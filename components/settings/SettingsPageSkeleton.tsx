"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface SettingsPageSkeletonProps {
  className?: string;
}

export function SettingsPageSkeleton({ className = "" }: SettingsPageSkeletonProps) {
  return (
    <div
      data-testid="settings-page-skeleton"
      role="status"
      aria-label="Loading settings"
      aria-busy="true"
      className={`space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6 select-none animate-in fade-in duration-200 ${className}`}
    >
      {/* Settings Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="space-y-2">
          <Skeleton animation="shimmer" className="h-8 w-48 rounded-xl" />
          <Skeleton animation="shimmer" className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton animation="shimmer" className="h-9 w-28 rounded-xl" />
          <Skeleton animation="shimmer" className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton
            key={idx}
            animation="shimmer"
            className={`h-9 rounded-xl shrink-0 ${idx === 0 ? "w-28 bg-primary/20" : "w-24"}`}
          />
        ))}
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <Skeleton animation="shimmer" className="h-6 w-40 rounded-lg" />
              <Skeleton animation="shimmer" className="h-3.5 w-64 rounded-md" />
            </div>

            {/* Form Fields Skeletons */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <Skeleton animation="shimmer" className="h-4 w-32 rounded-md" />
                  <Skeleton animation="shimmer" className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Skeleton animation="shimmer" className="h-10 w-24 rounded-xl" />
              <Skeleton animation="shimmer" className="h-10 w-32 rounded-xl bg-primary/20" />
            </div>
          </div>
        </div>

        {/* Right Info / Quick Help Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <Skeleton animation="shimmer" className="h-5 w-32 rounded-md" />
            <div className="space-y-2">
              <Skeleton animation="shimmer" className="h-3.5 w-full rounded-md" />
              <Skeleton animation="shimmer" className="h-3.5 w-4/5 rounded-md" />
              <Skeleton animation="shimmer" className="h-3.5 w-2/3 rounded-md" />
            </div>
            <Skeleton animation="shimmer" className="h-9 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
