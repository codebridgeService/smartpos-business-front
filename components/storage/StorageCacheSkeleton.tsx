"use client";

import React from "react";
import { Skeleton, type SkeletonProps } from "@/components/ui/skeleton";

export interface StorageCacheSkeletonProps extends SkeletonProps {
  className?: string;
}

export function StorageCacheSkeleton({
  animation = "shimmer",
  className = "",
  ...props
}: StorageCacheSkeletonProps) {
  return (
    <div
      className={`space-y-6 select-none ${className}`}
      role="status"
      aria-label="Loading storage and cache performance data"
      aria-busy="true"
      {...props}
    >
      {/* Top Header Card Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="space-y-1.5">
          <Skeleton
            animation={animation}
            className="h-6 w-56 sm:w-64 rounded-xl"
          />
          <Skeleton
            animation={animation}
            className="h-3.5 w-72 sm:w-96 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Skeleton
            animation={animation}
            className="h-8 w-32 rounded-xl"
          />
          <Skeleton
            animation={animation}
            className="h-8 w-8 rounded-xl"
          />
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Donut Chart & Category Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* StorageChart Skeleton Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton animation={animation} className="w-8 h-8 rounded-xl" />
                <Skeleton animation={animation} className="h-4.5 w-32 rounded-lg" />
              </div>
              <Skeleton animation={animation} className="h-5 w-20 rounded-md" />
            </div>

            {/* Circular Donut Ring Placeholder */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-2">
              <div className="w-44 h-44 rounded-full border-[22px] border-slate-200/80 dark:border-zinc-800/90 relative overflow-hidden animate-shimmer">
                <div className="absolute inset-0 bg-slate-100/60 dark:bg-zinc-850/60 rounded-full" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1.5">
                <Skeleton animation={animation} className="h-5 w-20 rounded-md" />
                <Skeleton animation={animation} className="h-3 w-14 rounded-sm" />
              </div>
            </div>

            {/* Metric stat boxes */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800/70 bg-slate-50/60 dark:bg-zinc-850/40 space-y-2">
                <Skeleton animation={animation} className="h-3 w-16 rounded-md" />
                <Skeleton animation={animation} className="h-5 w-20 rounded-md" />
              </div>
              <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800/70 bg-slate-50/60 dark:bg-zinc-850/40 space-y-2">
                <Skeleton animation={animation} className="h-3 w-20 rounded-md" />
                <Skeleton animation={animation} className="h-5 w-24 rounded-md" />
              </div>
            </div>

            {/* Disk usage bar */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <Skeleton animation={animation} className="h-3 w-24 rounded-md" />
                <Skeleton animation={animation} className="h-3 w-12 rounded-md" />
              </div>
              <Skeleton animation={animation} className="h-2 w-full rounded-full" />
            </div>
          </div>

          {/* StorageCategoryList Skeleton Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Skeleton animation={animation} className="h-4.5 w-36 rounded-lg" />
                <Skeleton animation={animation} className="h-5 w-6 rounded-md" />
              </div>
              <Skeleton animation={animation} className="h-7 w-20 rounded-lg" />
            </div>

            {/* 4 Category Rows */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100/90 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-850/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton animation={animation} className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton animation={animation} className="h-3.5 w-28 rounded-md" />
                    <Skeleton animation={animation} className="h-2.5 w-16 rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton animation={animation} className="h-5 w-16 rounded-md" />
                  <Skeleton animation={animation} className="w-7 h-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Maximum Cache Size, Auto-Remove, Drilldown Explorer */}
        <div className="lg:col-span-7 space-y-6">
          {/* CacheSizeSelector Skeleton Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton animation={animation} className="w-8 h-8 rounded-xl" />
                <Skeleton animation={animation} className="h-4.5 w-44 rounded-lg" />
              </div>
              <Skeleton animation={animation} className="h-6 w-24 rounded-lg" />
            </div>

            {/* Preset Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {[1, 2, 3, 4].map((btn) => (
                <Skeleton
                  key={btn}
                  animation={animation}
                  className="h-10 rounded-xl"
                />
              ))}
            </div>

            {/* Slider track */}
            <div className="space-y-2 pt-2">
              <Skeleton animation={animation} className="h-2.5 w-full rounded-full" />
              <div className="flex items-center justify-between">
                <Skeleton animation={animation} className="h-3 w-14 rounded-md" />
                <Skeleton animation={animation} className="h-3 w-16 rounded-md" />
              </div>
            </div>
          </div>

          {/* AutoRemoveSettings Skeleton Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Skeleton animation={animation} className="w-8 h-8 rounded-xl" />
              <div className="space-y-1">
                <Skeleton animation={animation} className="h-4.5 w-48 rounded-lg" />
                <Skeleton animation={animation} className="h-3 w-72 rounded-md" />
              </div>
            </div>

            {/* Policy toggle rows */}
            <div className="space-y-2.5 pt-1">
              {[1, 2].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100/90 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-850/30"
                >
                  <div className="space-y-1.5">
                    <Skeleton animation={animation} className="h-3.5 w-40 rounded-md" />
                    <Skeleton animation={animation} className="h-2.5 w-56 sm:w-72 rounded-sm" />
                  </div>
                  <Skeleton animation={animation} className="h-6 w-11 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* StorageDrilldownList Skeleton Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton animation={animation} className="w-8 h-8 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton animation={animation} className="h-4.5 w-32 rounded-lg" />
                  <Skeleton animation={animation} className="h-3 w-48 rounded-md" />
                </div>
              </div>
              <Skeleton animation={animation} className="w-7 h-7 rounded-lg" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800/80 overflow-x-auto">
              {[1, 2, 3, 4, 5].map((tab) => (
                <Skeleton
                  key={tab}
                  animation={animation}
                  className="h-7 w-20 rounded-lg shrink-0"
                />
              ))}
            </div>

            {/* Search Input Placeholder */}
            <Skeleton animation={animation} className="h-9 w-full rounded-xl" />

            {/* 3 Item Rows */}
            <div className="space-y-2 pt-1">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100/90 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-850/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton animation={animation} className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton animation={animation} className="h-3.5 w-36 rounded-md" />
                      <Skeleton animation={animation} className="h-2.5 w-24 rounded-sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton animation={animation} className="h-5 w-16 rounded-md" />
                    <Skeleton animation={animation} className="w-7 h-7 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
