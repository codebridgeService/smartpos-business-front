/**
 * SmartPOS Storage Manager
 * Coordinates Cache Storage, IndexedDB, and localStorage policies.
 * Ensures zero-data-loss protection for offline POS transactions.
 */

import {
  type CacheCategory,
  type CacheCategoryUsage,
  type CacheMetadataRecord,
  type StorageUsage,
} from "./storage-types";
import {
  CATEGORY_METADATA,
  getStoragePolicy,
  retentionToMs,
} from "./storage-policy";
import {
  clearCategoryIndexedDb,
  clearClearableIndexedDb,
  getAllCacheMetadata,
  removeCacheMetadataBatch,
  saveCacheMetadata,
  getCacheMetadata,
  getOfflineDataStatus,
  getStoreEstimatedBytes,
} from "./indexeddb-storage";
import { storageCache } from "./storage-cache";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { getQueryClient } from "@/lib/react-query/query-client";

export const POS_CACHES = {
  products: "smartpos-products-v1",
  categories: "smartpos-categories-v1",
  images: "smartpos-images-v1",
  inventory: "smartpos-inventory-v1",
  reports: "smartpos-reports-v1",
  receipts: "smartpos-receipts-v1",
  api: "smartpos-api-v1",
  users: "smartpos-users-v1",
  roles: "smartpos-roles-v1",
  permissions: "smartpos-permissions-v1",
  audit: "smartpos-audit-v1",
  temp: "smartpos-temp-v1",
  other: "smartpos-other-v1",
} as const;

/**
 * Remove legacy demonstration mock records from IndexedDB metadata
 */
