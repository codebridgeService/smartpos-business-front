"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface AuthPageSkeletonProps {
  className?: string;
}

export function AuthPageSkeleton({ className = "" }: AuthPageSkeletonProps) {
  return (
    <div
      data-testid="auth-page-skeleton"
      role="status"
      aria-label="Loading authentication view"
      aria-busy="true"
      className={`min-h-[80vh] w-full flex items-center justify-center p-4 select-none animate-in fade-in duration-200 ${className}`}
    >
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl space-y-6">
        {/* Brand / Logo Skeleton */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Skeleton animation="shimmer" className="h-12 w-12 rounded-2xl" />
          <Skeleton animation="shimmer" className="h-7 w-48 rounded-xl" />
          <Skeleton animation="shimmer" className="h-4 w-64 rounded-md" />
        </div>

        {/* Input Fields Skeletons */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Skeleton animation="shimmer" className="h-4 w-20 rounded-md" />
            <Skeleton animation="shimmer" className="h-11 w-full rounded-xl" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton animation="shimmer" className="h-4 w-20 rounded-md" />
              <Skeleton animation="shimmer" className="h-3.5 w-28 rounded-md" />
            </div>
            <Skeleton animation="shimmer" className="h-11 w-full rounded-xl" />
          </div>

          <Skeleton animation="shimmer" className="h-11 w-full rounded-xl bg-primary/20 mt-4" />
        </div>

        {/* Footer Link Skeleton */}
        <div className="flex justify-center pt-2">
          <Skeleton animation="shimmer" className="h-4 w-44 rounded-md" />
        </div>
      </div>
    </div>
  );
}
