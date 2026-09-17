import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore, useUIStore, usePermissionStore, useUserStore, useRoleStore } from "@/stores";

describe("Zustand Stores", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    useUIStore.getState().clearToasts();
    useUIStore.getState().setSidebarOpen(false);
    useUserStore.getState().closeDetailsModal();
  });

  describe("useUIStore", () => {
    it("manages sidebar toggle and open states", () => {
      const store = useUIStore.getState();
      expect(store.isSidebarOpen).toBe(false);

      store.toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);

      store.setSidebarOpen(false);
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it("manages modal states", () => {
      const store = useUIStore.getState();
      expect(store.isModalOpen("batch-create-modal")).toBe(false);

      store.openModal("batch-create-modal");
      expect(useUIStore.getState().isModalOpen("batch-create-modal")).toBe(true);

      store.closeModal("batch-create-modal");
      expect(useUIStore.getState().isModalOpen("batch-create-modal")).toBe(false);
    });

    it("adds and removes toast notifications", () => {
      const store = useUIStore.getState();
      const toastId = store.addToast({
        type: "success",
        title: "Test",
        message: "Action successful",
        duration: 0, // don't auto remove
      });

      expect(useUIStore.getState().toasts).toHaveLength(1);
      expect(useUIStore.getState().toasts[0].id).toBe(toastId);

      store.removeToast(toastId);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });

  describe("useAuthStore", () => {
    it("handles setAuth, clearAuth, and role/permission checks", () => {
      const store = useAuthStore.getState();
      expect(store.isAuthenticated).toBe(false);

      const mockUser = {
        id: 1,
        uuid: "user-123",
        name: "Test Admin",
        username: "admin",
        email: "admin@smartpos.com",
        phone: null,
        avatar: null,
        status: "active" as const,
        email_verified_at: null,
        last_login_at: null,
        last_login_ip: null,
        created_at: null,
        updated_at: null,
        deleted_at: null,
        avatar_url: null,
        roles: [
          {
            id: 1,
            uuid: "role-1",
            business_uuid: null,
            name: "Super Admin",
            code: "super_admin",
            is_system: true,
            created_at: null,
            updated_at: null,
            permissions: [
              {
                id: 1,
                uuid: "perm-1",
                code: "admin.dashboard.view",
                name: "View Dashboard",
                module: "Dashboard",
                description: null,
                created_at: null,
                updated_at: null,
              },
            ],
          },
        ],
      };

      store.setAuth(mockUser, "test-token-jwt");
      const updated = useAuthStore.getState();

      expect(updated.isAuthenticated).toBe(true);
      expect(updated.user?.name).toBe("Test Admin");
      expect(updated.hasRole("super_admin")).toBe(true);
      expect(updated.hasRole("cashier")).toBe(false);
      expect(updated.hasPermission("admin.dashboard.view")).toBe(true);
      expect(updated.hasPermission("inventory.delete")).toBe(false);

      updated.clearAuth();
      const cleared = useAuthStore.getState();
      expect(cleared.isAuthenticated).toBe(false);
      expect(cleared.user).toBeNull();
    });

    it("returns false for checkAuth when tokens are absent", async () => {
      const isAuthed = await useAuthStore.getState().checkAuth();
      expect(isAuthed).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe("usePermissionStore", () => {
    it("manages search query and modal toggles", () => {
      const store = usePermissionStore.getState();
      store.setSearchQuery("products");
      expect(usePermissionStore.getState().searchQuery).toBe("products");

      store.openBatchCreate();
      expect(usePermissionStore.getState().isBatchCreateOpen).toBe(true);

      store.closeBatchCreate();
      expect(usePermissionStore.getState().isBatchCreateOpen).toBe(false);
    });

    it("orders permissions strictly by module and then by code", () => {
      const store = usePermissionStore.getState();
      store.setSearchQuery("");
      store.setSelectedModule("all");
      store.setSelectedAction("all");
      const mockUnsorted = [
        { id: 1, uuid: "u1", code: "users.update", name: "Update Users", module: "users", description: null, created_at: null, updated_at: null },
        { id: 2, uuid: "u2", code: "dashboard.view", name: "View Dashboard", module: "dashboard", description: null, created_at: null, updated_at: null },
        { id: 3, uuid: "u3", code: "users.create", name: "Create Users", module: "users", description: null, created_at: null, updated_at: null },
        { id: 4, uuid: "u4", code: "billing.invoice", name: "Invoicing", module: "billing", description: null, created_at: null, updated_at: null },
        { id: 5, uuid: "u5", code: "billing.charge", name: "Charge Card", module: "billing", description: null, created_at: null, updated_at: null },
      ];

      store.setPermissions(mockUnsorted);
      const current = usePermissionStore.getState().permissions;

      expect(current.map((p) => p.code)).toEqual([
        "billing.charge",
        "billing.invoice",
        "dashboard.view",
        "users.create",
        "users.update",
      ]);

      const grouped = usePermissionStore.getState().getGroupedPermissions();
      expect(Object.keys(grouped)).toEqual(["billing", "dashboard", "users"]);
      expect(grouped["billing"].map((p) => p.code)).toEqual(["billing.charge", "billing.invoice"]);
      expect(grouped["users"].map((p) => p.code)).toEqual(["users.create", "users.update"]);
    });
  });

  describe("useUserStore", () => {
    it("manages user details modal and selected user state", () => {
      const store = useUserStore.getState();
      expect(store.selectedUser).toBeNull();
      expect(store.isDetailsModalOpen).toBe(false);

      store.openDetailsModal("user-456");
      expect(useUserStore.getState().isDetailsModalOpen).toBe(true);
      expect(useUserStore.getState().selectedUserUuid).toBe("user-456");

      const mockUser = {
        id: 456,
        uuid: "user-456",
        name: "Jane Doe",
        username: "janedoe",
        email: "jane@smartpos.com",
        phone: "555-1234",
        avatar: null,
        avatar_url: "https://example.com/avatar.jpg",
        status: "active" as const,
        email_verified_at: "2026-09-01T00:00:00Z",
        last_login_at: "2026-09-10T10:00:00Z",
        last_login_ip: "192.168.1.50",
        created_at: "2026-08-01T00:00:00Z",
        updated_at: "2026-09-10T10:00:00Z",
        deleted_at: null,
        roles: [],
      };

      store.setSelectedUser(mockUser);
      expect(useUserStore.getState().selectedUser?.name).toBe("Jane Doe");

      store.updateSelectedUser({ avatar_url: "https://example.com/new-avatar.jpg" });
      expect(useUserStore.getState().selectedUser?.avatar_url).toBe("https://example.com/new-avatar.jpg");

      store.setAvailableRoles([
        {
          id: 1,
          uuid: "role-admin",
          business_uuid: null,
          name: "Administrator",
          code: "admin",
          is_system: true,
          created_at: null,
          updated_at: null,
        },
      ]);
      expect(useUserStore.getState().availableRoles).toHaveLength(1);

      store.setSelectedRoleUuid("role-admin");
      expect(useUserStore.getState().selectedRoleUuid).toBe("role-admin");

      store.closeDetailsModal();
      expect(useUserStore.getState().isDetailsModalOpen).toBe(false);
      expect(useUserStore.getState().selectedUser).toBeNull();
      expect(useUserStore.getState().selectedUserUuid).toBeNull();
    });
  });

  describe("useRoleStore", () => {
    it("initializes with default system roles and proper filter defaults", () => {
      const store = useRoleStore.getState();
      expect(store.roles.length).toBeGreaterThanOrEqual(4);
      expect(store.searchQuery).toBe("");
      expect(store.filterType).toBe("all");
      expect(store.isCreateModalOpen).toBe(false);
      expect(store.roleForMatrix).toBeNull();
    });

    it("filters roles properly using getFilteredRoles", () => {
      const store = useRoleStore.getState();

      store.setSearchQuery("cashier");
      const filtered = store.getFilteredRoles();
      expect(filtered.length).toBe(1);
      expect(filtered[0].code).toBe("cashier");

      store.setSearchQuery("");
      store.setFilterType("system");
      const systemOnly = store.getFilteredRoles();
      expect(systemOnly.every((r) => r.is_system)).toBe(true);

      store.setFilterType("all");
    });

    it("manages role modals and selection state", () => {
      const store = useRoleStore.getState();

      store.setIsCreateModalOpen(true);
      expect(useRoleStore.getState().isCreateModalOpen).toBe(true);
      store.setIsCreateModalOpen(false);
      expect(useRoleStore.getState().isCreateModalOpen).toBe(false);

      const mockRole = {
        id: 99,
        uuid: "role-test-uuid",
        business_uuid: null,
        name: "Test Auditor",
        code: "auditor",
        is_system: false,
        created_at: null,
        updated_at: null,
      };

      store.setRoleForMatrix(mockRole);
      expect(useRoleStore.getState().roleForMatrix?.code).toBe("auditor");
      store.setRoleForMatrix(null);
      expect(useRoleStore.getState().roleForMatrix).toBeNull();
    });

    it("manages selectedBusinessUuid state for optional business filtering", () => {
      const store = useRoleStore.getState();
      expect(store.selectedBusinessUuid).toBeNull();

      store.setSelectedBusinessUuid("biz-test-uuid");
      expect(useRoleStore.getState().selectedBusinessUuid).toBe("biz-test-uuid");

      store.setSelectedBusinessUuid(null);
      expect(useRoleStore.getState().selectedBusinessUuid).toBeNull();
    });
  });
});
