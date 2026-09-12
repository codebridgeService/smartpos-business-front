import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BusinessNavbar } from "@/components/layout/business-navbar";
import { ThemeProvider } from "@/context/theme-context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock contexts
vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      uuid: "user-1",
      name: "Alex Store Manager",
      email: "manager@smartpos.local",
      roles: [{ name: "Store Manager" }],
    },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    businesses: [
      { id: 1, uuid: "biz-1", name: "Metro Retail", code: "MR-01", status: "active", currency_code: "USD" },
      { id: 2, uuid: "biz-2", name: "Apex Grocery", code: "AG-02", status: "active", currency_code: "USD" },
    ],
    activeBusiness: {
      id: 1,
      uuid: "biz-1",
      name: "Metro Retail",
      code: "MR-01",
      status: "active",
      currency_code: "USD",
    },
    selectBusiness: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/context/outlet-context", () => ({
  useOutlet: () => ({
    outlets: [
      { uuid: "out-1", name: "Flagship Branch", is_main_outlet: true },
      { uuid: "out-2", name: "Airport Store", is_main_outlet: false },
    ],
    activeOutlet: { uuid: "out-1", name: "Flagship Branch", is_main_outlet: true },
    selectOutlet: vi.fn(),
  }),
}));

describe("BusinessNavbar Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders business branding, logo, and portal badge", () => {
    render(
      <ThemeProvider>
        <BusinessNavbar />
      </ThemeProvider>
    );

    expect(screen.getByText("Dreams")).toBeDefined();
    expect(screen.getAllByText("POS").length).toBeGreaterThan(0);
    expect(screen.getByText("Business")).toBeDefined();
  });

  it("renders global search input and triggers spotlight modal on click or shortcut", () => {
    render(
      <ThemeProvider>
        <BusinessNavbar />
      </ThemeProvider>
    );

    const searchTrigger = screen.getByText("Search modules, outlets...");
    fireEvent.click(searchTrigger);

    // Spotlight modal should open
    expect(screen.getByPlaceholderText("Search business modules, outlets, products...")).toBeDefined();
    expect(screen.getByText("ESC to close")).toBeDefined();
    expect(screen.getByText("POS Terminal (Cashier)")).toBeDefined();
    expect(screen.getByText("Business Settings & Profile")).toBeDefined();
  });

  it("toggles outlet menu and displays branch outlets", () => {
    render(
      <ThemeProvider>
        <BusinessNavbar />
      </ThemeProvider>
    );

    const outletBtn = screen.getByText("Flagship Branch");
    fireEvent.click(outletBtn);

    expect(screen.getByText(/Branch Outlets/i)).toBeDefined();
    expect(screen.getByText("Airport Store")).toBeDefined();
    expect(screen.getByText("Main")).toBeDefined();
  });

  it("toggles Add New menu and displays retail quick actions", () => {
    render(
      <ThemeProvider>
        <BusinessNavbar />
      </ThemeProvider>
    );

    const addNewBtn = screen.getByText("Add New");
    fireEvent.click(addNewBtn);

    expect(screen.getByText("Quick Business Actions")).toBeDefined();
    expect(screen.getByText("Sale / POS")).toBeDefined();
    expect(screen.getByText("Register Shift")).toBeDefined();
    expect(screen.getByText("Stock Transfer")).toBeDefined();
  });

  it("toggles user menu and displays business user details", () => {
    render(
      <ThemeProvider>
        <BusinessNavbar />
      </ThemeProvider>
    );

    // Find and click the avatar button
    const userBtn = screen.getByText("A");
    fireEvent.click(userBtn);

    expect(screen.getByText("Alex Store Manager")).toBeDefined();
    expect(screen.getByText("manager@smartpos.local")).toBeDefined();
    expect(screen.getByText("Store Manager")).toBeDefined();
    expect(screen.getAllByText("Business Settings").length).toBeGreaterThan(0);
    expect(screen.getByText("Log Out")).toBeDefined();
  });
});
