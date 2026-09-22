import { apiClient } from "./client";
import type { Register, ApiResponse, ApiListResponse } from "@/types";

export interface CreateRegisterRequest {
  code: string;
  name: string;
  description?: string | null;
  default_cash_amount?: string | number;
  receipt_printer_name?: string | null;
  is_cash_drawer_connected?: boolean;
  status?: "active" | "inactive" | string;
}

export type UpdateRegisterRequest = Partial<CreateRegisterRequest>;

/**
 * Registers API Client
 * Interacts with /api/v1/outlets/{outlet}/registers and /api/v1/registers/{register}
 */
export const registersApi = {
  /**
   * List all cash registers for the specified outlet
   * Endpoint: GET /outlets/{outlet}/registers
   */
  async getRegisters(outletUuid: string): Promise<Register[]> {
    const res = await apiClient.get<ApiListResponse<Register> | { data: Register[] } | Register[]>(
      `/outlets/${outletUuid}/registers`
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
   * Fetch single register details
   * Endpoint: GET /registers/{register}
   */
  async getRegister(registerUuid: string): Promise<Register> {
    const res = await apiClient.get<ApiResponse<Register> | { data: Register }>(
      `/registers/${registerUuid}`
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Register;
  },

  /**
   * Create a new cash register for the specified outlet
   * Endpoint: POST /outlets/{outlet}/registers
   */
  async createRegister(outletUuid: string, data: CreateRegisterRequest): Promise<Register> {
    const res = await apiClient.post<ApiResponse<Register> | { data: Register }>(
      `/outlets/${outletUuid}/registers`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Register;
  },

  /**
   * Update an existing register
   * Endpoint: PUT /registers/{register}
   */
  async updateRegister(registerUuid: string, data: UpdateRegisterRequest): Promise<Register> {
    const res = await apiClient.put<ApiResponse<Register> | { data: Register }>(
      `/registers/${registerUuid}`,
      data
    );
    if ("data" in res && res.data) {
      return res.data;
    }
    return res as unknown as Register;
  },

  /**
   * Delete a register
   * Endpoint: DELETE /registers/{register}
   */
  async deleteRegister(registerUuid: string): Promise<void> {
    await apiClient.delete(`/registers/${registerUuid}`);
  },
};
