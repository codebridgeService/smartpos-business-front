import { storageCache, type PredefinedCacheKey } from "@/lib/storage/storage-cache";

/**
 * Wraps an async query fetcher with SmartPOS safe storageCache (localStorage TTL cache).
 *
 * Benefits:
 * - Offline Fallback: If network fails or device is offline, returns cached data.
 * - Cache Transparency: Populates SmartPOS storageCache so cache usage metrics in
 *   Storage Settings (/settings/storage) accurately show cached data sizes.
 * - Background Refresh: Integrates with TanStack Query staleTime and background sync.
 */
export function createCachedQueryFn<T>(
  cacheKey: PredefinedCacheKey,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 120
): () => Promise<T> {
  return async () => {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // 1. If offline, return existing cached data from storageCache
    if (!isOnline) {
      const cached = storageCache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
      throw new Error(`Device is offline and no cached data is available for key: ${cacheKey}`);
    }

    // 2. If online, fetch from API and cache in storageCache
    try {
      const freshData = await fetcher();
      if (freshData !== undefined && freshData !== null) {
        storageCache.set(cacheKey, freshData, ttlSeconds);
      }
      return freshData;
    } catch (networkError) {
      // 3. On server or connection error, fallback to storageCache if available
      const fallback = storageCache.get<T>(cacheKey);
      if (fallback !== null) {
        console.warn(`[createCachedQueryFn] Network request failed for ${cacheKey}, serving cached fallback.`, networkError);
        return fallback;
      }
      throw networkError;
    }
  };
}
