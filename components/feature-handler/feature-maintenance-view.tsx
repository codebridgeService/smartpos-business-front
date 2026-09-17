"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  LifeBuoy,
  ShieldAlert,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import type { Announcement } from "@/types/features-announcements";

export interface FeatureMaintenanceViewProps {
  featureName: string;
  moduleName?: string;
  reason?: string | null;
  announcement?: Announcement | null;
  maintenanceType?: string | null;
  estimatedCompletedAt?: string | null;
  showCountdown?: boolean;
  onRefresh: () => Promise<void>;
  canBypass?: boolean;
  onBypass?: () => void;
  dashboardHref?: string;
}

export function FeatureMaintenanceView({
  featureName,
  moduleName,
  reason,
  announcement,
  maintenanceType = "SYSTEM_MAINTENANCE",
  estimatedCompletedAt,
  showCountdown = true,
  onRefresh,
  canBypass = false,
  onBypass,
  dashboardHref = "/admin/dashboard",
}: FeatureMaintenanceViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    totalSeconds: number;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
    totalSeconds: 0,
  });

  useEffect(() => {
    if (!estimatedCompletedAt) return;

    const calculateTimeLeft = () => {
      const targetTime = new Date(estimatedCompletedAt).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00", totalSeconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        totalSeconds,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [estimatedCompletedAt]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2500);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayReason =
    announcement?.content ||
    reason ||
    "The engineering team is actively performing scheduled maintenance and bug fixes on this module. Operations will resume automatically as soon as tests are completed.";

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full">
        {/* Bypass Alert Banner if Authorized */}
        {canBypass && onBypass && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Administrative Maintenance Bypass Available
            </span>
            <button
              type="button"
              onClick={onBypass}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs"
            >
              Enter Anyway &rarr;
            </button>
          </div>
        )}

        {/* Main Worry / Maintenance Card */}
        <Card className="border-amber-200 dark:border-amber-900/40 shadow-2xl overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
          {/* Top Warning Gradient Bar */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

          <CardContent className="p-6 sm:p-10 space-y-6 text-center">
            {/* Animated Icon with Glow */}
            <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-amber-500/20 dark:bg-amber-500/10 animate-ping opacity-60" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner border border-amber-200/60 dark:border-amber-800/40">
                <Wrench className="h-10 w-10 animate-bounce duration-1000" />
              </div>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="warning" size="md" className="uppercase font-bold tracking-wider">
                  {(maintenanceType || "SYSTEM_MAINTENANCE").replace(/_/g, " ")}
                </Badge>
                {moduleName && (
                  <Badge variant="neutral" size="md">
                    {moduleName}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {featureName} is Temporarily Unavailable
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto">
                The company has temporarily closed this page to resolve an issue. Please wait while our engineering team completes the fix.
              </p>
            </div>

            {/* Official Announcement / Reason Box */}
            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  <Building className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  {announcement?.title ? `Announcement: ${announcement.title}` : "Company Notice"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-semibold">
                  Fix in Progress
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-100/90 leading-relaxed font-medium">
                {displayReason}
              </p>
            </div>

            {/* Live Countdown Clock if Estimated Time Available */}
            {showCountdown && estimatedCompletedAt && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  Estimated Remaining Time
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl min-w-[70px] border border-slate-200/60 dark:border-zinc-700/60 shadow-xs">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {timeLeft.hours}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Hours</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-300 dark:text-zinc-600">:</span>
                  <div className="flex flex-col items-center bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl min-w-[70px] border border-slate-200/60 dark:border-zinc-700/60 shadow-xs">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                      {timeLeft.minutes}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Minutes</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-300 dark:text-zinc-600">:</span>
                  <div className="flex flex-col items-center bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl min-w-[70px] border border-slate-200/60 dark:border-zinc-700/60 shadow-xs">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {timeLeft.seconds}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Seconds</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="primary"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full sm:w-auto"
                leftIcon={
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin text-white" : ""}`}
                  />
                }
              >
                {isRefreshing ? "Checking Status..." : refreshSuccess ? "Status Checked (Still in Maintenance)" : "Check Status Again"}
              </Button>

              <Link href={dashboardHref} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Return to Dashboard
                </Button>
              </Link>

              <a
                href="mailto:support@smartpos.local?subject=Support%20Request%20-%20Feature%20Maintenance"
                className="w-full sm:w-auto"
              >
                <Button variant="ghost" className="w-full" leftIcon={<LifeBuoy className="h-4 w-4 text-slate-400" />}>
                  Helpdesk
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
