import { describe, it, expect, vi, beforeEach } from "vitest";
import { unitsApi } from "@/lib/api/units";
import { apiClient } from "@/lib/api/client";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Units API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUnit = {
    id: 1,
    uuid: "unit-uuid-1",
    business_uuid: "biz-uuid-1",
    name: "Kilogram",
    code: "KG",
    symbol: "kg",
    precision: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  it("calls GET /units with formatted query parameters and headers", async () => {
    const mockResponse = {
      success: true,
      data: [mockUnit],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1,
      },
    };

    (apiClient.get as any).mockResolvedValueOnce(mockResponse);

    const result = await unitsApi.getUnits({
      search: "kilo",
      is_active: true,
      business_uuid: "biz-uuid-1",
      page: 1,
      per_page: 10,
    });

    expect(apiClient.get).toHaveBeenCalledWith("/units", {
      params: {
        search: "kilo",
        is_active: "true",
        business_uuid: "biz-uuid-1",
        page: 1,
        per_page: 10,
      },
      headers: {
        "X-Business-Uuid": "biz-uuid-1",
      },
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Kilogram");
    expect(result.meta.total).toBe(1);
  });

  it("handles GET /units without params and falls back gracefully", async () => {
    (apiClient.get as any).mockResolvedValueOnce([mockUnit]);

    const result = await unitsApi.getUnits();

    expect(apiClient.get).toHaveBeenCalledWith("/units", {
      params: {},
      headers: {},
    });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it("fetches single unit by ID or UUID via GET /units/{unit}", async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      success: true,
      data: mockUnit,
    });

    const result = await unitsApi.getUnit("unit-uuid-1", "biz-uuid-1");

    expect(apiClient.get).toHaveBeenCalledWith("/units/unit-uuid-1", {
      headers: {
        "X-Business-Uuid": "biz-uuid-1",
      },
    });
    expect(result.id).toBe(1);
    expect(result.code).toBe("KG");
  });

  it("creates unit via POST /units with valid payload and X-Business-Uuid", async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      success: true,
      message: "Unit created successfully.",
      data: mockUnit,
    });

    const result = await unitsApi.createUnit({
      name: "Kilogram",
      code: "KG",
      symbol: "kg",
      precision: 2,
      is_active: true,
      business_uuid: "biz-uuid-1",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/units",
      {
        name: "Kilogram",
        code: "KG",
        symbol: "kg",
        precision: 2,
        is_active: true,
        business_uuid: "biz-uuid-1",
      },
      {
        headers: {
          "X-Business-Uuid": "biz-uuid-1",
        },
      }
    );
    expect(result.data.symbol).toBe("kg");
  });

  it("throws error when creating unit without business_uuid", async () => {
    await expect(
      unitsApi.createUnit({
        name: "Liter",
        code: "LTR",
        symbol: "L",
        business_uuid: "",
      })
    ).rejects.toThrow("business_uuid is required to create a measurement unit");
  });

  it("updates unit via PUT /units/{unit}", async () => {
    (apiClient.put as any).mockResolvedValueOnce({
      success: true,
      message: "Unit updated successfully.",
      data: { ...mockUnit, precision: 3 },
    });

    const result = await unitsApi.updateUnit(1, {
      precision: 3,
      business_uuid: "biz-uuid-1",
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      "/units/1",
      { precision: 3 },
      {
        headers: {
          "X-Business-Uuid": "biz-uuid-1",
        },
      }
    );
    expect(result.data.precision).toBe(3);
  });

  it("toggles unit status via toggleUnitStatus helper", async () => {
    (apiClient.put as any).mockResolvedValueOnce({
      success: true,
      message: "Unit updated successfully.",
      data: { ...mockUnit, is_active: false },
    });

    const result = await unitsApi.toggleUnitStatus(1, true, "biz-uuid-1");

    expect(apiClient.put).toHaveBeenCalledWith(
      "/units/1",
      { is_active: false },
      {
        headers: {
          "X-Business-Uuid": "biz-uuid-1",
        },
      }
    );
    expect(result.data.is_active).toBe(false);
  });

  it("deletes unit via DELETE /units/{unit}", async () => {
    (apiClient.delete as any).mockResolvedValueOnce({
      success: true,
      message: "Unit deleted successfully.",
    });

    const result = await unitsApi.deleteUnit(1, "biz-uuid-1");

    expect(apiClient.delete).toHaveBeenCalledWith("/units/1", {
      headers: {
        "X-Business-Uuid": "biz-uuid-1",
      },
    });
    expect(result.success).toBe(true);
  });
});
