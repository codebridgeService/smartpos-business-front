"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Clock, Rocket } from "lucide-react";
import { Button, Badge, Card, CardContent } from "@/components/ui";

export interface FeatureComingSoonViewProps {
  featureName: string;
  moduleName?: string;
  description?: string | null;
  dashboardHref?: string;
}

export function FeatureComingSoonView({
  featureName,
  moduleName,
  description,
  dashboardHref = "/admin/dashboard",
}: FeatureComingSoonViewProps) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="max-w-xl w-full">
        <Card className="border-indigo-200 dark:border-indigo-900/40 shadow-2xl overflow-hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="p-6 sm:p-10 space-y-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner border border-indigo-200 dark:border-indigo-900/50">
              <Rocket className="h-10 w-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="primary" size="md" className="uppercase font-bold tracking-wider">
                  Coming Soon
                </Badge>
                {moduleName && (
                  <Badge variant="neutral" size="md">
                    {moduleName}
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {featureName} is on the Roadmap
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                {description || "Our engineering team is currently building and testing this capability for the next major SmartPOS release."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>Targeting Q4 SmartPOS Release. You will be notified when live.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Link href={dashboardHref} className="w-full sm:w-auto">
                <Button variant="primary" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
