import { apiClient } from "./client";
import type {
  Permission,
  StorePermissionBatchItem,
  UpdatePermissionRequest,
  LengthAwarePaginator,
  ApiListResponse,
} from "@/types";

/**
 * Sorts permissions strictly ordered by module (asc) and code (asc)
 */
export function sortPermissionsByModuleAndCode(permissions: Permission[]): Permission[] {
  return [...permissions].sort((a, b) => {
    const modA = (a.module || "other").trim().toLowerCase();
    const modB = (b.module || "other").trim().toLowerCase();
    if (modA !== modB) {
      return modA.localeCompare(modB);
    }
    return (a.code || "").trim().localeCompare((b.code || "").trim());
  });
}

/**
 * Permissions API Client
 * Connects to https://smartpos-api.servicefixit.me/api/v1/permissions
 */
export const permissionsApi = {
  /**
   * List permissions with optional pagination params
   * Endpoint: GET /permissions
   */
  async getPermissions(params?: { per_page?: number; page?: number }): Promise<LengthAwarePaginator<Permission> | Permission[]> {
    return apiClient.get<LengthAwarePaginator<Permission> | Permission[]>("/permissions", {
      params: {
        per_page: params?.per_page ?? 100,
        page: params?.page ?? 1,
      },
    });
  },

  /**
   * List all permissions ordered by module and code across all pages
   * Endpoint: GET https://smartpos-api.servicefixit.me/api/v1/permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const firstPageRes = await apiClient.get<
      LengthAwarePaginator<Permission> | ApiListResponse<Permission> | Permission[]
    >("/permissions", {
      params: { per_page: 100, page: 1 },
    });

    let allItems: Permission[] = [];

    if (Array.isArray(firstPageRes)) {
      allItems = firstPageRes;
    } else if (firstPageRes && typeof firstPageRes === "object" && "data" in firstPageRes && Array.isArray(firstPageRes.data)) {
      allItems = [...firstPageRes.data];

      // If paginated and more pages exist, fetch remaining pages
      const paginator = firstPageRes as LengthAwarePaginator<Permission>;
      if (paginator.last_page && paginator.last_page > 1) {
        const pagePromises: Promise<LengthAwarePaginator<Permission>>[] = [];
        for (let page = 2; page <= paginator.last_page; page++) {
          pagePromises.push(
            apiClient.get<LengthAwarePaginator<Permission>>("/permissions", {
              params: { per_page: 100, page },
            })
          );
        }
        const remainingPages = await Promise.all(pagePromises);
        remainingPages.forEach((pageRes) => {
          if (pageRes?.data && Array.isArray(pageRes.data)) {
            allItems.push(...pageRes.data);
          }
        });
      }
    }

    // Deduplicate by code and sort strictly by module and code
    const uniqueMap = new Map<string, Permission>();
    allItems.forEach((p) => {
      if (p.code) {
        uniqueMap.set(p.code.toLowerCase(), p);
      }
    });

    return sortPermissionsByModuleAndCode(Array.from(uniqueMap.values()));
  },

  /**
   * Create new permissions in batch
   * Endpoint: POST /permissions
   */
  async createBatch(items: StorePermissionBatchItem[]): Promise<Permission[]> {
    const payload = items.map((it) => ({
      code: it.code.trim().toLowerCase(),
      name: it.name.trim(),
      module: it.module ? it.module.trim().toLowerCase() : null,
      description: it.description?.trim() || null,
    }));

    const res = await apiClient.post<{ message: string; count: number; data: Permission[] } | Permission[]>(
      "/permissions",
      payload
    );

    if (Array.isArray(res)) {
      return res;
    }
    if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  /**
   * Update an existing permission
   * Endpoint: PUT /permissions/{id}
   */
  async update(id: number | string, data: UpdatePermissionRequest): Promise<Permission> {
    const payload = {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.module !== undefined && { module: data.module ? data.module.trim().toLowerCase() : null }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
    };

    return apiClient.put<Permission>(`/permissions/${id}`, payload);
  },

  /**
   * Delete a permission
   * Endpoint: DELETE /permissions/{id}
   */
  async delete(id: number | string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/permissions/${id}`);
  },
};
