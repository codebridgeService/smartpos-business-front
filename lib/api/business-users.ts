import { apiClient } from "./client";
import type { BusinessUser, BusinessUserOutlet, ApiResponse, ApiListResponse } from "@/types";

export interface StoreBusinessUserData {
  user_uuid: string;
  outlet_id?: number | null;
  role?: "owner" | "manager" | "cashier" | "staff" | "admin" | string;
  job_title?: string | null;
  employee_code?: string | null;
  phone?: string | null;
  notes?: string | null;
  pin_code?: string | null;
  is_owner?: boolean;
  status?: "active" | "suspended" | string;
}

export type UpdateBusinessUserData = Partial<StoreBusinessUserData>;

export interface AssignOutletData {
  outlet_uuid: string;
  is_primary?: boolean;
  is_active?: boolean;
}

/**
 * Business Users API Client
 * Interacts with /api/v1/businesses/{business}/users and user outlet assignments
 */
export const businessUsersApi = {
  /**
   * List all users associated with the specified business with optional filtering
   * Endpoint: GET /businesses/{business}/users
   */
  async getBusinessUsers(
    businessUuid: string,
    params?: { role?: string; is_owner?: boolean; user_uuid?: string }
  ): Promise<BusinessUser[]> {
    const res = await apiClient.get<ApiListResponse<BusinessUser> | { data: BusinessUser[] } | BusinessUser[]>(
      `/businesses/${businessUuid}/users`,
      { params }
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
   * Get the owner user of the business
   * Endpoint: GET /businesses/{business}/owner
   */
  async getBusinessOwner(businessUuid: string): Promise<BusinessUser | null> {
    try {
      const res = await apiClient.get<ApiResponse<BusinessUser> | { data: BusinessUser }>(
        `/businesses/${businessUuid}/owner`
      );
      if ("data" in res && res.data) {
        return res.data;
      }
      return (res as unknown as BusinessUser) || null;
    } catch {
      return null;
    }
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

  /**
   * List outlets assigned to a business user
   * Endpoint: GET /businesses/{business}/users/{businessUser}/outlets
   */
  async getUserOutlets(businessUuid: string, businessUserUuid: string): Promise<BusinessUserOutlet[]> {
    const res = await apiClient.get<ApiListResponse<BusinessUserOutlet> | { data: BusinessUserOutlet[] } | BusinessUserOutlet[]>(
      `/businesses/${businessUuid}/users/${businessUserUuid}/outlets`
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
   * Assign an outlet to a business user
   * Endpoint: POST /businesses/{business}/users/{businessUser}/outlets
   */
  async assignUserOutlet(
    businessUuid: string,
    businessUserUuid: string,
    data: AssignOutletData
  ): Promise<BusinessUserOutlet> {
    const res = await apiClient.post<ApiResponse<BusinessUserOutlet> | { data: BusinessUserOutlet }>(
      `/businesses/${businessUuid}/users/${businessUserUuid}/outlets`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as BusinessUserOutlet;
  },

  /**
   * Revoke an outlet assignment from a business user
   * Endpoint: DELETE /businesses/{business}/users/{businessUser}/outlets/{outlet}
   */
  async revokeUserOutlet(
    businessUuid: string,
    businessUserUuid: string,
    outletUuid: string
  ): Promise<void> {
    await apiClient.delete(`/businesses/${businessUuid}/users/${businessUserUuid}/outlets/${outletUuid}`);
  },
};

