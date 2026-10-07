import React, { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { StorageCacheSkeleton } from "@/components/storage";

const StorageCacheView = dynamic(
  () =>
    import("@/components/settings/storage-cache-view").then(
      (mod) => mod.StorageCacheView
    ),
  {
    loading: () => <StorageCacheSkeleton animation="shimmer" />,
  }
);

export const metadata: Metadata = {
  title: "Storage & Cache Management | SmartPOS Business",
  description:
    "Real-time browser storage breakdown, IndexedDB catalog caching, sync engine, and offline POS retention policies.",
};

export default function BusinessStoragePage() {
  return (
    <div className="space-y-6 w-full pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
          <span>Businesses</span>
          <span>/</span>
          <span>Settings</span>
          <span>/</span>
          <span className="text-[#FE9F43] font-bold">Storage & Cache</span>
        </div>
      </div>

      <Suspense fallback={<StorageCacheSkeleton animation="shimmer" />}>
        <StorageCacheView />
      </Suspense>
    </div>
  );
}
