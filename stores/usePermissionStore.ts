import { create } from "zustand";
import type { Permission, ApiListResponse } from "@/types";
import { apiClient } from "@/lib/api";

export interface PermissionState {
  permissions: Permission[];
  selectedPermission: Permission | null;
  searchQuery: string;
  selectedModule: string | null;
  isLoading: boolean;
  error: string | null;

  // Modal controls
  isBatchCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;

  // Actions
  setPermissions: (permissions: Permission[]) => void;
  setSelectedPermission: (permission: Permission | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedModule: (module: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Modal actions
  openBatchCreate: () => void;
  closeBatchCreate: () => void;
  openEdit: (permission: Permission) => void;
  closeEdit: () => void;
  openDelete: (permission: Permission) => void;
  closeDelete: () => void;

  // Async API actions
  fetchPermissions: () => Promise<void>;
  createPermission: (data: Partial<Permission>) => Promise<Permission>;
  updatePermission: (id: number, data: Partial<Permission>) => Promise<Permission>;
  deletePermission: (id: number) => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set) => ({
  permissions: [],
  selectedPermission: null,
  searchQuery: "",
  selectedModule: null,
  isLoading: false,
  error: null,

  isBatchCreateOpen: false,
  isEditOpen: false,
  isDeleteOpen: false,

  setPermissions: (permissions) => set({ permissions }),
  setSelectedPermission: (selectedPermission) => set({ selectedPermission }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedModule: (selectedModule) => set({ selectedModule }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  openBatchCreate: () => set({ isBatchCreateOpen: true }),
  closeBatchCreate: () => set({ isBatchCreateOpen: false }),

  openEdit: (permission) =>
    set({
      selectedPermission: permission,
      isEditOpen: true,
    }),
  closeEdit: () =>
    set({
      selectedPermission: null,
      isEditOpen: false,
    }),

  openDelete: (permission) =>
    set({
      selectedPermission: permission,
      isDeleteOpen: true,
    }),
  closeDelete: () =>
    set({
      selectedPermission: null,
      isDeleteOpen: false,
    }),

  fetchPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<ApiListResponse<Permission> | Permission[]>(
        "/permissions",
        { params: { per_page: 500 } }
      );

      const items = Array.isArray(response)
        ? response
        : response?.data || [];

      set({ permissions: items, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load permissions";
      set({ error: message, isLoading: false });
    }
  },

  createPermission: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const created = await apiClient.post<Permission>("/permissions", data);
      set((state) => ({
        permissions: [created, ...state.permissions],
        isLoading: false,
      }));
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create permission";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updatePermission: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiClient.put<Permission>(`/permissions/${id}`, data);
      set((state) => ({
        permissions: state.permissions.map((p) => (p.id === id ? updated : p)),
        selectedPermission: null,
        isLoading: false,
      }));
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update permission";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  deletePermission: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/permissions/${id}`);
      set((state) => ({
        permissions: state.permissions.filter((p) => p.id !== id),
        selectedPermission: null,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete permission";
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
