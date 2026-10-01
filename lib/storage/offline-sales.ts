/**
 * SmartPOS Offline Sales & Transaction Queue Manager
 *
 * Implements resilient offline cashier operation:
 * - When offline: stores sales and payments in IndexedDB (pending_sales, pending_payments).
 * - Enqueues sync actions in sync_queue.
 * - Listens for internet connectivity restoration ('online' event).
 * - Automatically uploads pending sales once the network returns.
 * - These tables are STRICTLY PROTECTED and never touched by cache eviction.
 */

import {
  getIndexDb,
  putStoreItem,
  getAllStoreItems,
  getOfflineDataStatus,
} from "./indexeddb-storage";
import { type OfflineDataStatus } from "./storage-types";

export interface PendingSale {
  uuid: string;
  customer?: string;
  items: Array<{
    product_uuid: string;
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  created_at: number;
  status: "pending_upload" | "syncing" | "failed";
  retry_count: number;
  error_message?: string;
}

export interface SyncQueueItem {
  id?: number;
  type: "sale.create" | "payment.process" | "inventory.adjust";
  payload: any;
  status: "pending" | "processing" | "failed";
  retry_count: number;
  created_at: number;
}

/**
 * Save a new pending sale created while offline.
 */
export async function createOfflineSale(sale: Omit<PendingSale, "status" | "retry_count">): Promise<PendingSale> {
  const fullSale: PendingSale = {
    ...sale,
    status: "pending_upload",
    retry_count: 0,
  };

  await putStoreItem("pending_sales", fullSale);

  // Enqueue in sync queue
  const queueItem: SyncQueueItem = {
    type: "sale.create",
    payload: fullSale,
    status: "pending",
    retry_count: 0,
    created_at: Date.now(),
  };

  await putStoreItem("sync_queue", queueItem);

  return fullSale;
}

/**
 * Retrieve all pending sales awaiting upload.
 */
export async function getPendingSales(): Promise<PendingSale[]> {
  return getAllStoreItems<PendingSale>("pending_sales");
}

/**
 * Retrieve all items in the sync queue.
 */
export async function getSyncQueueItems(): Promise<SyncQueueItem[]> {
  return getAllStoreItems<SyncQueueItem>("sync_queue");
}

import { apiClient } from "@/lib/api/client";

/**
 * Submit a sale with offline resilience:
 * If online: tries to POST directly to backend API.
 * If offline or network error: automatically persists to IndexedDB pending_sales and sync_queue.
 */
export async function submitSaleWithOfflineFallback(
  saleData: Omit<PendingSale, "status" | "retry_count" | "created_at">
): Promise<{ success: boolean; offline: boolean; data?: any; error?: string }> {
  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  if (isOnline) {
    try {
      const response = await apiClient.post<{ message?: string; data?: any }>("/sales", saleData);
      return { success: true, offline: false, data: response };
    } catch (err: any) {
      // If error is network-related (0 or timeout), fall through to offline save
      if (err?.status === 0 || err?.message?.includes("network") || err?.message?.includes("fetch")) {
        console.warn("[OfflineSales] Network down during checkout, queuing sale locally:", err);
      } else {
        // Validation / business error from backend: return without queuing broken payload
        return {
          success: false,
          offline: false,
          error: err?.message || "Failed to process sale on server",
        };
      }
    }
  }

  // Save offline in IndexedDB
  await createOfflineSale({
    ...saleData,
    created_at: Date.now(),
  });
  return { success: true, offline: true };
}

/**
 * Process the offline sync queue.
 * Uploads queued sales to the server API and purges synced records upon success.
 */
export async function processSyncQueue(
  uploader?: (item: SyncQueueItem) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { processed: 0, failed: 0 };
  }

  const queue = await getSyncQueueItems();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  const db = await getIndexDb();
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      let isSuccess = false;
      if (uploader) {
        isSuccess = await uploader(item);
      } else {
        // Real Backend API Dispatch
        try {
          if (item.type === "sale.create") {
            await apiClient.post("/sales", item.payload);
            isSuccess = true;
          } else if (item.type === "payment.process") {
            await apiClient.post("/payments", item.payload);
            isSuccess = true;
          } else {
            await apiClient.post("/sync/events", item.payload);
            isSuccess = true;
          }
        } catch (apiErr: any) {
          // If network connection dropped, abort further queue processing
          if (apiErr?.status === 0) {
            failed += 1;
            break;
          }
          console.warn(`[OfflineSales] Failed to sync item #${item.id}:`, apiErr);
          isSuccess = false;
        }
      }

      if (isSuccess && item.id) {
        // Remove from sync queue and pending sales
        const tx = db.transaction(["sync_queue", "pending_sales"], "readwrite");
        tx.objectStore("sync_queue").delete(item.id);
        if (item.type === "sale.create" && item.payload?.uuid) {
          tx.objectStore("pending_sales").delete(item.payload.uuid);
        }
        processed += 1;
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  return { processed, failed };
}

/**
 * Initialize automatic background sync when internet connection returns.
 */
export function setupOfflineSyncListener(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    console.info("[SmartPOS Sync] Internet connection detected. Processing sync queue...");
    processSyncQueue().catch((err) => {
      console.warn("[SmartPOS Sync] Error processing sync queue:", err);
    });
  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };
}
