"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface PermissionsPageSkeletonProps {
  className?: string;
}

export function PermissionsPageSkeleton({ className = "" }: PermissionsPageSkeletonProps) {
  return (
    <div
      data-testid="permissions-page-skeleton"
      className={`space-y-6 w-full pb-12 animate-in fade-in duration-200 ${className}`}
    >
      {/* Top Header & Breadcrumbs Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-3.5 w-14 rounded-md" />
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <Skeleton animation="shimmer" className="h-3.5 w-20 rounded-md" />
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <Skeleton animation="shimmer" className="h-3.5 w-32 rounded-md" />
          </div>

          {/* Title & Icon */}
          <div className="flex items-center gap-3">
            <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl shrink-0" />
            <Skeleton animation="shimmer" className="h-8 w-64 sm:w-80 rounded-xl" />
          </div>
          <Skeleton animation="shimmer" className="h-4 w-full max-w-lg rounded-md" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Skeleton animation="shimmer" className="h-9 w-32 rounded-xl" />
          <Skeleton animation="shimmer" className="h-9 w-24 rounded-xl" />
          <Skeleton animation="shimmer" className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* KPI Summary Cards Skeleton (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3"
          >
            <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton animation="shimmer" className="h-3 w-20 rounded-md" />
              <Skeleton animation="shimmer" className="h-6 w-14 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Skeleton animation="shimmer" className="h-10 w-full max-w-md rounded-xl" />
          <div className="flex flex-wrap items-center gap-2.5">
            <Skeleton animation="shimmer" className="h-9 w-36 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-32 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Module Accordions Skeleton (3 Modules with rows inside) */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, mIdx) => (
          <div
            key={mIdx}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden"
          >
            {/* Accordion Header */}
            <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton animation="shimmer" className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Skeleton animation="shimmer" className="h-4 w-36 rounded-md" />
                    <Skeleton animation="shimmer" className="h-4 w-16 rounded-md" />
                  </div>
                  <Skeleton animation="shimmer" className="h-3 w-56 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton animation="shimmer" className="h-6 w-24 rounded-full" />
                <Skeleton animation="shimmer" className="h-6 w-6 rounded-md" />
              </div>
            </div>

            {/* Permission Rows */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {Array.from({ length: 3 }).map((_, rIdx) => (
                <div
                  key={rIdx}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <Skeleton animation="shimmer" className="h-4 w-32 rounded-md" />
                      <Skeleton animation="shimmer" className="h-4 w-14 rounded-md" />
                    </div>
                    <Skeleton animation="shimmer" className="h-3 w-72 max-w-full rounded-md" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton animation="shimmer" className="h-7 w-36 rounded-lg" />
                    <Skeleton animation="shimmer" className="h-7 w-7 rounded-lg" />
                    <Skeleton animation="shimmer" className="h-7 w-7 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <Skeleton animation="shimmer" className="h-4 w-52 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton animation="shimmer" className="h-8 w-20 rounded-lg" />
          <Skeleton animation="shimmer" className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
