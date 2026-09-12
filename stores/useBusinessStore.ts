import { create } from "zustand";
import type {
  Business,
  BusinessSetting,
  StoreBusinessRequest,
  StoreBusinessResponse,
  UpdateBusinessRequest,
  UpdateBusinessSettingRequest,
} from "@/types";
import { businessesApi } from "@/lib/api/businesses";

export interface BusinessState {
  // Data
  businesses: Business[];
  selectedBusiness: Business | null;
  settings: BusinessSetting | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Search & Filter
  searchQuery: string;
  statusFilter: string;

  // Modal Visibility
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  provisionedResult: StoreBusinessResponse | null;

  // State setters
  setBusinesses: (businesses: Business[]) => void;
  setSelectedBusiness: (business: Business | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Modal controls
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (business: Business) => void;
  closeEditModal: () => void;
  openDeleteModal: (business: Business) => void;
  closeDeleteModal: () => void;
  clearProvisionedResult: () => void;

  // Async Actions
  fetchBusinesses: () => Promise<Business[]>;
  createBusiness: (data: StoreBusinessRequest) => Promise<StoreBusinessResponse>;
  updateBusiness: (uuid: string, data: UpdateBusinessRequest) => Promise<Business>;
  deleteBusiness: (uuid: string) => Promise<void>;
  fetchSettings: (businessUuid: string) => Promise<BusinessSetting | null>;
  updateSettings: (businessUuid: string, data: UpdateBusinessSettingRequest) => Promise<BusinessSetting>;

  // Computed / Filtered
  getFilteredBusinesses: () => Business[];
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  selectedBusiness: null,
  settings: null,
  isLoading: false,
  isSaving: false,
  error: null,

  searchQuery: "",
  statusFilter: "all",

  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  provisionedResult: null,

  setBusinesses: (businesses) => set({ businesses }),
  setSelectedBusiness: (selectedBusiness) => set({ selectedBusiness }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openEditModal: (business) => set({ isEditModalOpen: true, selectedBusiness: business }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedBusiness: null }),

  openDeleteModal: (business) => set({ isDeleteModalOpen: true, selectedBusiness: business }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedBusiness: null }),

  clearProvisionedResult: () => set({ provisionedResult: null }),

  fetchBusinesses: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await businessesApi.getBusinesses();
      set({ businesses: list, isLoading: false });
      return list;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load businesses";
      set({ error: msg, isLoading: false });
      return [];
    }
  },

  createBusiness: async (data: StoreBusinessRequest) => {
    set({ isSaving: true, error: null });
    try {
      const res = await businessesApi.createBusiness(data);
      const newBusiness = res.data;
      set((state) => ({
        businesses: [newBusiness, ...state.businesses],
        provisionedResult: res,
        isCreateModalOpen: false,
        isSaving: false,
      }));
      return res;
    } catch (err: unknown) {
      set({ isSaving: false });
      throw err;
    }
  },

  updateBusiness: async (uuid: string, data: UpdateBusinessRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await businessesApi.updateBusiness(uuid, data);
      set((state) => ({
        businesses: state.businesses.map((b) => (b.uuid === uuid ? updated : b)),
        selectedBusiness: state.selectedBusiness?.uuid === uuid ? updated : state.selectedBusiness,
        isEditModalOpen: false,
        isSaving: false,
      }));
      return updated;
    } catch (err: unknown) {
      set({ isSaving: false });
      throw err;
    }
  },

  deleteBusiness: async (uuid: string) => {
    set({ isSaving: true, error: null });
    try {
      await businessesApi.deleteBusiness(uuid);
      set((state) => ({
        businesses: state.businesses.filter((b) => b.uuid !== uuid),
        selectedBusiness: null,
        isDeleteModalOpen: false,
        isSaving: false,
      }));
    } catch (err: unknown) {
      set({ isSaving: false });
      throw err;
    }
  },

  fetchSettings: async (businessUuid: string) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await businessesApi.getBusinessSettings(businessUuid);
      set({ settings, isLoading: false });
      return settings;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load settings";
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  updateSettings: async (businessUuid: string, data: UpdateBusinessSettingRequest) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await businessesApi.updateBusinessSettings(businessUuid, data);
      set({ settings: updated, isSaving: false });
      return updated;
    } catch (err: unknown) {
      set({ isSaving: false });
      throw err;
    }
  },

  getFilteredBusinesses: () => {
    const { businesses, searchQuery, statusFilter } = get();
    const query = searchQuery.trim().toLowerCase();

    return businesses.filter((b) => {
      // Status filter
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }

      // Query filter
      if (!query) return true;

      const matchName = b.name?.toLowerCase().includes(query);
      const matchCode = b.code?.toLowerCase().includes(query);
      const matchLegal = b.legal_name?.toLowerCase().includes(query);
      const matchTax = b.tax_number?.toLowerCase().includes(query);
      const matchCity = b.city?.toLowerCase().includes(query);

      return matchName || matchCode || matchLegal || matchTax || matchCity;
    });
  },
}));
