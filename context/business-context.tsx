"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "./auth-context";
import type {
  Business,
  BusinessSetting,
  UpdateBusinessSettingRequest,
  ApiResponse,
  ApiListResponse,
} from "@/types";

const ACTIVE_BUSINESS_STORAGE_KEY = "smartpos_active_business_uuid";

interface BusinessContextType {
  businesses: Business[];
  activeBusiness: Business | null;
  settings: BusinessSetting | null;
  isLoading: boolean;
  error: string | null;
  fetchBusinesses: () => Promise<Business[]>;
  selectBusiness: (businessUuid: string) => Promise<void>;
  refreshSettings: () => Promise<BusinessSetting | null>;
  updateSettings: (newSettings: UpdateBusinessSettingRequest) => Promise<BusinessSetting>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [settings, setSettings] = useState<BusinessSetting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (businessUuid: string): Promise<BusinessSetting | null> => {
    try {
      const res = await apiClient.get<ApiResponse<BusinessSetting>>(
        `/businesses/${businessUuid}/settings`
      );
      setSettings(res.data);
      return res.data;
    } catch {
      setSettings(null);
      return null;
    }
  }, []);

  const selectBusiness = useCallback(
    async (businessUuid: string): Promise<void> => {
      const target = businesses.find((b) => b.uuid === businessUuid) || null;
      setActiveBusiness(target);

      if (target) {
        if (typeof window !== "undefined") {
          localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, target.uuid);
        }
        await fetchSettings(target.uuid);
      } else {
        setSettings(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
        }
      }
    },
    [businesses, fetchSettings]
  );

  const fetchBusinesses = useCallback(async (): Promise<Business[]> => {
    if (!isAuthenticated) {
      setBusinesses([]);
      setActiveBusiness(null);
      setSettings(null);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<ApiListResponse<Business>>("/businesses");
      const list = res.data || [];
      setBusinesses(list);

      // Determine active business: restore from localStorage or default to first
      let target: Business | null = null;
      const savedUuid =
        typeof window !== "undefined"
          ? localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY)
          : null;

      if (savedUuid) {
        target = list.find((b) => b.uuid === savedUuid) || null;
      }

      if (!target && list.length > 0) {
        target = list[0];
      }

      setActiveBusiness(target);

      if (target) {
        if (typeof window !== "undefined") {
          localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, target.uuid);
        }
        void fetchSettings(target.uuid);
      } else {
        setSettings(null);
      }

      return list;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load businesses";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchSettings]);

  const refreshSettings = useCallback(async (): Promise<BusinessSetting | null> => {
    if (!activeBusiness) return null;
    return fetchSettings(activeBusiness.uuid);
  }, [activeBusiness, fetchSettings]);

  const updateSettings = useCallback(
    async (newSettings: UpdateBusinessSettingRequest): Promise<BusinessSetting> => {
      if (!activeBusiness) {
        throw new Error("No active business selected");
      }

      const res = await apiClient.put<ApiResponse<BusinessSetting>>(
        `/businesses/${activeBusiness.uuid}/settings`,
        newSettings
      );
      setSettings(res.data);
      return res.data;
    },
    [activeBusiness]
  );

  // Sync with auth lifecycle
  useEffect(() => {
    if (isAuthenticated) {
      void fetchBusinesses();
    } else {
      setBusinesses([]);
      setActiveBusiness(null);
      setSettings(null);
    }
  }, [isAuthenticated, user?.uuid, fetchBusinesses]);

  const value = useMemo(
    () => ({
      businesses,
      activeBusiness,
      settings,
      isLoading,
      error,
      fetchBusinesses,
      selectBusiness,
      refreshSettings,
      updateSettings,
    }),
    [
      businesses,
      activeBusiness,
      settings,
      isLoading,
      error,
      fetchBusinesses,
      selectBusiness,
      refreshSettings,
      updateSettings,
    ]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness(): BusinessContextType {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
