import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveUnitsToIndexedDb,
  getCachedUnitsFromIndexedDb,
  fetchUnitsWithIndexedDbCache,
  clearUnitsIndexedDbCache,
} from "@/lib/storage/unit-cache";
import { unitsApi, type Unit } from "@/lib/api/units";
import * as idbStorage from "@/lib/storage/indexeddb-storage";

vi.mock("@/lib/api/units", () => ({
  unitsApi: {
    getUnits: vi.fn(),
  },
}));

vi.mock("@/lib/storage/indexeddb-storage", () => {
  let mockStore: Record<string, any[]> = {
    units: [],
  };

  return {
    getIndexedDb: vi.fn().mockResolvedValue({
      objectStoreNames: {
        contains: (name: string) => name === "units" || name === "cache_metadata",
      },
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          clear: vi.fn(() => {
            mockStore.units = [];
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
    deleteStoreItem: vi.fn(async (storeName: string, key: string) => {
      mockStore[storeName] = (mockStore[storeName] || []).filter((item: any) => item.uuid !== key);
    }),
    clearStore: vi.fn(async (storeName: string) => {
      mockStore[storeName] = [];
    }),
    saveCacheMetadata: vi.fn().mockResolvedValue(undefined),
    _setMockItems: (storeName: string, items: any[]) => {
      mockStore[storeName] = items;
    },
    _getMockItems: (storeName: string) => mockStore[storeName] || [],
    _clearAll: () => {
      mockStore = { units: [] };
    },
  };
});

const sampleUnits: Unit[] = [
  {
    id: 1,
    uuid: "u-001",
    business_uuid: "biz-alpha",
    name: "Kilogram",
    code: "KG",
    symbol: "kg",
    precision: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    uuid: "u-002",
    business_uuid: "biz-alpha",
    name: "Piece",
    code: "PCS",
    symbol: "pc",
    precision: 0,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    uuid: "u-003",
    business_uuid: "biz-beta",
    name: "Liter",
    code: "LTR",
    symbol: "L",
    precision: 3,
    is_active: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("Units IndexedDB Cache Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (idbStorage as any)._clearAll();
  });

  it("persists units to IndexedDB and records cache metadata", async () => {
    await saveUnitsToIndexedDb(sampleUnits);

    expect(idbStorage.putStoreItemsBatch).toHaveBeenCalledWith("units", sampleUnits);
    expect(idbStorage.saveCacheMetadata).toHaveBeenCalledWith(
      expect.objectContaining({
        cache_key: "units:catalog_cache",
        category: "products",
        storage_target: "indexed_db",
      })
    );
  });

  it("retrieves and filters cached units from IndexedDB by business UUID", async () => {
    (idbStorage as any)._setMockItems("units", sampleUnits);

    const result = await getCachedUnitsFromIndexedDb({ business_uuid: "biz-alpha" });

    expect(result).toHaveLength(2);
    expect(result.map((u) => u.name)).toEqual(["Kilogram", "Piece"]);
  });

  it("filters cached units by active status and search keyword", async () => {
    (idbStorage as any)._setMockItems("units", sampleUnits);

    const activeResult = await getCachedUnitsFromIndexedDb({ is_active: true });
    expect(activeResult).toHaveLength(2);

    const searchResult = await getCachedUnitsFromIndexedDb({ search: "lit" });
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].name).toBe("Liter");
  });

  it("falls back to IndexedDB when API call fails or is offline", async () => {
    (idbStorage as any)._setMockItems("units", sampleUnits);
    (unitsApi.getUnits as any).mockRejectedValueOnce(new Error("Network connection lost"));

    const result = await fetchUnitsWithIndexedDbCache({ business_uuid: "biz-alpha" });

    expect(result.isOffline).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
  });

  it("clears cached units from IndexedDB", async () => {
    (idbStorage as any)._setMockItems("units", sampleUnits);

    await clearUnitsIndexedDbCache();

    expect(idbStorage.getIndexedDb).toHaveBeenCalled();
  });
});