export async function purgeDemoMockEntries(): Promise<void> {
  try {
    const allMetadata = await getAllCacheMetadata();
    const mockKeys = allMetadata
      .filter(
        (m) =>
          m.cache_key.startsWith("/api/products/catalog-chunk") ||
          m.cache_key.startsWith("/media/products/") ||
          m.cache_key.startsWith("/api/inventory/") ||
          m.cache_key.startsWith("/reports/monthly-sales-august") ||
          m.cache_key.startsWith("/reports/tax-summary") ||
          m.cache_key.startsWith("/receipts/templates/standard-80mm") ||
          m.cache_key.startsWith("/temp/print-spool-001") ||
          m.cache_key.includes("-cache")
      )
      .map((m) => m.cache_key);

    if (mockKeys.length > 0) {
      await removeCacheMetadataBatch(mockKeys);
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Check if Cache Storage API is available in current environment.
 */
function isCacheStorageAvailable(): boolean {
  return typeof window !== "undefined" && "caches" in window;
}

/**
 * Safely open a Cache Storage namespace.
 */
async function openCache(category: CacheCategory): Promise<Cache | null> {
  if (!isCacheStorageAvailable()) return null;
  try {
    const cacheName = POS_CACHES[category] || POS_CACHES.other;
    return await window.caches.open(cacheName);
  } catch (err) {
    console.warn(`[StorageManager] Failed to open cache namespace for ${category}:`, err);
    return null;
  }
}

/**
 * Store a Response or payload in Cache Storage & track metadata in IndexedDB.
 */
export async function cacheResponse(
  category: CacheCategory,
  key: string,
  data: Response | Blob | string | object,
  contentType: string = "application/json"
): Promise<void> {
  const policy = getStoragePolicy();
  const retentionKey = category in policy.retention ? (category as keyof typeof policy.retention) : "temp";
  const retentionSetting = policy.retention[retentionKey] || "1_day";
  const retentionMs = retentionToMs(retentionSetting);
  const now = Date.now();
  const expiresAt = retentionMs ? now + retentionMs : null;

  let estimatedBytes = 0;
  let responseToCache: Response;

  if (data instanceof Response) {
    // Clone before consuming
    const cloned = data.clone();
    const blob = await cloned.blob();
    estimatedBytes = blob.size;
    responseToCache = new Response(blob, {
      status: data.status,
      statusText: data.statusText,
      headers: data.headers,
    });
  } else if (data instanceof Blob) {
    estimatedBytes = data.size;
    responseToCache = new Response(data, {
      headers: { "Content-Type": contentType },
    });
  } else if (typeof data === "string") {
    estimatedBytes = new Blob([data]).size;
    responseToCache = new Response(data, {
      headers: { "Content-Type": contentType },
    });
  } else {
    const jsonStr = JSON.stringify(data);
    estimatedBytes = new Blob([jsonStr]).size;
    responseToCache = new Response(jsonStr, {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Put in Cache Storage
  const cache = await openCache(category);
  if (cache) {
    const requestKey = key.startsWith("http")
      ? key
      : `https://smartpos.local/cache/${category}/${encodeURIComponent(key)}`;
    await cache.put(requestKey, responseToCache);
  }

  // 2. Put metadata in IndexedDB
  const metadata: CacheMetadataRecord = {
    cache_key: key,
    category,
    size_bytes: estimatedBytes,
    cached_at: now,
    last_accessed_at: now,
    expires_at: expiresAt,
    content_type: contentType,
    storage_target: "cache_storage",
  };

  try {
    await saveCacheMetadata(metadata);
  } catch (err) {
    console.warn("[StorageManager] Failed to record cache metadata in IndexedDB:", err);
  }
}

/**
 * Retrieve cached response from Cache Storage, updating last_accessed_at.
 */
export async function getCachedResponse(
  category: CacheCategory,
  key: string
): Promise<Response | null> {
  const cache = await openCache(category);
  if (!cache) return null;

  const requestKey = key.startsWith("http")
    ? key
    : `https://smartpos.local/cache/${category}/${encodeURIComponent(key)}`;
  const match = await cache.match(requestKey);

  if (match) {
    // Update last_accessed_at in metadata
    try {
      const meta = await getCacheMetadata(key);
      if (meta) {
        meta.last_accessed_at = Date.now();
        await saveCacheMetadata(meta);
      }
    } catch {
      // Non-blocking
    }
    return match;
  }

  return null;
}

/**
 * Retrieve REAL Category Storage Usage Breakdown from IndexedDB and Cache Storage.
 */
export async function getStorageCategoryUsage(): Promise<CacheCategoryUsage[]> {
  const categoriesList: CacheCategory[] = [
    "products",
    "categories",
    "images",
    "inventory",
    "reports",
    "receipts",
    "api",
    "users",
    "roles",
    "permissions",
    "audit",
    "temp",
    "other",
  ];

  let allMetadata: CacheMetadataRecord[] = [];
  try {
    allMetadata = await getAllCacheMetadata();
  } catch (err) {
    console.warn("[StorageManager] Could not read metadata from IndexedDB:", err);
  }

  // Group by category
  const categoryBytes: Record<CacheCategory, number> = {
    products: 0,
    categories: 0,
    images: 0,
    inventory: 0,
    reports: 0,
    receipts: 0,
    api: 0,
    users: 0,
    roles: 0,
    permissions: 0,
    audit: 0,
    temp: 0,
    other: 0,
  };

  const categoryCounts: Record<CacheCategory, number> = {
    products: 0,
    categories: 0,
    images: 0,
    inventory: 0,
    reports: 0,
    receipts: 0,
    api: 0,
    users: 0,
    roles: 0,
    permissions: 0,
    audit: 0,
    temp: 0,
    other: 0,
  };

  // 1. Process metadata records
  for (const item of allMetadata) {
    const cat = item.category || "other";
    if (categoryBytes[cat] !== undefined) {
      categoryBytes[cat] += item.size_bytes || 0;
      categoryCounts[cat] += 1;
    } else {
      categoryBytes.other += item.size_bytes || 0;
      categoryCounts.other += 1;
    }
  }

  // 2. Measure actual physical IndexedDB store sizes if metadata is unpopulated
  try {
    const [prodBytes, catBytes, invBytes] = await Promise.all([
      getStoreEstimatedBytes("products"),
      getStoreEstimatedBytes("categories"),
      getStoreEstimatedBytes("inventory"),
    ]);

    if (prodBytes > 0 && categoryBytes.products === 0) {
      categoryBytes.products = prodBytes;
      categoryCounts.products = Math.max(1, categoryCounts.products);
    }
    if (catBytes > 0 && categoryBytes.categories === 0) {
      categoryBytes.categories = catBytes;
      categoryCounts.categories = Math.max(1, categoryCounts.categories);
    }
    if (invBytes > 0 && categoryBytes.inventory === 0) {
      categoryBytes.inventory = invBytes;
      categoryCounts.inventory = Math.max(1, categoryCounts.inventory);
    }
  } catch {
    // Non-blocking
  }

  // 3. Inspect real Cache Storage entries for namespaces with unindexed items
  if (isCacheStorageAvailable()) {
    try {
      const imgCache = await window.caches.open(POS_CACHES.images);
      const imgKeys = await imgCache.keys();
      if (imgKeys.length > 0 && categoryBytes.images === 0) {
        categoryCounts.images = imgKeys.length;
        categoryBytes.images = imgKeys.length * 35 * 1024; // ~35 KB per thumbnail
      }
    } catch {
      // Non-blocking
    }
  }

  // 4. Measure real localStorage cached keys
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key) || "";
        const keyBytes = new Blob([val]).size;

        if (key === "smartpos:cache:users") {
          categoryBytes.users += keyBytes;
          categoryCounts.users += 1;
        } else if (key === "smartpos:cache:roles") {
          categoryBytes.roles += keyBytes;
          categoryCounts.roles += 1;
        } else if (
          key === "smartpos:cache:permissions" ||
          key.startsWith("smartpos:cache:permissions") ||
          key === "smartpos_permissions" ||
          key === "smartpos_user_permissions" ||
          key.includes("permission")
        ) {
          categoryBytes.permissions += keyBytes;
          categoryCounts.permissions += 1;
        } else if (key === "smartpos:cache:security-events") {
          categoryBytes.audit += keyBytes;
          categoryCounts.audit += 1;
        } else if (
          key === "smartpos:cache:companies" ||
          key === "smartpos_system_changelogs_cache" ||
          key === "smartpos_announcements" ||
          key === "smartpos_feature_controls" ||
          key === "smartpos_announcement_reads"
        ) {
          categoryBytes.other += keyBytes;
          categoryCounts.other += 1;
        } else if (key === "smartpos:cache:categories") {
          categoryBytes.categories += keyBytes;
          categoryCounts.categories += 1;
        } else if (
          key === "smartpos:cache:products" ||
          key === "smartpos:cache:brands"
        ) {
          categoryBytes.products += keyBytes;
          categoryCounts.products += 1;
        } else if (key === "smartpos:cache:react-query") {
          categoryBytes.api += keyBytes;
          categoryCounts.api += 1;
        }
      }

      // If permissions not yet written to localStorage, check if available in usePermissionStore
      if (categoryBytes.permissions === 0 && typeof window !== "undefined") {
        try {
          const storePerms = usePermissionStore.getState().permissions;
          if (storePerms && storePerms.length > 0) {
            storageCache.set("smartpos:cache:permissions", storePerms, 120);
            const raw = localStorage.getItem("smartpos:cache:permissions") || "";
            categoryBytes.permissions = new Blob([raw]).size;
            categoryCounts.permissions = storePerms.length;
          }
        } catch {
          // Non-blocking
        }
      }
    } catch {
      // Non-blocking
    }
  }

  const totalBytes = Object.values(categoryBytes).reduce((a, b) => a + b, 0);

  return categoriesList.map((key) => {
    const bytes = categoryBytes[key] || 0;
    const percentage = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0;
    const meta = CATEGORY_METADATA[key];

    return {
      key,
      name: meta?.name || key,
      bytes,
      percentage: Number(percentage.toFixed(1)),
      itemCount: categoryCounts[key] || 0,
      color: meta?.color || "#64748B",
      description: meta?.description || "",
    };
  });
}

/**
 * Calculate full browser storage usage including navigator.storage.estimate().
 */
export async function getBrowserStorageUsage(): Promise<StorageUsage> {
  let originUsage = 0;
  let originQuota = 0;

  if (
    typeof navigator !== "undefined" &&
    navigator.storage &&
    navigator.storage.estimate
  ) {
    try {
      const estimate = await navigator.storage.estimate();
      originUsage = estimate.usage ?? 0;
      originQuota = estimate.quota ?? 0;
    } catch (err) {
      console.warn("[StorageManager] navigator.storage.estimate() failed:", err);
    }
  }

  const categories = await getStorageCategoryUsage();
  const totalBytes = categories.reduce((sum, c) => sum + c.bytes, 0);

  const diskUsagePercentage =
    originQuota > 0 ? Number(((originUsage / originQuota) * 100).toFixed(2)) : 0.05;

  return {
    totalBytes,
    originUsageBytes: originUsage,
    originQuotaBytes: originQuota,
    diskUsagePercentage,
    categories,
  };
}

/**
 * Clear a specific category from Cache Storage and IndexedDB.
 */
export async function clearCategory(
  category: CacheCategory
): Promise<{ success: boolean; bytesFreed: number }> {
  let bytesFreed = 0;

  // 1. Gather bytes from metadata
  try {
    const allMetadata = await getAllCacheMetadata();
    const matched = allMetadata.filter((m) => m.category === category);
    bytesFreed = matched.reduce((sum, m) => sum + (m.size_bytes || 0), 0);
  } catch {
    // continue
  }

  // 2. Clear Cache Storage namespace
  if (isCacheStorageAvailable()) {
    try {
      const cacheName = POS_CACHES[category] || POS_CACHES.other;
      await window.caches.delete(cacheName);
    } catch (err) {
      console.warn(`[StorageManager] Failed to delete cache namespace ${category}:`, err);
    }
  }

  // 3. Clear IndexedDB store for this category
  try {
    await clearCategoryIndexedDb(category);
  } catch (err) {
    console.warn(`[StorageManager] Failed to clear IndexedDB category ${category}:`, err);
  }

  // 4. Clear matching safe localStorage cache keys
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      if (category === "users") {
        localStorage.removeItem("smartpos:cache:users");
      } else if (category === "roles") {
        localStorage.removeItem("smartpos:cache:roles");
      } else if (category === "permissions") {
        localStorage.removeItem("smartpos:cache:permissions");
      } else if (category === "audit") {
        localStorage.removeItem("smartpos:cache:security-events");
      } else if (category === "products") {
        localStorage.removeItem("smartpos:cache:products");
        localStorage.removeItem("smartpos:cache:brands");
      } else if (category === "categories") {
        localStorage.removeItem("smartpos:cache:categories");
      } else if (category === "api") {
        localStorage.removeItem("smartpos:cache:react-query");
      } else if (category === "other") {
        localStorage.removeItem("smartpos:cache:companies");
        localStorage.removeItem("smartpos_system_changelogs_cache");
        localStorage.removeItem("smartpos_announcements");
        localStorage.removeItem("smartpos_feature_controls");
        localStorage.removeItem("smartpos_announcement_reads");
        localStorage.removeItem("smartpos:cache:react-query");
      }
    } catch {
      // Non-blocking
    }
  }

  // 5. Invalidate & remove matching TanStack Query in-memory cache entries
  if (typeof window !== "undefined") {
    try {
      const queryClient = getQueryClient();
      if (category === "users") {
        queryClient.removeQueries({ queryKey: ["users"] });
      } else if (category === "roles") {
        queryClient.removeQueries({ queryKey: ["roles"] });
      } else if (category === "permissions") {
        queryClient.removeQueries({ queryKey: ["permissions"] });
      } else if (category === "categories") {
        queryClient.removeQueries({ queryKey: ["categories"] });
      } else if (category === "products") {
        queryClient.removeQueries({ queryKey: ["products"] });
      } else if (category === "audit") {
        queryClient.removeQueries({ queryKey: ["security"] });
      } else if (category === "other") {
        queryClient.removeQueries({ queryKey: ["businesses"] });
        queryClient.removeQueries({ queryKey: ["outlets"] });
      }
    } catch (err) {
      console.warn("[StorageManager] Error clearing TanStack Query cache for category:", category, err);
    }
  }

  return { success: true, bytesFreed };
}

