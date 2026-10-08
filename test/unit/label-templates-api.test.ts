import { describe, it, expect, vi, beforeEach } from "vitest";
import { labelTemplatesApi } from "@/lib/api/label-templates";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("labelTemplatesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paginated templates with search and active status filters", async () => {
    const mockResponse = {
      success: true,
      data: [
        {
          id: 1,
          uuid: "tmpl-1",
          business_uuid: "biz-1",
          name: "Standard Shelf Label",
          width_mm: 50,
          height_mm: 30,
          show_product_name: true,
          show_variant_name: true,
          show_price: true,
          show_sku: true,
          show_barcode: true,
          show_qrcode: false,
          is_default: true,
          is_active: true,
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const result = await labelTemplatesApi.getTemplates({
      search: "Shelf",
      is_active: true,
      business_uuid: "biz-1",
    });

    expect(apiClient.get).toHaveBeenCalledWith("/label-templates", {
      params: {
        search: "Shelf",
        is_active: "true",
        business_uuid: "biz-1",
      },
      headers: {
        "X-Business-Uuid": "biz-1",
      },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Standard Shelf Label");
  });

  it("creates a new label template", async () => {
    const input = {
      name: "New Compact Label",
      width_mm: 40,
      height_mm: 25,
      show_product_name: true,
      show_price: true,
      show_barcode: true,
    };

    const mockResponse = {
      success: true,
      message: "Label template created successfully.",
      data: {
        id: 2,
        uuid: "tmpl-2",
        business_uuid: "biz-1",
        ...input,
        show_variant_name: false,
        show_sku: false,
        show_qrcode: false,
        is_default: false,
        is_active: true,
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

    const result = await labelTemplatesApi.createTemplate(input, "biz-1");

    expect(apiClient.post).toHaveBeenCalledWith("/label-templates", input, {
      headers: {
        "X-Business-Uuid": "biz-1",
      },
    });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe("New Compact Label");
  });

  it("updates an existing label template", async () => {
    const updateInput = {
      name: "Updated Shelf Label",
      width_mm: 55,
      height_mm: 35,
    };

    const mockResponse = {
      success: true,
      data: {
        id: 1,
        uuid: "tmpl-1",
        business_uuid: "biz-1",
        name: "Updated Shelf Label",
        width_mm: 55,
        height_mm: 35,
        show_product_name: true,
        show_variant_name: true,
        show_price: true,
        show_sku: true,
        show_barcode: true,
        show_qrcode: false,
        is_default: true,
        is_active: true,
      },
    };

    vi.mocked(apiClient.put).mockResolvedValueOnce(mockResponse);

    const result = await labelTemplatesApi.updateTemplate(1, updateInput, "biz-1");

    expect(apiClient.put).toHaveBeenCalledWith("/label-templates/1", updateInput, {
      headers: {
        "X-Business-Uuid": "biz-1",
      },
    });
    expect(result.data.name).toBe("Updated Shelf Label");
  });

  it("deletes a label template", async () => {
    const mockResponse = {
      success: true,
      message: "Label template deleted successfully.",
    };

    vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse);

    const result = await labelTemplatesApi.deleteTemplate(1, "biz-1");

    expect(apiClient.delete).toHaveBeenCalledWith("/label-templates/1", {
      headers: {
        "X-Business-Uuid": "biz-1",
      },
    });
    expect(result.success).toBe(true);
  });
});
