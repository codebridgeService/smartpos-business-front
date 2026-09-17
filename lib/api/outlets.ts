import { apiClient } from "./client";
import type { Outlet, ApiResponse, ApiListResponse } from "@/types";

export interface CreateOutletRequest {
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_main_outlet?: boolean;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  tax_rate?: string | null;
  timezone?: string | null;
  is_active?: boolean;
  status?: string;
}

export type UpdateOutletRequest = Partial<CreateOutletRequest>;

/**
 * Outlets API Client
 * Interacts with /api/v1/businesses/{business}/outlets and /api/v1/outlets/{outlet}
 */
export const outletsApi = {
  /**
   * List all outlets for the specified business with device and register counts
   * Endpoint: GET /businesses/{business}/outlets
   */
  async getOutlets(businessUuid: string): Promise<Outlet[]> {
    const res = await apiClient.get<ApiListResponse<Outlet> | { data: Outlet[] } | Outlet[]>(
      `/businesses/${businessUuid}/outlets`
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
   * Fetch single outlet details
   * Endpoint: GET /outlets/{outlet}
   */
  async getOutlet(outletUuid: string): Promise<Outlet> {
    const res = await apiClient.get<ApiResponse<Outlet> | { data: Outlet }>(
      `/outlets/${outletUuid}`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Outlet;
  },

  /**
   * Create a new outlet for the specified business
   * Endpoint: POST /businesses/{business}/outlets
   */
  async createOutlet(businessUuid: string, data: CreateOutletRequest): Promise<Outlet> {
    const res = await apiClient.post<ApiResponse<Outlet> | { data: Outlet }>(
      `/businesses/${businessUuid}/outlets`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Outlet;
  },

  /**
   * Update an existing outlet
   * Endpoint: PUT /outlets/{outlet}
   */
  async updateOutlet(outletUuid: string, data: UpdateOutletRequest): Promise<Outlet> {
    const res = await apiClient.put<ApiResponse<Outlet> | { data: Outlet }>(
      `/outlets/${outletUuid}`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Outlet;
  },

  /**
   * Delete an outlet
   * Endpoint: DELETE /outlets/{outlet}
   */
  async deleteOutlet(outletUuid: string): Promise<void> {
    await apiClient.delete(`/outlets/${outletUuid}`);
  },
};
