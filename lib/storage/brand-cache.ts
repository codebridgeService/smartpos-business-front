/**
 * SmartPOS Brands IndexedDB Cache Layer
 * Provides robust offline storage, background caching, and client-side querying
 * backed by the singleton IndexedDB "brands" object store.
 */

import { type Brand, type BrandMeta, type GetBrandsParams, brandsApi } from "@/lib/api/brands";
import {
  getIndexedDb,
  putStoreItemsBatch,
  getAllStoreItems,
  saveCacheMetadata,
} from "./indexeddb-storage";
import { type CacheMetadataRecord } from "./storage-types";

const BRAND_STORE_NAME = "brands";
const CACHE_METADATA_KEY = "brands:catalog_cache";
const BRAND_CACHE_TTL_SECONDS = 3600; // 1 hour

export const FAKE_DEMO_BRAND_UUIDS = [
  "bnd-apple-001",
  "bnd-samsung-002",
  "bnd-nike-003",
  "bnd-logitech-004",
  "bnd-cocacola-005",
];

export interface CachedBrandsResult {
  data: Brand[];
  meta: BrandMeta;
  isOffline: boolean;
  totalCached: number;
  lastCachedAt?: string;
}

/**
 * Persists an array of brands to IndexedDB "brands" store
 * and tracks storage footprint in cache_metadata.
 */
export async function saveBrandsToIndexedDb(brands: Brand[]): Promise<void> {
  if (!brands || brands.length === 0) return;

  try {
    // 1. Write brand records to IndexedDB store
    await putStoreItemsBatch(BRAND_STORE_NAME, brands);

    // 2. Track in cache_metadata for storage settings transparency
    const jsonStr = JSON.stringify(brands);
    const byteSize = typeof Blob !== "undefined" ? new Blob([jsonStr]).size : jsonStr.length;

    const now = Date.now();
    const metadata: CacheMetadataRecord = {
      cache_key: CACHE_METADATA_KEY,
      category: "products",
      size_bytes: byteSize,
      cached_at: now,
      last_accessed_at: now,
      expires_at: now + BRAND_CACHE_TTL_SECONDS * 1000,
      content_type: "application/json",
      storage_target: "indexed_db",
    };

    await saveCacheMetadata(metadata);
  } catch (err) {
    console.warn("[BrandCache] Failed to persist brands to IndexedDB:", err);
  }
}

/**
 * Retrieves all cached brands from IndexedDB with optional filtering
 */
export async function getCachedBrandsFromIndexedDb(filters?: {
  business_uuid?: string;
  search?: string;
  is_active?: string | boolean;
}): Promise<Brand[]> {
  try {
    const allBrands = await getAllStoreItems<Brand>(BRAND_STORE_NAME);
    if (!allBrands || allBrands.length === 0) return [];

    // Filter out any legacy fake demo brand entries
    let filtered = allBrands.filter((b) => !FAKE_DEMO_BRAND_UUIDS.includes(b.uuid));

    // Filter by business_uuid if provided
    if (filters?.business_uuid && filters.business_uuid.trim()) {
      const bUuid = filters.business_uuid.trim().toLowerCase();
      filtered = filtered.filter(
        (b) => b.business_uuid && b.business_uuid.toLowerCase() === bUuid
      );
    }

    // Filter by active status
    if (filters?.is_active !== undefined && filters.is_active !== "" && filters.is_active !== "all") {
      const targetActive =
        typeof filters.is_active === "boolean"
          ? filters.is_active
          : String(filters.is_active).toLowerCase() === "true" || filters.is_active === "1";

      filtered = filtered.filter((b) => Boolean(b.is_active) === targetActive);
    }

    // Filter by search query (name, code, description)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(q)) ||
          (b.code && b.code.toLowerCase().includes(q)) ||
          (b.description && b.description.toLowerCase().includes(q))
      );
    }

    // Sort alphabetically by name
    return filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } catch (err) {
    console.warn("[BrandCache] Failed to read cached brands from IndexedDB:", err);
    return [];
  }
}

