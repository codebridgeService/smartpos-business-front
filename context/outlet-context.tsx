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
import { useBusiness } from "./business-context";
import type { Outlet, ApiListResponse } from "@/types";

const ACTIVE_OUTLET_STORAGE_KEY = "smartpos_active_outlet_uuid";

interface OutletContextType {
  outlets: Outlet[];
  activeOutlet: Outlet | null;
  isLoading: boolean;
  error: string | null;
  fetchOutlets: () => Promise<Outlet[]>;
  selectOutlet: (outletUuid: string) => void;
}

const OutletContext = createContext<OutletContextType | undefined>(undefined);

export function OutletProvider({ children }: { children: React.ReactNode }) {
  const { activeBusiness } = useBusiness();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [activeOutlet, setActiveOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectOutlet = useCallback(
    (outletUuid: string) => {
      const target = outlets.find((o) => o.uuid === outletUuid) || null;
      setActiveOutlet(target);

      if (typeof window !== "undefined") {
        if (target) {
          localStorage.setItem(ACTIVE_OUTLET_STORAGE_KEY, target.uuid);
        } else {
          localStorage.removeItem(ACTIVE_OUTLET_STORAGE_KEY);
        }
      }
    },
    [outlets]
  );

  const fetchOutlets = useCallback(async (): Promise<Outlet[]> => {
    if (!activeBusiness) {
      setOutlets([]);
      setActiveOutlet(null);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.get<ApiListResponse<Outlet>>(
        `/businesses/${activeBusiness.uuid}/outlets`
      );
      const list = res.data || [];
      setOutlets(list);

      // Determine active outlet: saved uuid, or main outlet, or first outlet
      let target: Outlet | null = null;
      const savedUuid =
        typeof window !== "undefined"
          ? localStorage.getItem(ACTIVE_OUTLET_STORAGE_KEY)
          : null;

      if (savedUuid) {
        target = list.find((o) => o.uuid === savedUuid) || null;
      }

      if (!target && list.length > 0) {
        target = list.find((o) => o.is_main_outlet) || list[0];
      }

      setActiveOutlet(target);

      if (target && typeof window !== "undefined") {
        localStorage.setItem(ACTIVE_OUTLET_STORAGE_KEY, target.uuid);
      }

      return list;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load outlets";
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [activeBusiness]);

  // Sync with activeBusiness changes
  useEffect(() => {
    if (activeBusiness) {
      void fetchOutlets();
    } else {
      setOutlets([]);
      setActiveOutlet(null);
    }
  }, [activeBusiness?.uuid, fetchOutlets]);

  const value = useMemo(
    () => ({
      outlets,
      activeOutlet,
      isLoading,
      error,
      fetchOutlets,
      selectOutlet,
    }),
    [outlets, activeOutlet, isLoading, error, fetchOutlets, selectOutlet]
  );

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

export function useOutlet(): OutletContextType {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error("useOutlet must be used within an OutletProvider");
  }
  return context;
}
