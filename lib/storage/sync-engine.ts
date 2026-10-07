/**
 * SmartPOS Incremental Sync Engine
 *
 * Implements Telegram-like delta synchronization:
 * - Reads from IndexedDB first for instant UI loading (0 KB network).
 * - Tracks sync tokens in localStorage under 'smartpos:sync:<resource>'.
 * - Requests only changes since last sync token (e.g. GET /api/v1/sync/products?since=...).
 * - Stores changes directly in IndexedDB.
 * - Supports instant local search without sending any network requests.
 */

import {
  getAllStoreItems,
  putStoreItemsBatch,
  putStoreItem,
  getIndexDb,
} from "./indexeddb-storage";

export const SYNC_KEYS = {
  products: "smartpos:sync:products",
  categories: "smartpos:sync:categories",
  brands: "smartpos:sync:brands",
  prices: "smartpos:sync:prices",
  inventory: "smartpos:sync:inventory",
} as const;

export type SyncResource = keyof typeof SYNC_KEYS;

/**
 * Retrieve the current sync token for a given resource.
 */
export function getSyncToken(resource: SyncResource): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_KEYS[resource]) || null;
}

/**
 * Store the latest sync token for a resource.
 */
export function setSyncToken(resource: SyncResource, token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_KEYS[resource], token);
}

/**
 * Reset all sync tokens (forces full re-sync next time).
 */
export function resetSyncTokens(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(SYNC_KEYS)) {
    localStorage.removeItem(key);
  }
}

export interface DeltaSyncResult<T> {
  data: T[];
  deleted?: string[];
  sync_token: string;
}

/**
 * Save products to local IndexedDB store.
 */
export async function saveLocalProducts(products: any[]): Promise<void> {
  await putStoreItemsBatch("products", products);
  // Also keep cached_products store in sync for backwards compatibility
  await putStoreItemsBatch("cached_products", products);
}

/**
 * Read products from local IndexedDB store (0 KB network).
 */
export async function getLocalProducts<T = any>(): Promise<T[]> {
  const items = await getAllStoreItems<T>("products");
  if (items.length > 0) return items;
  return getAllStoreItems<T>("cached_products");
}

/**
 * Instant local product search (0 KB network request).
 * Searches product name, barcode, and SKU entirely in local browser memory.
 */
export async function searchLocalProducts(query: string): Promise<any[]> {
  const products = await getLocalProducts();
  if (!query || !query.trim()) return products;

  const normalized = query.toLowerCase().trim();
  return products.filter((p: any) => {
    const nameMatch = p.name?.toLowerCase().includes(normalized);
    const barcodeMatch = p.barcode?.toLowerCase().includes(normalized);
    const skuMatch = p.sku?.toLowerCase().includes(normalized);
    return nameMatch || barcodeMatch || skuMatch;
  });
}

/**
 * Apply delta synchronization results to IndexedDB.
 */
export async function applyDeltaSync<T extends { uuid?: string; id?: string | number }>(
  resource: SyncResource,
  delta: DeltaSyncResult<T>
): Promise<void> {
  const storeName = resource;

  // 1. Upsert updated records
  if (delta.data && delta.data.length > 0) {
    await putStoreItemsBatch(storeName, delta.data);
  }

  // 2. Remove deleted records from IndexedDB
  if (delta.deleted && delta.deleted.length > 0) {
    try {
      const db = await getIndexDb();
      if (db.objectStoreNames.contains(storeName)) {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        for (const uuid of delta.deleted) {
          store.delete(uuid);
        }
      }
    } catch (err) {
      console.warn(`[SyncEngine] Error removing deleted ${resource}:`, err);
    }
  }

  // 3. Update sync token
  if (delta.sync_token) {
    setSyncToken(resource, delta.sync_token);
  }
}

import { productsApi, type Product, type ProductCategory, type ProductBrand, type ProductUnit } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { apiClient } from "@/lib/api/client";
import { batchCacheImages } from "./image-cache";
import { saveCacheMetadata } from "./indexeddb-storage";
import { processSyncQueue } from "./offline-sales";
import { type CacheMetadataRecord } from "./storage-types";

export interface SyncStatusResult {
  productsCount: number;
  categoriesCount: number;
  brandsCount: number;
  unitsCount: number;
  imagesCachedCount: number;
  lastSyncTime: string;
  source: "api_delta" | "api_full" | "indexeddb_offline";
}

