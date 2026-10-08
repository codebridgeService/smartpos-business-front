import { apiClient } from "./client";

export interface LabelTemplate {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  width_mm: number | string;
  height_mm: number | string;
  show_product_name: boolean;
  show_variant_name: boolean;
  show_price: boolean;
  show_sku: boolean;
  show_barcode: boolean;
  show_qrcode: boolean;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLabelTemplateInput {
  name: string;
  width_mm: number;
  height_mm: number;
  show_product_name?: boolean;
  show_variant_name?: boolean;
  show_price?: boolean;
  show_sku?: boolean;
  show_barcode?: boolean;
  show_qrcode?: boolean;
  is_default?: boolean;
  is_active?: boolean;
  business_uuid?: string;
}

export interface UpdateLabelTemplateInput {
  name?: string;
  width_mm?: number;
  height_mm?: number;
  show_product_name?: boolean;
  show_variant_name?: boolean;
  show_price?: boolean;
  show_sku?: boolean;
  show_barcode?: boolean;
  show_qrcode?: boolean;
  is_default?: boolean;
  is_active?: boolean;
  business_uuid?: string;
}

export interface GetLabelTemplatesParams {
  search?: string;
  is_active?: boolean | string;
  business_uuid?: string;
  page?: number;
  per_page?: number;
}

export interface LabelTemplateListResponse {
  success: boolean;
  data: LabelTemplate[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LabelTemplateResponse {
  success: boolean;
  message?: string;
  data: LabelTemplate;
}

export interface LabelTemplateDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Label Templates API Client
 * Interacts with product-service /api/v1/label-templates
 */
export const labelTemplatesApi = {
  /**
   * List paginated label templates with optional search and active status filters
   * Endpoint: GET /label-templates
   */
  async getTemplates(params?: GetLabelTemplatesParams): Promise<LabelTemplateListResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    if (params?.is_active !== undefined && params.is_active !== "") {
      queryParams.is_active = typeof params.is_active === "boolean"
        ? (params.is_active ? "true" : "false")
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

    const response = await apiClient.get<LabelTemplateListResponse>("/label-templates", {
      params: queryParams,
      headers,
    });

    if (response && Array.isArray(response.data)) {
      return response;
    }

    // Fallback if returned as direct array or generic paginator
    const rawData = Array.isArray(response) ? response : [];
    return {
      success: true,
      data: rawData as LabelTemplate[],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: rawData.length || 20,
        total: rawData.length,
      },
    };
  },

  /**
   * Get single label template by ID or UUID
   * Endpoint: GET /label-templates/{id}
   */
  async getTemplate(id: number | string, businessUuid?: string): Promise<LabelTemplateResponse> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }

    return apiClient.get<LabelTemplateResponse>(`/label-templates/${id}`, { headers });
  },

  /**
   * Create a new label template
   * Endpoint: POST /label-templates
   */
  async createTemplate(
    input: CreateLabelTemplateInput,
    businessUuid?: string
  ): Promise<LabelTemplateResponse> {
    const headers: Record<string, string> = {};
    const bUuid = input.business_uuid || businessUuid;
    if (bUuid && bUuid.trim()) {
      headers["X-Business-Uuid"] = bUuid.trim();
    }

    return apiClient.post<LabelTemplateResponse>("/label-templates", input, { headers });
  },

  /**
   * Update an existing label template
   * Endpoint: PUT /label-templates/{id}
   */
  async updateTemplate(
    id: number | string,
    input: UpdateLabelTemplateInput,
    businessUuid?: string
  ): Promise<LabelTemplateResponse> {
    const headers: Record<string, string> = {};
    const bUuid = input.business_uuid || businessUuid;
    if (bUuid && bUuid.trim()) {
      headers["X-Business-Uuid"] = bUuid.trim();
    }

    return apiClient.put<LabelTemplateResponse>(`/label-templates/${id}`, input, { headers });
  },

  /**
   * Remove a label template
   * Endpoint: DELETE /label-templates/{id}
   */
  async deleteTemplate(
    id: number | string,
    businessUuid?: string
  ): Promise<LabelTemplateDeleteResponse> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }

    return apiClient.delete<LabelTemplateDeleteResponse>(`/label-templates/${id}`, { headers });
  },
};
