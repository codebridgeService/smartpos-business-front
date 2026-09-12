import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BusinessShell } from "@/components/layout/business-shell";
import { ThemeProvider } from "@/context/theme-context";

// Mock next/navigation
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
      { id: 1, uuid: "biz-1", name: "Alpha Store", status: "active", currency_code: "USD" },
    ],
    activeBusiness: {
      id: 1,
      uuid: "biz-1",
      name: "Alpha Store",
      status: "active",
      currency_code: "USD",
    },
    selectBusiness: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/context/outlet-context", () => ({
  useOutlet: () => ({
    outlets: [{ uuid: "out-1", name: "Downtown Branch" }],
    activeOutlet: { uuid: "out-1", name: "Downtown Branch" },
    selectOutlet: vi.fn(),
  }),
}));

describe("BusinessShell Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the business branding and children content", () => {
    render(
      <ThemeProvider>
        <BusinessShell>
          <div data-testid="businesses-content">Business Management Content</div>
        </BusinessShell>
      </ThemeProvider>
    );

    expect(screen.getByTestId("businesses-content")).toBeDefined();
    expect(screen.getByText("Business Management Content")).toBeDefined();
    expect(screen.getByText("Dreams")).toBeDefined();
    expect(screen.getAllByText("POS").length).toBeGreaterThan(0);
  });

  it("renders admin sidebar navigation sections and links in BusinessShell", () => {
    render(
      <ThemeProvider>
        <BusinessShell>
          <div>Child</div>
        </BusinessShell>
      </ThemeProvider>
    );

    // Navigation items in BusinessShell
    expect(screen.getAllByText("Business Master").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Outlets").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cash Registers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("POS Devices").length).toBeGreaterThan(0);
  });

  it("renders active business tenant card and business footer badge", () => {
    render(
      <ThemeProvider>
        <BusinessShell>
          <div>Child</div>
        </BusinessShell>
      </ThemeProvider>
    );

    // Active business tenant card in BusinessSidebar
    expect(screen.getAllByText("Alpha Store").length).toBeGreaterThan(0);
    expect(screen.getAllByText("USD").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Business").length).toBeGreaterThan(0);
    expect(screen.getByText("Business Portal")).toBeDefined();
  });
});
