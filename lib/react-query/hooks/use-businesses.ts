"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessesApi } from "@/lib/api/businesses";
import { queryKeys } from "../query-keys";
import type {
  Business,
  BusinessSetting,
  StoreBusinessRequest,
  StoreBusinessResponse,
  UpdateBusinessRequest,
  UpdateBusinessSettingRequest,
} from "@/types";

/**
 * Hook to fetch all businesses for the current user/tenant.
 */
export function useBusinessesQuery(
  params?: { search?: string; status?: string },
  enabled = true
) {
  return useQuery<Business[]>({
    queryKey: queryKeys.businesses.list(params),
    queryFn: () => businessesApi.getBusinesses(params),
    enabled,
  });
}

/**
 * Hook to fetch a single business by UUID.
 */
export function useBusinessQuery(businessUuid?: string | null) {
  return useQuery<Business>({
    queryKey: queryKeys.businesses.detail(businessUuid ?? ""),
    queryFn: () => businessesApi.getBusiness(businessUuid!),
    enabled: Boolean(businessUuid),
  });
}

/**
 * Hook to fetch business settings.
 */
export function useBusinessSettingsQuery(businessUuid?: string | null) {
  return useQuery<BusinessSetting>({
    queryKey: queryKeys.businesses.settings(businessUuid ?? ""),
    queryFn: () => businessesApi.getBusinessSettings(businessUuid!),
    enabled: Boolean(businessUuid),
  });
}

/**
 * Hook to create a business and invalidate businesses cache.
 */
export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation<StoreBusinessResponse, Error, StoreBusinessRequest>({
    mutationFn: (data) => businessesApi.createBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.lists() });
    },
  });
}

/**
 * Hook to update a business.
 */
export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation<Business, Error, { businessUuid: string; data: UpdateBusinessRequest }>({
    mutationFn: ({ businessUuid, data }) => businessesApi.updateBusiness(businessUuid, data),
    onSuccess: (updatedBusiness, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.detail(variables.businessUuid) });
    },
  });
}

/**
 * Hook to delete a business.
 */
export function useDeleteBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (businessUuid) => businessesApi.deleteBusiness(businessUuid),
    onSuccess: (_, businessUuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businesses.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.businesses.detail(businessUuid) });
    },
  });
}

/**
 * Hook to update business settings.
 */
export function useUpdateBusinessSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    BusinessSetting,
    Error,
    { businessUuid: string; data: UpdateBusinessSettingRequest }
  >({
    mutationFn: ({ businessUuid, data }) =>
      businessesApi.updateBusinessSettings(businessUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.businesses.settings(variables.businessUuid),
      });
    },
  });
}
