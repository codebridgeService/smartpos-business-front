import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HorizontalNav } from "@/components/layout/horizontal-nav";
import { ThemeProvider } from "@/context/theme-context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock outlet context
vi.mock("@/context/outlet-context", () => ({
  useOutlet: () => ({ outlets: [{ uuid: "out-1", name: "Main Store" }] }),
}));

describe("HorizontalNav Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders all top-level horizontal navigation categories", () => {
    render(
      <ThemeProvider>
        <HorizontalNav />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: /Dashboard/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Super Admin/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Application/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Layouts/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Roles & Security/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Inventory/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Store & Registers/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Settings/i })).toBeDefined();
  });

  it("opens dropdown flyout menu when Inventory is clicked", () => {
    render(
      <ThemeProvider>
        <HorizontalNav />
      </ThemeProvider>
    );

    const inventoryButton = screen.getByRole("button", { name: /Inventory/i });
    fireEvent.click(inventoryButton);

    // Verify inventory submenu items from user screenshot
    expect(screen.getByText("Products")).toBeDefined();
    expect(screen.getByText("Create Product")).toBeDefined();
    expect(screen.getByText("Expired Products")).toBeDefined();
    expect(screen.getByText("Low Stocks")).toBeDefined();
    expect(screen.getByText("Category")).toBeDefined();
    expect(screen.getByText("Sub Category")).toBeDefined();
    expect(screen.getByText("Brands")).toBeDefined();
  });

  it("opens dropdown for Super Admin and shows SaaS subitems", () => {
    render(
      <ThemeProvider>
        <HorizontalNav />
      </ThemeProvider>
    );

    const superAdminButton = screen.getByRole("button", { name: /Super Admin/i });
    fireEvent.click(superAdminButton);

    expect(screen.getByText("Companies")).toBeDefined();
    expect(screen.getByText("Subscriptions")).toBeDefined();
    expect(screen.getByText("Packages")).toBeDefined();
    expect(screen.getByText("Announcements & Controls")).toBeDefined();
  });
});
