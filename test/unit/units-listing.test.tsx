import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UnitsListView } from "@/components/units/units-list-view";
import * as authContext from "@/context/auth-context";
import * as businessContext from "@/context/business-context";
import * as toastContext from "@/components/ui/toast";
import * as useUnitsHook from "@/lib/react-query/hooks/use-units";
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

vi.mock("@/lib/react-query/hooks/use-units", () => ({
  useUnitsQuery: vi.fn(),
  useCreateUnitMutation: vi.fn(),
  useUpdateUnitMutation: vi.fn(),
  useDeleteUnitMutation: vi.fn(),
  useToggleUnitStatusMutation: vi.fn(),
  useClearUnitCacheMutation: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-businesses", () => ({
  useBusinessesQuery: vi.fn(),
}));

const mockUnits = [
  {
    id: 1,
    uuid: "unit-001",
    business_uuid: "biz-001",
    name: "Kilogram",
    code: "KG",
    symbol: "kg",
    precision: 2,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    uuid: "unit-002",
    business_uuid: "biz-001",
    name: "Piece",
    code: "PCS",
    symbol: "pc",
    precision: 0,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 3,
    uuid: "unit-003",
    business_uuid: "biz-001",
    name: "Meter",
    code: "MTR",
    symbol: "m",
    precision: 3,
    is_active: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("UnitsListView Component", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const mockCreateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockUpdateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockDeleteMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockToggleMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockClearCacheMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (authContext.useAuth as any).mockReturnValue({
      user: {
        id: 1,
        roles: [{ code: "admin", name: "Administrator" }],
      },
    });

    (businessContext.useBusiness as any).mockReturnValue({
      activeBusiness: {
        uuid: "biz-001",
        name: "Acme Retail Store",
      },
    });

    (toastContext.useToast as any).mockReturnValue(mockToast);

    (useBusinessesHook.useBusinessesQuery as any).mockReturnValue({
      data: [{ uuid: "biz-001", name: "Acme Retail Store" }],
      isLoading: false,
    });

    (useUnitsHook.useCreateUnitMutation as any).mockReturnValue(mockCreateMutation);
    (useUnitsHook.useUpdateUnitMutation as any).mockReturnValue(mockUpdateMutation);
    (useUnitsHook.useDeleteUnitMutation as any).mockReturnValue(mockDeleteMutation);
    (useUnitsHook.useToggleUnitStatusMutation as any).mockReturnValue(mockToggleMutation);
    (useUnitsHook.useClearUnitCacheMutation as any).mockReturnValue(mockClearCacheMutation);

    (useUnitsHook.useUnitsQuery as any).mockReturnValue({
      data: {
        data: mockUnits,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 3,
        },
        isOffline: false,
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it("renders the units header and data table with units", () => {
    render(<UnitsListView />);

    expect(screen.getByText("Measurement Units")).toBeDefined();
    expect(screen.getByText("Kilogram")).toBeDefined();
    expect(screen.getByText("Piece")).toBeDefined();
    expect(screen.getByText("Meter")).toBeDefined();
    expect(screen.getByText("KG")).toBeDefined();
    expect(screen.getByText("PCS")).toBeDefined();
    expect(screen.getByText("kg")).toBeDefined();
    expect(screen.getByText("pc")).toBeDefined();
  });

  it("renders KPI metric stats cards correctly", () => {
    render(<UnitsListView />);

    expect(screen.getByText("Total Units")).toBeDefined();
    expect(screen.getByText("Active in POS")).toBeDefined();
    expect(screen.getByText("Inactive Units")).toBeDefined();
    expect(screen.getByText("Decimal Scaling")).toBeDefined();
  });

  it("supports searching and changing status filter tabs", () => {
    render(<UnitsListView />);

    const searchInput = screen.getByPlaceholderText(/Search units by name/i);
    fireEvent.change(searchInput, { target: { value: "kilo" } });
    expect((searchInput as HTMLInputElement).value).toBe("kilo");

    const activeTab = screen.getByRole("button", { name: "active" });
    fireEvent.click(activeTab);
    expect(activeTab).toBeDefined();
  });

  it("triggers toggle status mutation when clicking status badge", async () => {
    mockToggleMutation.mutateAsync.mockResolvedValueOnce({
      ...mockUnits[0],
      is_active: false,
    });

    render(<UnitsListView />);

    const activeButtons = screen.getAllByRole("button", { name: "Active" });
    fireEvent.click(activeButtons[0]);

    await waitFor(() => {
      expect(mockToggleMutation.mutateAsync).toHaveBeenCalledWith({
        unit: mockUnits[0],
        businessUuid: "biz-001",
      });
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  it("opens create unit modal when clicking '+ Create Unit'", () => {
    render(<UnitsListView />);

    const createButton = screen.getByRole("button", { name: /Create Unit/i });
    fireEvent.click(createButton);

    expect(screen.getByText("Create Measurement Unit")).toBeDefined();
  });
});
