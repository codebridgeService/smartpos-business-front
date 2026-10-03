import { describe, it, expect, vi, beforeEach } from "vitest";
import { brandsApi } from "@/lib/api/brands";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Brands API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls GET /brands with properly formatted query parameters", async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 1,
          uuid: "bnd-001",
          business_uuid: "biz-001",
          name: "Acme Corp",
          code: "ACME",
          description: "General goods",
          logo_path: null,
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          deleted_at: null,
          logo_url: "https://example.com/logo.png",
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

    const result = await brandsApi.getBrands({
      search: "acme",
      is_active: true,
      business_uuid: "biz-001",
      page: 1,
      per_page: 20,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/brands", {
      params: {
        search: "acme",
        is_active: "true",
        business_uuid: "biz-001",
        page: 1,
        per_page: 20,
      },
      headers: {
        "X-Business-Uuid": "biz-001",
      },
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Acme Corp");
    expect(result.meta.total).toBe(1);
  });

  it("handles is_active: false correctly as string 'false'", async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      success: true,
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    });

    await brandsApi.getBrands({
      is_active: false,
      page: 2,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/brands", {
      params: {
        is_active: "false",
        page: 2,
      },
      headers: {},
    });
  });

  it("fetches single brand by UUID", async () => {
    const mockBrand = {
      id: 2,
      uuid: "bnd-uuid-123",
      business_uuid: "biz-123",
      name: "Sony",
      code: "SONY",
      description: "Audio & Visual",
      logo_path: null,
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      deleted_at: null,
      logo_url: "",
    };

    (apiClient.get as any).mockResolvedValueOnce({ data: mockBrand });

    const result = await brandsApi.getBrand("bnd-uuid-123");
    expect(apiClient.get).toHaveBeenCalledWith("/brands/bnd-uuid-123");
    expect(result.name).toBe("Sony");
  });

  it("creates a brand with multipart/form-data support and X-Business-Uuid header", async () => {
    const mockCreated = {
      success: true,
      message: "Brand created successfully.",
      data: {
        id: 10,
        uuid: "bnd-new-456",
        business_uuid: "biz-123",
        name: "Logitech",
        code: "LOGI",
        description: "Peripherals",
        logo_path: "brands/logi.png",
        is_active: true,
        created_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-01T00:00:00Z",
        deleted_at: null,
        logo_url: "https://example.com/logi.png",
      },
    };

    (apiClient.post as any).mockResolvedValueOnce(mockCreated);

    const fakeFile = new File(["dummy content"], "logo.png", { type: "image/png" });

    const result = await brandsApi.createBrand({
      name: "Logitech",
      code: "LOGI",
      business_uuid: "biz-123",
      description: "Peripherals",
      logo: fakeFile,
      is_active: true,
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/brands",
      expect.any(FormData),
      {
        headers: {
          "X-Business-Uuid": "biz-123",
        },
      }
    );
    expect(result.success).toBe(true);
    expect(result.message).toBe("Brand created successfully.");
    expect(result.data.name).toBe("Logitech");
    expect(result.data.code).toBe("LOGI");
  });

  it("throws an error if business_uuid is missing when creating a brand", async () => {
    await expect(
      brandsApi.createBrand({
        name: "Test Brand",
        code: "TEST",
        business_uuid: "",
      })
    ).rejects.toThrow("business_uuid is required to create a brand");

    const formData = new FormData();
    formData.append("name", "Test Brand");
    formData.append("code", "TEST");

    await expect(brandsApi.createBrand(formData)).rejects.toThrow(
      "business_uuid is required to create a brand"
    );
  });

  it("updates a brand with JSON data via PUT", async () => {
    const mockUpdated = {
      success: true,
      message: "Brand updated successfully.",
      data: {
        id: 10,
        uuid: "bnd-10",
        business_uuid: "biz-123",
        name: "Logitech Updated",
        code: "LOGI2",
        description: "Updated desc",
        logo_path: null,
        is_active: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
        deleted_at: null,
        logo_url: "",
      },
    };

    (apiClient.put as any).mockResolvedValueOnce(mockUpdated);

    const result = await brandsApi.updateBrand("bnd-10", {
      name: "Logitech Updated",
      code: "LOGI2",
      description: "Updated desc",
      is_active: false,
      business_uuid: "biz-123",
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      "/brands/bnd-10",
      expect.objectContaining({
        name: "Logitech Updated",
        code: "LOGI2",
      }),
      {
        headers: {
          "X-Business-Uuid": "biz-123",
        },
      }
    );
    expect(result.success).toBe(true);
    expect(result.message).toBe("Brand updated successfully.");
    expect(result.data.name).toBe("Logitech Updated");
  });

  it("updates a brand with image replacement using FormData", async () => {
    const mockUpdated = {
      success: true,
      message: "Brand updated successfully.",
      data: {
        id: 10,
        uuid: "bnd-10",
        business_uuid: "biz-123",
        name: "Logitech With Logo",
        code: "LOGI",
        description: null,
        logo_path: "brands/new-logo.png",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
        deleted_at: null,
        logo_url: "https://example.com/new-logo.png",
      },
    };

    (apiClient.post as any).mockResolvedValueOnce(mockUpdated);

    const newLogoFile = new File(["new image data"], "new-logo.png", { type: "image/png" });

    const result = await brandsApi.updateBrand(10, {
      name: "Logitech With Logo",
      logo: newLogoFile,
      business_uuid: "biz-123",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/brands/10",
      expect.any(FormData),
      {
        headers: {
          "X-Business-Uuid": "biz-123",
        },
      }
    );
    expect(result.success).toBe(true);
    expect(result.data.logo_path).toBe("brands/new-logo.png");
  });

  it("deletes a brand via DELETE /brands/{brand}", async () => {
    const mockDeleteRes = {
      success: true,
      message: "Brand deleted successfully.",
    };

    (apiClient.delete as any).mockResolvedValueOnce(mockDeleteRes);

    const result = await brandsApi.deleteBrand(10, "biz-123");

    expect(apiClient.delete).toHaveBeenCalledWith("/brands/10", {
      headers: {
        "X-Business-Uuid": "biz-123",
      },
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe("Brand deleted successfully.");
  });

  it("toggles brand active status via toggleBrandStatus helper", async () => {
    const mockToggled = {
      success: true,
      message: "Brand updated successfully.",
      data: {
        id: 10,
        uuid: "bnd-10",
        business_uuid: "biz-123",
        name: "Logitech",
        code: "LOGI",
        description: null,
        logo_path: null,
        is_active: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
        deleted_at: null,
        logo_url: "",
      },
    };

    (apiClient.put as any).mockResolvedValueOnce(mockToggled);

    const result = await brandsApi.toggleBrandStatus("bnd-10", true, "biz-123");

    expect(apiClient.put).toHaveBeenCalledWith(
      "/brands/bnd-10",
      expect.objectContaining({
        is_active: false,
        business_uuid: "biz-123",
      }),
      {
        headers: {
          "X-Business-Uuid": "biz-123",
        },
      }
    );
    expect(result.data.is_active).toBe(false);
  });
});



