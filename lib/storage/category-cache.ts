/**
 * SmartPOS Categories IndexedDB Cache Layer
 * Provides offline storage, background caching, and client-side querying
 * backed by the singleton IndexedDB "categories" object store.
 */

import {
  type Category,
  type CategoryMeta,
  type GetCategoriesParams,
  categoriesApi,
} from "@/lib/api/categories";
import {
  getIndexedDb,
  putStoreItemsBatch,
  getAllStoreItems,
  saveCacheMetadata,
} from "./indexeddb-storage";
import { type CacheMetadataRecord } from "./storage-types";

const CATEGORY_STORE_NAME = "categories";
const CACHE_METADATA_KEY = "categories:catalog_cache";
const CATEGORY_CACHE_TTL_SECONDS = 3600; // 1 hour

export interface CachedCategoriesResult {
  data: Category[];
  meta: CategoryMeta;
  isOffline: boolean;
  totalCached: number;
  lastCachedAt?: string;
}

/**
 * Persists an array of categories to IndexedDB "categories" store
 * and tracks storage footprint in cache_metadata.
 */
export async function saveCategoriesToIndexedDb(categories: Category[]): Promise<void> {
  if (!categories || categories.length === 0) return;

  try {
    await putStoreItemsBatch(CATEGORY_STORE_NAME, categories);

    const jsonStr = JSON.stringify(categories);
    const byteSize = typeof Blob !== "undefined" ? new Blob([jsonStr]).size : jsonStr.length;

    const now = Date.now();
    const metadata: CacheMetadataRecord = {
      cache_key: CACHE_METADATA_KEY,
      category: "categories",
      size_bytes: byteSize,
      cached_at: now,
      last_accessed_at: now,
      expires_at: now + CATEGORY_CACHE_TTL_SECONDS * 1000,
      content_type: "application/json",
      storage_target: "indexed_db",
    };

    await saveCacheMetadata(metadata);
  } catch (err) {
    console.warn("[CategoryCache] Failed to persist categories to IndexedDB:", err);
  }
}

/**
 * Retrieves all cached categories from IndexedDB with optional filtering
 */
export async function getCachedCategoriesFromIndexedDb(filters?: {
  business_uuid?: string;
  search?: string;
  is_active?: string | boolean;
}): Promise<Category[]> {
  try {
    const allCategories = await getAllStoreItems<Category>(CATEGORY_STORE_NAME);
    if (!allCategories || allCategories.length === 0) return [];

    let filtered = allCategories;

    // Filter by business_uuid if provided
    if (filters?.business_uuid && filters.business_uuid.trim()) {
      const bUuid = filters.business_uuid.trim().toLowerCase();
      filtered = filtered.filter(
        (c) => c.business_uuid && c.business_uuid.toLowerCase() === bUuid
      );
    }

    // Filter by active status
    if (filters?.is_active !== undefined && filters.is_active !== "" && filters.is_active !== "all") {
      const targetActive =
        typeof filters.is_active === "boolean"
          ? filters.is_active
          : String(filters.is_active).toLowerCase() === "true" || filters.is_active === "1";

      filtered = filtered.filter((c) => Boolean(c.is_active) === targetActive);
    }

    // Filter by search query (name, code, description)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    // Sort by sort_order ascending, then name
    return filtered.sort((a, b) => {
      if ((a.sort_order ?? 0) !== (b.sort_order ?? 0)) {
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  } catch (err) {
    console.warn("[CategoryCache] Failed to read cached categories from IndexedDB:", err);
    return [];
  }
}

/**
 * Fetches categories with IndexedDB offline-first & cache-aside strategy
 */
export async function fetchCategoriesWithIndexedDbCache(
  params?: GetCategoriesParams
): Promise<CachedCategoriesResult> {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (!isOnline) {
    return serveIndexedDbFallback(params);
  }

  try {
    const apiResponse = await categoriesApi.getCategories(params);

    if (apiResponse.data && apiResponse.data.length > 0) {
      saveCategoriesToIndexedDb(apiResponse.data).catch(() => {});
    }

    const allCached = await getAllStoreItems<Category>(CATEGORY_STORE_NAME).catch(() => []);

    return {
      data: apiResponse.data,
      meta: apiResponse.meta,
      isOffline: false,
      totalCached: allCached.length || apiResponse.data.length,
      lastCachedAt: new Date().toISOString(),
    };
  } catch (networkError) {
    console.warn("[CategoryCache] Network error, falling back to IndexedDB:", networkError);
    return serveIndexedDbFallback(params);
  }
}

/**
 * Helper to compute pagination and slice cached IndexedDB categories
 */
async function serveIndexedDbFallback(params?: GetCategoriesParams): Promise<CachedCategoriesResult> {
  const cachedCategories = await getCachedCategoriesFromIndexedDb({
    business_uuid: params?.business_uuid,
    search: params?.search,
    is_active: params?.is_active,
  });

  const page = Math.max(1, params?.page || 1);
  const perPage = Math.max(1, params?.per_page || 20);
  const total = cachedCategories.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const offset = (page - 1) * perPage;
  const paginatedData = cachedCategories.slice(offset, offset + perPage);

  return {
    data: paginatedData,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
    isOffline: true,
    totalCached: total,
    lastCachedAt: new Date().toISOString(),
  };
}

/**
 * Remove category from IndexedDB cache
 */
export async function removeCategoryFromIndexedDb(uuidOrId: string | number): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db.objectStoreNames.contains(CATEGORY_STORE_NAME)) return;

    const tx = db.transaction(CATEGORY_STORE_NAME, "readwrite");
    const store = tx.objectStore(CATEGORY_STORE_NAME);

    if (typeof uuidOrId === "string") {
      store.delete(uuidOrId);
    } else {
      const all = await getAllStoreItems<Category>(CATEGORY_STORE_NAME);
      const match = all.find((c) => c.id === uuidOrId);
      if (match?.uuid) {
        store.delete(match.uuid);
      }
    }
  } catch (err) {
    console.warn(`[CategoryCache] Failed to remove category ${uuidOrId}:`, err);
  }
}
