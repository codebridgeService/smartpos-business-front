import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveBrandsToIndexedDb,
  getCachedBrandsFromIndexedDb,
  fetchBrandsWithIndexedDbCache,
  clearBrandsIndexedDbCache,
} from "@/lib/storage/brand-cache";
import { brandsApi, type Brand } from "@/lib/api/brands";
import * as idbStorage from "@/lib/storage/indexeddb-storage";

vi.mock("@/lib/api/brands", () => ({
  brandsApi: {
    getBrands: vi.fn(),
  },
}));

vi.mock("@/lib/storage/indexeddb-storage", () => {
  let mockStore: Record<string, any[]> = {
    brands: [],
  };

  return {
    getIndexedDb: vi.fn().mockResolvedValue({
      objectStoreNames: {
        contains: (name: string) => name === "brands" || name === "cache_metadata",
      },
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          clear: vi.fn(() => {
            mockStore.brands = [];
          }),
        }),
      }),
    }),
    putStoreItemsBatch: vi.fn(async (storeName: string, items: any[]) => {
      mockStore[storeName] = [...(mockStore[storeName] || []), ...items];
    }),
    getAllStoreItems: vi.fn(async (storeName: string) => {
      return mockStore[storeName] || [];
    }),
    saveCacheMetadata: vi.fn().mockResolvedValue(undefined),
    _setMockItems: (storeName: string, items: any[]) => {
      mockStore[storeName] = items;
    },
    _getMockItems: (storeName: string) => mockStore[storeName] || [],
    _clearAll: () => {
      mockStore = { brands: [] };
    },
  };
});

const sampleBrands: Brand[] = [
  {
    id: 1,
    uuid: "bnd-001",
    business_uuid: "biz-alpha",
    name: "Apple",
    code: "APPL",
    description: "Computers and phones",
    logo_path: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    logo_url: "https://example.com/apple.png",
  },
  {
    id: 2,
    uuid: "bnd-002",
    business_uuid: "biz-alpha",
    name: "Samsung",
    code: "SMSNG",
    description: "Electronics and appliances",
    logo_path: null,
    is_active: false,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    deleted_at: null,
    logo_url: "https://example.com/samsung.png",
  },
  {
    id: 3,
    uuid: "bnd-003",
    business_uuid: "biz-beta",
    name: "Nike",
    code: "NIKE",
    description: "Shoes and athletic apparel",
    logo_path: null,
    is_active: true,
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-01-03T00:00:00Z",
    deleted_at: null,
    logo_url: "https://example.com/nike.png",
  },
];

describe("Brands IndexedDB Cache Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (idbStorage as any)._clearAll();
  });

  it("persists brands into IndexedDB and saves cache metadata", async () => {
    await saveBrandsToIndexedDb(sampleBrands);

    expect(idbStorage.putStoreItemsBatch).toHaveBeenCalledWith("brands", sampleBrands);
    expect(idbStorage.saveCacheMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "products",
        cache_key: "brands:catalog_cache",
      })
    );
  });

  it("retrieves cached brands with search filtering", async () => {
    (idbStorage as any)._setMockItems("brands", sampleBrands);

    // Search by name
    const searchByName = await getCachedBrandsFromIndexedDb({ search: "apple" });
    expect(searchByName).toHaveLength(1);
    expect(searchByName[0].name).toBe("Apple");

    // Search by code
    const searchByCode = await getCachedBrandsFromIndexedDb({ search: "NIKE" });
    expect(searchByCode).toHaveLength(1);
    expect(searchByCode[0].code).toBe("NIKE");

    // Search by description
    const searchByDesc = await getCachedBrandsFromIndexedDb({ search: "appliances" });
    expect(searchByDesc).toHaveLength(1);
    expect(searchByDesc[0].name).toBe("Samsung");
  });

  it("retrieves cached brands with is_active filter", async () => {
    (idbStorage as any)._setMockItems("brands", sampleBrands);

    const activeBrands = await getCachedBrandsFromIndexedDb({ is_active: true });
    expect(activeBrands).toHaveLength(2);
    expect(activeBrands.every((b) => b.is_active)).toBe(true);

    const inactiveBrands = await getCachedBrandsFromIndexedDb({ is_active: false });
    expect(inactiveBrands).toHaveLength(1);
    expect(inactiveBrands[0].name).toBe("Samsung");
  });

  it("retrieves cached brands with business_uuid filter", async () => {
    (idbStorage as any)._setMockItems("brands", sampleBrands);

    const alphaBrands = await getCachedBrandsFromIndexedDb({ business_uuid: "biz-alpha" });
    expect(alphaBrands).toHaveLength(2);
    expect(alphaBrands.every((b) => b.business_uuid === "biz-alpha")).toBe(true);

    const betaBrands = await getCachedBrandsFromIndexedDb({ business_uuid: "biz-beta" });
    expect(betaBrands).toHaveLength(1);
    expect(betaBrands[0].name).toBe("Nike");
  });

  it("falls back to IndexedDB when API call fails or is offline", async () => {
    (idbStorage as any)._setMockItems("brands", sampleBrands);
    (brandsApi.getBrands as any).mockRejectedValueOnce(new Error("Network connection lost"));

    const result = await fetchBrandsWithIndexedDbCache({
      search: "apple",
      page: 1,
      per_page: 10,
    });

    expect(result.isOffline).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Apple");
    expect(result.meta.total).toBe(1);
  });

  it("fetches from API when online and updates IndexedDB cache", async () => {
    (brandsApi.getBrands as any).mockResolvedValueOnce({
      success: true,
      data: sampleBrands,
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 3 },
    });

    const result = await fetchBrandsWithIndexedDbCache({ page: 1, per_page: 20 });

    expect(result.isOffline).toBe(false);
    expect(result.data).toHaveLength(3);
    expect(idbStorage.putStoreItemsBatch).toHaveBeenCalledWith("brands", sampleBrands);
  });
});
