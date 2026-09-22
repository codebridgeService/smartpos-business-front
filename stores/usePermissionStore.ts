import { create } from "zustand";
import type {
  Permission,
  StorePermissionBatchItem,
  UpdatePermissionRequest,
} from "@/types";
import {
  permissionsApi,
  sortPermissionsByModuleAndCode,
} from "@/lib/api/permissions";


export interface PermissionState {
  // Data
  permissions: Permission[];
  isLoading: boolean;
  isInitialLoaded: boolean;
  error: string | null;

  // Filter & Search State
  searchQuery: string;
  selectedModule: string;
  selectedAction: string;

  // Accordion UI State
  collapsedModules: Record<string, boolean>;

  // Modal State
  isBatchModalOpen: boolean;
  isBatchCreateOpen: boolean;
  permissionToEdit: Permission | null;
  permissionToDelete: Permission | null;
  selectedPermission: Permission | null;

  // Actions
  setPermissions: (permissions: Permission[]) => void;
  setSelectedPermission: (permission: Permission | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedModule: (module: string) => void;
  setSelectedAction: (action: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleModuleCollapse: (module: string) => void;
  toggleAllModules: (expand: boolean) => void;

  // Modal Controls
  openBatchModal: () => void;
  closeBatchModal: () => void;
  openBatchCreate: () => void;
  closeBatchCreate: () => void;
  openEditModal: (permission: Permission) => void;
  closeEditModal: () => void;
  openDeleteModal: (permission: Permission) => void;
  closeDeleteModal: () => void;


  fetchPermissions: (force?: boolean) => Promise<void>;
  batchCreatePermissions: (items: StorePermissionBatchItem[]) => Promise<Permission[]>;
  updatePermission: (id: number | string, data: UpdatePermissionRequest) => Promise<Permission>;
  deletePermission: (id: number | string) => Promise<void>;

  // Derived Getters
  getModules: () => string[];
  getFilteredPermissions: () => Permission[];
  getGroupedPermissions: () => Record<string, Permission[]>;
  getGroupedMatrix: () => {
    sortedModuleKeys: string[];
    groups: Record<string, Permission[]>;
    totalMatching: number;
  };
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: [],
  isLoading: false,
  isInitialLoaded: false,
  error: null,

  searchQuery: "",
  selectedModule: "all",
  selectedAction: "all",

  collapsedModules: {},

  isBatchModalOpen: false,
  isBatchCreateOpen: false,
  permissionToEdit: null,
  permissionToDelete: null,
  selectedPermission: null,

  setPermissions: (permissions) =>
    set({ permissions: sortPermissionsByModuleAndCode(permissions) }),
  setSelectedPermission: (permission) => set({ selectedPermission: permission }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedModule: (selectedModule) => set({ selectedModule }),
  setSelectedAction: (selectedAction) => set({ selectedAction }),

  toggleModuleCollapse: (module) =>
    set((state) => ({
      collapsedModules: {
        ...state.collapsedModules,
        [module]: !state.collapsedModules[module],
      },
    })),

  toggleAllModules: (expand) =>
    set((state) => {
      const next: Record<string, boolean> = {};
      if (!expand) {
        state.getModules().forEach((mod) => {
          next[mod] = true;
        });
      }
      return { collapsedModules: next };
    }),

  openBatchModal: () => set({ isBatchModalOpen: true, isBatchCreateOpen: true }),
  closeBatchModal: () => set({ isBatchModalOpen: false, isBatchCreateOpen: false }),
  openBatchCreate: () => set({ isBatchModalOpen: true, isBatchCreateOpen: true }),
  closeBatchCreate: () => set({ isBatchModalOpen: false, isBatchCreateOpen: false }),

  openEditModal: (permission) =>
    set({
      permissionToEdit: permission,
      selectedPermission: permission,
    }),
  closeEditModal: () =>
    set({
      permissionToEdit: null,
      selectedPermission: null,
    }),

  openDeleteModal: (permission) =>
    set({
      permissionToDelete: permission,
    }),
  closeDeleteModal: () =>
    set({
      permissionToDelete: null,
    }),

  /**
   * Fetch all permissions ordered by module and code from
   * 
   */
  fetchPermissions: async (force = false) => {
    const { isInitialLoaded, isLoading } = get();
    if (isLoading) return;
    if (isInitialLoaded && !force && get().permissions.length > 0) return;

    set({ isLoading: true, error: null });

    try {
      const items = await permissionsApi.getAllPermissions();

      const sorted = sortPermissionsByModuleAndCode(items);

      set({
        permissions: sorted,
        isLoading: false,
        isInitialLoaded: true,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load permissions from server";

      // If we already have seeded or cached permissions, preserve them but report error
      set({
        isLoading: false,
        isInitialLoaded: true,
        error: message,
      });
    }
  },

  /**
   * Batch create new permissions
   */
  batchCreatePermissions: async (items) => {
    set({ isLoading: true, error: null });
    try {
      const created = await permissionsApi.createBatch(items);
      set((state) => {
        const merged = [...state.permissions, ...created];
        return {
          permissions: sortPermissionsByModuleAndCode(merged),
          isLoading: false,
          isBatchModalOpen: false,
        };
      });
      return created;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to batch create permissions";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Update an existing permission
   */
  updatePermission: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await permissionsApi.update(id, data);
      set((state) => {
        const next = state.permissions.map((p) =>
          p.id === id || p.uuid === String(id) ? { ...p, ...updated } : p
        );
        return {
          permissions: sortPermissionsByModuleAndCode(next),
          permissionToEdit: null,
          isLoading: false,
        };
      });
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update permission";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Delete a permission
   */
  deletePermission: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await permissionsApi.delete(id);
      set((state) => ({
        permissions: state.permissions.filter(
          (p) => p.id !== id && p.uuid !== String(id)
        ),
        permissionToDelete: null,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete permission";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Returns list of unique modules ordered alphabetically
   */
  getModules: () => {
    const { permissions } = get();
    const setOfModules = new Set<string>();
    permissions.forEach((p) => {
      const mod = (p.module || "other").trim().toLowerCase();
      setOfModules.add(mod);
    });
    return Array.from(setOfModules).sort();
  },

  /**
   * Returns permissions filtered by query, module, and action,
   * strictly ordered by module and code
   */
  getFilteredPermissions: () => {
    const { permissions, searchQuery, selectedModule, selectedAction } = get();
    const query = searchQuery.trim().toLowerCase();

    const filtered = permissions.filter((p) => {
      // 1. Search Query Filter
      if (query) {
        const matchesCode = p.code.toLowerCase().includes(query);
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesModule = (p.module || "").toLowerCase().includes(query);
        const matchesDesc = (p.description || "").toLowerCase().includes(query);
        if (!matchesCode && !matchesName && !matchesModule && !matchesDesc) {
          return false;
        }
      }

      // 2. Module Filter
      if (selectedModule !== "all") {
        const mod = (p.module || "other").toLowerCase();
        if (mod !== selectedModule.toLowerCase()) {
          return false;
        }
      }

      // 3. Action Filter
      if (selectedAction !== "all") {
        const code = p.code.toLowerCase();
        const actionType = selectedAction.toLowerCase();
        if (!code.endsWith(`.${actionType}`) && !code.includes(`.${actionType}.`)) {
          return false;
        }
      }

      return true;
    });

    return sortPermissionsByModuleAndCode(filtered);
  },

  /**
   * Returns permissions grouped by module, ordered by module and code
   */
  getGroupedPermissions: () => {
    const filtered = get().getFilteredPermissions();
    const groups: Record<string, Permission[]> = {};

    filtered.forEach((p) => {
      const mod = (p.module || "other").trim().toLowerCase();
      if (!groups[mod]) {
        groups[mod] = [];
      }
      groups[mod].push(p);
    });

    // Ensure each group's items are sorted by code
    Object.keys(groups).forEach((mod) => {
      groups[mod].sort((a, b) => a.code.localeCompare(b.code));
    });

    return groups;
  },

  /**
   * Returns matrix for directory display: sorted module keys, grouped items, and total match count
   */
  getGroupedMatrix: () => {
    const groups = get().getGroupedPermissions();
    const sortedModuleKeys = Object.keys(groups).sort();
    const totalMatching = get().getFilteredPermissions().length;
    return {
      sortedModuleKeys,
      groups,
      totalMatching,
    };
  },
}));
