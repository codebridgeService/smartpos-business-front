import { apiClient } from "./client";
import type { CashierSession, ApiResponse } from "@/types";

export interface StartCashierSessionRequest {
  register_uuid: string;
  pos_device_uuid?: string | null;
  user_uuid?: string | null;
}

export interface UnlockCashierSessionRequest {
  pin_code: string;
}

/**
 * Cashier Sessions & Terminal Lock API Client
 */
export const cashierSessionsApi = {
  /**
   * Start a new cashier session
   * Endpoint: POST /outlets/{outlet}/cashier-sessions/start
   */
  async startSession(
    outletUuid: string,
    data: StartCashierSessionRequest
  ): Promise<CashierSession> {
    const res = await apiClient.post<ApiResponse<CashierSession> | { data: CashierSession }>(
      `/outlets/${outletUuid}/cashier-sessions/start`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as CashierSession;
  },

  /**
   * Get current cashier session for outlet/register
   * Endpoint: GET /outlets/{outlet}/cashier-sessions/current
   */
  async getCurrentSession(
    outletUuid: string,
    registerUuid?: string
  ): Promise<CashierSession | null> {
    try {
      const url = registerUuid
        ? `/outlets/${outletUuid}/cashier-sessions/current?register_uuid=${registerUuid}`
        : `/outlets/${outletUuid}/cashier-sessions/current`;

      const res = await apiClient.get<ApiResponse<CashierSession> | { data: CashierSession } | null>(url);
      if (res && "data" in res && res.data) {
        return res.data;
      }
      return res as unknown as CashierSession | null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Lock cashier session (terminal lock)
   * Endpoint: POST /outlets/{outlet}/cashier-sessions/{cashierSession}/lock
   */
  async lockSession(
    outletUuid: string,
    sessionUuid: string
  ): Promise<CashierSession> {
    const res = await apiClient.post<ApiResponse<CashierSession> | { data: CashierSession }>(
      `/outlets/${outletUuid}/cashier-sessions/${sessionUuid}/lock`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as CashierSession;
  },

  /**
   * Unlock cashier session with staff PIN
   * Endpoint: POST /outlets/{outlet}/cashier-sessions/{cashierSession}/unlock
   */
  async unlockSession(
    outletUuid: string,
    sessionUuid: string,
    pinCode: string
  ): Promise<CashierSession> {
    const res = await apiClient.post<ApiResponse<CashierSession> | { data: CashierSession }>(
      `/outlets/${outletUuid}/cashier-sessions/${sessionUuid}/unlock`,
      { pin_code: pinCode }
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as CashierSession;
  },

  /**
   * End cashier session
   * Endpoint: POST /outlets/{outlet}/cashier-sessions/{cashierSession}/end
   */
  async endSession(
    outletUuid: string,
    sessionUuid: string
  ): Promise<CashierSession> {
    const res = await apiClient.post<ApiResponse<CashierSession> | { data: CashierSession }>(
      `/outlets/${outletUuid}/cashier-sessions/${sessionUuid}/end`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as CashierSession;
  },
};
