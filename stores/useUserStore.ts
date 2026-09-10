import { create } from "zustand";
import type { User, Role, ApiListResponse, LengthAwarePaginator } from "@/types";
import { apiClient, usersApi } from "@/lib/api";

export interface UserFilterState {
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  currentPage: number;
  perPage: number;
  viewMode: "table" | "grid";
}

export interface UserStoreState {
  // Data
  users: User[];
  paginator: LengthAwarePaginator<User> | null;
  selectedUserUuid: string | null;
  isLoading: boolean;
  error: string | null;

  // Selected User Details & Roles (for UserDetailsModal)
  selectedUser: User | null;
  availableRoles: Role[];
  selectedRoleUuid: string;
  isLoadingDetails: boolean;
  detailsError: string | null;

  // Filters & display
  filters: UserFilterState;

  // Modal triggers
  isCreateModalOpen: boolean;
  isDetailsModalOpen: boolean;

  // Actions
  setUsers: (users: User[]) => void;
  setSelectedUserUuid: (uuid: string | null) => void;
  setSelectedUser: (user: User | null) => void;
  setAvailableRoles: (roles: Role[]) => void;
  setSelectedRoleUuid: (roleUuid: string) => void;
  updateSelectedUser: (patch: Partial<User>) => void;
  setSearchQuery: (search: string) => void;
  setRoleFilter: (role: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setViewMode: (viewMode: "table" | "grid") => void;
  resetFilters: () => void;

  // Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailsModal: (uuid: string) => void;
  closeDetailsModal: () => void;

  // Async API
  fetchUsers: (page?: number) => Promise<void>;
  deleteUser: (uuid: string) => Promise<void>;
  loadUserDetails: (uuid: string) => Promise<{ user: User; roles: Role[] }>;
}

const DEFAULT_FILTERS: UserFilterState = {
  searchQuery: "",
  roleFilter: "all",
  statusFilter: "all",
  currentPage: 1,
  perPage: 20,
  viewMode: "table",
};

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  paginator: null,
  selectedUserUuid: null,
  isLoading: false,
  error: null,
  filters: { ...DEFAULT_FILTERS },

  // User details modal state
  selectedUser: null,
  availableRoles: [],
  selectedRoleUuid: "",
  isLoadingDetails: false,
  detailsError: null,

  isCreateModalOpen: false,
  isDetailsModalOpen: false,

  setUsers: (users) => set({ users }),
  setSelectedUserUuid: (selectedUserUuid) => set({ selectedUserUuid }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setAvailableRoles: (availableRoles) => set({ availableRoles }),
  setSelectedRoleUuid: (selectedRoleUuid) => set({ selectedRoleUuid }),
  updateSelectedUser: (patch) =>
    set((state) => ({
      selectedUser: state.selectedUser ? { ...state.selectedUser, ...patch } : null,
    })),

  setSearchQuery: (searchQuery) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery, currentPage: 1 },
    })),

  setRoleFilter: (roleFilter) =>
    set((state) => ({
      filters: { ...state.filters, roleFilter, currentPage: 1 },
    })),

  setStatusFilter: (statusFilter) =>
    set((state) => ({
      filters: { ...state.filters, statusFilter, currentPage: 1 },
    })),

  setPage: (currentPage) =>
    set((state) => ({
      filters: { ...state.filters, currentPage },
    })),

  setPerPage: (perPage) =>
    set((state) => ({
      filters: { ...state.filters, perPage, currentPage: 1 },
    })),

  setViewMode: (viewMode) =>
    set((state) => ({
      filters: { ...state.filters, viewMode },
    })),

  resetFilters: () =>
    set({
      filters: { ...DEFAULT_FILTERS },
    }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openDetailsModal: (selectedUserUuid) =>
    set({
      selectedUserUuid,
      isDetailsModalOpen: true,
    }),
  closeDetailsModal: () =>
    set({
      selectedUserUuid: null,
      selectedUser: null,
      isDetailsModalOpen: false,
    }),

  loadUserDetails: async (uuid: string) => {
    set({ isLoadingDetails: true, detailsError: null });
    try {
      const [userRes, rolesRes] = await Promise.all([
        apiClient.get<User>(`/users/${uuid}`),
        apiClient.get<ApiListResponse<Role> | Role[]>("/roles"),
      ]);

      const rList: Role[] = Array.isArray(rolesRes)
        ? rolesRes
        : (rolesRes as ApiListResponse<Role>)?.data || [];

      const defaultRoleUuid = rList.length > 0 ? rList[0].uuid : "";

      set({
        selectedUser: userRes,
        availableRoles: rList,
        selectedRoleUuid: defaultRoleUuid,
        isLoadingDetails: false,
      });

      return { user: userRes, roles: rList };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load user profile details.";
      set({ detailsError: message, isLoadingDetails: false });
      throw err;
    }
  },

  fetchUsers: async (targetPage) => {
    const { filters } = get();
    const page = targetPage ?? filters.currentPage;

    set({ isLoading: true, error: null });

    try {
      const paginator = await usersApi.getUsers({
        page,
        per_page: filters.perPage,
        search: filters.searchQuery.trim() || undefined,
        status: filters.statusFilter !== "all" ? filters.statusFilter : undefined,
        role: filters.roleFilter !== "all" ? filters.roleFilter : undefined,
      });

      set({
        users: paginator.data,
        paginator,
        isLoading: false,
        filters: { ...filters, currentPage: page },
      });
    } catch (err: unknown) {
      console.warn("Could not fetch user list directly, attempting /auth/me fallback:", err);
      try {
        const me = await usersApi.getUser("me");
        if (me && me.uuid) {
          set({
            users: [me],
            paginator: null,
            isLoading: false,
          });
          return;
        }
      } catch (meErr) {
        console.error("Failed to load user info fallback:", meErr);
      }

      const message = err instanceof Error ? err.message : "Failed to load users";
      set({ error: message, isLoading: false });
    }
  },

  deleteUser: async (uuid: string) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.deleteUser(uuid);
      set((state) => ({
        users: state.users.filter((u) => u.uuid !== uuid),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
