import { apiClient } from "./client";
import type { CashDrawerSession, CashDrawerMovement, CashMovementType, ApiResponse, ApiListResponse } from "@/types";

export interface RecordCashMovementRequest {
  type: CashMovementType | string;
  amount: number | string;
  reason?: string | null;
  notes?: string | null;
  reference_type?: string | null;
  reference_uuid?: string | null;
}

export interface DrawerDetailResponse extends CashDrawerSession {
  movements?: CashDrawerMovement[];
  total_in?: string;
  total_out?: string;
  net_movement?: string;
}

/**
 * Cash Drawer & Movements API Client
 */
export const drawersApi = {
  /**
   * Get real-time cash drawer balance and details
   * Endpoint: GET /outlets/{outlet}/registers/{register}/drawers/{cashDrawerSession}
   */
  async getDrawer(
    outletUuid: string,
    registerUuid: string,
    drawerSessionUuid: string
  ): Promise<DrawerDetailResponse> {
    const res = await apiClient.get<ApiResponse<DrawerDetailResponse> | { data: DrawerDetailResponse }>(
      `/outlets/${outletUuid}/registers/${registerUuid}/drawers/${drawerSessionUuid}`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as DrawerDetailResponse;
  },

  /**
   * Get cash movement history log
   * Endpoint: GET /outlets/{outlet}/registers/{register}/drawers/{cashDrawerSession}/movements
   */
  async getMovements(
    outletUuid: string,
    registerUuid: string,
    drawerSessionUuid: string
  ): Promise<CashDrawerMovement[]> {
    const res = await apiClient.get<ApiListResponse<CashDrawerMovement> | { data: CashDrawerMovement[] } | CashDrawerMovement[]>(
      `/outlets/${outletUuid}/registers/${registerUuid}/drawers/${drawerSessionUuid}/movements`
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
   * Record a new cash movement (cash in, cash out, payout, deposit, adjustment, refund)
   * Endpoint: POST /outlets/{outlet}/registers/{register}/drawers/{cashDrawerSession}/movements
   */
  async recordMovement(
    outletUuid: string,
    registerUuid: string,
    drawerSessionUuid: string,
    data: RecordCashMovementRequest
  ): Promise<CashDrawerMovement> {
    const res = await apiClient.post<ApiResponse<CashDrawerMovement> | { data: CashDrawerMovement }>(
      `/outlets/${outletUuid}/registers/${registerUuid}/drawers/${drawerSessionUuid}/movements`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as CashDrawerMovement;
  },
};
