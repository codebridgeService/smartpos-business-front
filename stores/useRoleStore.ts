import { create } from "zustand";
import type { Role, LengthAwarePaginator, ApiListResponse } from "@/types";
import { rolesApi, type CreateRolePayload, type UpdateRolePayload } from "@/lib/api/roles";

export const DEFAULT_SYSTEM_ROLES: Role[] = [
  {
    id: 1,
    uuid: "sys-role-admin",
    business_uuid: null,
    code: "admin",
    name: "Admin",
    is_system: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    uuid: "sys-role-owner",
    business_uuid: null,
    code: "owner",
    name: "Owner",
    is_system: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 3,
    uuid: "sys-role-store-manager",
    business_uuid: null,
    code: "store_manager",
    name: "Store Manager",
    is_system: false,
    created_at: null,
    updated_at: null,
  },
  {
    id: 4,
    uuid: "sys-role-cashier",
    business_uuid: null,
    code: "cashier",
    name: "Cashier",
    is_system: false,
    created_at: null,
    updated_at: null,
  },
  {
    id: 5,
    uuid: "sys-role-inventory-clerk",
    business_uuid: null,
    code: "inventory_clerk",
    name: "Inventory Clerk",
    is_system: false,
    created_at: null,
    updated_at: null,
  },
];

export interface RoleState {
  // Data
  roles: Role[];
  selectedRole: Role | null;
  paginator: LengthAwarePaginator<Role> | undefined;
  currentPage: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Search & Filter
  searchQuery: string;
  filterType: "all" | "system" | "custom";
  selectedBusinessUuid: string | null;

  // Modals
  isCreateModalOpen: boolean;
  isProvisionModalOpen: boolean;
  roleToEdit: Role | null;
  roleToDelete: Role | null;
  roleForMatrix: Role | null;

  // Setters
  setRoles: (roles: Role[]) => void;
  setSelectedRole: (role: Role | null) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (filterType: "all" | "system" | "custom") => void;
  setSelectedBusinessUuid: (businessUuid: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Modal Controls
  setIsCreateModalOpen: (open: boolean) => void;
  setIsProvisionModalOpen: (open: boolean) => void;
  setRoleToEdit: (role: Role | null) => void;
  setRoleToDelete: (role: Role | null) => void;
  setRoleForMatrix: (role: Role | null) => void;

  // Async Actions
  fetchRoles: (businessUuid?: string | null, page?: number) => Promise<Role[]>;
  createRole: (payload: CreateRolePayload) => Promise<Role>;
  updateRole: (uuid: string, payload: UpdateRolePayload) => Promise<Role>;
  deleteRole: (uuid: string) => Promise<void>;
  provisionRoles: (businessUuid?: string | null) => Promise<any>;
  syncPermissions: (roleUuid: string, permissionUuids: string[]) => Promise<Role>;
  syncAllPermissions: (roleUuid: string) => Promise<Role>;

  // Computed Selector
  getFilteredRoles: () => Role[];
}

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: DEFAULT_SYSTEM_ROLES,
  selectedRole: null,
  paginator: undefined,
  currentPage: 1,
  isLoading: false,
  isSaving: false,
  error: null,

  searchQuery: "",
  filterType: "all",
  selectedBusinessUuid: null,

  isCreateModalOpen: false,
  isProvisionModalOpen: false,
  roleToEdit: null,
  roleToDelete: null,
  roleForMatrix: null,

