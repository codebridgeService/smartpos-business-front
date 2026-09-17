"use client";

import React from "react";
import Link from "next/link";
import { Ban, ArrowLeft, LifeBuoy, AlertCircle } from "lucide-react";
import { Button, Badge, Card, CardContent } from "@/components/ui";

export interface FeatureDisabledViewProps {
  featureName: string;
  moduleName?: string;
  reason?: string | null;
  onRefresh?: () => Promise<void>;
  dashboardHref?: string;
}

export function FeatureDisabledView({
  featureName,
  moduleName,
  reason,
  onRefresh,
  dashboardHref = "/admin/dashboard",
}: FeatureDisabledViewProps) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="max-w-xl w-full">
        <Card className="border-rose-200 dark:border-rose-900/40 shadow-2xl overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
          <div className="h-2 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />
          <CardContent className="p-6 sm:p-10 space-y-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner border border-rose-200 dark:border-rose-900/50">
              <Ban className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="danger" size="md" className="uppercase font-bold tracking-wider">
                  Feature Disabled
                </Badge>
                {moduleName && (
                  <Badge variant="neutral" size="md">
                    {moduleName}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {featureName} is Currently Closed
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                This feature has been closed by company administrators. If you believe this is in error, please consult your system admin.
              </p>
            </div>

            {reason && (
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-left space-y-1">
                <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  Administrative Reason
                </div>
                <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200">{reason}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Link href={dashboardHref} className="w-full sm:w-auto">
                <Button variant="primary" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Return to Dashboard
                </Button>
              </Link>
              <a
                href="mailto:support@smartpos.local?subject=Support%20Request%20-%20Feature%20Disabled"
                className="w-full sm:w-auto"
              >
                <Button variant="ghost" className="w-full" leftIcon={<LifeBuoy className="h-4 w-4 text-slate-400" />}>
                  Contact Support
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