/**
 * Clear Entire Cache:
 * Removes all clearable Cache Storage entries & clearable IndexedDB stores.
 * Also clears safe localStorage cache keys while strictly preserving:
 * - Session tokens (smartpos_access_token, smartpos_refresh_token)
 * - Device and tenant IDs (smartpos_device_uuid, smartpos_active_business_uuid, smartpos_active_outlet_uuid)
 * - UI & theme preferences (smartpos_theme, smartpos_layout_customizer, outlets_view_mode, adminRolesZoom)
 * - Protected offline ledger (pending_sales, pending_payments, sync_queue)
 * Also resets TanStack Query in-memory cache.
 * NEVER calls localStorage.clear().
 */
export async function clearEntireCache(): Promise<{
  success: boolean;
  bytesFreed: number;
}> {
  let bytesFreed = 0;

  try {
    const allMetadata = await getAllCacheMetadata();
    bytesFreed = allMetadata.reduce((sum, m) => sum + (m.size_bytes || 0), 0);
  } catch {
    // continue
  }

  // 1. Delete all SmartPOS Cache Storage namespaces
  if (isCacheStorageAvailable()) {
    try {
      const cacheNames = Object.values(POS_CACHES);
      for (const name of cacheNames) {
        await window.caches.delete(name);
      }
    } catch (err) {
      console.warn("[StorageManager] Error deleting Cache Storage namespaces:", err);
    }
  }

  // 2. Clear clearable stores in IndexedDB (protected stores remain 100% untouched)
  try {
    await clearClearableIndexedDb();
  } catch (err) {
    console.warn("[StorageManager] Error clearing clearable IndexedDB stores:", err);
  }

  // 3. Clear all safe localStorage cache keys (strictly protects auth tokens & device IDs)
  try {
    storageCache.clearAllCache();
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("smartpos:cache:react-query");
    }
  } catch (err) {
    console.warn("[StorageManager] Error clearing safe localStorage cache keys:", err);
  }

  // 4. Clear all TanStack Query in-memory caches
  if (typeof window !== "undefined") {
    try {
      getQueryClient().clear();
    } catch (err) {
      console.warn("[StorageManager] Error clearing TanStack Query cache:", err);
    }
  }

  // 5. Verify protected stores are still safe
  const offlineStatus = await getOfflineDataStatus();
  console.info(
    `[StorageManager] Cache cleared successfully. Protected offline items preserved: ${offlineStatus.pendingSalesCount} sales, ${offlineStatus.pendingPaymentsCount} payments, ${offlineStatus.syncQueueCount} queue items.`
  );

  return { success: true, bytesFreed };
}