  setRoles: (roles) => set({ roles }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterType: (filterType) => set({ filterType }),
  setSelectedBusinessUuid: (selectedBusinessUuid) => set({ selectedBusinessUuid }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setIsCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),
  setIsProvisionModalOpen: (isProvisionModalOpen) => set({ isProvisionModalOpen }),
  setRoleToEdit: (roleToEdit) => set({ roleToEdit }),
  setRoleToDelete: (roleToDelete) => set({ roleToDelete }),
  setRoleForMatrix: (roleForMatrix) => set({ roleForMatrix }),

  fetchRoles: async (businessUuid, page = 1) => {
    const targetBusinessUuid =
      businessUuid !== undefined ? businessUuid : get().selectedBusinessUuid;

    set({
      isLoading: true,
      error: null,
      currentPage: page,
      selectedBusinessUuid: targetBusinessUuid ?? null,
    });

    try {
      const res = await rolesApi.getRoles({
        page,
        business_uuid: targetBusinessUuid || undefined,
      });

      let items: Role[] = [];
      let paginator: LengthAwarePaginator<Role> | undefined = undefined;

      if (Array.isArray(res)) {
        items = res;
      } else if (res && typeof res === "object") {
        if ("data" in res && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data;
        }
        if ("current_page" in res) {
          paginator = res as LengthAwarePaginator<Role>;
        }
      }

      if (items.length > 0) {
        set({ roles: items, paginator });
        return items;
      } else if (targetBusinessUuid) {
        // Specific business filter yielded no custom roles
        set({ roles: [], paginator: undefined });
        return [];
      } else {
        // Fallback to default system roles if empty database
        set({ roles: DEFAULT_SYSTEM_ROLES, paginator: undefined });
        return DEFAULT_SYSTEM_ROLES;
      }
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch roles" });
      return get().roles;
    } finally {
      set({ isLoading: false });
    }
  },

  createRole: async (payload) => {
    set({ isSaving: true, error: null });
    try {
      const newRole = await rolesApi.createRole(payload);
      set((state) => ({
        roles: [...state.roles, newRole],
        isCreateModalOpen: false,
      }));
      return newRole;
    } catch (err: any) {
      set({ error: err?.message || "Failed to create role" });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  updateRole: async (uuid, payload) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await rolesApi.updateRole(uuid, payload);
      set((state) => ({
        roles: state.roles.map((r) => (r.uuid === uuid ? { ...r, ...updated } : r)),
        roleToEdit: null,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err?.message || "Failed to update role" });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  deleteRole: async (uuid) => {
    set({ isSaving: true, error: null });
    try {
      await rolesApi.deleteRole(uuid);
      set((state) => ({
        roles: state.roles.filter((r) => r.uuid !== uuid),
        roleToDelete: null,
      }));
    } catch (err: any) {
      set({ error: err?.message || "Failed to delete role" });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  provisionRoles: async (businessUuid) => {
    set({ isSaving: true, error: null });
    try {
      const res = await rolesApi.provisionRoles(businessUuid);
      await get().fetchRoles(businessUuid, 1);
      set({ isProvisionModalOpen: false });
      return res;
    } catch (err: any) {
      set({ error: err?.message || "Failed to auto-provision roles" });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  syncPermissions: async (roleUuid, permissionUuids) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await rolesApi.syncPermissions(roleUuid, permissionUuids);
      set((state) => ({
        roles: state.roles.map((r) =>
          r.uuid === roleUuid ? { ...r, permissions: updated.permissions } : r
        ),
      }));
      return updated;
    } catch (err: any) {
      // Optimistically update permissions in local state
      set((state) => ({
        roles: state.roles.map((r) =>
          r.uuid === roleUuid
            ? {
                ...r,
                permissions: permissionUuids.map((u) => ({
                  id: 0,
                  uuid: u,
                  code: u,
                  name: u,
                  module: "custom",
                  description: null,
                  created_at: null,
                  updated_at: null,
                })),
              }
            : r
        ),
      }));
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  syncAllPermissions: async (roleUuid) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await rolesApi.syncAllPermissions(roleUuid);
      set((state) => ({
        roles: state.roles.map((r) =>
          r.uuid === roleUuid ? { ...r, permissions: updated.permissions } : r
        ),
      }));
      return updated;
    } catch (err: any) {
      set({ error: err?.message || "Failed to attach all permissions" });
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  getFilteredRoles: () => {
    const { roles, searchQuery, filterType } = get();
    const query = searchQuery.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.code.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterType === "system") return Boolean(role.is_system);
      if (filterType === "custom") return !role.is_system;
      return true;
    });
  },
}));
