import { apiClient } from "./client";

export interface Brand {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  code: string;
  description: string | null;
  logo_path: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  logo_url: string;
}

export interface BrandMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BrandListResponse {
  success: boolean;
  data: Brand[];
  meta: BrandMeta;
}

export interface GetBrandsParams {
  business_uuid?: string;
  is_active?: string | boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateBrandInput {
  name: string;
  code: string;
  business_uuid: string;
  description?: string | null;
  logo?: File | Blob | null;
  is_active?: boolean;
}

export interface BrandCreateResponse {
  success: boolean;
  message: string;
  data: Brand;
}

export interface UpdateBrandInput {
  name?: string;
  code?: string;
  description?: string | null;
  logo?: File | Blob | null;
  is_active?: boolean | null;
  business_uuid?: string;
}

export interface BrandUpdateResponse {
  success: boolean;
  message: string;
  data: Brand;
}

export interface BrandDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Brands API Client
 * Interacts with /api/v1/brands
 */
export const brandsApi = {
  /**
   * List paginated brands with optional search, active status, and business_uuid filters
   * Endpoint: GET /brands
   */
  async getBrands(params?: GetBrandsParams): Promise<BrandListResponse> {
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

    const response = await apiClient.get<BrandListResponse>("/brands", {
      params: queryParams,
      headers,
    });

    if (response && Array.isArray(response.data) && response.meta) {
      return response;
    }

    // Fallback if data is returned directly as array or wrapped differently
    const items = Array.isArray(response)
      ? (response as Brand[])
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
   * Fetch single brand by UUID
   * Endpoint: GET /brands/{brand}
   */
  async getBrand(uuid: string): Promise<Brand> {
    const res = await apiClient.get<{ success?: boolean; data?: Brand } | Brand>(`/brands/${uuid}`);
    if (res && typeof res === "object" && "data" in res && (res as any).data) {
      return (res as any).data as Brand;
    }
    return res as Brand;
  },

  /**
   * Create a new brand with image upload support (multipart/form-data)
   * Endpoint: POST /brands
   */
  async createBrand(input: CreateBrandInput | FormData): Promise<BrandCreateResponse> {
    let body: FormData;

    if (input instanceof FormData) {
      const bUuid = input.get("business_uuid");
      if (!bUuid || String(bUuid).trim() === "") {
        throw new Error("business_uuid is required to create a brand");
      }
      body = input;
    } else {
      if (!input.business_uuid || !input.business_uuid.trim()) {
        throw new Error("business_uuid is required to create a brand");
      }

      body = new FormData();
      body.append("name", input.name.trim());
      body.append("code", input.code.trim());
      body.append("business_uuid", input.business_uuid.trim());

      if (input.description !== undefined && input.description !== null && input.description !== "") {
        body.append("description", input.description.trim());
      }

      if (input.is_active !== undefined && input.is_active !== null) {
        body.append("is_active", input.is_active ? "1" : "0");
      }

      if (input.logo) {
        body.append("logo", input.logo);
      }
    }

    const targetBizUuid =
      input instanceof FormData
        ? String(input.get("business_uuid") || "").trim()
        : input.business_uuid.trim();

    const res = await apiClient.post<BrandCreateResponse>("/brands", body, {
      headers: {
        "X-Business-Uuid": targetBizUuid,
      },
    });
    return res;
  },

  /**
   * Update the specified brand in storage with image replacement support
   * Endpoint: PUT /brands/{brand}
   */
  async updateBrand(
    idOrUuid: string | number,
    input: UpdateBrandInput | Partial<Brand> | FormData
  ): Promise<BrandUpdateResponse> {
    const headers: Record<string, string> = {};

    if (input instanceof FormData) {
      const bUuid = input.get("business_uuid");
      if (bUuid) {
        headers["X-Business-Uuid"] = String(bUuid).trim();
      }
      if (!input.has("_method")) {
        input.append("_method", "PUT");
      }
      const res = await apiClient.post<BrandUpdateResponse>(`/brands/${idOrUuid}`, input, {
        headers,
      });
      return res;
    }

    const hasLogoFile = (input as any).logo instanceof File || (input as any).logo instanceof Blob;

    if (hasLogoFile) {
      const formData = new FormData();
      formData.append("_method", "PUT");
      if (input.name !== undefined) formData.append("name", input.name.trim());
      if (input.code !== undefined) formData.append("code", input.code.trim());
      if (input.description !== undefined && input.description !== null) {
        formData.append("description", input.description.trim());
      }
      if (input.is_active !== undefined && input.is_active !== null) {
        formData.append("is_active", input.is_active ? "1" : "0");
      }
      if ((input as any).logo) {
        formData.append("logo", (input as any).logo);
      }
      if (input.business_uuid) {
        formData.append("business_uuid", input.business_uuid);
        headers["X-Business-Uuid"] = input.business_uuid;
      }

      const res = await apiClient.post<BrandUpdateResponse>(`/brands/${idOrUuid}`, formData, {
        headers,
      });
      return res;
    }

    if (input.business_uuid) {
      headers["X-Business-Uuid"] = input.business_uuid;
    }

    const res = await apiClient.put<BrandUpdateResponse>(`/brands/${idOrUuid}`, input, {
      headers,
    });
    return res;
  },

  /**
   * Quick toggle active status on/off
   * Endpoint: PUT /brands/{brand}
   */
  async toggleBrandStatus(
    idOrUuid: string | number,
    currentStatus: boolean,
    business_uuid?: string
  ): Promise<BrandUpdateResponse> {
    return this.updateBrand(idOrUuid, {
      is_active: !currentStatus,
      business_uuid,
    });
  },

  /**
   * Remove the specified brand from storage
   * Endpoint: DELETE /brands/{brand}
   */
  async deleteBrand(
    idOrUuid: string | number,
    business_uuid?: string
  ): Promise<BrandDeleteResponse> {
    const headers: Record<string, string> = {};
    if (business_uuid && business_uuid.trim()) {
      headers["X-Business-Uuid"] = business_uuid.trim();
    }

    const res = await apiClient.delete<BrandDeleteResponse>(`/brands/${idOrUuid}`, {
      headers,
    });
    return res;
  },
};
