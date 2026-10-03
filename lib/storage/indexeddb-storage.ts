/**
 * SmartPOS IndexedDB Storage Layer
 * Manages clearable cache stores and STRICTLY PROTECTED offline POS stores.
 *
 * DB Name: smartpos_storage_v1
 *
 * Safe Clearable Stores:
 * - cache_metadata
 * - cached_products
 * - cached_categories
 * - cached_inventory
 *
 * PROTECTED Stores (NEVER cleared during cache clear/cleanup):
 * - pending_sales
 * - pending_payments
 * - sync_queue
 */

import {
  type CacheCategory,
  type CacheMetadataRecord,
  type OfflineDataStatus,
} from "./storage-types";

export type { CacheCategory, CacheMetadataRecord, OfflineDataStatus };

export const DB_NAME = "smartpos_storage_v1";
export const DB_VERSION = 2;

export const CLEARABLE_STORES = [
  "cache_metadata",
  "cached_products",
  "cached_categories",
  "cached_inventory",
  "products",
  "categories",
  "brands",
  "units",
  "prices",
  "inventory",
] as const;

export const PROTECTED_STORES = [
  "pending_sales",
  "pending_payments",
  "sync_queue",
  "sync_state",
] as const;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or retrieve the singleton IndexedDB connection.
 */
export async function getIndexedDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not supported or running in server environment.");
  }

  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. cache_metadata store
      if (!db.objectStoreNames.contains("cache_metadata")) {
        const metadataStore = db.createObjectStore("cache_metadata", {
          keyPath: "cache_key",
        });
        metadataStore.createIndex("category", "category", { unique: false });
        metadataStore.createIndex("last_accessed_at", "last_accessed_at", {
          unique: false,
        });
        metadataStore.createIndex("expires_at", "expires_at", { unique: false });
      }

      // 2. Structured Clearable POS Stores (Offline-First Catalog)
      const catalogStores = [
        "products",
        "categories",
        "brands",
        "units",
        "prices",
        "inventory",
        "cached_products",
        "cached_categories",
        "cached_inventory",
      ];
      for (const store of catalogStores) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "uuid" });
        }
      }

      // 3. PROTECTED Offline Stores (Never cleared automatically)
      if (!db.objectStoreNames.contains("pending_sales")) {
        db.createObjectStore("pending_sales", { keyPath: "uuid" });
      }
      if (!db.objectStoreNames.contains("pending_payments")) {
        db.createObjectStore("pending_payments", { keyPath: "uuid" });
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("sync_state")) {
        db.createObjectStore("sync_state", { keyPath: "resource" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      dbPromise = null;
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

export { getIndexedDb as getIndexDb };

/**
 * Save or update cache metadata in IndexedDB.
 */
export async function saveCacheMetadata(
  record: CacheMetadataRecord
): Promise<void> {
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_metadata", "readwrite");
    const store = tx.objectStore("cache_metadata");
    const req = store.put(record);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get cache metadata record by key.
 */
export async function getCacheMetadata(
  key: string
): Promise<CacheMetadataRecord | null> {
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_metadata", "readonly");
    const store = tx.objectStore("cache_metadata");
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all cache metadata records.
 */
export async function getAllCacheMetadata(): Promise<CacheMetadataRecord[]> {
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_metadata", "readonly");
    const store = tx.objectStore("cache_metadata");
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove a single cache metadata entry.
 */
export async function removeCacheMetadata(key: string): Promise<void> {
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_metadata", "readwrite");
    const store = tx.objectStore("cache_metadata");
    const req = store.delete(key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove multiple cache metadata entries.
 */
export async function removeCacheMetadataBatch(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cache_metadata", "readwrite");
    const store = tx.objectStore("cache_metadata");

    for (const key of keys) {
      store.delete(key);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Clear ONLY clearable IndexedDB stores.
 * Strictly guarantees that pending_sales, pending_payments, and sync_queue are NEVER cleared.
 */
export async function clearClearableIndexedDb(): Promise<void> {
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLEARABLE_STORES, "readwrite");

    for (const storeName of CLEARABLE_STORES) {
      tx.objectStore(storeName).clear();
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Clear metadata entries belonging to specific category and clear associated store if any.
 */
export async function clearCategoryIndexedDb(
  category: CacheCategory
): Promise<string[]> {
  const db = await getIndexedDb();
  const allMetadata = await getAllCacheMetadata();
  const matched = allMetadata.filter((m) => m.category === category);
  const keysToRemove = matched.map((m) => m.cache_key);

  if (keysToRemove.length > 0) {
    await removeCacheMetadataBatch(keysToRemove);
  }

  // Clear specific object stores if direct mapping exists
  if (category === "products") {
    const storesToClear = [
      "products",
      "cached_products",
      "categories",
      "cached_categories",
      "brands",
      "units",
      "prices",
    ].filter((s) => db.objectStoreNames.contains(s));

    if (storesToClear.length > 0) {
      const tx = db.transaction(storesToClear, "readwrite");
      for (const s of storesToClear) {
        tx.objectStore(s).clear();
      }
    }
  } else if (category === "inventory") {
    const storesToClear = ["inventory", "cached_inventory"].filter((s) =>
      db.objectStoreNames.contains(s)
    );
    if (storesToClear.length > 0) {
      const tx = db.transaction(storesToClear, "readwrite");
      for (const s of storesToClear) {
        tx.objectStore(s).clear();
      }
    }
  }

  return keysToRemove;
}

/**
 * Query current counts of PROTECTED offline transactions.
 */
export async function getOfflineDataStatus(): Promise<OfflineDataStatus> {
  try {
    const db = await getIndexedDb();

    const countInStore = (storeName: (typeof PROTECTED_STORES)[number]): Promise<number> => {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);
          const req = store.count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => resolve(0);
        } catch {
          resolve(0);
        }
      });
    };

    const [sales, payments, queue] = await Promise.all([
      countInStore("pending_sales"),
      countInStore("pending_payments"),
      countInStore("sync_queue"),
    ]);

    return {
      pendingSalesCount: sales,
      pendingPaymentsCount: payments,
      syncQueueCount: queue,
      isProtected: true,
    };
  } catch (err) {
    console.warn("[IndexedDB] Could not query offline data status:", err);
    return {
      pendingSalesCount: 0,
      pendingPaymentsCount: 0,
      syncQueueCount: 0,
      isProtected: true,
    };
  }
}

/**
 * Save an item in a specific IndexedDB store.
 */
export async function putStoreItem(storeName: string, item: any): Promise<void> {
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        return resolve();
      }
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Save multiple items into an IndexedDB store in a single transaction.
 */
export async function putStoreItemsBatch(storeName: string, items: any[]): Promise<void> {
  if (items.length === 0) return;
  const db = await getIndexedDb();
  return new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        return resolve();
      }
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Retrieve all items from a given store.
 */
export async function getAllStoreItems<T = any>(storeName: string): Promise<T[]> {
  try {
    const db = await getIndexedDb();
    if (!db.objectStoreNames.contains(storeName)) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Estimate the actual serialized byte size of an object store.
 */
export async function getStoreEstimatedBytes(storeName: string): Promise<number> {
  try {
    const items = await getAllStoreItems(storeName);
    if (!items || items.length === 0) return 0;
    const jsonStr = JSON.stringify(items);
    return new Blob([jsonStr]).size;
  } catch {
    return 0;
  }
}

