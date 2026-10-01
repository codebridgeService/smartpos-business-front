"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShoppingCart, CreditCard, RefreshCw, Database, Wifi, WifiOff } from "lucide-react";
import { type OfflineDataStatus as OfflineStatusType } from "@/lib/storage/storage-types";

interface OfflineDataStatusProps {
  status: OfflineStatusType;
  className?: string;
}

export function OfflineDataStatus({
  status,
  className = "",
}: OfflineDataStatusProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Protected Offline POS Ledger
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Isolated IndexedDB tables with guaranteed persistence
            </p>
          </div>
        </div>

        {/* Live Network Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isOnline
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Online Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Offline Ready</span>
            </>
          )}
        </div>
      </div>

      {/* 3 Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pending Sales */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Pending Sales
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {status.pendingSalesCount}
            </span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Payments
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {status.pendingPaymentsCount}
            </span>
          </div>
        </div>

        {/* Sync Queue */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
              Sync Queue
            </span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              {status.syncQueueCount}
            </span>
          </div>
        </div>
      </div>

      {/* Emerald Protection Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="leading-relaxed">
          <strong className="text-emerald-950 dark:text-white font-semibold">Protected from eviction.</strong> Pending offline sales and cash transactions are strictly excluded from all cache clearing routines.
        </span>
      </div>
    </div>
  );
}
