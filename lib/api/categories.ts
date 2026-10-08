import { apiClient } from "./client";

export interface Category {
  id: number;
  uuid: string;
  business_uuid: string;
  parent_id: number | null;
  name: string;
  code: string;
  description: string | null;
  image_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  image_url: string;
  parent?: Category | null;
  children?: Category[];
}

export interface CategoryMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  meta: CategoryMeta;
}

export interface CategoryTreeResponse {
  success: boolean;
  data: Category[];
}

export interface GetCategoriesParams {
  business_uuid?: string;
  is_active?: string | boolean;
  search?: string;
  tree?: boolean;
  page?: number;
  per_page?: number;
}

export interface CreateCategoryInput {
  name: string;
  code: string;
  business_uuid: string;
  parent_id?: number | null;
  description?: string | null;
  image?: File | Blob | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface CategoryCreateResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface UpdateCategoryInput {
  name?: string;
  code?: string;
  parent_id?: number | null;
  description?: string | null;
  image?: File | Blob | null;
  sort_order?: number;
  is_active?: boolean | null;
  business_uuid?: string;
}

export interface CategoryUpdateResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface CategoryDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Categories API Client
 * Interacts with /api/v1/categories
 */
export const categoriesApi = {
  /**
   * List paginated categories with optional search, active status, and business_uuid filters
   * Endpoint: GET /categories
   */
  async getCategories(params?: GetCategoriesParams): Promise<CategoryListResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    if (params?.is_active !== undefined && params.is_active !== "") {
      queryParams.is_active = typeof params.is_active === "boolean"
        ? (params.is_active ? "true" : "false")
        : String(params.is_active);
    }

    if (params?.tree) {
      queryParams.tree = "1";
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

    const response = await apiClient.get<CategoryListResponse>("/categories", {
      params: queryParams,
      headers,
    });

    if (response && Array.isArray(response.data) && response.meta) {
      return response;
    }

    const items = Array.isArray(response)
      ? (response as Category[])
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
   * Fetch hierarchical tree view of categories
   * Endpoint: GET /categories?tree=1
   */
  async getCategoryTree(businessUuid?: string): Promise<Category[]> {
    const headers: Record<string, string> = {};
    const queryParams: Record<string, string> = { tree: "1" };

    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
      queryParams.business_uuid = businessUuid.trim();
    }

    const response = await apiClient.get<{ success?: boolean; data?: Category[] } | Category[]>("/categories", {
      params: queryParams,
      headers,
    });

    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray((response as any).data)) {
      return (response as any).data;
    }
    return [];
  },

  /**
   * Fetch single category by ID or UUID
   * Endpoint: GET /categories/{category}
   */
  async getCategory(idOrUuid: string | number): Promise<Category> {
    const res = await apiClient.get<{ success?: boolean; data?: Category } | Category>(`/categories/${idOrUuid}`);
    if (res && typeof res === "object" && "data" in res && (res as any).data) {
      return (res as any).data as Category;
    }
    return res as Category;
  },

  /**
   * Create a new category with image upload support (multipart/form-data)
   * Endpoint: POST /categories
   */
  async createCategory(input: CreateCategoryInput | FormData): Promise<CategoryCreateResponse> {
    let body: FormData;

    if (input instanceof FormData) {
      const bUuid = input.get("business_uuid");
      if (!bUuid || String(bUuid).trim() === "") {
        throw new Error("business_uuid is required to create a category");
      }
      body = input;
    } else {
      if (!input.business_uuid || !input.business_uuid.trim()) {
        throw new Error("business_uuid is required to create a category");
      }

      body = new FormData();
      body.append("name", input.name.trim());
      body.append("code", input.code.trim());
      body.append("business_uuid", input.business_uuid.trim());

      if (input.parent_id !== undefined && input.parent_id !== null) {
        body.append("parent_id", String(input.parent_id));
      }

      if (input.description !== undefined && input.description !== null && input.description !== "") {
        body.append("description", input.description.trim());
      }

      if (input.sort_order !== undefined && input.sort_order !== null) {
        body.append("sort_order", String(input.sort_order));
      }

      if (input.is_active !== undefined && input.is_active !== null) {
        body.append("is_active", input.is_active ? "1" : "0");
      }

      if (input.image) {
        body.append("image", input.image);
      }
    }

    const targetBizUuid =
      input instanceof FormData
        ? String(input.get("business_uuid") || "").trim()
        : input.business_uuid.trim();

    const res = await apiClient.post<CategoryCreateResponse>("/categories", body, {
      headers: {
        "X-Business-Uuid": targetBizUuid,
      },
    });
    return res;
  },

