"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Unit,
  type GetUnitsParams,
  type CreateUnitInput,
  type UpdateUnitInput,
  type UnitDeleteResponse,
  unitsApi,
} from "@/lib/api/units";
import {
  fetchUnitsWithIndexedDbCache,
  saveUnitsToIndexedDb,
  removeUnitFromIndexedDb,
  clearUnitsIndexedDbCache,
  type CachedUnitsResult,
} from "@/lib/storage/unit-cache";
import { useUnitStore } from "@/stores/useUnitStore";
import { queryKeys } from "../query-keys";

/**
 * Hook to fetch paginated measurement units with offline-first IndexedDB cache
 */
export function useUnitsQuery(params?: GetUnitsParams, enabled = true) {
  return useQuery<CachedUnitsResult>({
    queryKey: queryKeys.units.list(params as Record<string, unknown>),
    queryFn: async () => {
      const result = await fetchUnitsWithIndexedDbCache(params);
      if (result?.data) {
        useUnitStore.getState().setUnits(result.data);
      }
      return result;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch single unit detail
 */
export function useUnitQuery(
  idOrUuid?: string | number,
  businessUuid?: string,
  enabled = true
) {
  return useQuery<Unit>({
    queryKey: queryKeys.units.detail(idOrUuid || ""),
    queryFn: () => unitsApi.getUnit(idOrUuid!, businessUuid),
    enabled: Boolean(idOrUuid && enabled),
  });
}

/**
 * Hook to create a measurement unit
 */
export function useCreateUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation<Unit, Error, CreateUnitInput>({
    mutationFn: async (data) => {
      const res = await unitsApi.createUnit(data);
      return res.data;
    },
    onSuccess: (newUnit) => {
      saveUnitsToIndexedDb([newUnit]).catch(() => {});

      const current = useUnitStore.getState().units;
      useUnitStore
        .getState()
        .setUnits([newUnit, ...current.filter((u) => u.uuid !== newUnit.uuid)]);

      queryClient.invalidateQueries({ queryKey: queryKeys.units.lists() });
    },
  });
}

/**
 * Hook to update a measurement unit
 */
export function useUpdateUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Unit,
    Error,
    { idOrUuid: string | number; data: UpdateUnitInput }
  >({
    mutationFn: async ({ idOrUuid, data }) => {
      const res = await unitsApi.updateUnit(idOrUuid, data);
      return res.data;
    },
    onSuccess: (updatedUnit) => {
      saveUnitsToIndexedDb([updatedUnit]).catch(() => {});

      const current = useUnitStore.getState().units;
      useUnitStore
        .getState()
        .setUnits(
          current.map((u) =>
            u.uuid === updatedUnit.uuid || u.id === updatedUnit.id ? updatedUnit : u
          )
        );

      queryClient.invalidateQueries({ queryKey: queryKeys.units.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.detail(updatedUnit.uuid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.detail(updatedUnit.id),
      });
    },
  });
}

/**
 * Quick toggle active status on/off mutation
 */
export function useToggleUnitStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Unit,
    Error,
    { unit: Unit; businessUuid?: string }
  >({
    mutationFn: async ({ unit, businessUuid }) => {
      const res = await unitsApi.toggleUnitStatus(
        unit.id || unit.uuid,
        unit.is_active,
        businessUuid || unit.business_uuid
      );
      return res.data;
    },
    onSuccess: (updatedUnit) => {
      saveUnitsToIndexedDb([updatedUnit]).catch(() => {});

      const current = useUnitStore.getState().units;
      useUnitStore
        .getState()
        .setUnits(
          current.map((u) =>
            u.uuid === updatedUnit.uuid || u.id === updatedUnit.id ? updatedUnit : u
          )
        );

      queryClient.invalidateQueries({ queryKey: queryKeys.units.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.units.detail(updatedUnit.uuid),
      });
    },
  });
}

/**
 * Hook to delete a measurement unit
 */
export function useDeleteUnitMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UnitDeleteResponse,
    Error,
    { idOrUuid: string | number; uuid: string; businessUuid?: string }
  >({
    mutationFn: async ({ idOrUuid, businessUuid }) => {
      return unitsApi.deleteUnit(idOrUuid, businessUuid);
    },
    onSuccess: (_, variables) => {
      removeUnitFromIndexedDb(variables.uuid).catch(() => {});

      const current = useUnitStore.getState().units;
      useUnitStore
        .getState()
        .setUnits(current.filter((u) => u.uuid !== variables.uuid));

      queryClient.invalidateQueries({ queryKey: queryKeys.units.lists() });
    },
  });
}

/**
 * Hook to clear the IndexedDB units cache
 */
export function useClearUnitCacheMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await clearUnitsIndexedDbCache();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.lists() });
    },
  });
}
