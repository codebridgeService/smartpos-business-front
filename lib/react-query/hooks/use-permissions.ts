"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionsApi } from "@/lib/api/permissions";
import { queryKeys } from "../query-keys";
import type { Permission, LengthAwarePaginator, StorePermissionBatchItem, UpdatePermissionRequest } from "@/types";

/**
 * Hook to fetch all permissions ordered by module and code
 */
export function useAllPermissionsQuery(enabled = true) {
  return useQuery<Permission[]>({
    queryKey: queryKeys.permissions.allList(),
    queryFn: () => permissionsApi.getAllPermissions(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

/**
 * Hook to fetch paginated permissions
 */
export function usePermissionsQuery(params?: { per_page?: number; page?: number }, enabled = true) {
  return useQuery<LengthAwarePaginator<Permission> | Permission[]>({
    queryKey: queryKeys.permissions.list(params),
    queryFn: () => permissionsApi.getPermissions(params),
    enabled,
  });
}

/**
 * Hook to batch create permissions
 */
export function useCreatePermissionsBatchMutation() {
  const queryClient = useQueryClient();

  return useMutation<Permission[], Error, StorePermissionBatchItem[]>({
    mutationFn: (items) => permissionsApi.createBatch(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}

/**
 * Hook to update a permission
 */
export function useUpdatePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation<Permission, Error, { id: number | string; data: UpdatePermissionRequest }>({
    mutationFn: ({ id, data }) => permissionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}

/**
 * Hook to delete a permission
 */
export function useDeletePermissionMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, number | string>({
    mutationFn: (id) => permissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
    },
  });
}
