"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi, type CreateRolePayload, type UpdateRolePayload } from "@/lib/api/roles";
import { queryKeys } from "../query-keys";
import type { Role, LengthAwarePaginator, ApiListResponse, User } from "@/types";

/**
 * Hook to fetch roles list with optional filtering
 */
export function useRolesQuery(
  params?: {
    page?: number;
    per_page?: number;
    business_uuid?: string | null;
    is_system?: boolean;
  },
  enabled = true
) {
  return useQuery<LengthAwarePaginator<Role> | ApiListResponse<Role> | Role[]>({
    queryKey: queryKeys.roles.list(params),
    queryFn: () => rolesApi.getRoles(params),
    enabled,
  });
}

/**
 * Hook to fetch single role details by UUID
 */
export function useRoleQuery(uuid?: string | null, enabled = true) {
  return useQuery<Role>({
    queryKey: queryKeys.roles.detail(uuid ?? ""),
    queryFn: () => rolesApi.getRole(uuid!),
    enabled: Boolean(uuid && enabled),
  });
}

/**
 * Hook to fetch users assigned to a role
 */
export function useRoleUsersQuery(roleUuidOrCode?: string | null, enabled = true) {
  return useQuery<User[]>({
    queryKey: queryKeys.roles.users(roleUuidOrCode ?? ""),
    queryFn: () => rolesApi.getRoleUsers(roleUuidOrCode!),
    enabled: Boolean(roleUuidOrCode && enabled),
  });
}

/**
 * Hook to create a new role
 */
export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, CreateRolePayload>({
    mutationFn: (payload) => rolesApi.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
    },
  });
}

/**
 * Hook to update an existing role
 */
export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, { uuid: string; payload: UpdateRolePayload }>({
    mutationFn: ({ uuid, payload }) => rolesApi.updateRole(uuid, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.uuid) });
    },
  });
}

/**
 * Hook to delete a role
 */
export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (uuid) => rolesApi.deleteRole(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.roles.detail(uuid) });
    },
  });
}

/**
 * Hook to sync permissions for a role
 */
export function useSyncRolePermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, { roleUuid: string; permissionUuids: string[] }>({
    mutationFn: ({ roleUuid, permissionUuids }) => rolesApi.syncPermissions(roleUuid, permissionUuids),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(variables.roleUuid) });
    },
  });
}
