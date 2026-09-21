import React, { act } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BusinessStaffPage from "@/app/businesses/staff/page";
import { businessUsersApi } from "@/lib/api/business-users";
import { apiClient } from "@/lib/api/client";

const mockStaffMembers = [
  {
    id: 1,
    uuid: "staff-uuid-1",
    business_id: 10,
    outlet_id: 1,
    user_uuid: "user-uuid-owner",
    employee_code: "EMP-001",
    job_title: "General Manager",
    role: "owner",
    is_owner: true,
    is_active: true,
    phone: "+855 12 345 678",
    notes: "Business Founder",
    status: "active",
    joined_at: "2026-01-01T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    uuid: "staff-uuid-2",
    business_id: 10,
    outlet_id: 1,
    user_uuid: "user-uuid-cashier",
    employee_code: "EMP-002",
    job_title: "POS Operator",
    role: "cashier",
    is_owner: false,
    is_active: true,
    phone: "+855 98 765 432",
    notes: "Front counter cashier",
    status: "active",
    joined_at: "2026-01-05T00:00:00Z",
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-01-05T00:00:00Z",
  },
  {
    id: 3,
    uuid: "staff-uuid-3",
    business_id: 10,
    outlet_id: 2,
    user_uuid: "user-uuid-suspended",
    employee_code: "EMP-003",
    job_title: "Trainee",
    role: "staff",
    is_owner: false,
    is_active: false,
    phone: "+855 11 222 333",
    notes: "Suspended pending review",
    status: "suspended",
    joined_at: "2026-02-01T00:00:00Z",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
  },
];

const mockOutlets = [
  {
    id: 1,
    uuid: "outlet-uuid-1",
    business_id: 10,
    code: "OUT-001",
    name: "Downtown Flagship",
    is_main_outlet: true,
    is_active: true,
    status: "active",
  },
  {
    id: 2,
    uuid: "outlet-uuid-2",
    business_id: 10,
    code: "OUT-002",
    name: "Airport Branch",
    is_main_outlet: false,
    is_active: true,
    status: "active",
  },
];

const mockUserOutlets = [
  {
    id: 101,
    uuid: "assign-uuid-1",
    business_user_id: 2,
    outlet_id: 1,
    is_primary: true,
    is_active: true,
    assigned_at: "2026-01-10T00:00:00Z",
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-01-10T00:00:00Z",
    outlet: mockOutlets[0],
  },
];

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: { id: 10, uuid: "biz-uuid-123", name: "SmartPOS Supermarket" },
    businesses: [{ id: 10, uuid: "biz-uuid-123", name: "SmartPOS Supermarket" }],
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

