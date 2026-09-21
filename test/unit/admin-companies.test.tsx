import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CompaniesPage from "@/app/admin/companies/page";
import { useBusinessStore } from "@/stores/useBusinessStore";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useBusiness context
vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    businesses: [
      {
        id: 1,
        uuid: "biz-uuid-1",
        name: "Test Retail Corp",
        code: "TRC01",
        status: "active",
        email: "retail@test.com",
        outlets_count: 3,
        registers_count: 2,
        pos_devices_count: 2,
      },
    ],
    activeBusiness: {
      id: 1,
      uuid: "biz-uuid-1",
      name: "Test Retail Corp",
      code: "TRC01",
      status: "active",
    },
    selectBusiness: vi.fn(),
    fetchBusinesses: vi.fn(),
  }),
}));

// Mock useBusinessStore
vi.mock("@/stores/useBusinessStore", () => ({
  useBusinessStore: vi.fn(),
}));

describe("Admin CompaniesPage", () => {
  const mockFetchBusinesses = vi.fn();
  const mockOpenCreateModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBusinessStore).mockReturnValue({
      businesses: [
        {
          id: 1,
          uuid: "biz-uuid-1",
          name: "Global Supermarket Ltd",
          code: "GSM01",
          status: "active",
          email: "supermarket@test.com",
          city: "Phnom Penh",
          country_code: "KH",
          currency_code: "USD",
          currency_symbol: "$",
          outlets_count: 4,
          registers_count: 5,
          pos_devices_count: 3,
          created_at: "2025-01-10T00:00:00.000Z",
        },
        {
          id: 2,
          uuid: "biz-uuid-2",
          name: "Urban Boutique Coffee",
          code: "UBC02",
          status: "inactive",
          email: "coffee@test.com",
          city: "Siem Reap",
          country_code: "KH",
          currency_code: "KHR",
          currency_symbol: "៛",
          outlets_count: 1,
          registers_count: 1,
          pos_devices_count: 1,
          created_at: "2025-02-15T00:00:00.000Z",
        },
      ],
      isLoading: false,
      isSaving: false,
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      selectedBusiness: null,
      provisionedResult: null,
      openCreateModal: mockOpenCreateModal,
      closeCreateModal: vi.fn(),
      openEditModal: vi.fn(),
      closeEditModal: vi.fn(),
      openDeleteModal: vi.fn(),
      closeDeleteModal: vi.fn(),
      clearProvisionedResult: vi.fn(),
      fetchBusinesses: mockFetchBusinesses,
      createBusiness: vi.fn(),
      updateBusiness: vi.fn(),
      deleteBusiness: vi.fn(),
    });
  });

  it("renders the Companies Management page header and stats", async () => {
    render(<CompaniesPage />);

    expect(screen.getAllByText("Companies Management").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Total Registered Companies")).toBeDefined();
    expect(screen.getByText("Active Tenants")).toBeDefined();
    expect(screen.getByText("Global Supermarket Ltd")).toBeDefined();
    expect(screen.getByText("Urban Boutique Coffee")).toBeDefined();
  });

  it("calls fetchBusinesses on component mount", async () => {
    render(<CompaniesPage />);

    await waitFor(() => {
      expect(mockFetchBusinesses).toHaveBeenCalled();
    });
  });

  it("displays correct scale metrics and action buttons", () => {
    render(<CompaniesPage />);

    expect(screen.getByText("Export CSV")).toBeDefined();
    expect(screen.getByText("Add Company")).toBeDefined();
    expect(screen.getByText("Refresh")).toBeDefined();
  });
});
