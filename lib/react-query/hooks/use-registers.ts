"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registersApi,
  type CreateRegisterRequest,
  type UpdateRegisterRequest,
} from "@/lib/api/registers";
import { queryKeys } from "../query-keys";
import type { Register } from "@/types";

/**
 * Hook to fetch cash registers for an outlet
 */
export function useRegistersQuery(outletUuid?: string | null, enabled = true) {
  return useQuery<Register[]>({
    queryKey: queryKeys.registers.list(outletUuid ?? undefined),
    queryFn: () => registersApi.getRegisters(outletUuid!),
    enabled: Boolean(outletUuid && enabled),
  });
}

/**
 * Hook to fetch a single register by UUID
 */
export function useRegisterQuery(registerUuid?: string | null, enabled = true) {
  return useQuery<Register>({
    queryKey: queryKeys.registers.detail(registerUuid ?? ""),
    queryFn: () => registersApi.getRegister(registerUuid!),
    enabled: Boolean(registerUuid && enabled),
  });
}

/**
 * Hook to create a new register
 */
export function useCreateRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<Register, Error, { outletUuid: string; data: CreateRegisterRequest }>({
    mutationFn: ({ outletUuid, data }) => registersApi.createRegister(outletUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.list(variables.outletUuid) });
    },
  });
}

/**
 * Hook to update an existing register
 */
export function useUpdateRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<Register, Error, { registerUuid: string; data: UpdateRegisterRequest; outletUuid?: string }>({
    mutationFn: ({ registerUuid, data }) => registersApi.updateRegister(registerUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.detail(variables.registerUuid) });
      if (variables.outletUuid) {
        queryClient.invalidateQueries({ queryKey: queryKeys.registers.list(variables.outletUuid) });
      }
    },
  });
}

/**
 * Hook to delete a register
 */
export function useDeleteRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { registerUuid: string; outletUuid?: string }>({
    mutationFn: ({ registerUuid }) => registersApi.deleteRegister(registerUuid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.registers.detail(variables.registerUuid) });
      if (variables.outletUuid) {
        queryClient.invalidateQueries({ queryKey: queryKeys.registers.list(variables.outletUuid) });
      }
    },
  });
}
