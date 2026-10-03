"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface PosPageSkeletonProps {
  className?: string;
}

export function PosPageSkeleton({ className = "" }: PosPageSkeletonProps) {
  return (
    <div
      data-testid="pos-page-skeleton"
      role="status"
      aria-label="Loading POS Terminal"
      aria-busy="true"
      className={`h-[calc(100vh-4rem)] w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in duration-200 select-none ${className}`}
    >
      {/* Left Column: Product Grid & Category Tabs (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        {/* Top Header & Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <Skeleton animation="shimmer" className="h-10 w-full sm:w-72 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton animation="shimmer" className="h-10 w-28 rounded-xl" />
            <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl" />
            <Skeleton animation="shimmer" className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-hidden py-1">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton
              key={idx}
              animation="shimmer"
              className={`h-9 rounded-full shrink-0 ${
                idx === 0 ? "w-24 bg-primary/20" : "w-20"
              }`}
            />
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between gap-2"
            >
              <Skeleton animation="shimmer" className="h-24 w-full rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton animation="shimmer" className="h-4 w-4/5 rounded-md" />
                <Skeleton animation="shimmer" className="h-3 w-1/2 rounded-md" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Skeleton animation="shimmer" className="h-5 w-16 rounded-md" />
                <Skeleton animation="shimmer" className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Cart & Checkout Summary (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-4 h-full">
        <div className="flex-1 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs p-4 flex flex-col justify-between gap-4">
          {/* Cart Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Skeleton animation="shimmer" className="h-6 w-32 rounded-lg" />
              <Skeleton animation="shimmer" className="h-7 w-16 rounded-md" />
            </div>

            {/* Customer Selector */}
            <Skeleton animation="shimmer" className="h-10 w-full rounded-xl" />

            {/* Cart Items List */}
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 py-1">
                  <div className="space-y-1 flex-1">
                    <Skeleton animation="shimmer" className="h-4 w-32 rounded-md" />
                    <Skeleton animation="shimmer" className="h-3 w-16 rounded-md" />
                  </div>
                  <Skeleton animation="shimmer" className="h-7 w-20 rounded-lg" />
                  <Skeleton animation="shimmer" className="h-4 w-12 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Cart Totals & Checkout Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton animation="shimmer" className="h-3.5 w-16 rounded-md" />
                <Skeleton animation="shimmer" className="h-3.5 w-16 rounded-md" />
              </div>
              <div className="flex justify-between">
                <Skeleton animation="shimmer" className="h-3.5 w-12 rounded-md" />
                <Skeleton animation="shimmer" className="h-3.5 w-14 rounded-md" />
              </div>
              <div className="flex justify-between pt-1 font-semibold">
                <Skeleton animation="shimmer" className="h-5 w-20 rounded-md" />
                <Skeleton animation="shimmer" className="h-6 w-24 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton animation="shimmer" className="h-11 w-full rounded-xl" />
              <Skeleton animation="shimmer" className="h-11 w-full rounded-xl bg-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
