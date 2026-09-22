import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminRolesPage from "@/app/admin/roles/page";
import AdminPermissionsPage from "@/app/admin/permissions/page";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { ToastProvider } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles";
import { permissionsApi } from "@/lib/api/permissions";
import type { Permission } from "@/types";

// Mock business context
vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: {
      id: 1,
      uuid: "test-biz-uuid",
      name: "Test Store",
      code: "TEST",
    },
    businesses: [],
    isLoading: false,
  }),
}));

const mockRolesData = [
  {
    id: 1,
    uuid: "sys-role-owner",
    code: "owner",
    name: "Business Owner",
    is_system: true,
  },
  {
    id: 2,
    uuid: "sys-role-admin",
    code: "admin",
    name: "System Administrator",
    is_system: true,
  },
];

const mockPermissionsData: Permission[] = [
  {
    id: 1,
    uuid: "perm-users-01",
    code: "users.view",
    name: "View Users",
    module: "users",
    description: "Can view users list and details",
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    uuid: "perm-users-02",
    code: "users.create",
    name: "Create Users",
    module: "users",
    description: "Can create new users",
    created_at: null,
    updated_at: null,
  },
  {
    id: 3,
    uuid: "perm-prod-01",
    code: "products.view",
    name: "View Products",
    module: "products",
    description: "Can view products catalog",
    created_at: null,
    updated_at: null,
  },
];

// Mock API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({ success: true }),
    put: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock roles API
vi.mock("@/lib/api/roles", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/roles")>();
  return {
    ...actual,
    rolesApi: {
      ...actual.rolesApi,
      getRoles: vi.fn(),
    },
  };
});

// Mock permissions API directly for robust permissions testing
vi.mock("@/lib/api/permissions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/permissions")>();
  return {
    ...actual,
    permissionsApi: {
      ...actual.permissionsApi,
      getAllPermissions: vi.fn(),
      getPermissions: vi.fn(),
    },
  };
});

describe("Roles & RBAC Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default roles API mock
    vi.mocked(rolesApi.getRoles).mockResolvedValue({
      data: mockRolesData,
      total: mockRolesData.length,
      current_page: 1,
      last_page: 1,
      per_page: 20,
      from: 1,
      to: mockRolesData.length,
    } as any);

    // Default permissions API mock resolves with live API permissions catalog
    vi.mocked(permissionsApi.getAllPermissions).mockResolvedValue(mockPermissionsData);

    usePermissionStore.setState({
      permissions: [],
      isLoading: false,
      isInitialLoaded: false,
      error: null,
      searchQuery: "",
      selectedModule: "all",
      selectedAction: "all",
      collapsedModules: {},
    });

    useRoleStore.setState({
      roles: mockRolesData as any,
      isLoading: false,
      selectedBusinessUuid: null,
      searchQuery: "",
      filterType: "all",
    });
  });

  it("renders AdminRolesPage with roles list and action buttons", async () => {
    useRoleStore.setState({
      roles: mockRolesData as any,
      isLoading: false,
      fetchRoles: vi.fn().mockResolvedValue(mockRolesData as any),
    });

    render(
      <ToastProvider>
        <AdminRolesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Access Control/i })).toBeDefined();
    });
    const roleConfigBtn = screen.getByRole("button", { name: /Roles Configuration/i });
    expect(roleConfigBtn).toBeDefined();
  });

  describe("AdminPermissionsPage - Live API Loading", () => {
    it("renders AdminPermissionsPage with permissions fetched from API", async () => {
      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      // Verify Header and Actions
      expect(screen.getByText(/System Permissions Matrix/i)).toBeDefined();
      expect(screen.getByText(/Manage Roles/i)).toBeDefined();
      expect(screen.getByText(/Batch Create/i)).toBeDefined();

      // Verify Metric Cards using live data counts
      await waitFor(() => {
        expect(screen.getByText("Total Permissions")).toBeDefined();
        expect(screen.getAllByText(String(mockPermissionsData.length)).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Active Modules")).toBeDefined();
        expect(screen.getByText("Identity Service")).toBeDefined();
      });

      // Verify module titles exist in the rendered view
      expect(screen.getAllByText(/User Accounts/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Product Catalog/i).length).toBeGreaterThanOrEqual(1);
    });

    it("filters permissions when searching by keyword", async () => {
      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByText(String(mockPermissionsData.length)).length).toBeGreaterThanOrEqual(1);
      });

      // Search for specific permission "users.create"
      const searchInput = screen.getByPlaceholderText(/Search by permission code, name, or description/i);
      fireEvent.change(searchInput, { target: { value: "users.create" } });

      await waitFor(() => {
        expect(usePermissionStore.getState().getGroupedMatrix().totalMatching).toBe(1);
        expect(screen.getByText("users.create")).toBeDefined();
      });

      // Clear search restores all items
      const clearBtn = screen.getByRole("button", { name: /Clear search/i });
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(usePermissionStore.getState().getGroupedMatrix().totalMatching).toBe(mockPermissionsData.length);
      });
    });

    it("filters permissions when selecting a specific module", async () => {
      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByText(String(mockPermissionsData.length)).length).toBeGreaterThanOrEqual(1);
      });

      // Filter by 'users' module
      const moduleSelects = screen.getAllByRole("combobox");
      const moduleSelect = moduleSelects[0];
      fireEvent.change(moduleSelect, { target: { value: "users" } });

      await waitFor(() => {
        const userPermsCount = mockPermissionsData.filter((p) => p.module === "users").length;
        expect(usePermissionStore.getState().getGroupedMatrix().totalMatching).toBe(userPermsCount);
      });
    });
  });

  describe("AdminPermissionsPage - Error Handling", () => {
    it("displays error alert banner when API call fails", async () => {
      const errorMessage = "Identity Service offline (503 Service Unavailable)";
      vi.mocked(permissionsApi.getAllPermissions).mockRejectedValueOnce(new Error(errorMessage));

      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      await waitFor(() => {
        const errorBanner = screen.getByTestId("permissions-error-banner");
        expect(errorBanner).toBeDefined();
        expect(errorBanner.textContent).toContain(errorMessage);
        expect(screen.getByRole("button", { name: /Retry Connection/i })).toBeDefined();
      });
    });
  });
});