/**
 * Fetches brands with IndexedDB offline-first & cache-aside strategy:
 * 1. Checks online status.
 * 2. If online, attempts API fetch -> updates IndexedDB -> returns fresh data.
 * 3. If offline or network error, falls back seamlessly to IndexedDB cached brands.
 */
export async function fetchBrandsWithIndexedDbCache(
  params?: GetBrandsParams
): Promise<CachedBrandsResult> {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // 1. If device is offline, immediately serve from IndexedDB
  if (!isOnline) {
    return serveIndexedDbFallback(params);
  }

  // 2. If online, attempt live network request
  try {
    const apiResponse = await brandsApi.getBrands(params);

    // Persist fresh items to IndexedDB in the background
    if (apiResponse.data && apiResponse.data.length > 0) {
      saveBrandsToIndexedDb(apiResponse.data).catch(() => {});
    }

    // Query total count of all cached brands in IndexedDB
    const allCached = await getAllStoreItems<Brand>(BRAND_STORE_NAME).catch(() => []);

    return {
      data: apiResponse.data,
      meta: apiResponse.meta,
      isOffline: false,
      totalCached: allCached.length || apiResponse.data.length,
      lastCachedAt: new Date().toISOString(),
    };
  } catch (networkError) {
    // 3. Fallback on network or connection errors
    console.warn("[BrandCache] Network error, falling back to IndexedDB:", networkError);
    return serveIndexedDbFallback(params);
  }
}

/**
 * Helper to compute pagination and slice cached IndexedDB brands
 */
async function serveIndexedDbFallback(params?: GetBrandsParams): Promise<CachedBrandsResult> {
  const cachedBrands = await getCachedBrandsFromIndexedDb({
    business_uuid: params?.business_uuid,
    search: params?.search,
    is_active: params?.is_active,
  });

  const page = Math.max(1, params?.page || 1);
  const perPage = Math.max(1, params?.per_page || 20);
  const total = cachedBrands.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  const offset = (page - 1) * perPage;
  const paginatedData = cachedBrands.slice(offset, offset + perPage);

  const allCached = await getAllStoreItems<Brand>(BRAND_STORE_NAME).catch(() => []);

  return {
    data: paginatedData,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: perPage,
      total,
    },
    isOffline: true,
    totalCached: allCached.length,
    lastCachedAt: new Date().toISOString(),
  };
}

/**
 * Remove a single brand from IndexedDB "brands" store by uuid or id
 */
export async function removeBrandFromIndexedDb(idOrUuid: string | number): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db.objectStoreNames.contains(BRAND_STORE_NAME)) return;

    const tx = db.transaction(BRAND_STORE_NAME, "readwrite");
    const store = tx.objectStore(BRAND_STORE_NAME);

    if (typeof idOrUuid === "string") {
      store.delete(idOrUuid);
    } else {
      const all = await getAllStoreItems<Brand>(BRAND_STORE_NAME);
      const match = all.find((b) => b.id === idOrUuid);
      if (match?.uuid) {
        store.delete(match.uuid);
      }
    }
  } catch (err) {
    console.warn("[BrandCache] Failed to delete brand from IndexedDB:", err);
  }
}

/**
 * Delete all 5 fake demo sample brands from IndexedDB "brands" store
 */
export async function deleteFakeDemoBrandsFromIndexedDb(): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db.objectStoreNames.contains(BRAND_STORE_NAME)) return;

    const tx = db.transaction(BRAND_STORE_NAME, "readwrite");
    const store = tx.objectStore(BRAND_STORE_NAME);

    for (const uuid of FAKE_DEMO_BRAND_UUIDS) {
      store.delete(uuid);
    }
  } catch (err) {
    console.warn("[BrandCache] Failed to delete fake demo brands from IndexedDB:", err);
  }
}

/**
 * Clear all brands from IndexedDB
 */
export async function clearBrandsIndexedDbCache(): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (db.objectStoreNames.contains(BRAND_STORE_NAME)) {
      const tx = db.transaction(BRAND_STORE_NAME, "readwrite");
      tx.objectStore(BRAND_STORE_NAME).clear();
    }
  } catch (err) {
    console.warn("[BrandCache] Failed to clear brands store:", err);
  }
}

