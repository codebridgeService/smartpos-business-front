import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BusinessesPage from "@/app/businesses/page";

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Admin User", email: "admin@smartpos.com" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: { id: 1, name: "Senghorng Mart" },
  }),
}));

describe("BusinessesPage (DreamsPOS Dashboard)", () => {
  it("renders welcome header, order count and date filter", () => {
    render(<BusinessesPage />);
    expect(screen.getByText(/Welcome,/i)).toBeDefined();
    expect(screen.getByText(/200\+/i)).toBeDefined();
    expect(screen.getByText(/01 Jan 2024 - 07 Jan 2024/i)).toBeDefined();
  });

  it("renders the 4 primary metric cards", () => {
    render(<BusinessesPage />);
    expect(screen.getAllByText("Total Sales").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$48,988,078").length).toBeGreaterThan(0);
    expect(screen.getByText("Total Sales Return")).toBeDefined();
    expect(screen.getByText("$16,478,145")).toBeDefined();
    expect(screen.getAllByText("Total Purchase").length).toBeGreaterThan(0);
    expect(screen.getByText("$24,145,789")).toBeDefined();
    expect(screen.getByText("Total Purchase Return")).toBeDefined();
    expect(screen.getByText("$18,458,747")).toBeDefined();
  });

  it("renders secondary KPI cards including Profit, Invoice Due, and Expenses", () => {
    render(<BusinessesPage />);
    expect(screen.getByText("Profit")).toBeDefined();
    expect(screen.getByText("$8,458,798")).toBeDefined();
    expect(screen.getByText("Invoice Due")).toBeDefined();
    expect(screen.getByText("$48,988,78")).toBeDefined();
    expect(screen.getByText("Total Expenses")).toBeDefined();
    expect(screen.getByText("$8,980,097")).toBeDefined();
  });

  it("renders Sales & Purchase, Top Products, and Transactions sections", () => {
    render(<BusinessesPage />);
    expect(screen.getByText("Sales & Purchase")).toBeDefined();
    expect(screen.getByText("Top Selling Products")).toBeDefined();
    expect(screen.getByText("Low Stock Products")).toBeDefined();
    expect(screen.getByText("Recent Sales")).toBeDefined();
    expect(screen.getByText("Sales Statics")).toBeDefined();
    expect(screen.getByText("Recent Transactions")).toBeDefined();
    expect(screen.getByText("Top Customers")).toBeDefined();
    expect(screen.getByText("Top Categories")).toBeDefined();
    expect(screen.getByText("Order Statistics")).toBeDefined();
  });
});
