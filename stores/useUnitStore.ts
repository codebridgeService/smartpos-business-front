import { create } from "zustand";
import {
  type Unit,
  type CreateUnitInput,
  type UpdateUnitInput,
  type GetUnitsParams,
  unitsApi,
} from "@/lib/api/units";
import {
  saveUnitsToIndexedDb,
  getCachedUnitsFromIndexedDb,
} from "@/lib/storage/unit-cache";

export interface UnitState {
  // Data
  units: Unit[];
  selectedUnit: Unit | null;
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
  setUnits: (units: Unit[]) => void;
  setSelectedUnit: (unit: Unit | null) => void;
  setActiveBusinessUuid: (businessUuid: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Modal controls
  openCreateModal: (defaultBusinessUuid?: string) => void;
  closeCreateModal: () => void;
  openEditModal: (unit: Unit) => void;
  closeEditModal: () => void;
  openDeleteModal: (unit: Unit) => void;
  closeDeleteModal: () => void;
  openDetailModal: (unit: Unit) => void;
  closeDetailModal: () => void;

  // Async Actions
  fetchUnits: (params?: GetUnitsParams) => Promise<Unit[]>;
  createUnit: (input: CreateUnitInput) => Promise<Unit>;
  updateUnit: (
    idOrUuid: string | number,
    data: UpdateUnitInput
  ) => Promise<Unit>;
  deleteUnit: (idOrUuid: string | number, businessUuid?: string) => Promise<void>;

  // Filtered helper
  getFilteredUnits: () => Unit[];
}

export const useUnitStore = create<UnitState>((set, get) => ({
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

  setUnits: (units) => set({ units }),
  setSelectedUnit: (selectedUnit) => set({ selectedUnit }),
  setActiveBusinessUuid: (activeBusinessUuid) => set({ activeBusinessUuid }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  openCreateModal: (defaultBusinessUuid) => {
    if (defaultBusinessUuid) {
      set({ activeBusinessUuid: defaultBusinessUuid });
    }
    set({ isCreateModalOpen: true, selectedUnit: null });
  },
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openEditModal: (unit) => set({ isEditModalOpen: true, selectedUnit: unit }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedUnit: null }),

  openDeleteModal: (unit) => set({ isDeleteModalOpen: true, selectedUnit: unit }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedUnit: null }),

  openDetailModal: (unit) => set({ isDetailModalOpen: true, selectedUnit: unit }),
  closeDetailModal: () => set({ isDetailModalOpen: false, selectedUnit: null }),

  fetchUnits: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await unitsApi.getUnits(params);
      const items = response.data || [];
      set({ units: items, isLoading: false });
      saveUnitsToIndexedDb(items).catch(() => {});
      return items;
    } catch (err: any) {
      const cached = await getCachedUnitsFromIndexedDb(params);
      if (cached && cached.length > 0) {
        set({ units: cached, isLoading: false });
        return cached;
      }
      const msg = err?.message || "Failed to fetch measurement units";
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  createUnit: async (input) => {
    set({ isSaving: true, error: null });
    try {
      const response = await unitsApi.createUnit(input);
      const newUnit = response.data;
      set((state) => ({
        units: [newUnit, ...state.units.filter((u) => u.uuid !== newUnit.uuid)],
        isSaving: false,
        isCreateModalOpen: false,
      }));
      saveUnitsToIndexedDb([newUnit]).catch(() => {});
      return newUnit;
    } catch (err: any) {
      const msg = err?.message || "Failed to create measurement unit";
      set({ error: msg, isSaving: false });
      throw err;
    }
  },

  updateUnit: async (idOrUuid, data) => {
    set({ isSaving: true, error: null });
    try {
      const response = await unitsApi.updateUnit(idOrUuid, data);
      const updatedUnit = response.data;
      set((state) => ({
        units: state.units.map((u) =>
          u.uuid === updatedUnit.uuid || u.id === updatedUnit.id ? updatedUnit : u
        ),
        selectedUnit: updatedUnit,
        isSaving: false,
        isEditModalOpen: false,
      }));
      saveUnitsToIndexedDb([updatedUnit]).catch(() => {});
      return updatedUnit;
    } catch (err: any) {
      const msg = err?.message || "Failed to update measurement unit";
      set({ error: msg, isSaving: false });
      throw err;
    }
  },

  deleteUnit: async (idOrUuid, businessUuid) => {
    set({ isSaving: true, error: null });
    try {
      await unitsApi.deleteUnit(idOrUuid, businessUuid);
      set((state) => ({
        units: state.units.filter(
          (u) => u.uuid !== String(idOrUuid) && u.id !== Number(idOrUuid)
        ),
        isSaving: false,
        isDeleteModalOpen: false,
        selectedUnit: null,
      }));
    } catch (err: any) {
      const msg = err?.message || "Failed to delete measurement unit";
      set({ error: msg, isSaving: false });
      throw err;
    }
  },

  getFilteredUnits: () => {
    const { units, searchQuery, statusFilter } = get();
    return units.filter((unit) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = unit.is_active;
      if (statusFilter === "inactive") matchesStatus = !unit.is_active;

      return matchesSearch && matchesStatus;
    });
  },
}));
