/**
 * SmartPOS Storage Automatic Cleanup Engine
 * Implements retention-based expiration and LRU maximum cache size enforcement.
 * Guaranteed zero-data-loss for protected offline POS data.
 */

import {
  type CacheCategory,
  type CacheMetadataRecord,
  type CleanupResult,
  type PosStoragePolicy,
} from "./storage-types";
import {
  getStoragePolicy,
  retentionToMs,
} from "./storage-policy";
import {
  getAllCacheMetadata,
  removeCacheMetadataBatch,
} from "./indexeddb-storage";
import { POS_CACHES } from "./storage-manager";
import { isSafeCacheKey } from "./storage-cache";

const LOCALSTORAGE_KEY_CATEGORY_MAP: Record<string, CacheCategory> = {
  "smartpos:cache:users": "users",
  "smartpos:cache:roles": "roles",
  "smartpos:cache:permissions": "permissions",
  "smartpos:cache:security-events": "audit",
  "smartpos:cache:api": "api",
  "smartpos:cache:react-query": "api",
  "smartpos:cache:products": "products",
  "smartpos:cache:categories": "products",
  "smartpos:cache:brands": "products",
  "smartpos:cache:images": "images",
  "smartpos:cache:companies": "users",
  "smartpos:cache:business-settings": "other",
  "smartpos_system_changelogs_cache": "temp",
  "smartpos_announcements": "temp",
  "smartpos_feature_controls": "temp",
  "smartpos_announcement_reads": "temp",
};

/**
 * Remove items from browser Cache Storage given keys and their category.
 */
async function removeCacheStorageEntries(
  items: Array<{ category: CacheCategory; key: string }>
): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  for (const item of items) {
    try {
      const cacheName = POS_CACHES[item.category] || POS_CACHES.other;
      const cache = await window.caches.open(cacheName);
      const requestKey = item.key.startsWith("http")
        ? item.key
        : `https://smartpos.local/cache/${item.category}/${encodeURIComponent(item.key)}`;
      await cache.delete(requestKey);
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Perform retention cleanup on localStorage safe cache keys.
 * Evaluates envelope expires_at and policy retention duration (hour, day, week, month).
 */
export function cleanupExpiredLocalStorageCache(policy: PosStoragePolicy): {
  expiredCount: number;
  freedBytes: number;
} {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return { expiredCount: 0, freedBytes: 0 };
  }

  const now = Date.now();
  let expiredCount = 0;
  let freedBytes = 0;

  const candidateKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isSafeCacheKey(key)) {
      candidateKeys.push(key);
    }
  }

  for (const key of candidateKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const sizeBytes = new Blob([raw]).size;
      const data = JSON.parse(raw);

      let shouldEvict = false;

      // 1. Check explicit envelope expires_at
      if (data && typeof data === "object" && typeof data.expires_at === "number") {
        if (now > data.expires_at) {
          shouldEvict = true;
        }
      }

      // 2. Check retention policy duration
      const category: CacheCategory = LOCALSTORAGE_KEY_CATEGORY_MAP[key] || "other";
      const retentionSetting =
        policy.retention[category] || policy.retention.temp || "never";
      const retentionMs = retentionToMs(retentionSetting);

      if (!shouldEvict && retentionMs !== null) {
        const cachedAt = typeof data?.cached_at === "number" ? data.cached_at : now;
        if (now - cachedAt > retentionMs) {
          shouldEvict = true;
        }
      }

      if (shouldEvict) {
        localStorage.removeItem(key);
        expiredCount++;
        freedBytes += sizeBytes;
      }
    } catch {
      // If parsing fails for a safe cache key, evict corrupt entry
      try {
        localStorage.removeItem(key);
        expiredCount++;
      } catch {
        // ignore
      }
    }
  }

  return { expiredCount, freedBytes };
}

/**
 * Perform retention cleanup across all storage tiers (IndexedDB, Cache Storage, localStorage):
 * Remove all cached records that have exceeded their configured retention period.
 */
