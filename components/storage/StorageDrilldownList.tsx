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
  Users,
  Key,
  UserCheck,
  ShieldAlert,
  Building2,
  Package,
  Layers,
  Tag,
  Sliders,
  Zap,
  Sparkles,
  Megaphone,
  CheckCheck,
  ToggleLeft,
  Database,
  Search,
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
import { Skeleton } from "@/components/ui/skeleton";

export interface DrilldownItem {
  id: string;
  name: string;
  rawKey?: string;
  category: "catalog" | "media" | "files" | "offline" | "localstorage";
  sizeBytes: number;
  subtitle: string;
  avatarColor: string;
  isProtected?: boolean;
  icon?: React.ReactNode;
}

interface StorageDrilldownListProps {
  onClearItem?: (id: string, name: string) => void;
  className?: string;
}

/**
 * Returns human-friendly metadata, semantic icon, and theme colors for safe cache keys.
 */
function getLocalStorageItemMeta(key: string): {
  name: string;
  subtitle: string;
  avatarColor: string;
  icon: React.ReactNode;
} {
  switch (key) {
    case "smartpos:cache:users":
      return {
        name: "Users Management",
        subtitle: "Users & Staff Profiles",
        avatarColor: "bg-blue-600 dark:bg-blue-500",
        icon: <Users className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:roles":
      return {
        name: "Roles & RBAC",
        subtitle: "Role Definitions & Access Rules",
        avatarColor: "bg-indigo-600 dark:bg-indigo-500",
        icon: <UserCheck className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:permissions":
      return {
        name: "System Permissions Matrix",
        subtitle: "Role-Permission Mappings & Entitlements",
        avatarColor: "bg-purple-600 dark:bg-purple-500",
        icon: <Key className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:security-events":
      return {
        name: "Security Audit Logs",
        subtitle: "Forensic Events & Anomaly Audit",
        avatarColor: "bg-rose-600 dark:bg-rose-500",
        icon: <ShieldAlert className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:companies":
      return {
        name: "Companies Management",
        subtitle: "Company & Business Tenants",
        avatarColor: "bg-amber-600 dark:bg-amber-500",
        icon: <Building2 className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:products":
      return {
        name: "Product Catalog",
        subtitle: "Cached Inventory & SKU Metadata",
        avatarColor: "bg-emerald-600 dark:bg-emerald-500",
        icon: <Package className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:categories":
      return {
        name: "Product Categories",
        subtitle: "POS Category Hierarchy",
        avatarColor: "bg-teal-600 dark:bg-teal-500",
        icon: <Layers className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:brands":
      return {
        name: "Brands Catalog",
        subtitle: "Manufacturer Brand Data",
        avatarColor: "bg-cyan-600 dark:bg-cyan-500",
        icon: <Tag className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:business-settings":
      return {
        name: "Business Settings",
        subtitle: "Store Tax, Receipts & Preferences",
        avatarColor: "bg-slate-700 dark:bg-zinc-700",
        icon: <Sliders className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:api":
    case "smartpos:cache:react-query":
      return {
        name: "API Query Cache",
        subtitle: "Cached API Responses & TanStack Query",
        avatarColor: "bg-orange-600 dark:bg-orange-500",
        icon: <Zap className="w-4 h-4 text-white" />,
      };
    case "smartpos:cache:images":
      return {
        name: "Image Metadata",
        subtitle: "Cached Image URLs & CDN References",
        avatarColor: "bg-pink-600 dark:bg-pink-500",
        icon: <ImageIcon className="w-4 h-4 text-white" />,
      };
    case "smartpos_system_changelogs_cache":
      return {
        name: "System Changelogs",
        subtitle: "Release Notes & Version History",
        avatarColor: "bg-sky-600 dark:bg-sky-500",
        icon: <Sparkles className="w-4 h-4 text-white" />,
      };
    case "smartpos_announcements":
      return {
        name: "System Announcements",
        subtitle: "Platform Bulletins & Alerts",
        avatarColor: "bg-amber-500 dark:bg-amber-600",
        icon: <Megaphone className="w-4 h-4 text-white" />,
      };
    case "smartpos_announcement_reads":
      return {
        name: "Read Announcements State",
        subtitle: "User Acknowledged Alerts & Reads",
        avatarColor: "bg-teal-600 dark:bg-teal-500",
        icon: <CheckCheck className="w-4 h-4 text-white" />,
      };
    case "smartpos_feature_controls":
      return {
        name: "Feature Controls & Flags",
        subtitle: "Dynamic Feature Toggles & Switches",
        avatarColor: "bg-violet-600 dark:bg-violet-500",
        icon: <ToggleLeft className="w-4 h-4 text-white" />,
      };
    default: {
      let friendlyName = key;
      if (key.startsWith("smartpos:cache:")) {
        friendlyName = key.replace("smartpos:cache:", "");
      } else if (key.startsWith("smartpos_")) {
        friendlyName = key.replace(/^smartpos_/, "").replace(/_cache$/, "");
      }
      friendlyName = friendlyName
        .split(/[-_:]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

      return {
        name: friendlyName || "Cache Dataset",
        subtitle: key,
        avatarColor: "bg-emerald-600 dark:bg-emerald-500",
        icon: <Database className="w-4 h-4 text-white" />,
      };
    }
  }
}

export function StorageDrilldownList({
  onClearItem,
  className = "",
}: StorageDrilldownListProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "media" | "files" | "offline" | "localstorage">("localstorage");
  const [items, setItems] = useState<DrilldownItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
          const meta = getLocalStorageItemMeta(key);

          realItems.push({
            id: key,
            name: meta.name,
            rawKey: key,
            category: "localstorage",
            sizeBytes,
            subtitle: meta.subtitle,
            avatarColor: meta.avatarColor,
            icon: meta.icon,
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

  const filteredItems = items
    .filter((item) => item.category === activeTab)
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.rawKey && item.rawKey.toLowerCase().includes(q))
      );
    });

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
          { key: "localstorage", label: "Local Storage" },
          { key: "catalog", label: "Catalog" },
          { key: "media", label: "Media" },
          { key: "files", label: "Reports" },
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

      {/* Search Input Bar */}
      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTab === "localstorage" ? "cache items (e.g. users, permissions)..." : "items..."}`}
            className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-zinc-900 focus:outline-hidden transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-450 dark:placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer p-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Item Rows */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 p-2">
        {isLoading ? (
          <div className="space-y-2 p-1" role="status" aria-busy="true">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-850/30"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <Skeleton animation="shimmer" className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Skeleton animation="shimmer" className="h-4 w-36 sm:w-48 rounded-md" />
                    <Skeleton animation="shimmer" className="h-3 w-20 sm:w-28 rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton animation="shimmer" className="h-5 w-16 rounded-md" />
                  <Skeleton animation="shimmer" className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
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
                  {item.icon ? (
                    item.icon
                  ) : item.category === "media" ? (
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
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 shrink-0">
                        Protected
                      </span>
                    ) : item.category === "localstorage" ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                        Safe Cache
                      </span>
                    ) : null}
                    {item.rawKey ? (
                      <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 truncate" title={item.rawKey}>
                        {item.rawKey}
                      </span>
                    ) : (
                      <span>{item.subtitle}</span>
                    )}
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
