"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  shiftsApi,
  type OpenShiftRequest,
  type CloseShiftRequest,
} from "@/lib/api/shifts";
import { queryKeys } from "../query-keys";
import type { RegisterSession } from "@/types";

/**
 * Hook to fetch register shift sessions
 */
export function useShiftsQuery(outletUuid?: string | null, registerUuid?: string | null, enabled = true) {
  return useQuery<RegisterSession[]>({
    queryKey: queryKeys.shifts.list(outletUuid ?? "", registerUuid ?? ""),
    queryFn: () => shiftsApi.getShifts(outletUuid!, registerUuid!),
    enabled: Boolean(outletUuid && registerUuid && enabled),
  });
}

/**
 * Hook to fetch the current open shift for a register
 */
export function useCurrentShiftQuery(outletUuid?: string | null, registerUuid?: string | null, enabled = true) {
  return useQuery<RegisterSession | null>({
    queryKey: queryKeys.shifts.current(outletUuid ?? undefined, registerUuid ?? undefined),
    queryFn: () => shiftsApi.getCurrentShift(outletUuid!, registerUuid!),
    enabled: Boolean(outletUuid && registerUuid && enabled),
  });
}

/**
 * Hook to open a new shift
 */
export function useOpenShiftMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    RegisterSession,
    Error,
    { outletUuid: string; registerUuid: string; data: OpenShiftRequest }
  >({
    mutationFn: ({ outletUuid, registerUuid, data }) =>
      shiftsApi.openShift(outletUuid, registerUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.current(variables.outletUuid, variables.registerUuid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.list(variables.outletUuid, variables.registerUuid),
      });
    },
  });
}

/**
 * Hook to close a shift
 */
export function useCloseShiftMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    RegisterSession,
    Error,
    { outletUuid: string; registerUuid: string; shiftId: string | number; data: CloseShiftRequest }
  >({
    mutationFn: ({ outletUuid, registerUuid, shiftId, data }) =>
      shiftsApi.closeShift(outletUuid, registerUuid, shiftId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.current(variables.outletUuid, variables.registerUuid),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.list(variables.outletUuid, variables.registerUuid),
      });
    },
  });
}
