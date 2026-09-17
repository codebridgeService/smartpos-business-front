import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminRolesPage from "@/app/admin/roles/page";
import AdminPermissionsPage, { DEFAULT_PERMISSIONS } from "@/app/admin/permissions/page";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { useRoleStore } from "@/stores/useRoleStore";
import { ToastProvider } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { rolesApi } from "@/lib/api/roles";
import { permissionsApi } from "@/lib/api/permissions";

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

    // Default permissions API mock resolves with standard static permissions catalog
    vi.mocked(permissionsApi.getAllPermissions).mockResolvedValue(DEFAULT_PERMISSIONS);

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
      roles: [],
      isLoading: false,
    });
  });

  it("renders AdminRolesPage with roles list and action buttons", async () => {
    render(
      <ToastProvider>
        <AdminRolesPage />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Access Control & RBAC/i)).toBeDefined();
      expect(screen.getByText(/Business Owner/i)).toBeDefined();
    });
  });

  describe("AdminPermissionsPage - Static Data", () => {
    it("renders AdminPermissionsPage with static data (DEFAULT_PERMISSIONS, metrics, and modules)", async () => {
      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      // Verify Header and Actions
      expect(screen.getByText(/System Permissions Matrix/i)).toBeDefined();
      expect(screen.getByText(/Manage Roles/i)).toBeDefined();
      expect(screen.getByText(/Batch Create/i)).toBeDefined();

      // Verify Metric Cards using static data counts
      await waitFor(() => {
        expect(screen.getByText("Total Permissions")).toBeDefined();
        // Both Total Permissions and Filtered Results display the count
        expect(screen.getAllByText(String(DEFAULT_PERMISSIONS.length)).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Active Modules")).toBeDefined();
        expect(screen.getByText("Identity Service")).toBeDefined();
      });

      // Verify static module titles exist in the rendered view (both select option & module header)
      expect(screen.getAllByText(/User Accounts/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Product Catalog/i).length).toBeGreaterThanOrEqual(1);
    });

    it("filters static permissions when searching by keyword", async () => {
      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByText(String(DEFAULT_PERMISSIONS.length)).length).toBeGreaterThanOrEqual(1);
      });

      // Search for specific permission "users.create"
      const searchInput = screen.getByPlaceholderText(/Search by permission code, name, or description/i);
      fireEvent.change(searchInput, { target: { value: "users.create" } });

      await waitFor(() => {
        // Only 1 matching permission should be in the filtered results
        expect(usePermissionStore.getState().getGroupedMatrix().totalMatching).toBe(1);
        expect(screen.getByText("users.create")).toBeDefined();
      });

      // Clear search restores all static items
      const clearBtn = screen.getByRole("button", { name: /Clear search/i });
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(usePermissionStore.getState().getGroupedMatrix().totalMatching).toBe(DEFAULT_PERMISSIONS.length);
      });
    });

    it("filters static permissions when selecting a specific module", async () => {
      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getAllByText(String(DEFAULT_PERMISSIONS.length)).length).toBeGreaterThanOrEqual(1);
      });

      // Filter by 'users' module
      const moduleSelects = screen.getAllByRole("combobox");
      const moduleSelect = moduleSelects[0]; // Module selector is the first combobox
      fireEvent.change(moduleSelect, { target: { value: "users" } });

      await waitFor(() => {
        const userPermsCount = DEFAULT_PERMISSIONS.filter((p) => p.module === "users").length;
        expect(usePermissionStore.getState().getGroupedMatrix().totalMatching).toBe(userPermsCount);
      });
    });
  });

  describe("AdminPermissionsPage - Error Handling", () => {
    it("displays error alert banner when API call fails and retains static fallback data", async () => {
      // API call rejects with server error
      const errorMessage = "Identity Service offline (503 Service Unavailable)";
      vi.mocked(permissionsApi.getAllPermissions).mockRejectedValueOnce(new Error(errorMessage));

      render(
        <ToastProvider>
          <AdminPermissionsPage />
        </ToastProvider>
      );

      // Verify that error banner is displayed with the exact failure message
      await waitFor(() => {
        const errorBanner = screen.getByTestId("permissions-error-banner");
        expect(errorBanner).toBeDefined();
        expect(errorBanner.textContent).toContain(errorMessage);
        expect(screen.getByRole("button", { name: /Retry Connection/i })).toBeDefined();
      });

      // Crucial: Fallback static permissions must still be preserved and visible
      expect(screen.getAllByText(String(DEFAULT_PERMISSIONS.length)).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/User Accounts/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
