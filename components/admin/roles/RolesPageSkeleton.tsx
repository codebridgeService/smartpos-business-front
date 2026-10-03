"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface RolesPageSkeletonProps {
  className?: string;
}

export function RolesPageSkeleton({ className = "" }: RolesPageSkeletonProps) {
  return (
    <div
      data-testid="roles-page-skeleton"
      className={`space-y-6 w-full pb-12 animate-in fade-in duration-200 ${className}`}
    >
      {/* Top Header & Breadcrumbs Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Breadcrumb row */}
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-3.5 w-14 rounded-md" />
            <span className="text-slate-300 dark:text-zinc-700">/</span>
            <Skeleton animation="shimmer" className="h-3.5 w-24 rounded-md" />
          </div>

          {/* Title & Icon */}
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
          <Skeleton animation="shimmer" className="h-9 w-36 rounded-xl" />
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
            <Skeleton animation="shimmer" className="h-9 w-48 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-36 rounded-xl" />
            <Skeleton animation="shimmer" className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#edf2f9] dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-zinc-700/60">
                <th className="py-3 px-6"><Skeleton animation="shimmer" className="h-3.5 w-16 rounded" /></th>
                <th className="py-3 px-4"><Skeleton animation="shimmer" className="h-3.5 w-24 rounded" /></th>
                <th className="py-3 px-4 hidden lg:table-cell"><Skeleton animation="shimmer" className="h-3.5 w-28 rounded" /></th>
                <th className="py-3 px-4"><Skeleton animation="shimmer" className="h-3.5 w-24 rounded" /></th>
                <th className="py-3 px-6 text-right"><Skeleton animation="shimmer" className="h-3.5 w-16 ml-auto rounded" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {Array.from({ length: 6 }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                  {/* Role Column */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3.5">
                      <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton animation="shimmer" className="h-4 w-28 rounded-md" />
                        <Skeleton animation="shimmer" className="h-3 w-16 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Type & Scope Column */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <Skeleton animation="shimmer" className="h-5 w-24 rounded-md" />
                      <Skeleton animation="shimmer" className="h-4 w-20 rounded-md" />
                    </div>
                  </td>

                  {/* Description Column */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <div className="space-y-1 max-w-sm">
                      <Skeleton animation="shimmer" className="h-3 w-full rounded" />
                      <Skeleton animation="shimmer" className="h-3 w-3/4 rounded" />
                    </div>
                  </td>

                  {/* Permissions Column */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1.5">
                      <Skeleton animation="shimmer" className="h-6 w-28 rounded-lg" />
                      <div className="flex items-center gap-1">
                        <Skeleton animation="shimmer" className="h-4 w-16 rounded" />
                        <Skeleton animation="shimmer" className="h-4 w-16 rounded" />
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton animation="shimmer" className="h-7 w-7 rounded-lg" />
                      <Skeleton animation="shimmer" className="h-7 w-7 rounded-lg" />
                      <Skeleton animation="shimmer" className="h-7 w-7 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800">
          <Skeleton animation="shimmer" className="h-4 w-48 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-8 w-20 rounded-lg" />
            <Skeleton animation="shimmer" className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
