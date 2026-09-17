import React, { act } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BusinessOutletsPage from "@/app/businesses/outlets/page";
import { outletsApi } from "@/lib/api/outlets";
import { apiClient } from "@/lib/api/client";

const mockOutlets = [
  {
    id: 1,
    uuid: "outlet-uuid-1",
    business_id: 10,
    code: "OUT-001",
    name: "Downtown Flagship",
    phone: "+855 23 999 001",
    email: "flagship@smartpos.com",
    address: "123 Monivong Blvd",
    city: "Phnom Penh",
    country_code: "KH",
    is_main_outlet: true,
    tax_rate: "10.00",
    timezone: "Asia/Phnom_Penh",
    is_active: true,
    status: "active",
    registers_count: 3,
    pos_devices_count: 4,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    uuid: "outlet-uuid-2",
    business_id: 10,
    code: "OUT-002",
    name: "Airport Kiosk",
    phone: "+855 23 999 002",
    email: "airport@smartpos.com",
    address: "Russian Blvd",
    city: "Phnom Penh",
    country_code: "KH",
    is_main_outlet: false,
    tax_rate: "10.00",
    timezone: "Asia/Phnom_Penh",
    is_active: true,
    status: "active",
    registers_count: 1,
    pos_devices_count: 2,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
];

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: { id: 10, uuid: "biz-uuid-123", name: "SmartPOS Retail" },
  }),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/components/ui/toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("outletsApi Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches outlets list with GET /businesses/{business}/outlets", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockOutlets });

    const result = await outletsApi.getOutlets("biz-uuid-123");
    expect(apiClient.get).toHaveBeenCalledWith("/businesses/biz-uuid-123/outlets");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Downtown Flagship");
    expect(result[0].is_main_outlet).toBe(true);
  });

  it("fetches single outlet with GET /outlets/{outlet}", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockOutlets[0] });

    const result = await outletsApi.getOutlet("outlet-uuid-1");
    expect(apiClient.get).toHaveBeenCalledWith("/outlets/outlet-uuid-1");
    expect(result.code).toBe("OUT-001");
  });

  it("creates outlet with POST /businesses/{business}/outlets", async () => {
    const newOutlet = {
      code: "OUT-003",
      name: "Riverside Branch",
      is_main_outlet: false,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: 3, uuid: "out-3", ...newOutlet } });

    const result = await outletsApi.createOutlet("biz-uuid-123", newOutlet);
    expect(apiClient.post).toHaveBeenCalledWith("/businesses/biz-uuid-123/outlets", newOutlet);
    expect(result.name).toBe("Riverside Branch");
  });

  it("updates outlet with PUT /outlets/{outlet}", async () => {
    const updateData = { name: "Downtown Super Flagship" };
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { ...mockOutlets[0], ...updateData } });

    const result = await outletsApi.updateOutlet("outlet-uuid-1", updateData);
    expect(apiClient.put).toHaveBeenCalledWith("/outlets/outlet-uuid-1", updateData);
    expect(result.name).toBe("Downtown Super Flagship");
  });

  it("deletes outlet with DELETE /outlets/{outlet}", async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    await outletsApi.deleteOutlet("outlet-uuid-1");
    expect(apiClient.delete).toHaveBeenCalledWith("/outlets/outlet-uuid-1");
  });
});

describe("BusinessOutletsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockOutlets });
  });

  it("renders outlets grid displaying name, code, phone, address, and device count", async () => {
    await act(async () => {
      render(<BusinessOutletsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Downtown Flagship")).toBeDefined();
    });

    expect(screen.getByText("OUT-001")).toBeDefined();
    expect(screen.getByText("Main Branch")).toBeDefined();
    expect(screen.getByText("+855 23 999 001")).toBeDefined();
    expect(screen.getByText(/123 Monivong Blvd/i)).toBeDefined();
    expect(screen.getByText("Airport Kiosk")).toBeDefined();
  });

  it("toggles to table view and displays dense columns", async () => {
    await act(async () => {
      render(<BusinessOutletsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Downtown Flagship")).toBeDefined();
    });

    const tableBtn = screen.getByTitle("Dense Table View");
    await act(async () => {
      fireEvent.click(tableBtn);
    });

    expect(screen.getByText("Outlet / Code")).toBeDefined();
    expect(screen.getByText("Phone & Email")).toBeDefined();
    expect(screen.getByText("Location / City")).toBeDefined();
  });

  it("opens create modal with 'Main Outlet' checkbox", async () => {
    await act(async () => {
      render(<BusinessOutletsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Downtown Flagship")).toBeDefined();
    });

    const addBtn = screen.getByRole("button", { name: /Add Outlet/i });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByText("Add New Outlet")).toBeDefined();
    expect(screen.getByLabelText(/Set as Main Outlet/i)).toBeDefined();
  });

  it("opens edit modal and submits update", async () => {
    vi.mocked(apiClient.put).mockResolvedValue({
      data: { ...mockOutlets[1], name: "Airport Kiosk Express" },
    });

    await act(async () => {
      render(<BusinessOutletsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Airport Kiosk")).toBeDefined();
    });

    const editButtons = screen.getAllByTitle("Edit Outlet Configuration");
    await act(async () => {
      fireEvent.click(editButtons[1]);
    });

    expect(screen.getByText(/Edit Outlet: Airport Kiosk/i)).toBeDefined();

    const nameInput = screen.getByDisplayValue("Airport Kiosk");
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Airport Kiosk Express" } });
    });

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    await act(async () => {
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/outlets/outlet-uuid-2",
        expect.objectContaining({ name: "Airport Kiosk Express" })
      );
    });
  });

  it("opens delete modal and submits deletion", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await act(async () => {
      render(<BusinessOutletsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Airport Kiosk")).toBeDefined();
    });

    const deleteButtons = screen.getAllByTitle("Delete Outlet");
    await act(async () => {
      fireEvent.click(deleteButtons[1]);
    });

    expect(screen.getByText("Delete Outlet Location")).toBeDefined();

    const confirmBtn = screen.getByRole("button", { name: /Yes, Delete Outlet/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith("/outlets/outlet-uuid-2");
    });
  });
});
