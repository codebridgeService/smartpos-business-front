"use client";

import { useState, useEffect, useCallback } from "react";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import { checkFeatureStatus } from "@/lib/api/feature-controls";
import type { Announcement, FeatureControl } from "@/types/features-announcements";
import type { FeatureCheckResponse } from "@/types/feature-control";

export interface PageFeatureState {
  status: "ACTIVE" | "MAINTENANCE" | "DISABLED" | "COMING_SOON";
  featureName: string;
  moduleName?: string;
  reason?: string | null;
  announcement?: Announcement | null;
  maintenanceType?: string | null;
  estimatedCompletedAt?: string | null;
  showCountdown: boolean;
  isLoading: boolean;
  isBypassed: boolean;
  setBypassed: (val: boolean) => void;
  refresh: () => Promise<void>;
}

function getInitialFeatureData(featureKey?: string | null, defaultTitle?: string) {
  if (!featureKey) {
    return {
      status: "ACTIVE" as const,
      featureName: defaultTitle || "Feature",
      reason: null,
      announcement: null,
    };
  }

  try {
    const localFeatures = FeaturesAnnouncementsStore.getFeatures();
    const localAnnouncements = FeaturesAnnouncementsStore.getAnnouncements();

    const matchedLocal = localFeatures.find(
      (f) =>
        f.slug.toLowerCase() === featureKey.toLowerCase() ||
        f.id.toLowerCase() === featureKey.toLowerCase() ||
        featureKey.toLowerCase().includes(f.slug.toLowerCase())
    );

    if (matchedLocal) {
      let linkedAnn: Announcement | null = null;
      if (matchedLocal.announcement_id) {
        linkedAnn = localAnnouncements.find((a) => a.id === matchedLocal.announcement_id) || null;
      }

      if (!matchedLocal.is_enabled) {
        if (matchedLocal.status === "maintenance") {
          return {
            status: "MAINTENANCE" as const,
            featureName: matchedLocal.name,
            reason: linkedAnn?.content || "Company engineering team is actively resolving an issue. Please wait while maintenance is completed.",
            announcement: linkedAnn,
          };
        }
        if (matchedLocal.status === "coming_soon") {
          return {
            status: "COMING_SOON" as const,
            featureName: matchedLocal.name,
            reason: matchedLocal.description || null,
            announcement: linkedAnn,
          };
        }
        if (matchedLocal.status === "disabled") {
          return {
            status: "DISABLED" as const,
            featureName: matchedLocal.name,
            reason: linkedAnn?.content || "This feature has been temporarily disabled by administration.",
            announcement: linkedAnn,
          };
        }
      }

      return {
        status: "ACTIVE" as const,
        featureName: matchedLocal.name,
        reason: null,
        announcement: linkedAnn,
      };
    }
  } catch {
    // fallback
  }

  return {
    status: "ACTIVE" as const,
    featureName: defaultTitle || featureKey,
    reason: null,
    announcement: null,
  };
}

export function usePageFeature(featureKey?: string | null, defaultTitle?: string): PageFeatureState {
  const initial = getInitialFeatureData(featureKey, defaultTitle);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBypassed, setBypassed] = useState<boolean>(false);
  const [status, setStatus] = useState<"ACTIVE" | "MAINTENANCE" | "DISABLED" | "COMING_SOON">(initial.status);
  const [featureName, setFeatureName] = useState<string>(initial.featureName);
  const [moduleName, setModuleName] = useState<string | undefined>(undefined);
  const [reason, setReason] = useState<string | null>(initial.reason);
  const [announcement, setAnnouncement] = useState<Announcement | null>(initial.announcement);
  const [maintenanceType, setMaintenanceType] = useState<string | null>(null);
  const [estimatedCompletedAt, setEstimatedCompletedAt] = useState<string | null>(null);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  const evaluateStatus = useCallback(async () => {
    if (!featureKey) {
      setStatus("ACTIVE");
      return;
    }

    try {
      // 1. Check local synchronized store first for zero-latency detection
      const localFeatures = FeaturesAnnouncementsStore.getFeatures();
      const localAnnouncements = FeaturesAnnouncementsStore.getAnnouncements();

      const matchedLocal = localFeatures.find(
        (f) =>
          f.slug.toLowerCase() === featureKey.toLowerCase() ||
          f.id.toLowerCase() === featureKey.toLowerCase() ||
          featureKey.toLowerCase().includes(f.slug.toLowerCase())
      );

      if (matchedLocal) {
        setFeatureName(matchedLocal.name);
        setModuleName(matchedLocal.module);

        // Find linked announcement if any
        let linkedAnn: Announcement | null = null;
        if (matchedLocal.announcement_id) {
          linkedAnn = localAnnouncements.find((a) => a.id === matchedLocal.announcement_id) || null;
        }

        // Also check if there is an active urgent maintenance announcement for this module
        if (!linkedAnn) {
          linkedAnn =
            localAnnouncements.find(
              (a) =>
                a.is_active &&
                (a.type === "maintenance" || a.priority === "urgent") &&
                (a.title.toLowerCase().includes(matchedLocal.name.toLowerCase()) ||
                  a.content.toLowerCase().includes(matchedLocal.name.toLowerCase()))
            ) || null;
        }

        setAnnouncement(linkedAnn);

        // Check if feature is closed / in maintenance
        if (!matchedLocal.is_enabled) {
          if (matchedLocal.status === "maintenance") {
            setStatus("MAINTENANCE");
            setReason(linkedAnn?.content || "Company engineering team is actively resolving an issue. Please wait while maintenance is completed.");
            setMaintenanceType("SYSTEM_MAINTENANCE");
            setEstimatedCompletedAt(linkedAnn?.expires_at || null);
            setShowCountdown(Boolean(linkedAnn?.expires_at));
            setIsLoading(false);
            return;
          }

          if (matchedLocal.status === "coming_soon") {
            setStatus("COMING_SOON");
            setReason(matchedLocal.description);
            setIsLoading(false);
            return;
          }

          if (matchedLocal.status === "disabled") {
            setStatus("DISABLED");
            setReason(linkedAnn?.content || "This feature has been temporarily disabled by administration.");
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Query remote feature control API for server-side state
      try {
        const remoteData = await checkFeatureStatus(featureKey);
        if (remoteData) {
          setFeatureName(remoteData.name || defaultTitle || featureKey);
          setReason(remoteData.reason || null);
          setMaintenanceType(remoteData.maintenance_type || null);
          setEstimatedCompletedAt(remoteData.estimated_completed_at || null);
          setShowCountdown(remoteData.show_countdown ?? false);

          if (remoteData.status === "MAINTENANCE") {
            setStatus("MAINTENANCE");
            setIsLoading(false);
            return;
          } else if (remoteData.status === "DISABLED") {
            setStatus("DISABLED");
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to active if remote service offline
      }

      setStatus("ACTIVE");
    } finally {
      setIsLoading(false);
    }
  }, [featureKey, defaultTitle]);

  useEffect(() => {
    void evaluateStatus();

    // Listen to local broadcast events when admin updates features or announcements
    const handleSync = () => {
      void evaluateStatus();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("smartpos_features_updated", handleSync);
      window.addEventListener("smartpos_announcements_updated", handleSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("smartpos_features_updated", handleSync);
        window.removeEventListener("smartpos_announcements_updated", handleSync);
      }
    };
  }, [evaluateStatus]);

  return {
    status,
    featureName,
    moduleName,
    reason,
    announcement,
    maintenanceType,
    estimatedCompletedAt,
    showCountdown,
    isLoading,
    isBypassed,
    setBypassed,
    refresh: evaluateStatus,
  };
}
