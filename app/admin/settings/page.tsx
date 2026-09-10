"use client";

import React, { Suspense } from "react";
import { DreamPosSettingsShell } from "@/components/settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-9">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      }
    >
      <DreamPosSettingsShell initialTab="profile" />
    </Suspense>
  );
}
