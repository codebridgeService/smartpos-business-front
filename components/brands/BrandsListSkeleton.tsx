"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface BrandsListSkeletonProps {
  className?: string;
}

export function BrandsListSkeleton({ className = "" }: BrandsListSkeletonProps) {
  return (
    <div
      data-testid="brands-list-skeleton"
      role="status"
      aria-label="Loading brands catalog"
      aria-busy="true"
      className={`space-y-6 w-full pb-12 animate-in fade-in duration-200 ${className}`}
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
            <Skeleton animation="shimmer" className="h-8 w-48 sm:w-64 rounded-xl" />
          </div>
          <Skeleton animation="shimmer" className="h-4 w-full max-w-sm rounded-md" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Skeleton animation="shimmer" className="h-9 w-28 rounded-xl" />
          <Skeleton animation="shimmer" className="h-9 w-32 rounded-xl" />
          <Skeleton animation="shimmer" className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* KPI / Summary Row */}
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

      {/* Filter and Search Bar Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Skeleton animation="shimmer" className="h-10 w-full md:w-80 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-9 w-28 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-24 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Brands Cards / Table Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <Skeleton animation="shimmer" className="h-12 w-12 rounded-xl" />
              <Skeleton animation="shimmer" className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton animation="shimmer" className="h-5 w-3/4 rounded-md" />
              <Skeleton animation="shimmer" className="h-3 w-1/2 rounded-md" />
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
              <Skeleton animation="shimmer" className="h-4 w-20 rounded-md" />
              <Skeleton animation="shimmer" className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
