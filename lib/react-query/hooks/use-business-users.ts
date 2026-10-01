"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  businessUsersApi,
  type StoreBusinessUserData,
  type UpdateBusinessUserData,
  type AssignOutletData,
} from "@/lib/api/business-users";
import { queryKeys } from "../query-keys";
import type { BusinessUser, BusinessUserOutlet } from "@/types";

/**
 * Hook to fetch business users list (staff)
 */
export function useBusinessUsersQuery(
  businessUuid?: string | null,
  params?: { role?: string; is_owner?: boolean; user_uuid?: string },
  enabled = true
) {
  return useQuery<BusinessUser[]>({
    queryKey: queryKeys.businessUsers.list(businessUuid ?? "", params),
    queryFn: () => businessUsersApi.getBusinessUsers(businessUuid!, params),
    enabled: Boolean(businessUuid && enabled),
  });
}

/**
 * Hook to fetch business owner
 */
export function useBusinessOwnerQuery(businessUuid?: string | null, enabled = true) {
  return useQuery<BusinessUser | null>({
    queryKey: queryKeys.businessUsers.owner(businessUuid ?? ""),
    queryFn: () => businessUsersApi.getBusinessOwner(businessUuid!),
    enabled: Boolean(businessUuid && enabled),
  });
}

/**
 * Hook to add a business user
 */
export function useAddBusinessUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<BusinessUser, Error, { businessUuid: string; data: StoreBusinessUserData }>({
    mutationFn: ({ businessUuid, data }) => businessUsersApi.addBusinessUser(businessUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.list(variables.businessUuid) });
    },
  });
}

/**
 * Hook to update business user
 */
export function useUpdateBusinessUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    BusinessUser,
    Error,
    { businessUuid: string; businessUserUuid: string; data: UpdateBusinessUserData }
  >({
    mutationFn: ({ businessUuid, businessUserUuid, data }) =>
      businessUsersApi.updateBusinessUser(businessUuid, businessUserUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.list(variables.businessUuid) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.businessUsers.detail(variables.businessUuid, variables.businessUserUuid),
      });
    },
  });
}

/**
 * Hook to suspend a business user
 */
export function useSuspendBusinessUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<BusinessUser, Error, { businessUuid: string; businessUserUuid: string }>({
    mutationFn: ({ businessUuid, businessUserUuid }) =>
      businessUsersApi.suspendBusinessUser(businessUuid, businessUserUuid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.list(variables.businessUuid) });
    },
  });
}

/**
 * Hook to delete a business user
 */
export function useDeleteBusinessUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { businessUuid: string; businessUserUuid: string }>({
    mutationFn: ({ businessUuid, businessUserUuid }) =>
      businessUsersApi.deleteBusinessUser(businessUuid, businessUserUuid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.list(variables.businessUuid) });
    },
  });
}

/**
 * Hook to assign outlet to user
 */
export function useAssignUserOutletMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    BusinessUserOutlet,
    Error,
    { businessUuid: string; businessUserUuid: string; data: AssignOutletData }
  >({
    mutationFn: ({ businessUuid, businessUserUuid, data }) =>
      businessUsersApi.assignUserOutlet(businessUuid, businessUserUuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessUsers.list(variables.businessUuid) });
    },
  });
}
