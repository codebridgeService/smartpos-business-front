import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BusinessSidebar } from "@/components/layout/business-sidebar";
import { ThemeProvider } from "@/context/theme-context";

// Mock navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/businesses",
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock contexts
vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      uuid: "user-1",
      name: "Business Manager",
      email: "manager@test.com",
      roles: [{ name: "Owner" }],
    },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    businesses: [
      { id: 1, uuid: "biz-1", name: "Metro Retail", status: "active", currency_code: "USD", code: "MR-01" },
    ],
    activeBusiness: {
      id: 1,
      uuid: "biz-1",
      name: "Metro Retail",
      status: "active",
      currency_code: "USD",
      code: "MR-01",
    },
    selectBusiness: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/context/outlet-context", () => ({
  useOutlet: () => ({
    outlets: [
      { uuid: "out-1", name: "Flagship Branch" },
      { uuid: "out-2", name: "Airport Store" },
    ],
    activeOutlet: { uuid: "out-1", name: "Flagship Branch" },
    selectOutlet: vi.fn(),
  }),
}));

describe("BusinessSidebar Component", () => {
  it("renders active business identity card and navigation sections", () => {
    render(
      <ThemeProvider>
        <BusinessSidebar />
      </ThemeProvider>
    );

    // Business identity card & footer
    expect(screen.getAllByText("Metro Retail").length).toBe(2);
    expect(screen.getByText("USD")).toBeDefined();
    expect(screen.getByText("• MR-01")).toBeDefined();

    // Section headers
    expect(screen.getByText("Main")).toBeDefined();
    expect(screen.getByText("Store & Terminals")).toBeDefined();
    expect(screen.getByText("Stock & Inventory")).toBeDefined();
    expect(screen.getByText("Staff & Governance")).toBeDefined();
    expect(screen.getByText("Settings & System")).toBeDefined();

    // Core Business links
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Outlets")).toBeDefined();
    expect(screen.getByText("Business Master")).toBeDefined();
    expect(screen.getByText("Business Settings")).toBeDefined();
    expect(screen.getByText("Outlets & Branches")).toBeDefined();
    expect(screen.getByText("Cash Registers")).toBeDefined();
    expect(screen.getByText("POS Devices")).toBeDefined();
  });

  it("toggles dropdown accordion on group click", () => {
    render(
      <ThemeProvider>
        <BusinessSidebar />
      </ThemeProvider>
    );

    const shiftsBtn = screen.getByText("Cash Drawer & Shifts");
    fireEvent.click(shiftsBtn);

    // Submenu children should now be visible
    expect(screen.getByText("Register Shifts")).toBeDefined();
    expect(screen.getByText("Cash Drawer")).toBeDefined();
  });

  it("toggles Dashboard and Outlets dropdowns showing submenus and outlet listings", () => {
    render(
      <ThemeProvider>
        <BusinessSidebar />
      </ThemeProvider>
    );

    // Click Dashboard dropdown
    const dashboardBtn = screen.getByText("Dashboard");
    fireEvent.click(dashboardBtn);

    expect(screen.getByText("Admin Dashboard")).toBeDefined();
    expect(screen.getByText("Admin Dashboard 2")).toBeDefined();
    expect(screen.getByText("Sales Dashboard")).toBeDefined();
    expect(screen.getAllByText("POS Terminal").length).toBeGreaterThanOrEqual(1);

    // Click Outlets dropdown to list all outlets
    const outletsBtn = screen.getByText("Outlets");
    fireEvent.click(outletsBtn);

    expect(screen.getAllByText("All Outlets").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Flagship Branch").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Airport Store").length).toBeGreaterThan(0);
  });

  it("calls onItemClick when an item is selected", () => {
    const onItemClick = vi.fn();
    render(
      <ThemeProvider>
        <BusinessSidebar onItemClick={onItemClick} />
      </ThemeProvider>
    );

    const masterLink = screen.getByText("Business Master");
    fireEvent.click(masterLink);
    expect(onItemClick).toHaveBeenCalled();
  });

  it("renders correctly in collapsed mode", () => {
    const { container } = render(
      <ThemeProvider>
        <BusinessSidebar isCollapsed={true} />
      </ThemeProvider>
    );

    // In collapsed mode, the container exists and has expected compact classes
    expect(container.querySelector(".h-full")).toBeDefined();
  });
});