  /**
   * Update the specified category in storage with image replacement support
   * Endpoint: PUT /categories/{category} (POST with _method=PUT for multipart/form-data)
   */
  async updateCategory(
    idOrUuid: string | number,
    input: UpdateCategoryInput | Partial<Category> | FormData
  ): Promise<CategoryUpdateResponse> {
    const headers: Record<string, string> = {};

    if (input instanceof FormData) {
      const bUuid = input.get("business_uuid");
      if (bUuid) {
        headers["X-Business-Uuid"] = String(bUuid).trim();
      }
      if (!input.has("_method")) {
        input.append("_method", "PUT");
      }
      const res = await apiClient.post<CategoryUpdateResponse>(`/categories/${idOrUuid}`, input, {
        headers,
      });
      return res;
    }

    const hasImageFile = (input as any).image instanceof File || (input as any).image instanceof Blob;

    if (hasImageFile) {
      const formData = new FormData();
      formData.append("_method", "PUT");
      if (input.name !== undefined) formData.append("name", input.name.trim());
      if (input.code !== undefined) formData.append("code", input.code.trim());
      if (input.parent_id !== undefined) {
        formData.append("parent_id", input.parent_id === null ? "" : String(input.parent_id));
      }
      if (input.description !== undefined && input.description !== null) {
        formData.append("description", input.description.trim());
      }
      if (input.sort_order !== undefined && input.sort_order !== null) {
        formData.append("sort_order", String(input.sort_order));
      }
      if (input.is_active !== undefined && input.is_active !== null) {
        formData.append("is_active", input.is_active ? "1" : "0");
      }
      if ((input as any).image) {
        formData.append("image", (input as any).image);
      }
      if (input.business_uuid) {
        formData.append("business_uuid", input.business_uuid);
        headers["X-Business-Uuid"] = input.business_uuid;
      }

      const res = await apiClient.post<CategoryUpdateResponse>(`/categories/${idOrUuid}`, formData, {
        headers,
      });
      return res;
    }

    const payload: Record<string, any> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.code !== undefined) payload.code = input.code.trim();
    if (input.parent_id !== undefined) payload.parent_id = input.parent_id;
    if (input.description !== undefined) payload.description = input.description;
    if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
    if (input.is_active !== undefined) payload.is_active = input.is_active;
    if (input.business_uuid) {
      payload.business_uuid = input.business_uuid;
      headers["X-Business-Uuid"] = input.business_uuid;
    }

    const res = await apiClient.put<CategoryUpdateResponse>(`/categories/${idOrUuid}`, payload, {
      headers,
    });
    return res;
  },

  /**
   * Delete category (soft delete, moves to trash)
   * Endpoint: DELETE /categories/{category}
   */
  async deleteCategory(idOrUuid: string | number, businessUuid?: string): Promise<CategoryDeleteResponse> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }
    const res = await apiClient.delete<CategoryDeleteResponse>(`/categories/${encodeURIComponent(String(idOrUuid))}`, {
      headers,
    });
    return res;
  },

  /**
   * Display a listing of soft-deleted categories
   * Endpoint: GET /categories/trash
   */
  async getTrashedCategories(params?: GetTrashedCategoriesParams): Promise<CategoryListResponse> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params?.page) {
      queryParams.page = params.page;
    }
    if (params?.per_page) {
      queryParams.per_page = params.per_page;
    }
    if (params?.business_uuid && params.business_uuid.trim()) {
      queryParams.business_uuid = params.business_uuid.trim();
    }

    const headers: Record<string, string> = {};
    if (params?.business_uuid && params.business_uuid.trim()) {
      headers["X-Business-Uuid"] = params.business_uuid.trim();
    }

    const response = await apiClient.get<CategoryListResponse>("/categories/trash", {
      params: queryParams,
      headers,
    });

    if (response && Array.isArray(response.data) && response.meta) {
      return response;
    }

    const items = Array.isArray(response)
      ? (response as Category[])
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
   * Restore a soft-deleted category
   * Endpoint: POST /categories/{id}/restore
   */
  async restoreCategory(
    idOrUuid: string | number,
    businessUuid?: string
  ): Promise<TrashedCategoryRestoreResponse> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }

    const res = await apiClient.post<TrashedCategoryRestoreResponse>(
      `/categories/${encodeURIComponent(String(idOrUuid))}/restore`,
      {},
      { headers }
    );
    return res;
  },

  /**
   * Permanently purge a soft-deleted category from storage
   * Endpoint: DELETE /categories/{id}/force
   */
  async forceDeleteCategory(
    idOrUuid: string | number,
    businessUuid?: string
  ): Promise<TrashedCategoryForceDeleteResponse> {
    const headers: Record<string, string> = {};
    if (businessUuid && businessUuid.trim()) {
      headers["X-Business-Uuid"] = businessUuid.trim();
    }

    const res = await apiClient.delete<TrashedCategoryForceDeleteResponse>(
      `/categories/${encodeURIComponent(String(idOrUuid))}/force`,
      { headers }
    );
    return res;
  },
};

export interface GetTrashedCategoriesParams {
  business_uuid?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface TrashedCategoryRestoreResponse {
  success: boolean;
  message: string;
  data: Category;
}

export interface TrashedCategoryForceDeleteResponse {
  success: boolean;
  message: string;
}