describe("businessUsersApi Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches staff list with GET /businesses/{business}/users", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStaffMembers });

    const result = await businessUsersApi.getBusinessUsers("biz-uuid-123");
    expect(apiClient.get).toHaveBeenCalledWith("/businesses/biz-uuid-123/users", { params: undefined });
    expect(result).toHaveLength(3);
    expect(result[0].user_uuid).toBe("user-uuid-owner");
    expect(result[0].is_owner).toBe(true);
  });

  it("fetches business owner with GET /businesses/{business}/owner", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStaffMembers[0] });

    const result = await businessUsersApi.getBusinessOwner("biz-uuid-123");
    expect(apiClient.get).toHaveBeenCalledWith("/businesses/biz-uuid-123/owner");
    expect(result?.user_uuid).toBe("user-uuid-owner");
  });

  it("adds a new staff member with POST /businesses/{business}/users", async () => {
    const newMember = {
      id: 4,
      uuid: "staff-uuid-4",
      business_id: 10,
      user_uuid: "user-new-staff",
      role: "cashier",
      is_owner: false,
      is_active: true,
      status: "active",
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: newMember });

    const result = await businessUsersApi.addBusinessUser("biz-uuid-123", {
      user_uuid: "user-new-staff",
      role: "cashier",
    });
    expect(apiClient.post).toHaveBeenCalledWith("/businesses/biz-uuid-123/users", {
      user_uuid: "user-new-staff",
      role: "cashier",
    });
    expect(result.user_uuid).toBe("user-new-staff");
  });

  it("updates a staff member with PUT /businesses/{business}/users/{user}", async () => {
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      data: { ...mockStaffMembers[1], job_title: "Senior Cashier" },
    });

    const result = await businessUsersApi.updateBusinessUser("biz-uuid-123", "staff-uuid-2", {
      job_title: "Senior Cashier",
    });
    expect(apiClient.put).toHaveBeenCalledWith(
      "/businesses/biz-uuid-123/users/staff-uuid-2",
      { job_title: "Senior Cashier" }
    );
    expect(result.job_title).toBe("Senior Cashier");
  });

  it("suspends a staff member with POST /businesses/{business}/users/{user}/suspend", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { ...mockStaffMembers[1], status: "suspended" },
    });

    const result = await businessUsersApi.suspendBusinessUser("biz-uuid-123", "staff-uuid-2");
    expect(apiClient.post).toHaveBeenCalledWith(
      "/businesses/biz-uuid-123/users/staff-uuid-2/suspend",
      {}
    );
    expect(result.status).toBe("suspended");
  });

  it("deletes a staff member with DELETE /businesses/{business}/users/{user}", async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    await businessUsersApi.deleteBusinessUser("biz-uuid-123", "staff-uuid-3");
    expect(apiClient.delete).toHaveBeenCalledWith("/businesses/biz-uuid-123/users/staff-uuid-3");
  });

  it("fetches user outlets with GET /businesses/{business}/users/{user}/outlets", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUserOutlets });

    const result = await businessUsersApi.getUserOutlets("biz-uuid-123", "staff-uuid-2");
    expect(apiClient.get).toHaveBeenCalledWith("/businesses/biz-uuid-123/users/staff-uuid-2/outlets");
    expect(result).toHaveLength(1);
    expect(result[0].outlet?.name).toBe("Downtown Flagship");
  });

  it("assigns an outlet to user with POST /businesses/{business}/users/{user}/outlets", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        id: 102,
        uuid: "assign-uuid-2",
        business_user_id: 2,
        outlet_id: 2,
        is_primary: false,
        is_active: true,
      },
    });

    const result = await businessUsersApi.assignUserOutlet("biz-uuid-123", "staff-uuid-2", {
      outlet_uuid: "outlet-uuid-2",
      is_primary: false,
      is_active: true,
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      "/businesses/biz-uuid-123/users/staff-uuid-2/outlets",
      {
        outlet_uuid: "outlet-uuid-2",
        is_primary: false,
        is_active: true,
      }
    );
    expect(result.id).toBe(102);
  });

  it("revokes user outlet with DELETE /businesses/{business}/users/{user}/outlets/{outlet}", async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({});

    await businessUsersApi.revokeUserOutlet("biz-uuid-123", "staff-uuid-2", "outlet-uuid-1");
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/businesses/biz-uuid-123/users/staff-uuid-2/outlets/outlet-uuid-1"
    );
  });
});

