"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { outletsApi, type CreateOutletRequest, type UpdateOutletRequest } from "@/lib/api/outlets";
import { queryKeys } from "../query-keys";
import type { Outlet } from "@/types";

/**
 * Hook to fetch outlets for a business.
 */
export function useOutletsQuery(businessUuid?: string | null) {
  return useQuery<Outlet[]>({
    queryKey: queryKeys.outlets.list(businessUuid ?? undefined),
    queryFn: () => outletsApi.getOutlets(businessUuid!),
    enabled: Boolean(businessUuid),
  });
}

/**
 * Hook to fetch a single outlet by UUID.
 */
export function useOutletQuery(outletUuid?: string | null) {
  return useQuery<Outlet>({
    queryKey: queryKeys.outlets.detail(outletUuid ?? ""),
    queryFn: () => outletsApi.getOutlet(outletUuid!),
    enabled: Boolean(outletUuid),
  });
}

/**
 * Hook to create an outlet.
 */
export function useCreateOutletMutation() {
  const queryClient = useQueryClient();

  return useMutation<Outlet, Error, { businessUuid: string; data: CreateOutletRequest }>({
    mutationFn: ({ businessUuid, data }) => outletsApi.createOutlet(businessUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.outlets.list(variables.businessUuid),
      });
    },
  });
}

/**
 * Hook to update an outlet.
 */
export function useUpdateOutletMutation() {
  const queryClient = useQueryClient();

  return useMutation<Outlet, Error, { outletUuid: string; businessUuid?: string; data: UpdateOutletRequest }>({
    mutationFn: ({ outletUuid, data }) => outletsApi.updateOutlet(outletUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outlets.detail(variables.outletUuid) });
      if (variables.businessUuid) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.outlets.list(variables.businessUuid),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.outlets.lists() });
      }
    },
  });
}

/**
 * Hook to delete an outlet.
 */
export function useDeleteOutletMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { outletUuid: string; businessUuid?: string }>({
    mutationFn: ({ outletUuid }) => outletsApi.deleteOutlet(outletUuid),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: queryKeys.outlets.detail(variables.outletUuid) });
      if (variables.businessUuid) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.outlets.list(variables.businessUuid),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.outlets.lists() });
      }
    },
  });
}
