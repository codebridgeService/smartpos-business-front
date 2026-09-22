import { apiClient } from "./client";
import type { RegisterSession, ApiResponse, ApiListResponse } from "@/types";

export interface OpenShiftRequest {
  opening_cash: string | number;
  pos_device_uuid?: string | null;
  notes?: string | null;
}

export interface CloseShiftRequest {
  closing_cash: string | number;
  notes?: string | null;
}

/**
 * Shifts & Cash Drawer API Client
 */
export const shiftsApi = {
  /**
   * List shift sessions for the specified register
   * Endpoint: GET /outlets/{outlet}/registers/{register}/shifts
   */
  async getShifts(outletUuid: string, registerUuid: string): Promise<RegisterSession[]> {
    const res = await apiClient.get<ApiListResponse<RegisterSession> | { data: RegisterSession[] } | RegisterSession[]>(
      `/outlets/${outletUuid}/registers/${registerUuid}/shifts`
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
   * Get the current open shift session for the register
   * Endpoint: GET /outlets/{outlet}/registers/{register}/shifts/current
   */
  async getCurrentShift(outletUuid: string, registerUuid: string): Promise<RegisterSession | null> {
    try {
      const res = await apiClient.get<ApiResponse<RegisterSession> | { data: RegisterSession } | null>(
        `/outlets/${outletUuid}/registers/${registerUuid}/shifts/current`
      );
      if (res && "data" in res && res.data) {
        return res.data;
      }
      return res as unknown as RegisterSession | null;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  },

  /**
   * Open a new register shift
   * Endpoint: POST /outlets/{outlet}/registers/{register}/shifts/open
   */
  async openShift(outletUuid: string, registerUuid: string, data: OpenShiftRequest): Promise<RegisterSession> {
    const res = await apiClient.post<ApiResponse<RegisterSession> | { data: RegisterSession }>(
      `/outlets/${outletUuid}/registers/${registerUuid}/shifts/open`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as RegisterSession;
  },

  /**
   * Close a register shift
   * Endpoint: POST /outlets/{outlet}/registers/{register}/shifts/{shift}/close
   */
  async closeShift(outletUuid: string, registerUuid: string, shiftId: string | number, data: CloseShiftRequest): Promise<RegisterSession> {
    const res = await apiClient.post<ApiResponse<RegisterSession> | { data: RegisterSession }>(
      `/outlets/${outletUuid}/registers/${registerUuid}/shifts/${shiftId}/close`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as RegisterSession;
  }
};
