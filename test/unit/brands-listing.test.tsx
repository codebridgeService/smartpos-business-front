import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrandsListView } from "@/components/brands/brands-list-view";
import * as authContext from "@/context/auth-context";
import * as businessContext from "@/context/business-context";
import * as toastContext from "@/components/ui/toast";
import * as useBrandsHook from "@/lib/react-query/hooks/use-brands";
import * as useBusinessesHook from "@/lib/react-query/hooks/use-businesses";

vi.mock("@/context/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-brands", () => ({
  useBrandsQuery: vi.fn(),
  useCreateBrandMutation: vi.fn(),
  useUpdateBrandMutation: vi.fn(),
  useDeleteBrandMutation: vi.fn(),
  useToggleBrandStatusMutation: vi.fn(),
  useSyncBrandsMutation: vi.fn(),
  useClearBrandCacheMutation: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-businesses", () => ({
  useBusinessesQuery: vi.fn(),
}));

vi.mock("@/lib/storage/brand-cache", () => ({
  saveBrandsToIndexedDb: vi.fn().mockResolvedValue(undefined),
  clearBrandsIndexedDbCache: vi.fn().mockResolvedValue(undefined),
  deleteFakeDemoBrandsFromIndexedDb: vi.fn().mockResolvedValue(undefined),
}));

const mockBrands = [
  {
    id: 1,
    uuid: "bnd-apple-001",
    business_uuid: "biz-001",
    name: "Apple Inc.",
    code: "APPL",
    description: "Phones and computers",
    logo_path: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    logo_url: "https://example.com/apple.png",
  },
  {
    id: 2,
    uuid: "bnd-samsung-002",
    business_uuid: "biz-001",
    name: "Samsung",
    code: "SMSNG",
    description: "Displays and home tech",
    logo_path: null,
    is_active: false,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    deleted_at: null,
    logo_url: "https://example.com/samsung.png",
  },
];

describe("BrandsListView Component", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (authContext.useAuth as any).mockReturnValue({
      user: {
        id: "1",
        email: "admin@smartpos.com",
        roles: ["admin"],
      },
    });

    (businessContext.useBusiness as any).mockReturnValue({
      activeBusiness: {
        uuid: "biz-001",
        name: "Main Flagship Business",
      },
    });

    (toastContext.useToast as any).mockReturnValue(mockToast);

    (useBusinessesHook.useBusinessesQuery as any).mockReturnValue({
      data: [
        { uuid: "biz-001", name: "Main Flagship Business" },
        { uuid: "biz-002", name: "Secondary Retail Store" },
      ],
    });

    (useBrandsHook.useBrandsQuery as any).mockReturnValue({
      data: {
        data: mockBrands,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 2,
        },
        isOffline: false,
        totalCached: 2,
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    (useBrandsHook.useSyncBrandsMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    (useBrandsHook.useCreateBrandMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    (useBrandsHook.useUpdateBrandMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    (useBrandsHook.useDeleteBrandMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    (useBrandsHook.useToggleBrandStatusMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });

    (useBrandsHook.useClearBrandCacheMutation as any).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  it("renders page header, search bar, and brand listing table", () => {
    render(<BrandsListView />);

    expect(screen.getByText("Brands Directory")).toBeDefined();
    expect(screen.getByPlaceholderText("Search by brand name, code, or description...")).toBeDefined();
    expect(screen.getByText("Apple Inc.")).toBeDefined();
    expect(screen.getByText("Samsung")).toBeDefined();
    expect(screen.getByText("APPL")).toBeDefined();
    expect(screen.getByText("SMSNG")).toBeDefined();
  });

  it("renders status badges correctly for active and inactive brands", () => {
    render(<BrandsListView />);

    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inactive").length).toBeGreaterThan(0);
  });

  it("renders multi-business selector for platform admins", () => {
    render(<BrandsListView />);

    const select = screen.getByLabelText("Filter by Business") as HTMLSelectElement;
    expect(select).toBeDefined();
    expect(screen.getByText("All Businesses (Global)")).toBeDefined();
    expect(screen.getAllByText("Main Flagship Business").length).toBeGreaterThan(0);
    expect(screen.getByText("Secondary Retail Store")).toBeDefined();
  });

  it("updates search filter input", () => {
    render(<BrandsListView />);

    const searchInput = screen.getByPlaceholderText("Search by brand name, code, or description...") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "Apple" } });

    expect(searchInput.value).toBe("Apple");
  });

  it("switches status filter tabs (All Brands, Active, Inactive)", () => {
    render(<BrandsListView />);

    const activeTab = screen.getByRole("button", { name: "Active" });
    fireEvent.click(activeTab);

    // Filter badge appears
    expect(screen.getByText("Status: active")).toBeDefined();
  });

  it("opens and closes brand detail modal when 'View' is clicked", async () => {
    render(<BrandsListView />);

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    fireEvent.click(viewButtons[0]);

    // Modal pops up
    expect(screen.getByText("Brand UUID")).toBeDefined();
    expect(screen.getByText("bnd-apple-001")).toBeDefined();

    // Close modal
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("bnd-apple-001")).toBeNull();
    });
  });

  it("shows offline indicator badge when data is served from IndexedDB cache", () => {
    (useBrandsHook.useBrandsQuery as any).mockReturnValue({
      data: {
        data: mockBrands,
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 2 },
        isOffline: true,
        totalCached: 2,
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<BrandsListView />);

    expect(screen.getByText("IndexedDB Offline Cache")).toBeDefined();
  });
});
