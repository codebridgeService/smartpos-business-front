import { apiClient } from "./client";
import type { BusinessUser, ApiResponse, ApiListResponse } from "@/types";

export interface StoreBusinessUserData {
  user_uuid: string;
  role?: string;
  job_title?: string | null;
  employee_code?: string | null;
  phone?: string | null;
  notes?: string | null;
  pin_code?: string | null;
  is_owner?: boolean;
  status?: "active" | "suspended" | string;
}

export type UpdateBusinessUserData = Partial<StoreBusinessUserData>;

/**
 * Business Users API Client
 * Interacts with /api/v1/businesses/{business}/users
 */
export const businessUsersApi = {
  /**
   * List all users associated with the specified business
   * Endpoint: GET /businesses/{business}/users
   */
  async getBusinessUsers(businessUuid: string): Promise<BusinessUser[]> {
    const res = await apiClient.get<ApiListResponse<BusinessUser> | { data: BusinessUser[] } | BusinessUser[]>(
      `/businesses/${businessUuid}/users`
    );

    if (Array.isArray(res)) {
      return res;
    }
    if (res && "data" in res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Add a user to the specified business with role and status
   * Endpoint: POST /businesses/{business}/users
   */
  async addBusinessUser(businessUuid: string, data: StoreBusinessUserData): Promise<BusinessUser> {
    const res = await apiClient.post<ApiResponse<BusinessUser> | { data: BusinessUser }>(
      `/businesses/${businessUuid}/users`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as BusinessUser;
  },

  /**
   * Update business user membership details and permissions
   * Endpoint: PUT /businesses/{business}/users/{businessUser}
   */
  async updateBusinessUser(
    businessUuid: string,
    businessUserUuid: string,
    data: UpdateBusinessUserData
  ): Promise<BusinessUser> {
    const res = await apiClient.put<ApiResponse<BusinessUser> | { data: BusinessUser }>(
      `/businesses/${businessUuid}/users/${businessUserUuid}`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as BusinessUser;
  },

  /**
   * Suspend a business user
   * Endpoint: POST /businesses/{business}/users/{businessUser}/suspend
   */
  async suspendBusinessUser(businessUuid: string, businessUserUuid: string): Promise<BusinessUser> {
    const res = await apiClient.post<ApiResponse<BusinessUser> | { data: BusinessUser }>(
      `/businesses/${businessUuid}/users/${businessUserUuid}/suspend`,
      {}
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as BusinessUser;
  },

  /**
   * Remove a user from the business
   * Endpoint: DELETE /businesses/{business}/users/{businessUser}
   */
  async deleteBusinessUser(businessUuid: string, businessUserUuid: string): Promise<void> {
    await apiClient.delete(`/businesses/${businessUuid}/users/${businessUserUuid}`);
  },
};
