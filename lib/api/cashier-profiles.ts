import { apiClient } from "./client";
import type { CashierProfile, ApiResponse } from "@/types";

export interface UpdateCashierProfileRequest {
  display_name?: string | null;
  avatar_url?: string | null;
  can_sell?: boolean;
  can_refund?: boolean;
  can_void?: boolean;
  can_discount?: boolean;
  max_discount_percent?: number | string;
  pin_code?: string;
  is_active?: boolean;
}

/**
 * Cashier Profiles API Client
 */
export const cashierProfilesApi = {
  /**
   * Get cashier profile permissions and status
   * Endpoint: GET /businesses/{business}/users/{businessUser}/cashier-profile
   */
  async getProfile(
    businessUuid: string,
    businessUserUuid: string
  ): Promise<CashierProfile | null> {
    try {
      const res = await apiClient.get<ApiResponse<CashierProfile> | { data: CashierProfile } | null>(
        `/businesses/${businessUuid}/users/${businessUserUuid}/cashier-profile`
      );
      if (res && "data" in res && res.data) {
        return res.data;
      }
      return res as unknown as CashierProfile | null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Update cashier profile permissions & PIN code
   * Endpoint: PUT /businesses/{business}/users/{businessUser}/cashier-profile
   */
  async updateProfile(
    businessUuid: string,
    businessUserUuid: string,
    data: UpdateCashierProfileRequest
  ): Promise<CashierProfile> {
    const res = await apiClient.put<ApiResponse<CashierProfile> | { data: CashierProfile }>(
      `/businesses/${businessUuid}/users/${businessUserUuid}/cashier-profile`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as CashierProfile;
  },
};
