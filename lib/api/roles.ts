import { apiClient } from "./client";
import type { Role, LengthAwarePaginator, ApiListResponse } from "@/types";

export interface CreateRolePayload {
  name: string;
  code: string;
  business_uuid?: string | null;
  is_system?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  code?: string;
}

export const rolesApi = {
  /**
   * List roles, optionally filtered by business_uuid and page
   * Endpoint: GET /roles
   */
  async getRoles(params?: {
    page?: number;
    per_page?: number;
    business_uuid?: string | null;
  }): Promise<LengthAwarePaginator<Role> | ApiListResponse<Role> | Role[]> {
    return apiClient.get<LengthAwarePaginator<Role> | ApiListResponse<Role> | Role[]>("/roles", {
      params: {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 20,
        business_uuid: params?.business_uuid || undefined,
      },
    });
  },

  /**
   * Get role details with loaded permissions
   * Endpoint: GET /roles/{role}
   */
  async getRole(uuid: string): Promise<Role> {
    const res = await apiClient.get<Role | { data: Role }>(`/roles/${uuid}`);
    return "data" in res && res.data ? res.data : (res as Role);
  },

  /**
   * Create a new role
   * Endpoint: POST /roles
   */
  async createRole(payload: CreateRolePayload): Promise<Role> {
    const res = await apiClient.post<Role | { data: Role }>("/roles", payload);
    return "data" in res && res.data ? res.data : (res as Role);
  },

  /**
   * Update an existing role
   * Endpoint: PUT /roles/{role}
   */
  async updateRole(uuid: string, payload: UpdateRolePayload): Promise<Role> {
    const res = await apiClient.put<Role | { data: Role }>(`/roles/${uuid}`, payload);
    return "data" in res && res.data ? res.data : (res as Role);
  },

  /**
   * Delete a non-system role
   * Endpoint: DELETE /roles/{role}
   */
  async deleteRole(uuid: string): Promise<void> {
    await apiClient.delete(`/roles/${uuid}`);
  },

  /**
   * Auto-provision standard roles for a business
   * Endpoint: POST /roles/provision
   */
  async provisionRoles(businessUuid?: string | null): Promise<any> {
    return apiClient.post("/roles/provision", {
      business_uuid: businessUuid || undefined,
    });
  },

  /**
   * Synchronize permissions for a role
   * Endpoint: POST /roles/{role}/permissions
   */
  async syncPermissions(roleUuid: string, permissionUuids: string[]): Promise<Role> {
    const res = await apiClient.post<Role | { data: Role }>(`/roles/${roleUuid}/permissions`, {
      permission_uuids: permissionUuids,
    });
    return "data" in res && res.data ? res.data : (res as Role);
  },

  /**
   * Attach all permissions to a role
   * Endpoint: POST /roles/{role}/permissions/all
   */
  async syncAllPermissions(roleUuid: string): Promise<Role> {
    const res = await apiClient.post<Role | { data: Role }>(`/roles/${roleUuid}/permissions/all`);
    return "data" in res && res.data ? res.data : (res as Role);
  },
};
