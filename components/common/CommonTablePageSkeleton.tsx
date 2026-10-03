"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface CommonTablePageSkeletonProps {
  className?: string;
  columns?: number;
  rows?: number;
  showKpis?: boolean;
}

export function CommonTablePageSkeleton({
  className = "",
  columns = 5,
  rows = 8,
  showKpis = true,
}: CommonTablePageSkeletonProps) {
  return (
    <div
      data-testid="common-table-page-skeleton"
      role="status"
      aria-label="Loading page data"
      aria-busy="true"
      className={`space-y-6 w-full pb-12 select-none animate-in fade-in duration-200 ${className}`}
    >
      {/* Top Banner / Breadcrumb Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-3.5 w-16 rounded-md" />
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <Skeleton animation="shimmer" className="h-3.5 w-24 rounded-md" />
          </div>

          <div className="flex items-center gap-3">
            <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl shrink-0" />
            <Skeleton animation="shimmer" className="h-8 w-56 sm:w-72 rounded-xl" />
          </div>
          <Skeleton animation="shimmer" className="h-4 w-full max-w-md rounded-md" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Skeleton animation="shimmer" className="h-9 w-28 rounded-xl" />
          <Skeleton animation="shimmer" className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Row (optional) */}
      {showKpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3"
            >
              <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton animation="shimmer" className="h-3 w-16 rounded-md" />
                <Skeleton animation="shimmer" className="h-6 w-12 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden space-y-4 p-4">
        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <Skeleton animation="shimmer" className="h-10 w-full sm:w-72 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-9 w-24 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid gap-4 py-2 px-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Skeleton key={cIdx} animation="shimmer" className="h-4 w-3/4 rounded-md" />
            ))}
          </div>

          {/* Table Data Rows */}
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div
              key={rIdx}
              className="grid gap-4 py-3 px-3 items-center border-b border-slate-100 dark:border-zinc-800/60 last:border-0"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((_, cIdx) => (
                <div key={cIdx} className="flex items-center gap-2">
                  {cIdx === 0 && <Skeleton animation="shimmer" className="h-8 w-8 rounded-lg shrink-0" />}
                  <Skeleton animation="shimmer" className={`h-4 rounded-md ${cIdx === 0 ? "w-2/3" : "w-1/2"}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
