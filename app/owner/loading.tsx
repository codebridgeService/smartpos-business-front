"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function OwnerLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="h-12 w-12 rounded-2xl bg-purple-600/10 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Loading Store Owner Portal...
        </p>
        <p className="text-xs text-zinc-500">Retrieving business metrics and branch controls</p>
      </div>
    </div>
  );
}
