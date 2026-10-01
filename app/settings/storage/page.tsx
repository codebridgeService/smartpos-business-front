"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Database,
  RefreshCw,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { SettingsNav } from "@/components/settings";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  StorageChart,
  StorageCategoryList,
  CacheSizeSelector,
  AutoRemoveSettings,
  ClearCacheDialog,
  OfflineDataStatus,
  StorageDrilldownList,
} from "@/components/storage";
import {
  type CacheCategory,
  type StorageUsage,
  type PosStoragePolicy,
  type OfflineDataStatus as OfflineStatusType,
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
import {
  getOfflineDataStatus,
} from "@/lib/storage/indexeddb-storage";
import { runStorageCleanup } from "@/lib/storage/storage-cleanup";
import { storageCache } from "@/lib/storage/storage-cache";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { permissionsApi } from "@/lib/api/permissions";

export default function ModernStoragePage() {
  const toast = useToast();

  const [policy, setPolicy] = useState<PosStoragePolicy>(DEFAULT_STORAGE_POLICY);
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatusType>({
    pendingSalesCount: 0,
    pendingPaymentsCount: 0,
    syncQueueCount: 0,
    isProtected: true,
  });

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

      const [browserUsage, offline] = await Promise.all([
        getBrowserStorageUsage(),
        getOfflineDataStatus(),
      ]);

      setUsage(browserUsage);
      setOfflineStatus(offline);
    } catch (err) {
      console.warn("[StoragePage] Error refreshing storage data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run cleanup, ensure permissions cached, and purge mock demo entries on page mount
  useEffect(() => {
    async function init() {
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
      }
      await refreshStorageData();
    }
    init();
  }, [refreshStorageData]);

  // Handle policy update
  const handleUpdatePolicy = (newPolicy: PosStoragePolicy) => {
    setPolicy(newPolicy);
    saveStoragePolicy(newPolicy);
    toast.success("Storage policy updated.");
    runStorageCleanup().then(() => {
      refreshStorageData();
    });
  };

  // Open confirmation dialog
  const handleOpenClearDialog = (
    categoriesToClear: CacheCategory[],
    bytesToClear: number
  ) => {
    setClearTargetCategories(categoriesToClear);
    setClearTargetBytes(bytesToClear);
    setIsClearDialogOpen(true);
  };

  // Execute confirmed cache clearing
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
      console.error("[StoragePage] Clear error:", err);
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

  // Seed demo cache (327.9 MB breakdown)
  // Reset policy to defaults
  const handleResetPolicy = () => {
    const defaultPol = resetStoragePolicy();
    setPolicy(defaultPol);
    toast.success("Storage policy reset to defaults (500 MB limit).");
    refreshStorageData();
  };

  const totalBytes = usage?.totalBytes ?? 0;
  const categories = usage?.categories ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans">
      {/* Top Navigation */}
      <SettingsNav />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Header Hero Banner */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Storage & Cache Performance
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Cpu className="w-3 h-3" />
                  Realtime Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Zero data-loss browser storage manager. Protected offline sales, auto-retention rules, and LRU eviction.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshStorageData}
              disabled={isLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetPolicy}
              title="Reset policy to defaults (500 MB)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Donut Chart & Category Breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Donut Chart */}
            <StorageChart
              categories={categories}
              totalBytes={totalBytes}
              diskUsagePercentage={usage?.diskUsagePercentage ?? 0.05}
            />

            {/* Storage Breakdown Checklist & Primary Clear Button */}
            <StorageCategoryList
              categories={categories}
              totalBytes={totalBytes}
              onClearSelected={handleOpenClearDialog}
              onClearCategorySingle={handleClearCategorySingle}
              isClearing={isClearing}
            />
          </div>

          {/* Right Column: Maximum Cache Size, Auto-Remove, Offline Ledger */}
          <div className="lg:col-span-7 space-y-6">
            {/* MAXIMUM CACHE LIMIT Stepped Slider */}
            <CacheSizeSelector
              currentBytes={policy.maxCacheBytes}
              onChange={(newBytes) =>
                handleUpdatePolicy({ ...policy, maxCacheBytes: newBytes })
              }
            />

            {/* AUTO-REMOVE RETENTION POLICIES with Square Gradient Icons */}
            <AutoRemoveSettings
              policy={policy}
              onUpdatePolicy={handleUpdatePolicy}
            />

            {/* PROTECTED OFFLINE POS LEDGER */}
            <OfflineDataStatus
              status={offlineStatus}
            />

            {/* CACHE EXPLORER (Catalog, Media, Reports, Offline Queue) */}
            <StorageDrilldownList
              onClearItem={(id, name) => {
                toast.success(`Removed ${name} from storage.`);
                refreshStorageData();
              }}
            />

            {/* Safety Guarantee Callout */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-3 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                  Zero Data-Loss POS Principle
                </span>
                <p className="leading-relaxed">
                  Cached products and images are disposable. Unsynced customer sales and offline payments in IndexedDB are strictly protected and never touched by cache eviction.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ClearCacheDialog
          isOpen={isClearDialogOpen}
          onClose={() => setIsClearDialogOpen(false)}
          onConfirm={handleConfirmClear}
          isClearing={isClearing}
          targetBytes={clearTargetBytes}
          categoryNames={clearTargetCategories}
        />
      </main>
    </div>
  );
}
