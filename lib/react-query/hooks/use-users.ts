"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type GetUsersParams } from "@/lib/api/users";
import { queryKeys } from "../query-keys";
import type { User, LengthAwarePaginator, StoreUserRequest, UpdateUserRequest } from "@/types";

/**
 * Hook to fetch paginated users list.
 */
export function useUsersQuery(params?: GetUsersParams, enabled = true) {
  return useQuery<LengthAwarePaginator<User>>({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: () => usersApi.getUsers(params),
    enabled,
  });
}

/**
 * Hook to fetch single user by UUID.
 */
export function useUserQuery(uuid?: string | null) {
  return useQuery<User>({
    queryKey: queryKeys.users.detail(uuid ?? ""),
    queryFn: () => usersApi.getUser(uuid!),
    enabled: Boolean(uuid),
  });
}

/**
 * Hook to create a new user.
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; data: User }, Error, StoreUserRequest>({
    mutationFn: (data) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Hook to update an existing user.
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { uuid: string; data: UpdateUserRequest }>({
    mutationFn: ({ uuid, data }) => usersApi.updateUser(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.uuid) });
    },
  });
}

/**
 * Hook to delete a user.
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (uuid) => usersApi.deleteUser(uuid),
    onSuccess: (_, uuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(uuid) });
    },
  });
}
