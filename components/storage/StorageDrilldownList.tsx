"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Image as ImageIcon,
  Boxes,
  ShieldCheck,
  Trash2,
  FolderOpen,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { formatBytes } from "@/lib/storage/storage-policy";
import {
  getAllCacheMetadata,
  removeCacheMetadata,
  getAllStoreItems,
} from "@/lib/storage/indexeddb-storage";
import { getPendingSales, getSyncQueueItems } from "@/lib/storage/offline-sales";
import { POS_CACHES } from "@/lib/storage/storage-manager";
import { isSafeCacheKey, HUMAN_LABELS } from "@/lib/storage/storage-cache";

export interface DrilldownItem {
  id: string;
  name: string;
  category: "catalog" | "media" | "files" | "offline" | "localstorage";
  sizeBytes: number;
  subtitle: string;
  avatarColor: string;
  isProtected?: boolean;
}

interface StorageDrilldownListProps {
  onClearItem?: (id: string, name: string) => void;
  className?: string;
}

export function StorageDrilldownList({
  onClearItem,
  className = "",
}: StorageDrilldownListProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "media" | "files" | "offline" | "localstorage">("catalog");
  const [items, setItems] = useState<DrilldownItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load REAL data from IndexedDB, Cache Storage, and browser localStorage
  const loadRealDrilldownItems = useCallback(async () => {
    setIsLoading(true);
    const realItems: DrilldownItem[] = [];

    try {
      // 1. Catalog Items (Products from IndexedDB)
      const products = await getAllStoreItems("products");
      for (const p of products.slice(0, 10)) {
        const pSize = new Blob([JSON.stringify(p)]).size;
        realItems.push({
          id: p.uuid || p.id || `prod-${Math.random()}`,
          name: p.name || "Unnamed Product",
          category: "catalog",
          sizeBytes: pSize,
          subtitle: p.barcode ? `Barcode: ${p.barcode}` : "Cached in IndexedDB",
          avatarColor: "bg-blue-500",
        });
      }

      // 2. Metadata Records (Images, Reports, Files)
      const metadata = await getAllCacheMetadata();
      for (const meta of metadata) {
        if (meta.category === "images") {
          const fileName = meta.cache_key.split("/").pop() || "Cached Image";
          realItems.push({
            id: meta.cache_key,
            name: decodeURIComponent(fileName),
            category: "media",
            sizeBytes: meta.size_bytes || 0,
            subtitle: meta.content_type || "image/webp",
            avatarColor: "bg-emerald-500",
          });
        } else if (meta.category === "reports" || meta.category === "receipts") {
          const fileName = meta.cache_key.split("/").pop() || "Document";
          realItems.push({
            id: meta.cache_key,
            name: decodeURIComponent(fileName),
            category: "files",
            sizeBytes: meta.size_bytes || 0,
            subtitle: meta.category === "reports" ? "Report statement" : "Receipt buffer",
            avatarColor: "bg-purple-600",
          });
        }
      }

      // 3. Offline Queue & Pending Sales (PROTECTED)
      const [pendingSales, syncQueue] = await Promise.all([
        getPendingSales(),
        getSyncQueueItems(),
      ]);

      for (const sale of pendingSales) {
        realItems.push({
          id: sale.uuid,
          name: `Pending Sale: ${sale.customer || "Walk-in Guest"}`,
          category: "offline",
          sizeBytes: new Blob([JSON.stringify(sale)]).size,
          subtitle: `$${Number(sale.total || 0).toFixed(2)} • ${sale.items?.length || 0} items awaiting sync`,
          avatarColor: "bg-emerald-600",
          isProtected: true,
        });
      }

      for (const queueItem of syncQueue) {
        realItems.push({
          id: `queue-${queueItem.id}`,
          name: `Sync Action: ${queueItem.type}`,
          category: "offline",
          sizeBytes: new Blob([JSON.stringify(queueItem)]).size,
          subtitle: `Queued • ${new Date(queueItem.created_at).toLocaleTimeString()}`,
          avatarColor: "bg-amber-600",
          isProtected: true,
        });
      }

      // 4. Real Browser localStorage Entries - ONLY SAFE CACHE DATASETS (Protected system keys strictly hidden)
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;

          // Strictly filter out protected keys (tokens, hardware UUIDs, settings)
          const isSafe = isSafeCacheKey(key);
          if (!isSafe) {
            continue; // Do NOT show protected items - show ONLY safe cache datasets
          }

          const val = localStorage.getItem(key) || "";
          const sizeBytes = new Blob([val]).size;
          const humanLabel = HUMAN_LABELS[key] || "Safe Cache Dataset";

          realItems.push({
            id: key,
            name: key,
            category: "localstorage",
            sizeBytes,
            subtitle: `${humanLabel} • Safe Cache`,
            avatarColor: "bg-emerald-600",
            isProtected: false,
          });
        }
      }
    } catch (err) {
      console.warn("[StorageDrilldownList] Error loading real storage items:", err);
    } finally {
      setItems(realItems);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRealDrilldownItems();
  }, [loadRealDrilldownItems]);

  const filteredItems = items.filter((item) => item.category === activeTab);

  const handleRemove = async (id: string, name: string) => {
    try {
      if (activeTab === "localstorage") {
        if (typeof window !== "undefined") {
          localStorage.removeItem(id);
        }
      } else {
        // Remove from metadata
        await removeCacheMetadata(id);

        // Remove from Cache Storage if URL
        if (typeof window !== "undefined" && "caches" in window && id.startsWith("http")) {
          const cache = await window.caches.open(POS_CACHES.images);
          await cache.delete(id);
        }
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      if (onClearItem) {
        onClearItem(id, name);
      }
    } catch (err) {
      console.warn("[StorageDrilldownList] Error purging item:", err);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden select-none ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Cache Explorer
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Inspect or purge individual stored assets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadRealDrilldownItems}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Refresh cached assets list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center border-b border-zinc-200/80 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-850/40 overflow-x-auto">
        {[
          { key: "catalog", label: "Catalog" },
          { key: "media", label: "Media" },
          { key: "files", label: "Reports" },
          { key: "localstorage", label: "Local Storage" },
          { key: "offline", label: "Offline Queue" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 pb-3 pt-2 text-center text-xs sm:text-[13px] font-semibold transition-all relative cursor-pointer whitespace-nowrap px-2 ${
                isActive
                  ? "text-primary font-bold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-t-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Item Rows */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 p-2">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Reading local browser storage...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {activeTab === "offline"
              ? "No pending offline transactions. All sales are synced with the server."
              : activeTab === "media"
              ? "No images cached yet. Avatars, logos, and product media will appear here as they are loaded."
              : activeTab === "files"
              ? "No offline reports cached. Exported statements will appear here."
              : activeTab === "localstorage"
              ? "No safe cache datasets found in localStorage. Sensitive tokens and protected system keys are securely hidden."
              : "No catalog products cached in IndexedDB yet."}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors group"
            >
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${item.avatarColor}`}
                >
                  {item.category === "media" ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : item.category === "files" ? (
                    <FileText className="w-4 h-4" />
                  ) : item.category === "localstorage" ? (
                    <HardDrive className="w-4 h-4" />
                  ) : item.isProtected ? (
                    <ShieldCheck className="w-4 h-4 text-white" />
                  ) : (
                    <Boxes className="w-4 h-4" />
                  )}
                </div>

                <div className="truncate pr-2">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                    {item.isProtected ? (
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                        Protected
                      </span>
                    ) : item.category === "localstorage" ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        Safe Cache
                      </span>
                    ) : null}
                    <span>{item.subtitle}</span>
                  </div>
                </div>
              </div>

              {/* Right: Size & Action */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300">
                  {formatBytes(item.sizeBytes)}
                </span>
                {!item.isProtected && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.name)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title={`Purge ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
