import { apiClient } from "./client";
import type { LengthAwarePaginator, ApiListResponse } from "@/types";

export interface Product {
  id: number;
  uuid: string;
  business_id: number;
  category_id?: number | null;
  brand_id?: number | null;
  unit_id?: number | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  type: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  category?: ProductCategory | null;
  brand?: ProductBrand | null;
  unit?: ProductUnit | null;
  variants?: ProductVariant[];
  [key: string]: unknown;
}

export interface ProductCategory {
  id: number;
  uuid: string;
  name: string;
  slug?: string;
  parent_id?: number | null;
  status?: string;
}

export interface ProductBrand {
  id: number;
  uuid: string;
  name: string;
  slug?: string;
}

export interface ProductUnit {
  id: number;
  uuid: string;
  name: string;
  symbol: string;
}

export interface ProductVariant {
  id: number;
  uuid: string;
  product_id: number;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  cost_price?: string | number;
  selling_price?: string | number;
  stock_quantity?: number;
}

export interface GetProductsParams {
  business_id?: string | number;
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string | number;
  brand_id?: string | number;
  status?: string;
}

export const productsApi = {
  /**
   * List paginated products
   * Endpoint: GET /products
   */
  async getProducts(params?: GetProductsParams): Promise<LengthAwarePaginator<Product>> {
    const headers: Record<string, string> = {};
    if (params?.business_id) {
      headers["X-Business-Id"] = String(params.business_id);
    }

    const response = await apiClient.get<LengthAwarePaginator<Product> | ApiListResponse<Product>>("/products", {
      headers,
      params: {
        page: params?.page,
        per_page: params?.per_page ?? 20,
        search: params?.search?.trim() || undefined,
        category_id: params?.category_id,
        brand_id: params?.brand_id,
        status: params?.status,
      },
    });

    if (response && "current_page" in response) {
      return response as LengthAwarePaginator<Product>;
    }

    const rawData = Array.isArray(response)
      ? response
      : (response as ApiListResponse<Product>)?.data || [];
    const data = rawData as Product[];

    return {
      data,
      current_page: 1,
      first_page_url: null,
      from: data.length > 0 ? 1 : 0,
      last_page: 1,
      last_page_url: null,
      links: [],
      next_page_url: null,
      path: null,
      per_page: data.length || 20,
      prev_page_url: null,
      to: data.length,
      total: data.length,
    };
  },

  /**
   * Get single product by UUID or ID
   * Endpoint: GET /products/{product}
   */
  async getProduct(uuidOrId: string | number, businessId?: string | number): Promise<Product> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    return apiClient.get<Product>(`/products/${uuidOrId}`, { headers });
  },

  /**
   * Create a new product
   * Endpoint: POST /products
   */
  async createProduct(data: Partial<Product>, businessId?: string | number): Promise<{ message: string; data: Product }> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    return apiClient.post<{ message: string; data: Product }>("/products", data, { headers });
  },

  /**
   * Update product
   * Endpoint: PUT /products/{product}
   */
  async updateProduct(uuidOrId: string | number, data: Partial<Product>, businessId?: string | number): Promise<Product> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    return apiClient.put<Product>(`/products/${uuidOrId}`, data, { headers });
  },

  /**
   * Delete product
   * Endpoint: DELETE /products/{product}
   */
  async deleteProduct(uuidOrId: string | number, businessId?: string | number): Promise<{ message: string }> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    return apiClient.delete<{ message: string }>(`/products/${uuidOrId}`, { headers });
  },

  /**
   * Get product categories
   * Endpoint: GET /categories
   */
  async getCategories(businessId?: string | number): Promise<ProductCategory[]> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    const res = await apiClient.get<ApiListResponse<ProductCategory> | ProductCategory[]>("/categories", { headers });
    return Array.isArray(res) ? res : (res as ApiListResponse<ProductCategory>).data || [];
  },

  /**
   * Get product brands
   * Endpoint: GET /brands
   */
  async getBrands(businessId?: string | number): Promise<ProductBrand[]> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    const res = await apiClient.get<ApiListResponse<ProductBrand> | ProductBrand[]>("/brands", { headers });
    return Array.isArray(res) ? res : (res as ApiListResponse<ProductBrand>).data || [];
  },

  /**
   * Get product units
   * Endpoint: GET /units
   */
  async getUnits(businessId?: string | number): Promise<ProductUnit[]> {
    const headers: Record<string, string> = {};
    if (businessId) {
      headers["X-Business-Id"] = String(businessId);
    }
    const res = await apiClient.get<ApiListResponse<ProductUnit> | ProductUnit[]>("/units", { headers });
    return Array.isArray(res) ? res : (res as ApiListResponse<ProductUnit>).data || [];
  },
};
