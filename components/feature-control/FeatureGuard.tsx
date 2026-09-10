'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { checkFeatureStatus } from '@/lib/api/feature-controls';
import { FeatureCheckResponse, FeatureStatus } from '@/types/feature-control';
import { MaintenancePage } from './MaintenancePage';
import { DisabledFeaturePage } from './DisabledFeaturePage';

interface FeatureGuardContextValue {
  statusData: FeatureCheckResponse | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  bypassed: boolean;
  setBypassed: (val: boolean) => void;
}

const FeatureGuardContext = createContext<FeatureGuardContextValue>({
  statusData: null,
  isLoading: false,
  refresh: async () => {},
  bypassed: false,
  setBypassed: () => {},
});

export function useFeatureControl(featureKey: string) {
  const [statusData, setStatusData] = useState<FeatureCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await checkFeatureStatus(featureKey);
      setStatusData(data);
    } catch {
      setStatusData({
        feature_key: featureKey,
        name: featureKey,
        status: 'ACTIVE',
        show_countdown: false,
        allow_owner_bypass: true,
        allow_admin_bypass: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [featureKey]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    statusData,
    isLoading,
    isMaintenance: statusData?.status === 'MAINTENANCE',
    isDisabled: statusData?.status === 'DISABLED',
    isActive: statusData?.status === 'ACTIVE' || !statusData,
    refresh: fetchStatus,
  };
}

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallbackTitle?: string;
  isOwner?: boolean;
}

export function FeatureGuard({
  featureKey,
  children,
  fallbackTitle,
  isOwner = false,
}: FeatureGuardProps) {
  const { statusData, isLoading, refresh } = useFeatureControl(featureKey);
  const [bypassed, setBypassed] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Checking system status...</span>
        </div>
      </div>
    );
  }

  // If bypassed by owner/admin
  if (bypassed && isOwner) {
    return (
      <FeatureGuardContext.Provider value={{ statusData, isLoading, refresh, bypassed, setBypassed }}>
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <span>⚠️ Viewing feature with Owner Bypass enabled</span>
          <button
            onClick={() => setBypassed(false)}
            className="underline hover:text-amber-800 dark:hover:text-amber-200"
          >
            Show Maintenance Screen
          </button>
        </div>
        {children}
      </FeatureGuardContext.Provider>
    );
  }

  const status = statusData?.status ?? 'ACTIVE';

  if (status === 'MAINTENANCE') {
    return (
      <MaintenancePage
        featureKey={featureKey}
        featureName={statusData?.name || fallbackTitle}
        reason={statusData?.reason}
        maintenanceType={statusData?.maintenance_type}
        estimatedCompletedAt={statusData?.estimated_completed_at}
        showCountdown={statusData?.show_countdown}
        onRefresh={refresh}
        isOwner={isOwner && (statusData?.allow_owner_bypass ?? true)}
        onBypass={() => setBypassed(true)}
      />
    );
  }

  if (status === 'DISABLED') {
    return (
      <DisabledFeaturePage
        featureKey={featureKey}
        featureName={statusData?.name || fallbackTitle}
        reason={statusData?.reason}
        onRefresh={refresh}
      />
    );
  }

  return (
    <FeatureGuardContext.Provider value={{ statusData, isLoading, refresh, bypassed, setBypassed }}>
      {children}
    </FeatureGuardContext.Provider>
  );
}

/**
 * Action Guard component for wrapping action buttons (e.g. Create Product button)
 */
interface ActionGuardProps {
  featureKey: string;
  children: React.ReactElement<{ disabled?: boolean; onClick?: React.MouseEventHandler; title?: string }>;
  fallbackAction?: () => void;
}

export function ActionGuard({ featureKey, children, fallbackAction }: ActionGuardProps) {
  const { statusData, isMaintenance, isDisabled } = useFeatureControl(featureKey);

  if (isMaintenance || isDisabled) {
    const reasonText = isMaintenance
      ? `Under Maintenance: ${statusData?.reason || 'Temporarily disabled for updates'}`
      : `Disabled: ${statusData?.reason || 'Feature unavailable'}`;

    return React.cloneElement(children, {
      disabled: true,
      title: reasonText,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (fallbackAction) {
          fallbackAction();
        } else {
          alert(reasonText);
        }
      },
    });
  }

  return children;
}
