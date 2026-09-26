import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ThemeProvider } from "@/context/theme-context";
import { Modal } from "@/components/ui/modal";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/companies",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock useAuth
vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      uuid: "user-admin",
      name: "Admin User",
      email: "admin@test.com",
      roles: [{ name: "Super Admin" }],
    },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

// Mock useBusiness
vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    businesses: [{ id: 1, uuid: "biz-1", name: "Company Corp", status: "active" }],
    activeBusiness: { id: 1, uuid: "biz-1", name: "Company Corp", status: "active" },
    selectBusiness: vi.fn(),
    isLoading: false,
  }),
}));

// Mock useOutlet
vi.mock("@/context/outlet-context", () => ({
  useOutlet: () => ({
    outlets: [{ uuid: "out-1", name: "Main HQ" }],
    activeOutlet: { uuid: "out-1", name: "Main HQ" },
    selectOutlet: vi.fn(),
  }),
}));

describe("Admin Shell Without Blur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not apply blur effect to AdminNavbar and AdminSidebar", () => {
    const { container } = render(
      <ThemeProvider>
        <DashboardShell variant="admin">
          <div data-testid="page-content">Companies Page Content</div>
        </DashboardShell>
      </ThemeProvider>
    );

    // Navbar should NOT have blur class
    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    expect(header?.className).not.toContain("blur");

    // Sidebar wrapper should NOT have blur class
    const sidebarWrapper = container.querySelector(".sticky.top-16");
    expect(sidebarWrapper).not.toBeNull();
    expect(sidebarWrapper?.className).not.toContain("blur");

    // Main should NOT have blur class
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main?.className).not.toContain("blur");
  });

  it("renders Modal portalled to document.body with standard clean backdrop without blur", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Create New Business Tenant">
        <div data-testid="modal-form">Form Content</div>
      </Modal>
    );

    // Modal should be attached to document.body
    expect(screen.getByTestId("modal-form")).toBeDefined();
    const backdrop = document.querySelector(".bg-black\\/50");
    expect(backdrop).not.toBeNull();
    expect(backdrop?.className).not.toContain("backdrop-blur");
    const modalRoot = document.querySelector(".z-\\[100\\]");
    expect(modalRoot).not.toBeNull();
  });
});
