import { apiClient } from "./client";

export interface Unit {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  code: string;
  symbol: string;
  precision: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface UnitMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UnitListResponse {
  success: boolean;
  data: Unit[];
  meta: UnitMeta;
}

export interface GetUnitsParams {
  business_uuid?: string;
  is_active?: string | boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateUnitInput {
  name: string;
  code: string;
  symbol: string;
  precision?: number | null;
  is_active?: boolean | null;
  business_uuid: string;
}

export interface UnitCreateResponse {
  success: boolean;
  message: string;
  data: Unit;
}

export interface UpdateUnitInput {
  name?: string;
  code?: string;
  symbol?: string;
  precision?: number | null;
  is_active?: boolean | null;
  business_uuid?: string;
}

export interface UnitUpdateResponse {
  success: boolean;
  message: string;
  data: Unit;
}

export interface UnitDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Measurement Units API Client
 * Interacts with /api/v1/units
 */
export const unitsApi = {
  /**
   * List paginated measurement units with optional search and active status filters
   * Endpoint: GET /units
   */
  async getUnits(params?: GetUnitsParams): Promise<UnitListResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    if (params?.is_active !== undefined && params.is_active !== "") {
      queryParams.is_active =
        typeof params.is_active === "boolean"
          ? params.is_active
            ? "true"
            : "false"
          : String(params.is_active);
    }

    if (params?.business_uuid && params.business_uuid.trim()) {
      queryParams.business_uuid = params.business_uuid.trim();
    }

    if (params?.page) {
      queryParams.page = params.page;
    }

    if (params?.per_page) {
      queryParams.per_page = params.per_page;
    }

    const headers: Record<string, string> = {};
    if (params?.business_uuid && params.business_uuid.trim()) {
      headers["X-Business-Uuid"] = params.business_uuid.trim();
    }

    const response = await apiClient.get<UnitListResponse>("/units", {
      params: queryParams,
      headers,
    });

    if (response && Array.isArray(response.data) && response.meta) {
      return response;
    }

    const items = Array.isArray(response)
      ? (response as Unit[])
      : Array.isArray((response as any)?.data)
      ? (response as any).data
      : [];

    return {
      success: true,
      data: items,
      meta: (response as any)?.meta || {
        current_page: params?.page || 1,
        last_page: 1,
        per_page: params?.per_page || items.length || 20,
        total: items.length,
      },
    };
  },

  /**
   * Fetch single measurement unit by ID or UUID
   * Endpoint: GET /units/{unit}
   */
  async getUnit(idOrUuid: string | number, businessUuid?: string): Promise<Unit> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }

    const res = await apiClient.get<{ success?: boolean; data?: Unit } | Unit>(
      `/units/${idOrUuid}`,
      { headers }
    );

    if (res && typeof res === "object" && "data" in res && (res as any).data) {
      return (res as any).data as Unit;
    }
    return res as Unit;
  },

  /**
   * Store a newly created measurement unit
   * Endpoint: POST /units
   */
  async createUnit(input: CreateUnitInput): Promise<UnitCreateResponse> {
    if (!input.business_uuid || !input.business_uuid.trim()) {
      throw new Error("business_uuid is required to create a measurement unit");
    }

    const headers: Record<string, string> = {
      "X-Business-Uuid": input.business_uuid.trim(),
    };

    const payload = {
      name: input.name.trim(),
      code: input.code.trim(),
      symbol: input.symbol.trim(),
      precision: input.precision !== undefined && input.precision !== null ? Number(input.precision) : 0,
      is_active: input.is_active ?? true,
      business_uuid: input.business_uuid.trim(),
    };

    const res = await apiClient.post<UnitCreateResponse>("/units", payload, {
      headers,
    });
    return res;
  },

  /**
   * Update the specified measurement unit in storage
   * Endpoint: PUT /units/{unit}
   */
  async updateUnit(
    idOrUuid: string | number,
    input: UpdateUnitInput
  ): Promise<UnitUpdateResponse> {
    const headers: Record<string, string> = {};
    if (input.business_uuid && input.business_uuid.trim()) {
      headers["X-Business-Uuid"] = input.business_uuid.trim();
    }

    const payload: Record<string, any> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.code !== undefined) payload.code = input.code.trim();
    if (input.symbol !== undefined) payload.symbol = input.symbol.trim();
    if (input.precision !== undefined && input.precision !== null) {
      payload.precision = Number(input.precision);
    }
    if (input.is_active !== undefined && input.is_active !== null) {
      payload.is_active = Boolean(input.is_active);
    }

    const res = await apiClient.put<UnitUpdateResponse>(`/units/${idOrUuid}`, payload, {
      headers,
    });
    return res;
  },

  /**
   * Quick toggle active status on/off
   * Endpoint: PUT /units/{unit}
   */
  async toggleUnitStatus(
    idOrUuid: string | number,
    currentStatus: boolean,
    businessUuid?: string
  ): Promise<UnitUpdateResponse> {
    return this.updateUnit(idOrUuid, {
      is_active: !currentStatus,
      business_uuid: businessUuid,
    });
  },

  /**
   * Remove the specified measurement unit from storage
   * Endpoint: DELETE /units/{unit}
   */
  async deleteUnit(
    idOrUuid: string | number,
    businessUuid?: string
  ): Promise<UnitDeleteResponse> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }

    const res = await apiClient.delete<UnitDeleteResponse>(`/units/${idOrUuid}`, {
      headers,
    });
    return res;
  },
};
