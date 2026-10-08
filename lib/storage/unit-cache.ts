/**
 * SmartPOS Units IndexedDB Cache Layer
 * Provides robust offline storage, background caching, and client-side querying
 * backed by the singleton IndexedDB "units" object store.
 */

import { type Unit, type UnitMeta, type GetUnitsParams, unitsApi } from "@/lib/api/units";
import {
  getIndexedDb,
  putStoreItemsBatch,
  getAllStoreItems,
  saveCacheMetadata,
} from "./indexeddb-storage";
import { type CacheMetadataRecord } from "./storage-types";

const UNIT_STORE_NAME = "units";
const CACHE_METADATA_KEY = "units:catalog_cache";
const UNIT_CACHE_TTL_SECONDS = 3600; // 1 hour

export interface CachedUnitsResult {
  data: Unit[];
  meta: UnitMeta;
  isOffline: boolean;
  totalCached: number;
  lastCachedAt?: string;
}

/**
 * Persists an array of units to IndexedDB "units" store
 * and tracks storage footprint in cache_metadata.
 */
export async function saveUnitsToIndexedDb(units: Unit[]): Promise<void> {
  if (!units || units.length === 0) return;

  try {
    // 1. Write unit records to IndexedDB store
    await putStoreItemsBatch(UNIT_STORE_NAME, units);

    // 2. Track in cache_metadata for storage settings transparency
    const jsonStr = JSON.stringify(units);
    const byteSize = typeof Blob !== "undefined" ? new Blob([jsonStr]).size : jsonStr.length;

    const now = Date.now();
    const metadata: CacheMetadataRecord = {
      cache_key: CACHE_METADATA_KEY,
      category: "products",
      size_bytes: byteSize,
      cached_at: now,
      last_accessed_at: now,
      expires_at: now + UNIT_CACHE_TTL_SECONDS * 1000,
      content_type: "application/json",
      storage_target: "indexed_db",
    };

    await saveCacheMetadata(metadata);
  } catch (error) {
    console.warn("[UnitCache] Failed to persist units to IndexedDB:", error);
  }
}

/**
 * Read all cached units from IndexedDB with client-side filtering.
 */
export async function getCachedUnitsFromIndexedDb(
  params?: GetUnitsParams
): Promise<Unit[]> {
  try {
    const all = await getAllStoreItems<Unit>(UNIT_STORE_NAME);
    if (!all || all.length === 0) {
      return [];
    }

    let filtered = [...all];

    // Filter by business UUID if provided
    if (params?.business_uuid) {
      filtered = filtered.filter((u) => u.business_uuid === params.business_uuid);
    }

    // Filter by active status if provided
    if (params?.is_active !== undefined && params.is_active !== "") {
      const activeFlag =
        typeof params.is_active === "boolean"
          ? params.is_active
          : params.is_active === "true" || params.is_active === "1";
      filtered = filtered.filter((u) => Boolean(u.is_active) === activeFlag);
    }

    // Search query filter
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q) ||
          u.symbol.toLowerCase().includes(q)
      );
    }

    // Sort by name ascending
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  } catch (error) {
    console.warn("[UnitCache] Error reading from IndexedDB:", error);
    return [];
  }
}

/**
 * Removes a single unit record from IndexedDB "units" store by uuid or id.
 */
export async function removeUnitFromIndexedDb(idOrUuid: string | number): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (!db.objectStoreNames.contains(UNIT_STORE_NAME)) return;

    const tx = db.transaction(UNIT_STORE_NAME, "readwrite");
    const store = tx.objectStore(UNIT_STORE_NAME);

    if (typeof idOrUuid === "string") {
      store.delete(idOrUuid);
    } else {
      const all = await getAllStoreItems<Unit>(UNIT_STORE_NAME);
      const match = all.find((u) => u.id === idOrUuid);
      if (match?.uuid) {
        store.delete(match.uuid);
      }
    }
  } catch (error) {
    console.warn(`[UnitCache] Could not delete unit ${idOrUuid} from IndexedDB:`, error);
  }
}

/**
 * Purges the entire units object store in IndexedDB.
 */
export async function clearUnitsIndexedDbCache(): Promise<void> {
  try {
    const db = await getIndexedDb();
    if (db.objectStoreNames.contains(UNIT_STORE_NAME)) {
      const tx = db.transaction(UNIT_STORE_NAME, "readwrite");
      tx.objectStore(UNIT_STORE_NAME).clear();
    }
  } catch (error) {
    console.warn("[UnitCache] Could not clear units store in IndexedDB:", error);
  }
}

/**
 * Network-first query helper with offline fallback:
 * 1. Attempts to fetch fresh data from unitsApi.getUnits()
 * 2. On success, persists records to IndexedDB and returns API response
 * 3. On network error, gracefully falls back to local IndexedDB records
 */
export async function fetchUnitsWithIndexedDbCache(
  params?: GetUnitsParams
): Promise<CachedUnitsResult> {
  try {
    const remoteResponse = await unitsApi.getUnits(params);

    if (remoteResponse?.data && remoteResponse.data.length > 0) {
      saveUnitsToIndexedDb(remoteResponse.data).catch(() => {});
    }

    return {
      data: remoteResponse.data,
      meta: remoteResponse.meta,
      isOffline: false,
      totalCached: remoteResponse.data.length,
      lastCachedAt: new Date().toISOString(),
    };
  } catch (netError) {
    console.warn("[UnitCache] Network error, falling back to IndexedDB:", netError);

    const offlineUnits = await getCachedUnitsFromIndexedDb(params);

    const page = params?.page || 1;
    const perPage = params?.per_page || 15;
    const total = offlineUnits.length;
    const startIndex = (page - 1) * perPage;
    const paginatedItems = offlineUnits.slice(startIndex, startIndex + perPage);

    return {
      data: paginatedItems,
      meta: {
        current_page: page,
        last_page: Math.max(1, Math.ceil(total / perPage)),
        per_page: perPage,
        total,
      },
      isOffline: true,
      totalCached: total,
      lastCachedAt: new Date().toISOString(),
    };
  }
}