describe("BusinessStaffPage UI Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes("outlets") && url.includes("users")) return { data: mockUserOutlets };
      if (url.includes("outlets")) return { data: mockOutlets };
      if (url.includes("users")) return { data: mockStaffMembers };
      return { data: [] };
    });
  });

  it("renders staff members table and statistics correctly", async () => {

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Staff Memberships & Access")).toBeDefined();
      expect(screen.getByText("user-uuid-owner")).toBeDefined();
      expect(screen.getByText("user-uuid-cashier")).toBeDefined();
      expect(screen.getByText("user-uuid-suspended")).toBeDefined();
    });

    // Check KPI counts
    expect(screen.getByText("3")).toBeDefined(); // Total staff
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1); // Active staff & Outlets
    expect(screen.getByText("1")).toBeDefined(); // Suspended staff
  });

  it("filters staff by search query and status tabs", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes("outlets") && url.includes("users")) return { data: mockUserOutlets };
      if (url.includes("outlets")) return { data: mockOutlets };
      if (url.includes("users")) return { data: mockStaffMembers };
      return { data: [] };
    });

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("user-uuid-cashier")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search staff by UUID/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "cashier" } });
    });

    expect(screen.getByText("user-uuid-cashier")).toBeDefined();
    expect(screen.queryByText("user-uuid-suspended")).toBeNull();

    // Clear search and switch to suspended tab
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "" } });
    });

    const suspendedTab = screen.getByRole("button", { name: /^suspended$/i });
    await act(async () => {
      fireEvent.click(suspendedTab);
    });

    expect(screen.getByText("user-uuid-suspended")).toBeDefined();
    expect(screen.queryByText("user-uuid-owner")).toBeNull();
  });

  it("opens Add Staff modal and submits form", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes("outlets") && url.includes("users")) return { data: mockUserOutlets };
      if (url.includes("outlets")) return { data: mockOutlets };
      if (url.includes("users")) return { data: mockStaffMembers };
      return { data: [] };
    });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 4,
        uuid: "staff-uuid-4",
        user_uuid: "user-new-joiner",
        role: "cashier",
        is_owner: false,
        is_active: true,
        status: "active",
      },
    });

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("user-uuid-owner")).toBeDefined();
    });

    const addBtn = screen.getByRole("button", { name: /Add Staff Member/i });
    await act(async () => {
      fireEvent.click(addBtn);
    });

    expect(screen.getByText("Assign an existing registered user to SmartPOS Supermarket.")).toBeDefined();

    // Fill Form
    const userUuidInput = screen.getByPlaceholderText(/6818c7f6-9109-4365/i);
    await act(async () => {
      fireEvent.change(userUuidInput, { target: { value: "user-new-joiner" } });
    });

    const form = userUuidInput.closest("form");
    expect(form).toBeDefined();

    await act(async () => {
      if (form) {
        fireEvent.submit(form);
      }
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/businesses/biz-uuid-123/users",
        expect.objectContaining({
          user_uuid: "user-new-joiner",
        })
      );
      expect(mockToast.success).toHaveBeenCalledWith("Staff member added to business successfully!");
    });
  });

  it("opens Edit Staff modal and updates details", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes("outlets") && url.includes("users")) return { data: mockUserOutlets };
      if (url.includes("outlets")) return { data: mockOutlets };
      if (url.includes("users")) return { data: mockStaffMembers };
      return { data: [] };
    });
    vi.mocked(apiClient.put).mockResolvedValue({
      data: {
        ...mockStaffMembers[1],
        job_title: "Senior Cashier Lead",
      },
    });

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("user-uuid-cashier")).toBeDefined();
    });

    const editButtons = screen.getAllByTitle("Edit Membership");
    await act(async () => {
      fireEvent.click(editButtons[1]); // Cashier
    });

    await waitFor(() => {
      expect(screen.getByText("Update Staff Membership")).toBeDefined();
    });

    const jobTitleInput = screen.getByDisplayValue("POS Operator");
    await act(async () => {
      fireEvent.change(jobTitleInput, { target: { value: "Senior Cashier Lead" } });
    });

    const form = jobTitleInput.closest("form");
    expect(form).toBeDefined();

    await act(async () => {
      if (form) {
        fireEvent.submit(form);
      }
    });

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/businesses/biz-uuid-123/users/staff-uuid-2",
        expect.objectContaining({
          job_title: "Senior Cashier Lead",
        })
      );
      expect(mockToast.success).toHaveBeenCalledWith("Staff membership details updated successfully!");
    });
  });

  it("toggles staff suspension state", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes("outlets") && url.includes("users")) return { data: mockUserOutlets };
      if (url.includes("outlets")) return { data: mockOutlets };
      if (url.includes("users")) return { data: mockStaffMembers };
      return { data: [] };
    });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        ...mockStaffMembers[1],
        status: "suspended",
      },
    });

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("user-uuid-cashier")).toBeDefined();
    });

    const suspendButtons = screen.getAllByTitle("Suspend staff member");
    await act(async () => {
      fireEvent.click(suspendButtons[1]); // Cashier row
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/businesses/biz-uuid-123/users/staff-uuid-2/suspend",
        {}
      );
      expect(mockToast.success).toHaveBeenCalledWith("Staff member suspended.");
    });
  });

  it("opens Delete modal and confirms removal", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url: string) => {
      if (url.includes("outlets") && url.includes("users")) return { data: mockUserOutlets };
      if (url.includes("outlets")) return { data: mockOutlets };
      if (url.includes("users")) return { data: mockStaffMembers };
      return { data: [] };
    });
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("user-uuid-suspended")).toBeDefined();
    });

    const deleteButtons = screen.getAllByTitle("Remove from Business");
    await act(async () => {
      fireEvent.click(deleteButtons[2]); // Suspended member row
    });

    await waitFor(() => {
      expect(screen.getByText("Remove Staff Member")).toBeDefined();
      expect(screen.getByText("Destructive Action")).toBeDefined();
    });

    const confirmBtn = screen.getByRole("button", { name: /Remove Member/i });
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith("/businesses/biz-uuid-123/users/staff-uuid-3");
      expect(mockToast.success).toHaveBeenCalledWith("Staff member removed from business tenant.");
      expect(screen.queryByText("Remove Staff Member")).toBeNull();
    });
  });

  it("opens Outlet Assignment sub-view modal, loads assignments, and revokes assignment", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});

    await act(async () => {
      render(<BusinessStaffPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("user-uuid-owner")).toBeDefined();
    });

    const ownerRow = screen.getByText("user-uuid-owner").closest("tr");
    expect(ownerRow).not.toBeNull();
    const manageOutletsBtn = ownerRow!.querySelector('button[title="Manage Outlets"]')!;
    expect(manageOutletsBtn).not.toBeNull();

    await act(async () => {
      fireEvent.click(manageOutletsBtn);
    });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith("/businesses/biz-uuid-123/users/staff-uuid-1/outlets");
    });

    // Revoke outlet assignment
    const revokeBtn = screen.getByRole("button", { name: /Revoke/i });
    await act(async () => {
      fireEvent.click(revokeBtn);
    });

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith(
        "/businesses/biz-uuid-123/users/staff-uuid-1/outlets/outlet-uuid-1"
      );
      expect(mockToast.success).toHaveBeenCalledWith("Outlet assignment revoked.");
    });
  });
});
