import { apiClient } from "./client";
import type {
  Business,
  BusinessSetting,
  StoreBusinessRequest,
  StoreBusinessResponse,
  UpdateBusinessRequest,
  UpdateBusinessSettingRequest,
  ApiResponse,
  ApiListResponse,
} from "@/types";

/**
 * Businesses and POS Settings API Client
 * Interacts with /api/v1/businesses and /api/v1/businesses/{business}/settings
 */
export const businessesApi = {
  /**
   * List businesses associated with the authenticated user / platform admin
   * Endpoint: GET /businesses
   */
  async getBusinesses(params?: { search?: string; status?: string }): Promise<Business[]> {
    const res = await apiClient.get<ApiListResponse<Business> | { data: Business[] } | Business[]>("/businesses", {
      params,
    });

    if (Array.isArray(res)) {
      return res;
    }
    if (res && "data" in res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Fetch single business details
   * Endpoint: GET /businesses/{business}
   */
  async getBusiness(businessUuid: string): Promise<Business> {
    const res = await apiClient.get<ApiResponse<Business> | { data: Business }>(`/businesses/${businessUuid}`);
    return "data" in res ? res.data : (res as unknown as Business);
  },

  /**
   * Create a new business and auto-provision default outlet, register, and machine credentials
   * Endpoint: POST /businesses
   */
  async createBusiness(data: StoreBusinessRequest): Promise<StoreBusinessResponse> {
    return apiClient.post<StoreBusinessResponse>("/businesses", data);
  },

  /**
   * Update business details
   * Endpoint: PUT /businesses/{business}
   */
  async updateBusiness(businessUuid: string, data: UpdateBusinessRequest): Promise<Business> {
    const res = await apiClient.put<ApiResponse<Business> | { data: Business }>(`/businesses/${businessUuid}`, data);
    return "data" in res ? res.data : (res as unknown as Business);
  },

  /**
   * Delete business
   * Endpoint: DELETE /businesses/{business}
   */
  async deleteBusiness(businessUuid: string): Promise<void> {
    await apiClient.delete(`/businesses/${businessUuid}`);
  },

  /**
   * Get POS settings for business
   * Endpoint: GET /businesses/{business}/settings
   */
  async getBusinessSettings(businessUuid: string): Promise<BusinessSetting> {
    const res = await apiClient.get<ApiResponse<BusinessSetting> | { data: BusinessSetting }>(
      `/businesses/${businessUuid}/settings`
    );
    return "data" in res ? res.data : (res as unknown as BusinessSetting);
  },

  /**
   * Update POS settings for business
   * Endpoint: PUT /businesses/{business}/settings
   */
  async updateBusinessSettings(
    businessUuid: string,
    data: UpdateBusinessSettingRequest
  ): Promise<BusinessSetting> {
    const res = await apiClient.put<ApiResponse<BusinessSetting> | { data: BusinessSetting }>(
      `/businesses/${businessUuid}/settings`,
      data
    );
    return "data" in res ? res.data : (res as unknown as BusinessSetting);
  },
};
