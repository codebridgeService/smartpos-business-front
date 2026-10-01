/**
 * SmartPOS API Response Cache in Cache Storage
 *
 * Implements Telegram-like API caching:
 * - Namespace: 'smartpos-api-v1' in browser Cache Storage.
 * - Caches GET API requests with ETag / TTL support.
 * - When offline: immediately returns cached response without errors.
 * - When online: conditionally checks If-None-Match. If 304 Not Modified,
 *   serves local cache with 0 KB response body transfer.
 */

import { saveCacheMetadata, removeCacheMetadata } from "./indexeddb-storage";
import { type CacheMetadataRecord } from "./storage-types";

export const API_CACHE_NAME = "smartpos-api-v1";

function hasCacheStorage(): boolean {
  return typeof window !== "undefined" && "caches" in window;
}

export async function openApiCache(): Promise<Cache | null> {
  if (!hasCacheStorage()) return null;
  try {
    return await window.caches.open(API_CACHE_NAME);
  } catch (err) {
    console.warn("[ApiCache] Unable to open API cache:", err);
    return null;
  }
}

export interface CachedGetOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
  headers?: Record<string, string>;
}

/**
 * Perform a cached GET request backed by Cache Storage and IndexedDB metadata.
 */
export async function cachedApiGet<T = unknown>(
  url: string,
  options: CachedGetOptions = {}
): Promise<{ data: T; fromCache: boolean; etag?: string | null }> {
  const { ttlMs = 5 * 60 * 1000, forceRefresh = false, headers = {} } = options;
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
  const cache = await openApiCache();

  // 1. Check local Cache Storage first
  let cachedResponse: Response | null = null;
  if (cache && !forceRefresh) {
    try {
      cachedResponse = (await cache.match(url)) ?? null;
    } catch {
      cachedResponse = null;
    }
  }

  // If offline, return cached response immediately
  if (!isOnline) {
    if (cachedResponse) {
      const data = (await cachedResponse.json()) as T;
      return { data, fromCache: true };
    }
    throw new Error("Device is offline and no cached response is available.");
  }

  // 2. Online: Prepare conditional request if ETag exists
  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  const cachedEtag = cachedResponse?.headers.get("ETag");
  if (cachedEtag && !forceRefresh) {
    reqHeaders["If-None-Match"] = cachedEtag;
  }

  try {
    const netResponse = await fetch(url, {
      method: "GET",
      headers: reqHeaders,
    });

    // 304 Not Modified -> Use cached data (0 KB body transfer)
    if (netResponse.status === 304 && cachedResponse) {
      const data = (await cachedResponse.json()) as T;
      return { data, fromCache: true, etag: cachedEtag };
    }

    if (!netResponse.ok) {
      if (cachedResponse) {
        // Fallback to cached response on server errors
        const data = (await cachedResponse.json()) as T;
        return { data, fromCache: true };
      }
      throw new Error(`API GET request failed with status ${netResponse.status}`);
    }

    // 3. Clone and store in Cache Storage
    if (cache) {
      const cloned = netResponse.clone();
      await cache.put(url, cloned);

      // Track size in IndexedDB cache_metadata
      try {
        const text = await netResponse.clone().text();
        const sizeBytes = new Blob([text]).size;
        const meta: CacheMetadataRecord = {
          cache_key: url,
          category: "api",
          size_bytes: sizeBytes,
          cached_at: Date.now(),
          last_accessed_at: Date.now(),
          expires_at: Date.now() + ttlMs,
          content_type: netResponse.headers.get("content-type") || "application/json",
          storage_target: "cache_storage",
        };
        await saveCacheMetadata(meta);
      } catch {
        // Non-blocking metadata recording
      }
    }

    const data = (await netResponse.json()) as T;
    return { data, fromCache: false, etag: netResponse.headers.get("ETag") };
  } catch (err) {
    // If network failed but we have a cached copy, return it
    if (cachedResponse) {
      const data = (await cachedResponse.json()) as T;
      return { data, fromCache: true };
    }
    throw err;
  }
}

/**
 * Remove an API endpoint from Cache Storage.
 */
export async function clearCachedApiEndpoint(url: string): Promise<boolean> {
  const cache = await openApiCache();
  if (!cache) return false;
  const deleted = await cache.delete(url);
  await removeCacheMetadata(url);
  return deleted;
}
