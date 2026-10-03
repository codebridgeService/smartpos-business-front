import { create } from "zustand";
import {
  type Brand,
  type CreateBrandInput,
  type UpdateBrandInput,
  type GetBrandsParams,
  brandsApi,
} from "@/lib/api/brands";
import {
  saveBrandsToIndexedDb,
  getCachedBrandsFromIndexedDb,
} from "@/lib/storage/brand-cache";

export interface BrandState {
  // Data
  brands: Brand[];
  selectedBrand: Brand | null;
  activeBusinessUuid: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Search & Filter
  searchQuery: string;
  statusFilter: string; // "all" | "active" | "inactive"

  // Modal Visibility
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isDetailModalOpen: boolean;

  // State setters
  setBrands: (brands: Brand[]) => void;
  setSelectedBrand: (brand: Brand | null) => void;
  setActiveBusinessUuid: (businessUuid: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Modal controls
  openCreateModal: (defaultBusinessUuid?: string) => void;
  closeCreateModal: () => void;
  openEditModal: (brand: Brand) => void;
  closeEditModal: () => void;
  openDeleteModal: (brand: Brand) => void;
  closeDeleteModal: () => void;
  openDetailModal: (brand: Brand) => void;
  closeDetailModal: () => void;

  // Async Actions
  fetchBrands: (params?: GetBrandsParams) => Promise<Brand[]>;
  createBrand: (input: CreateBrandInput | FormData) => Promise<Brand>;
  updateBrand: (
    idOrUuid: string | number,
    data: UpdateBrandInput | Partial<Brand> | FormData
  ) => Promise<Brand>;
  deleteBrand: (uuid: string) => Promise<void>;

  // Computed / Filtered
  getFilteredBrands: () => Brand[];
}

export const useBrandStore = create<BrandState>((set, get) => ({
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

  setBrands: (brands) => set({ brands }),
  setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
  setActiveBusinessUuid: (activeBusinessUuid) => set({ activeBusinessUuid }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  openCreateModal: (defaultBusinessUuid) =>
    set((state) => ({
      isCreateModalOpen: true,
      activeBusinessUuid: defaultBusinessUuid || state.activeBusinessUuid,
    })),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openEditModal: (brand) => set({ isEditModalOpen: true, selectedBrand: brand }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedBrand: null }),

  openDeleteModal: (brand) => set({ isDeleteModalOpen: true, selectedBrand: brand }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedBrand: null }),

  openDetailModal: (brand) => set({ isDetailModalOpen: true, selectedBrand: brand }),
  closeDetailModal: () => set({ isDetailModalOpen: false, selectedBrand: null }),

  fetchBrands: async (params?: GetBrandsParams) => {
    // 1. Try local IndexedDB cache first
    const targetBusiness = params?.business_uuid || get().activeBusinessUuid;
    const cached = await getCachedBrandsFromIndexedDb({
      business_uuid: targetBusiness,
      search: params?.search || get().searchQuery,
      is_active: params?.is_active,
    });

    if (cached && cached.length > 0) {
      set({ brands: cached, isLoading: false });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const res = await brandsApi.getBrands({
        business_uuid: targetBusiness || undefined,
        search: params?.search || get().searchQuery || undefined,
        is_active: params?.is_active,
        page: params?.page,
        per_page: params?.per_page,
      });

      const list = res.data || [];
      if (list.length > 0) {
        await saveBrandsToIndexedDb(list);
      }
      set({ brands: list, isLoading: false });
      return list;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load brands";
      set({ error: msg, isLoading: false });
      return cached || [];
    }
  },

  createBrand: async (input: CreateBrandInput | FormData) => {
    set({ isSaving: true, error: null });

    // Validate that business_uuid is present and required
    let targetBizUuid = "";
    if (input instanceof FormData) {
      targetBizUuid = String(input.get("business_uuid") || "").trim();
    } else {
      targetBizUuid = (input.business_uuid || "").trim();
    }

    if (!targetBizUuid) {
      const err = new Error("business_uuid is required to create a brand");
      set({ isSaving: false, error: err.message });
      throw err;
    }

    try {
      const res = await brandsApi.createBrand(input);
      const newBrand = res.data;

      // Update IndexedDB cache
      await saveBrandsToIndexedDb([newBrand]);

      // Prepend to store
      set((state) => ({
        brands: [newBrand, ...state.brands.filter((b) => b.uuid !== newBrand.uuid)],
        isCreateModalOpen: false,
        isSaving: false,
      }));

      return newBrand;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create brand";
      set({ isSaving: false, error: msg });
      throw err;
    }
  },

  updateBrand: async (
    idOrUuid: string | number,
    data: UpdateBrandInput | Partial<Brand> | FormData
  ) => {
    set({ isSaving: true, error: null });
    try {
      const res = await brandsApi.updateBrand(idOrUuid, data);
      const updated = res.data;
      await saveBrandsToIndexedDb([updated]);

      set((state) => ({
        brands: state.brands.map((b) =>
          b.uuid === updated.uuid || b.id === updated.id ? updated : b
        ),
        selectedBrand:
          state.selectedBrand?.uuid === updated.uuid || state.selectedBrand?.id === updated.id
            ? updated
            : state.selectedBrand,
        isEditModalOpen: false,
        isSaving: false,
      }));

      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update brand";
      set({ isSaving: false, error: msg });
      throw err;
    }
  },

  deleteBrand: async (uuid: string) => {
    set({ isSaving: true, error: null });
    try {
      await brandsApi.deleteBrand(uuid);
      set((state) => ({
        brands: state.brands.filter((b) => b.uuid !== uuid),
        selectedBrand: null,
        isDeleteModalOpen: false,
        isSaving: false,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete brand";
      set({ isSaving: false, error: msg });
      throw err;
    }
  },

  getFilteredBrands: () => {
    const { brands, searchQuery, statusFilter, activeBusinessUuid } = get();
    const query = searchQuery.trim().toLowerCase();

    return brands.filter((b) => {
      // Business filter
      if (activeBusinessUuid && b.business_uuid && b.business_uuid !== activeBusinessUuid) {
        return false;
      }

      // Status filter
      if (statusFilter === "active" && !b.is_active) {
        return false;
      }
      if (statusFilter === "inactive" && b.is_active) {
        return false;
      }

      // Query filter
      if (!query) return true;

      const matchName = b.name?.toLowerCase().includes(query);
      const matchCode = b.code?.toLowerCase().includes(query);
      const matchDesc = b.description?.toLowerCase().includes(query);

      return matchName || matchCode || matchDesc;
    });
  },
}));
