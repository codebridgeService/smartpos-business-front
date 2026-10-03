"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { syncAllPosData } from "@/lib/storage/sync-engine";
import {
  StorageChart,
  StorageCategoryList,
  CacheSizeSelector,
  AutoRemoveSettings,
  ClearCacheDialog,
  StorageDrilldownList,
  StorageCacheSkeleton,
} from "@/components/storage";
import {
  type CacheCategory,
  type StorageUsage,
  type PosStoragePolicy,
} from "@/lib/storage/storage-types";
import {
  getStoragePolicy,
  saveStoragePolicy,
  resetStoragePolicy,
  DEFAULT_STORAGE_POLICY,
  formatBytes,
} from "@/lib/storage/storage-policy";
import {
  getBrowserStorageUsage,
  clearCategory,
  clearEntireCache,
  purgeDemoMockEntries,
} from "@/lib/storage/storage-manager";
import { runStorageCleanup } from "@/lib/storage/storage-cleanup";
import { storageCache } from "@/lib/storage/storage-cache";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { permissionsApi } from "@/lib/api/permissions";

export { StorageCacheSkeleton, type StorageCacheSkeletonProps } from "@/components/storage";

interface StorageCacheViewProps {
  className?: string;
}

export function StorageCacheView({ className = "" }: StorageCacheViewProps) {
  const toast = useToast();

  const [policy, setPolicy] = useState<PosStoragePolicy>(DEFAULT_STORAGE_POLICY);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Clear dialog state
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [clearTargetCategories, setClearTargetCategories] = useState<CacheCategory[]>([]);
  const [clearTargetBytes, setClearTargetBytes] = useState(0);

  // Refresh all storage metrics
  const refreshStorageData = useCallback(async () => {
    try {
      const currentPolicy = getStoragePolicy();
      setPolicy(currentPolicy);

      const browserUsage = await getBrowserStorageUsage();
      setUsage(browserUsage);
    } catch (err) {
      console.warn("[StorageCacheView] Error refreshing storage data:", err);
    }
  }, []);

  // Run cleanup, ensure permissions cached, and purge mock demo entries on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        await purgeDemoMockEntries();
        await runStorageCleanup();

        // Check & ensure permission matrix is cached
        if (!storageCache.has("smartpos:cache:permissions")) {
          const storePerms = usePermissionStore.getState().permissions;
          if (storePerms && storePerms.length > 0) {
            storageCache.set("smartpos:cache:permissions", storePerms, 120);
          } else {
            try {
              const perms = await permissionsApi.getAllPermissions();
              if (Array.isArray(perms) && perms.length > 0) {
                storageCache.set("smartpos:cache:permissions", perms, 120);
              }
            } catch {
              // Non-blocking offline
            }
          }
        }
      } catch {
        // Non-blocking
      } finally {
        await refreshStorageData();
        setIsLoading(false);
      }
    }
    init();
  }, [refreshStorageData]);

  // Handle policy update
  const handleUpdatePolicy = (newPolicy: PosStoragePolicy) => {
    setPolicy(newPolicy);
    saveStoragePolicy(newPolicy);
    runStorageCleanup().then((res) => {
      refreshStorageData();
      if (res.expiredCount > 0) {
        toast.success(
          `Retention policy updated. Pruned ${res.expiredCount} expired items (${formatBytes(res.totalFreedBytes)} freed).`
        );
      } else {
        toast.success("Storage policy updated.");
      }
    });
  };

  // Periodic background auto-cleanup watcher
  useEffect(() => {
    const timer = setInterval(() => {
      runStorageCleanup().then(() => {
        refreshStorageData();
      });
    }, 60000);

    return () => clearInterval(timer);
  }, [refreshStorageData]);

  // Open confirmation dialog
  const handleOpenClearDialog = (
    categoriesToClear: CacheCategory[],
    bytesToClear: number
  ) => {
    setClearTargetCategories(categoriesToClear);
    setClearTargetBytes(bytesToClear);
    setIsClearDialogOpen(true);
  };

  // Confirm clear
  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      const allCategories = usage?.categories.map((c) => c.key) || [];
      const isAll =
        clearTargetCategories.length === allCategories.length &&
        clearTargetCategories.length > 0;

      let freed = 0;
      if (isAll) {
        const res = await clearEntireCache();
        freed = res.bytesFreed;
      } else {
        for (const cat of clearTargetCategories) {
          const res = await clearCategory(cat);
          freed += res.bytesFreed;
        }
      }

      await refreshStorageData();
      setIsClearDialogOpen(false);
      toast.success(
        `Cleared ${formatBytes(freed || clearTargetBytes)} of cache safely. Offline POS records preserved.`
      );
    } catch (err) {
      console.error("[StorageCacheView] Clear error:", err);
      toast.error("Failed to clear cache.");
    } finally {
      setIsClearing(false);
    }
  };

  // Clear single category
  const handleClearCategorySingle = async (category: CacheCategory) => {
    setIsClearing(true);
    try {
      const res = await clearCategory(category);
      await refreshStorageData();
      toast.success(`Cleared ${formatBytes(res.bytesFreed)} from ${category}.`);
    } catch {
      toast.error(`Failed to clear ${category}.`);
    } finally {
      setIsClearing(false);
    }
  };

  // Reset policy
  const handleResetPolicy = () => {
    const defaultPol = resetStoragePolicy();
    setPolicy(defaultPol);
    toast.success("Policy reset to default 500 MB.");
    refreshStorageData();
  };

  const totalBytes = usage?.totalBytes ?? 0;
  const categories = usage?.categories ?? [];

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncWithApi = async () => {
    setIsSyncing(true);
    try {
      const result = await syncAllPosData();
      toast.success(
        `Synced ${result.productsCount} products & ${result.categoriesCount} categories from Backend API.`
      );
      await refreshStorageData();
    } catch (err: any) {
      toast.error("Failed to sync with API: " + (err?.message || "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading && !usage) {
    return <StorageCacheSkeleton animation="shimmer" className={className} />;
  }

  return (
    <div className={`space-y-6 text-foreground select-none ${className}`}>
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Storage & Cache Performance
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Realtime client storage breakdown, incremental sync, and retention policies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncWithApi}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold cursor-pointer disabled:opacity-50"
            title="Incremental sync from SmartPOS Backend API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Backend API"}</span>
          </button>

          <button
            type="button"
            onClick={refreshStorageData}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh storage data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Donut Chart & Category Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <StorageChart
            categories={categories}
            totalBytes={totalBytes}
            diskUsagePercentage={usage?.diskUsagePercentage ?? 0.05}
          />

          <StorageCategoryList
            categories={categories}
            totalBytes={totalBytes}
            onClearSelected={handleOpenClearDialog}
            onClearCategorySingle={handleClearCategorySingle}
            isClearing={isClearing}
          />
        </div>

        {/* Right Column: Maximum Cache Size, Auto-Remove, Drilldown Explorer */}
        <div className="lg:col-span-7 space-y-6">
          <CacheSizeSelector
            currentBytes={policy.maxCacheBytes}
            onChange={(newBytes) =>
              handleUpdatePolicy({ ...policy, maxCacheBytes: newBytes })
            }
          />

          <AutoRemoveSettings
            policy={policy}
            onUpdatePolicy={handleUpdatePolicy}
            onTriggerCleanup={async () => {
              const res = await runStorageCleanup();
              await refreshStorageData();
              if (res.expiredCount > 0) {
                toast.success(
                  `Auto-Remove executed: Pruned ${res.expiredCount} expired items (${formatBytes(res.totalFreedBytes)} freed).`
                );
              } else {
                toast.info(
                  "Auto-Remove evaluated: All storage modules are within retention policies."
                );
              }
            }}
          />

          <StorageDrilldownList
            onClearItem={(id, name) => {
              toast.success(`Removed ${name} from storage.`);
              refreshStorageData();
            }}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ClearCacheDialog
        isOpen={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
        onConfirm={handleConfirmClear}
        isClearing={isClearing}
        targetBytes={clearTargetBytes}
        categoryNames={clearTargetCategories}
      />
    </div>
  );
}