/**
 * Sync Catalog Meta (Categories, Brands, Units) from Backend API into IndexedDB.
 */
export async function syncCatalogFromApi(businessId?: string | number): Promise<{
  categories: ProductCategory[];
  brands: ProductBrand[];
  units: ProductUnit[];
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const [categories, brands, units] = await Promise.all([
      getAllStoreItems<ProductCategory>("categories"),
      getAllStoreItems<ProductBrand>("brands"),
      getAllStoreItems<ProductUnit>("units"),
    ]);
    return { categories, brands, units };
  }

  try {
    let rawCategories: any[] = [];
    try {
      const res = await productsApi.getCategories(businessId);
      if (Array.isArray(res) && res.length > 0) {
        rawCategories = res;
      }
    } catch {
      // Fall through to dedicated categoriesApi
    }

    if (rawCategories.length === 0) {
      try {
        const catRes = await categoriesApi.getCategories(
          businessId ? { business_uuid: String(businessId) } : undefined
        );
        if (catRes && Array.isArray(catRes.data) && catRes.data.length > 0) {
          rawCategories = catRes.data;
        }
      } catch {
        // Offline / fallback
      }
    }

    const [brands, units] = await Promise.all([
      productsApi.getBrands(businessId).catch(() => []),
      productsApi.getUnits(businessId).catch(() => []),
    ]);

    const categories = rawCategories as ProductCategory[];

    if (categories.length > 0) {
      await putStoreItemsBatch("categories", categories);
      setSyncToken("categories", new Date().toISOString());
      const catSize = new Blob([JSON.stringify(categories)]).size;
      await saveCacheMetadata({
        cache_key: "/api/categories",
        category: "categories",
        size_bytes: catSize,
        cached_at: Date.now(),
        last_accessed_at: Date.now(),
        expires_at: Date.now() + 7 * 24 * 3600 * 1000,
        storage_target: "indexed_db",
      });
    }

    if (brands.length > 0) {
      await putStoreItemsBatch("brands", brands);
      setSyncToken("brands", new Date().toISOString());
      const brandSize = new Blob([JSON.stringify(brands)]).size;
      await saveCacheMetadata({
        cache_key: "/api/brands",
        category: "products",
        size_bytes: brandSize,
        cached_at: Date.now(),
        last_accessed_at: Date.now(),
        expires_at: Date.now() + 7 * 24 * 3600 * 1000,
        storage_target: "indexed_db",
      });
    }

    if (units.length > 0) {
      await putStoreItemsBatch("units", units);
      const unitSize = new Blob([JSON.stringify(units)]).size;
      await saveCacheMetadata({
        cache_key: "/api/units",
        category: "products",
        size_bytes: unitSize,
        cached_at: Date.now(),
        last_accessed_at: Date.now(),
        expires_at: Date.now() + 30 * 24 * 3600 * 1000,
        storage_target: "indexed_db",
      });
    }

    return { categories, brands, units };
  } catch (err) {
    console.warn("[SyncEngine] Catalog API sync failed, falling back to local storage:", err);
    const [categories, brands, units] = await Promise.all([
      getAllStoreItems<ProductCategory>("categories"),
      getAllStoreItems<ProductBrand>("brands"),
      getAllStoreItems<ProductUnit>("units"),
    ]);
    return { categories, brands, units };
  }
}

/**
 * Incrementally sync products from the Backend API into IndexedDB and pre-cache images.
 */
