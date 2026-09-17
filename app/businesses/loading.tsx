"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function BusinessLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl bg-slate-900/5 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl w-full">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Metrics Row Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </Card>
        ))}
      </div>

      {/* Main Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3 w-60 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {Array.from({ length: 4 }).map((_, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                      <Skeleton className="h-2.5 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, fIdx) => (
                <div key={fIdx} className="space-y-2 pb-3 border-b border-slate-100 dark:border-zinc-800/60 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-28 rounded-md" />
                    <Skeleton className="h-2.5 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-md" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
