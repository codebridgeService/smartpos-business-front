import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUnitStore } from "@/stores/useUnitStore";
import { unitsApi, type Unit } from "@/lib/api/units";
import * as unitCache from "@/lib/storage/unit-cache";

vi.mock("@/lib/api/units", () => ({
  unitsApi: {
    getUnits: vi.fn(),
    getUnit: vi.fn(),
    createUnit: vi.fn(),
    updateUnit: vi.fn(),
    deleteUnit: vi.fn(),
  },
}));

vi.mock("@/lib/storage/unit-cache", () => ({
  saveUnitsToIndexedDb: vi.fn().mockResolvedValue(undefined),
  getCachedUnitsFromIndexedDb: vi.fn().mockResolvedValue([]),
  clearUnitsIndexedDbCache: vi.fn().mockResolvedValue(undefined),
}));

describe("useUnitStore (Zustand)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUnitStore.setState({
      units: [],
      selectedUnit: null,
      activeBusinessUuid: "",
      isLoading: false,
      isSaving: false,
      error: null,
      searchQuery: "",
      statusFilter: "all",
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      isDetailModalOpen: false,
    });
  });

  const dummyUnit: Unit = {
    id: 1,
    uuid: "unit-1",
    business_uuid: "biz-1",
    name: "Kilogram",
    code: "KG",
    symbol: "kg",
    precision: 2,
    is_active: true,
    created_at: null,
    updated_at: null,
  };

  it("initializes with default values", () => {
    const state = useUnitStore.getState();
    expect(state.units).toEqual([]);
    expect(state.selectedUnit).toBeNull();
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.statusFilter).toBe("all");
    expect(state.searchQuery).toBe("");
  });

  it("handles modal open and close controls", () => {
    const store = useUnitStore.getState();

    store.openCreateModal("biz-preset");
    expect(useUnitStore.getState().isCreateModalOpen).toBe(true);
    expect(useUnitStore.getState().activeBusinessUuid).toBe("biz-preset");

    store.closeCreateModal();
    expect(useUnitStore.getState().isCreateModalOpen).toBe(false);

    store.openEditModal(dummyUnit);
    expect(useUnitStore.getState().isEditModalOpen).toBe(true);
    expect(useUnitStore.getState().selectedUnit).toEqual(dummyUnit);

    store.closeEditModal();
    expect(useUnitStore.getState().isEditModalOpen).toBe(false);

    store.openDeleteModal(dummyUnit);
    expect(useUnitStore.getState().isDeleteModalOpen).toBe(true);
    expect(useUnitStore.getState().selectedUnit).toEqual(dummyUnit);

    store.closeDeleteModal();
    expect(useUnitStore.getState().isDeleteModalOpen).toBe(false);

    store.openDetailModal(dummyUnit);
    expect(useUnitStore.getState().isDetailModalOpen).toBe(true);
    expect(useUnitStore.getState().selectedUnit).toEqual(dummyUnit);

    store.closeDetailModal();
    expect(useUnitStore.getState().isDetailModalOpen).toBe(false);
  });

  it("filters units accurately by search query and active status", () => {
    const unit1: Unit = { ...dummyUnit, id: 1, uuid: "u1", name: "Kilogram", code: "KG", symbol: "kg", is_active: true };
    const unit2: Unit = { ...dummyUnit, id: 2, uuid: "u2", name: "Gram", code: "G", symbol: "g", is_active: true };
    const unit3: Unit = { ...dummyUnit, id: 3, uuid: "u3", name: "Meter", code: "MTR", symbol: "m", is_active: false };

    useUnitStore.setState({ units: [unit1, unit2, unit3] });

    // 1. All
    expect(useUnitStore.getState().getFilteredUnits()).toHaveLength(3);

    // 2. Active filter
    useUnitStore.getState().setStatusFilter("active");
    expect(useUnitStore.getState().getFilteredUnits()).toHaveLength(2);

    // 3. Inactive filter
    useUnitStore.getState().setStatusFilter("inactive");
    expect(useUnitStore.getState().getFilteredUnits()).toHaveLength(1);

    // 4. Search query
    useUnitStore.getState().setStatusFilter("all");
    useUnitStore.getState().setSearchQuery("kilo");
    expect(useUnitStore.getState().getFilteredUnits()).toHaveLength(1);
    expect(useUnitStore.getState().getFilteredUnits()[0].name).toBe("Kilogram");
  });

  it("fetches units via API and persists to IndexedDB", async () => {
    (unitsApi.getUnits as any).mockResolvedValueOnce({
      success: true,
      data: [dummyUnit],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
    });

    const items = await useUnitStore.getState().fetchUnits();

    expect(items).toEqual([dummyUnit]);
    expect(useUnitStore.getState().units).toEqual([dummyUnit]);
    expect(unitCache.saveUnitsToIndexedDb).toHaveBeenCalledWith([dummyUnit]);
  });

  it("falls back to IndexedDB when API fetch fails", async () => {
    (unitsApi.getUnits as any).mockRejectedValueOnce(new Error("Network Error"));
    (unitCache.getCachedUnitsFromIndexedDb as any).mockResolvedValueOnce([dummyUnit]);

    const items = await useUnitStore.getState().fetchUnits();

    expect(items).toEqual([dummyUnit]);
    expect(useUnitStore.getState().units).toEqual([dummyUnit]);
  });
});