export async function syncProductsFromApi(
  businessId?: string | number,
  options: { forceFull?: boolean } = {}
): Promise<{ products: Product[]; source: "api_delta" | "api_full" | "indexeddb_offline" }> {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (!isOnline) {
    const local = await getLocalProducts<Product>();
    return { products: local, source: "indexeddb_offline" };
  }

  const sinceToken = !options.forceFull ? getSyncToken("products") : null;

  // 1. Try Incremental Delta Sync API endpoint if sync token exists
  if (sinceToken) {
    try {
      const delta = await apiClient.get<DeltaSyncResult<Product>>("/sync/products", {
        params: {
          since: sinceToken,
          business_id: businessId,
        },
      });

      if (delta && Array.isArray(delta.data)) {
        await applyDeltaSync("products", delta);

        // Pre-cache newly updated product images into Cache Storage
        const imageItems = delta.data
          .filter((p: any) => p.image_url || p.thumbnail_url)
          .map((p: any) => ({
            category: "product" as const,
            uuid: p.uuid || String(p.id),
            url: p.image_url || p.thumbnail_url,
          }));
        if (imageItems.length > 0) {
          batchCacheImages(imageItems).catch(() => {});
        }

        const updatedProducts = await getLocalProducts<Product>();
        return { products: updatedProducts, source: "api_delta" };
      }
    } catch {
      // Delta endpoint not supported or error -> fall through to standard catalog fetch
    }
  }

  // 2. Full / Paginated catalog fetch from standard products API
  try {
    const paginator = await productsApi.getProducts({
      business_id: businessId,
      per_page: 100,
    });
    const products = paginator.data || [];

    if (products.length > 0) {
      await saveLocalProducts(products);

      // Save catalog metadata to IndexedDB
      const catalogSize = new Blob([JSON.stringify(products)]).size;
      await saveCacheMetadata({
        cache_key: `/api/products?business_id=${businessId || "all"}`,
        category: "products",
        size_bytes: catalogSize,
        cached_at: Date.now(),
        last_accessed_at: Date.now(),
        expires_at: Date.now() + 30 * 24 * 3600 * 1000,
        storage_target: "indexed_db",
      });

      // Update sync token in localStorage
      const latestUpdate = products.reduce((max, p) => {
        const t = p.updated_at ? new Date(p.updated_at).getTime() : 0;
        return t > max ? t : max;
      }, 0);
      const syncToken = latestUpdate > 0 ? new Date(latestUpdate).toISOString() : new Date().toISOString();
      setSyncToken("products", syncToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("smartpos:last_sync_timestamp", new Date().toISOString());
      }

      // Pre-cache product images in background via Cache Storage (smartpos-images-v1)
      const imageItems = products
        .filter((p: any) => p.image_url || p.thumbnail_url)
        .map((p: any) => ({
          category: "product" as const,
          uuid: p.uuid || String(p.id),
          url: p.image_url || p.thumbnail_url,
        }));
      if (imageItems.length > 0) {
        batchCacheImages(imageItems).catch(() => {});
      }
    }

    return { products, source: "api_full" };
  } catch (err) {
    console.warn("[SyncEngine] Failed to fetch products from API, reading IndexedDB:", err);
    const local = await getLocalProducts<Product>();
    return { products: local, source: "indexeddb_offline" };
  }
}

/**
 * Local-First Product Access:
 * 1. Returns products immediately from local IndexedDB (0ms, 0 KB network transfer).
 * 2. Asynchronously asks backend for delta changes and updates IndexedDB quietly.
 */
export async function getProductsLocalFirst(
  businessId?: string | number
): Promise<{ products: Product[]; isInstantLocal: boolean }> {
  const localProducts = await getLocalProducts<Product>();

  if (localProducts.length > 0) {
    // Background sync without blocking user interaction
    if (typeof navigator !== "undefined" && navigator.onLine) {
      syncProductsFromApi(businessId).catch((err) => {
        console.warn("[SyncEngine] Background product sync failed:", err);
      });
    }
    return { products: localProducts, isInstantLocal: true };
  }

  // First time initialization: must fetch from API
  const { products } = await syncProductsFromApi(businessId);
  return { products, isInstantLocal: false };
}

/**
 * Complete Orchestrator: Sync All POS Data (Catalog + Products + Images + Flush Offline Queue)
 */
export async function syncAllPosData(businessId?: string | number): Promise<SyncStatusResult> {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // 1. Flush offline sales queue first if online
  if (isOnline) {
    await processSyncQueue().catch(() => {});
  }

  // 2. Sync Catalog metadata
  const catalog = await syncCatalogFromApi(businessId);

  // 3. Sync Products
  const { products, source } = await syncProductsFromApi(businessId);

  const nowIso = new Date().toISOString();
  if (typeof window !== "undefined") {
    localStorage.setItem("smartpos:last_sync_timestamp", nowIso);
  }

  return {
    productsCount: products.length,
    categoriesCount: catalog.categories.length,
    brandsCount: catalog.brands.length,
    unitsCount: catalog.units.length,
    imagesCachedCount: products.filter((p: any) => p.image_url || p.thumbnail_url).length,
    lastSyncTime: nowIso,
    source,
  };
}
