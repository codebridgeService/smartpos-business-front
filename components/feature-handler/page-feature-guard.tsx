"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { isAdmin, isOwner } from "@/lib/utils/roles";
import { getFeatureConfigForPath } from "./route-feature-map";
import { usePageFeature } from "./use-page-feature";
import { FeatureMaintenanceView } from "./feature-maintenance-view";
import { FeatureDisabledView } from "./feature-disabled-view";
import { FeatureComingSoonView } from "./feature-coming-soon-view";
import { FeatureAnnouncementBanner } from "./feature-announcement-banner";
import { Loader2 } from "lucide-react";

export interface PageFeatureGuardProps {
  children: React.ReactNode;
  featureKey?: string;
  featureName?: string;
  moduleName?: string;
  fallbackTitle?: string;
  disableAutoDetection?: boolean;
}

export function PageFeatureGuard({
  children,
  featureKey: explicitKey,
  featureName: explicitName,
  moduleName: explicitModule,
  fallbackTitle,
  disableAutoDetection = false,
}: PageFeatureGuardProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isUserAdmin = isAdmin(user);
  const isUserOwner = isOwner(user);
  const canBypass = isUserAdmin || isUserOwner;

  // Resolve feature config from explicit prop or route path
  const routeConfig = !disableAutoDetection && !explicitKey ? getFeatureConfigForPath(pathname) : null;
  const activeKey = explicitKey || routeConfig?.key || null;
  const activeTitle = explicitName || routeConfig?.name || fallbackTitle || "Page";
  const activeModule = explicitModule || routeConfig?.module;

  const {
    status,
    featureName,
    reason,
    announcement,
    maintenanceType,
    estimatedCompletedAt,
    showCountdown,
    isLoading,
    isBypassed,
    setBypassed,
    refresh,
  } = usePageFeature(activeKey, activeTitle);

  // If no feature key is attached to this route, render directly
  if (!activeKey) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Checking feature availability...
          </span>
        </div>
      </div>
    );
  }

  // If user bypassed maintenance
  if (isBypassed && canBypass) {
    return (
      <>
        <div className="mb-4 py-2 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>⚠️ Viewing {featureName} with Administrator/Owner bypass active</span>
          <button
            type="button"
            onClick={() => setBypassed(false)}
            className="underline hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer"
          >
            Show Problem Notice
          </button>
        </div>
        {children}
      </>
    );
  }

  // 1. Maintenance Status (Company is fixing a problem)
  if (status === "MAINTENANCE") {
    return (
      <FeatureMaintenanceView
        featureName={featureName}
        moduleName={activeModule}
        reason={reason}
        announcement={announcement}
        maintenanceType={maintenanceType}
        estimatedCompletedAt={estimatedCompletedAt}
        showCountdown={showCountdown}
        onRefresh={refresh}
        canBypass={canBypass}
        onBypass={() => setBypassed(true)}
        dashboardHref={isUserAdmin ? "/admin/dashboard" : "/businesses"}
      />
    );
  }

  // 2. Disabled Status
  if (status === "DISABLED") {
    return (
      <FeatureDisabledView
        featureName={featureName}
        moduleName={activeModule}
        reason={reason}
        onRefresh={refresh}
        dashboardHref={isUserAdmin ? "/admin/dashboard" : "/businesses"}
      />
    );
  }

  // 3. Coming Soon Status
  if (status === "COMING_SOON") {
    return (
      <FeatureComingSoonView
        featureName={featureName}
        moduleName={activeModule}
        description={reason}
        dashboardHref={isUserAdmin ? "/admin/dashboard" : "/businesses"}
      />
    );
  }

  // 4. Active Status: Render Page with top announcement banner if available
  return (
    <>
      <FeatureAnnouncementBanner announcement={announcement} />
      {children}
    </>
  );
}
