import { apiClient } from "./client";
import type {
  User,
  LengthAwarePaginator,
  ApiListResponse,
  StoreUserRequest,
  UpdateUserRequest,
  AssignUserRoleRequest,
  AvatarUploadResponse,
} from "@/types";

export interface GetUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const usersApi = {
  /**
   * List paginated users with loaded roles.
   * Endpoint: GET /users
   */
  async getUsers(params?: GetUsersParams): Promise<LengthAwarePaginator<User>> {
    const response = await apiClient.get<LengthAwarePaginator<User> | ApiListResponse<User>>("/users", {
      params: {
        page: params?.page,
        per_page: params?.per_page ?? 20,
        search: params?.search?.trim() || undefined,
        role: params?.role && params.role !== "all" ? params.role : undefined,
        status: params?.status && params.status !== "all" ? params.status : undefined,
      },
    });

    if (response && "current_page" in response) {
      return response as LengthAwarePaginator<User>;
    }

    // Fallback if returned wrapped in data array
    const rawData = Array.isArray(response)
      ? response
      : (response as ApiListResponse<User>)?.data || [];
    const data = rawData as User[];

    return {
      data,
      current_page: 1,
      first_page_url: null,
      from: data.length > 0 ? 1 : 0,
      last_page: 1,
      last_page_url: null,
      links: [],
      next_page_url: null,
      path: null,
      per_page: data.length || 20,
      prev_page_url: null,
      to: data.length,
      total: data.length,
    };
  },

  /**
   * Get user details including loaded roles, permissions, and registered devices.
   * Endpoint: GET /users/{user}
   */
  async getUser(uuidOrId: string | number): Promise<User> {
    return apiClient.get<User>(`/users/${uuidOrId}`);
  },

  /**
   * Create a new user account with optional auto-assigned role template.
   * Endpoint: POST /users
   */
  async createUser(data: StoreUserRequest): Promise<{ message: string; data: User }> {
    return apiClient.post<{ message: string; data: User }>("/users", data);
  },

  /**
   * Update user details.
   * Endpoint: PUT /users/{user}
   */
  async updateUser(uuidOrId: string | number, data: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/users/${uuidOrId}`, data);
  },

  /**
   * Delete a user account.
   * Endpoint: DELETE /users/{user}
   */
  async deleteUser(uuidOrId: string | number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${uuidOrId}`);
  },

  /**
   * Assign a role to a user.
   * Endpoint: POST /users/{user}/roles
   */
  async assignRole(userUuid: string, roleUuid: string): Promise<User> {
    return apiClient.post<User>(`/users/${userUuid}/roles`, {
      role_uuid: roleUuid,
    } as AssignUserRoleRequest);
  },

  /**
   * Remove a role from a user.
   * Endpoint: DELETE /users/{user}/roles/{role}
   */
  async removeRole(userUuid: string, roleUuidOrId: string | number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/${userUuid}/roles/${roleUuidOrId}`);
  },

  /**
   * Upload user avatar.
   * Endpoint: POST /users/{user}/avatar
   */
  async uploadAvatar(userUuid: string, file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient.post<AvatarUploadResponse>(`/users/${userUuid}/avatar`, formData);
  },

  /**
   * Remove user avatar.
   * Endpoint: DELETE /users/{user}/avatar
   */
  async deleteAvatar(userUuid: string): Promise<{ message: string; data: { avatar: null; avatar_url: null } }> {
    return apiClient.delete<{ message: string; data: { avatar: null; avatar_url: null } }>(`/users/${userUuid}/avatar`);
  },
};
