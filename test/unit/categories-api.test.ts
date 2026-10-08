import { describe, it, expect, vi, beforeEach } from "vitest";
import { categoriesApi } from "@/lib/api/categories";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Categories API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /categories with query parameters and X-Business-Uuid header", async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 1,
          uuid: "cat-001",
          business_uuid: "biz-001",
          parent_id: null,
          name: "Beverages",
          code: "BEV",
          description: "Drink items",
          image_path: null,
          sort_order: 1,
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          deleted_at: null,
          image_url: "https://example.com/bev.png",
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
      },
    };

    (apiClient.get as any).mockResolvedValueOnce(mockResponse);

    const result = await categoriesApi.getCategories({
      search: "bev",
      is_active: true,
      business_uuid: "biz-001",
      page: 1,
      per_page: 20,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/categories", {
      params: {
        search: "bev",
        is_active: "true",
        business_uuid: "biz-001",
        page: 1,
        per_page: 20,
      },
      headers: {
        "X-Business-Uuid": "biz-001",
      },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Beverages");
  });

  it("calls GET /categories with tree=1 when tree option is provided", async () => {
    const mockTree = [
      {
        id: 1,
        uuid: "cat-001",
        name: "Beverages",
        children: [
          { id: 2, uuid: "cat-002", name: "Cold Drinks", parent_id: 1 },
        ],
      },
    ];

    (apiClient.get as any).mockResolvedValueOnce({
      success: true,
      data: mockTree,
    });

    const result = await categoriesApi.getCategoryTree("biz-001");

    expect(apiClient.get).toHaveBeenCalledWith("/categories", {
      params: { tree: "1", business_uuid: "biz-001" },
      headers: { "X-Business-Uuid": "biz-001" },
    });

    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
  });

  it("creates a new category using POST /categories multipart FormData", async () => {
    const mockCreated = {
      success: true,
      message: "Category created successfully",
      data: {
        id: 10,
        uuid: "cat-010",
        name: "Snacks",
        code: "SNK",
        business_uuid: "biz-001",
        parent_id: null,
        is_active: true,
      },
    };

    (apiClient.post as any).mockResolvedValueOnce(mockCreated);

    const result = await categoriesApi.createCategory({
      name: "Snacks",
      code: "SNK",
      business_uuid: "biz-001",
      parent_id: null,
      sort_order: 2,
      is_active: true,
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/categories",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "X-Business-Uuid": "biz-001" },
      })
    );
    expect(result.data.name).toBe("Snacks");
  });

  it("deletes a category using DELETE /categories/{id}", async () => {
    (apiClient.delete as any).mockResolvedValueOnce({
      success: true,
      message: "Category deleted successfully",
    });

    const res = await categoriesApi.deleteCategory("cat-010", "biz-001");
    expect(apiClient.delete).toHaveBeenCalledWith("/categories/cat-010", {
      headers: { "X-Business-Uuid": "biz-001" },
    });
    expect(res.success).toBe(true);
  });

  it("calls GET /categories/trash with parameters and X-Business-Uuid header", async () => {
    const mockTrashResponse = {
      success: true,
      data: [
        {
          id: 5,
          uuid: "cat-del-005",
          name: "Old Bakery",
          code: "O-BAK",
          deleted_at: "2026-02-01T10:00:00Z",
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1,
      },
    };

    (apiClient.get as any).mockResolvedValueOnce(mockTrashResponse);

    const result = await categoriesApi.getTrashedCategories({
      search: "old",
      business_uuid: "biz-001",
      page: 1,
      per_page: 10,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/categories/trash", {
      params: {
        search: "old",
        business_uuid: "biz-001",
        page: 1,
        per_page: 10,
      },
      headers: {
        "X-Business-Uuid": "biz-001",
      },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Old Bakery");
  });

  it("calls POST /categories/{id}/restore with X-Business-Uuid header", async () => {
    const mockRestoreResponse = {
      success: true,
      message: "Category restored successfully.",
      data: {
        id: 5,
        uuid: "cat-del-005",
        name: "Old Bakery",
        deleted_at: null,
      },
    };

    (apiClient.post as any).mockResolvedValueOnce(mockRestoreResponse);

    const result = await categoriesApi.restoreCategory("cat-del-005", "biz-001");

    expect(apiClient.post).toHaveBeenCalledWith(
      "/categories/cat-del-005/restore",
      {},
      {
        headers: {
          "X-Business-Uuid": "biz-001",
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.data.deleted_at).toBeNull();
  });

  it("calls DELETE /categories/{id}/force with X-Business-Uuid header", async () => {
    const mockForceResponse = {
      success: true,
      message: "Category permanently deleted.",
    };

    (apiClient.delete as any).mockResolvedValueOnce(mockForceResponse);

    const result = await categoriesApi.forceDeleteCategory("cat-del-005", "biz-001");

    expect(apiClient.delete).toHaveBeenCalledWith(
      "/categories/cat-del-005/force",
      {
        headers: {
          "X-Business-Uuid": "biz-001",
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("Category permanently deleted.");
  });
});
