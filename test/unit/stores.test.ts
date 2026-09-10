import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore, useUIStore, usePermissionStore, useUserStore } from "@/stores";

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
});
