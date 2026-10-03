import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBrandStore } from "@/stores/useBrandStore";
import { brandsApi, type Brand } from "@/lib/api/brands";
import * as brandCache from "@/lib/storage/brand-cache";

vi.mock("@/lib/api/brands", () => ({
  brandsApi: {
    getBrands: vi.fn(),
    getBrand: vi.fn(),
    createBrand: vi.fn(),
    updateBrand: vi.fn(),
    deleteBrand: vi.fn(),
  },
}));

vi.mock("@/lib/storage/brand-cache", () => ({
  saveBrandsToIndexedDb: vi.fn().mockResolvedValue(undefined),
  getCachedBrandsFromIndexedDb: vi.fn().mockResolvedValue([]),
  clearBrandsIndexedDbCache: vi.fn().mockResolvedValue(undefined),
}));

describe("useBrandStore (Zustand)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBrandStore.setState({
      brands: [],
      selectedBrand: null,
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

  it("initializes with default values", () => {
    const state = useBrandStore.getState();
    expect(state.brands).toEqual([]);
    expect(state.selectedBrand).toBeNull();
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.statusFilter).toBe("all");
    expect(state.searchQuery).toBe("");
  });

  it("handles modal open and close controls", () => {
    const dummyBrand: Brand = {
      id: 1,
      uuid: "brand-1",
      business_uuid: "biz-1",
      name: "Apple",
      code: "APPL",
      description: null,
      logo_path: null,
      is_active: true,
      created_at: null,
      updated_at: null,
      deleted_at: null,
      logo_url: "",
    };

    useBrandStore.getState().openCreateModal("biz-target-123");
    expect(useBrandStore.getState().isCreateModalOpen).toBe(true);
    expect(useBrandStore.getState().activeBusinessUuid).toBe("biz-target-123");

    useBrandStore.getState().closeCreateModal();
    expect(useBrandStore.getState().isCreateModalOpen).toBe(false);

    useBrandStore.getState().openEditModal(dummyBrand);
    expect(useBrandStore.getState().isEditModalOpen).toBe(true);
    expect(useBrandStore.getState().selectedBrand).toEqual(dummyBrand);

    useBrandStore.getState().closeEditModal();
    expect(useBrandStore.getState().isEditModalOpen).toBe(false);
    expect(useBrandStore.getState().selectedBrand).toBeNull();

    useBrandStore.getState().openDetailModal(dummyBrand);
    expect(useBrandStore.getState().isDetailModalOpen).toBe(true);
    expect(useBrandStore.getState().selectedBrand).toEqual(dummyBrand);

    useBrandStore.getState().closeDetailModal();
    expect(useBrandStore.getState().isDetailModalOpen).toBe(false);
  });

  it("requires business_uuid when creating a brand", async () => {
    const inputWithoutBiz = {
      name: "Samsung",
      code: "SAMS",
      business_uuid: "",
    };

    await expect(useBrandStore.getState().createBrand(inputWithoutBiz)).rejects.toThrow(
      "business_uuid is required to create a brand"
    );

    const formDataWithoutBiz = new FormData();
    formDataWithoutBiz.append("name", "Samsung");
    formDataWithoutBiz.append("code", "SAMS");

    await expect(useBrandStore.getState().createBrand(formDataWithoutBiz)).rejects.toThrow(
      "business_uuid is required to create a brand"
    );
  });

  it("creates brand with business_uuid and persists to IndexedDB and Zustand store", async () => {
    const createdBrand: Brand = {
      id: 10,
      uuid: "bnd-new-10",
      business_uuid: "biz-hq-001",
      name: "Sony",
      code: "SONY",
      description: "Audio & Entertainment",
      logo_path: "brands/sony.png",
      is_active: true,
      created_at: "2026-03-01T00:00:00Z",
      updated_at: "2026-03-01T00:00:00Z",
      deleted_at: null,
      logo_url: "https://example.com/sony.png",
    };

    (brandsApi.createBrand as any).mockResolvedValueOnce({
      success: true,
      message: "Brand created successfully.",
      data: createdBrand,
    });

    const result = await useBrandStore.getState().createBrand({
      name: "Sony",
      code: "SONY",
      business_uuid: "biz-hq-001",
      description: "Audio & Entertainment",
      is_active: true,
    });

    expect(result).toEqual(createdBrand);
    expect(brandsApi.createBrand).toHaveBeenCalledTimes(1);
    expect(brandCache.saveBrandsToIndexedDb).toHaveBeenCalledWith([createdBrand]);

    const state = useBrandStore.getState();
    expect(state.brands).toHaveLength(1);
    expect(state.brands[0].name).toBe("Sony");
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.isSaving).toBe(false);
  });

  it("filters brands by search query, status, and active business UUID", () => {
    const dummyBrands: Brand[] = [
      {
        id: 1,
        uuid: "b1",
        business_uuid: "biz-1",
        name: "Apple Store",
        code: "APPL",
        description: "iPhones & MacBooks",
        logo_path: null,
        is_active: true,
        created_at: null,
        updated_at: null,
        deleted_at: null,
        logo_url: "",
      },
      {
        id: 2,
        uuid: "b2",
        business_uuid: "biz-1",
        name: "Microsoft",
        code: "MSFT",
        description: "Surface & Windows",
        logo_path: null,
        is_active: false,
        created_at: null,
        updated_at: null,
        deleted_at: null,
        logo_url: "",
      },
      {
        id: 3,
        uuid: "b3",
        business_uuid: "biz-2",
        name: "Nike Athletics",
        code: "NIKE",
        description: "Shoes",
        logo_path: null,
        is_active: true,
        created_at: null,
        updated_at: null,
        deleted_at: null,
        logo_url: "",
      },
    ];

    useBrandStore.setState({ brands: dummyBrands });

    // Filter by query
    useBrandStore.setState({ searchQuery: "surface" });
    expect(useBrandStore.getState().getFilteredBrands()).toHaveLength(1);
    expect(useBrandStore.getState().getFilteredBrands()[0].code).toBe("MSFT");

    // Filter by active status
    useBrandStore.setState({ searchQuery: "", statusFilter: "active" });
    expect(useBrandStore.getState().getFilteredBrands()).toHaveLength(2);

    // Filter by business UUID
    useBrandStore.setState({ statusFilter: "all", activeBusinessUuid: "biz-2" });
    expect(useBrandStore.getState().getFilteredBrands()).toHaveLength(1);
    expect(useBrandStore.getState().getFilteredBrands()[0].name).toBe("Nike Athletics");
  });

  it("updates existing brand in store and saves to IndexedDB", async () => {
    const initialBrand: Brand = {
      id: 1,
      uuid: "b1",
      business_uuid: "biz-1",
      name: "Apple Store",
      code: "APPL",
      description: null,
      logo_path: null,
      is_active: true,
      created_at: null,
      updated_at: null,
      deleted_at: null,
      logo_url: "",
    };

    const updatedBrand: Brand = {
      ...initialBrand,
      name: "Apple Inc.",
      description: "Updated description",
    };

    useBrandStore.setState({ brands: [initialBrand], selectedBrand: initialBrand });

    (brandsApi.updateBrand as any).mockResolvedValueOnce({
      success: true,
      message: "Brand updated successfully.",
      data: updatedBrand,
    });

    const result = await useBrandStore.getState().updateBrand("b1", {
      name: "Apple Inc.",
      description: "Updated description",
    });

    expect(result.name).toBe("Apple Inc.");
    expect(brandCache.saveBrandsToIndexedDb).toHaveBeenCalledWith([updatedBrand]);
    expect(useBrandStore.getState().brands[0].name).toBe("Apple Inc.");
    expect(useBrandStore.getState().selectedBrand?.name).toBe("Apple Inc.");
  });
});

