"use client";

import React from "react";
import { Store, Loader2 } from "lucide-react";

export interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  title = "Loading SmartPOS...",
  subtitle = "Preparing your business environment and data",
  fullScreen = false,
}: LoadingScreenProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden ${
        fullScreen
          ? "fixed inset-0 z-50 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md"
          : "min-h-[70vh] w-full"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
        {/* Animated Brand Logo with pulsing ring */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-blue-600/20 dark:bg-blue-400/20 blur-md animate-pulse" />
          <div className="relative h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30">
            <Store className="h-7 w-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow border border-zinc-200 dark:border-zinc-800">
            <Loader2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        </div>

        {/* Text indicators */}
        <div className="space-y-1.5">
          <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            {subtitle}
          </p>
        </div>

        {/* Subtle progress bar */}
        <div className="w-48 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full w-1/3 animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}