export async function cleanupExpiredCache(): Promise<{
  expiredCount: number;
  freedBytes: number;
}> {
  const policy = getStoragePolicy();
  const now = Date.now();

  // 1. Clean IndexedDB & Cache Storage entries
  const allMetadata = await getAllCacheMetadata();
  const toRemove: CacheMetadataRecord[] = [];

  for (const record of allMetadata) {
    // 1. Check explicit expires_at
    if (record.expires_at !== null && record.expires_at < now) {
      toRemove.push(record);
      continue;
    }

    // 2. Check policy retention duration
    const retentionSetting =
      policy.retention[record.category as keyof typeof policy.retention] ||
      policy.retention.temp ||
      "never";
    const retentionMs = retentionToMs(retentionSetting);

    if (retentionMs !== null) {
      const lastAccessed = record.last_accessed_at || record.cached_at;
      if (now - lastAccessed > retentionMs) {
        toRemove.push(record);
      }
    }
  }

  let idbFreedBytes = 0;
  if (toRemove.length > 0) {
    idbFreedBytes = toRemove.reduce((sum, r) => sum + (r.size_bytes || 0), 0);
    const keysToRemove = toRemove.map((r) => r.cache_key);

    // Remove from Cache Storage
    await removeCacheStorageEntries(
      toRemove.map((r) => ({ category: r.category, key: r.cache_key }))
    );

    // Remove from IndexedDB metadata
    await removeCacheMetadataBatch(keysToRemove);
  }

  // 2. Clean localStorage safe cache entries
  const lsResult = cleanupExpiredLocalStorageCache(policy);

  return {
    expiredCount: toRemove.length + lsResult.expiredCount,
    freedBytes: idbFreedBytes + lsResult.freedBytes,
  };
}

/**
 * Enforce maximum cache size limit using Least Recently Used (LRU) eviction.
 */
export async function enforceCacheLimit(): Promise<{
  evictedCount: number;
  freedBytes: number;
}> {
  const policy = getStoragePolicy();

  // If No Limit (null), do not enforce custom application cap
  if (policy.maxCacheBytes === null) {
    return { evictedCount: 0, freedBytes: 0 };
  }

  const allMetadata = await getAllCacheMetadata();
  let currentTotalBytes = allMetadata.reduce(
    (sum, r) => sum + (r.size_bytes || 0),
    0
  );

  if (currentTotalBytes <= policy.maxCacheBytes) {
    return { evictedCount: 0, freedBytes: 0 };
  }

  // Sort by last_accessed_at ascending (oldest first)
  const sorted = [...allMetadata].sort((a, b) => {
    const timeA = a.last_accessed_at || a.cached_at;
    const timeB = b.last_accessed_at || b.cached_at;
    return timeA - timeB;
  });

  const toEvict: CacheMetadataRecord[] = [];
  let freedBytes = 0;

  for (const record of sorted) {
    if (currentTotalBytes <= policy.maxCacheBytes) break;
    toEvict.push(record);
    const size = record.size_bytes || 0;
    currentTotalBytes -= size;
    freedBytes += size;
  }

  if (toEvict.length === 0) {
    return { evictedCount: 0, freedBytes: 0 };
  }

  await removeCacheStorageEntries(
    toEvict.map((r) => ({ category: r.category, key: r.cache_key }))
  );
  await removeCacheMetadataBatch(toEvict.map((r) => r.cache_key));

  return { evictedCount: toEvict.length, freedBytes };
}

/**
 * Master cleanup routine:
 * 1. Evicts expired cache entries
 * 2. Enforces max cache size if exceeded
 */
export async function runStorageCleanup(): Promise<CleanupResult> {
  const expired = await cleanupExpiredCache();
  const limit = await enforceCacheLimit();

  return {
    expiredFreedBytes: expired.freedBytes,
    expiredCount: expired.expiredCount,
    limitFreedBytes: limit.freedBytes,
    limitEvictedCount: limit.evictedCount,
    totalFreedBytes: expired.freedBytes + limit.freedBytes,
  };
}
