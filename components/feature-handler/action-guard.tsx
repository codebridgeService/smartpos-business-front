"use client";

import React, { useState } from "react";
import { Wrench, AlertTriangle, X, LifeBuoy } from "lucide-react";
import { usePageFeature } from "./use-page-feature";
import { Button, Badge } from "@/components/ui";

export interface ActionGuardProps {
  featureKey: string;
  actionName?: string;
  children: (props: {
    onClick: (e: React.MouseEvent) => void;
    isDisabled: boolean;
    isMaintenance: boolean;
  }) => React.ReactNode;
  onProceed?: (e: React.MouseEvent) => void;
}

export function ActionGuard({
  featureKey,
  actionName = "Create Action",
  children,
  onProceed,
}: ActionGuardProps) {
  const { status, featureName, reason, announcement } = usePageFeature(featureKey);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const isMaintenance = status === "MAINTENANCE";
  const isDisabled = status === "DISABLED";
  const isBlocked = isMaintenance || isDisabled;

  const handleClick = (e: React.MouseEvent) => {
    if (isBlocked) {
      e.preventDefault();
      e.stopPropagation();
      setShowBlockedModal(true);
      return;
    }

    if (onProceed) {
      onProceed(e);
    }
  };

  return (
    <>
      {children({
        onClick: handleClick,
        isDisabled: isBlocked,
        isMaintenance,
      })}

      {/* Intercept Modal when feature is closed/in-maintenance */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowBlockedModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-900/50 p-6 text-center z-10 animate-in zoom-in-95 space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <Wrench className="h-7 w-7 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <Badge variant="warning" size="sm" className="uppercase font-bold">
                Company Fix in Progress
              </Badge>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {actionName} is Temporarily Paused
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {announcement?.content ||
                  reason ||
                  `The company is currently performing updates on ${featureName}. Creating new items is temporarily paused to avoid data inconsistency. Please wait while the fix is deployed.`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 border-t border-slate-100 dark:border-zinc-800">
              <Button
                variant="primary"
                onClick={() => setShowBlockedModal(false)}
                className="w-full"
              >
                Understood, I will wait
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
