import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SalesDashboardView } from "@/components/businesses/sales-dashboard-view";

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: { id: 1, name: "John Smilga", email: "john@smartpos.com" },
    isAuthenticated: true,
  }),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: { id: 1, name: "Flagship Store" },
  }),
}));

describe("SalesDashboardView Component", () => {
  it("renders store greeting banner and date range selector", () => {
    render(<SalesDashboardView />);
    expect(screen.getByText(/here's what's happening with your store today/i)).toBeDefined();
    expect(screen.getByText("01 Jan 2024 - 07 Jan 2024")).toBeDefined();
  });

  it("renders the 3 top metric cards with weekly earnings and totals", () => {
    render(<SalesDashboardView />);
    expect(screen.getByText("Weekly Earning")).toBeDefined();
    expect(screen.getByText(/\$95,?000\.45/)).toBeDefined();
    expect(screen.getAllByText("increase compare to last week").length).toBe(2);

    expect(screen.getByText("10,000+")).toBeDefined();
    expect(screen.getByText("No of Total Sales")).toBeDefined();

    expect(screen.getByText("800+")).toBeDefined();
    expect(screen.getByText("No of Purchased Goods")).toBeDefined();
  });

  it("renders Best Seller section with top product sales", () => {
    render(<SalesDashboardView />);
    expect(screen.getByText("Best Seller")).toBeDefined();
    expect(screen.getAllByText("Lobar Handy").length).toBeGreaterThan(0);
    expect(screen.getByText("6547")).toBeDefined();
    expect(screen.getByText("Bold V3.2")).toBeDefined();
    expect(screen.getByText("3474")).toBeDefined();
    expect(screen.getAllByText("Lenovo 3rd Generation").length).toBeGreaterThan(0);
    expect(screen.getByText("Apple Series 5 Watch")).toBeDefined();
  });

  it("renders Recent Transactions table with order details, payment, and status", () => {
    render(<SalesDashboardView />);
    expect(screen.getByText("Recent Transactions")).toBeDefined();
    expect(screen.getByText("Order Details")).toBeDefined();
    expect(screen.getByText("Payment")).toBeDefined();
    expect(screen.getByText("Amount")).toBeDefined();

    expect(screen.getByText("Paypal")).toBeDefined();
    expect(screen.getByText("#416645453773")).toBeDefined();
    expect(screen.getByText("$1099.00")).toBeDefined();

    expect(screen.getByText("Apple Pay")).toBeDefined();
    expect(screen.getByText("$600.55")).toBeDefined();
    expect(screen.getByText("Cancelled")).toBeDefined();

    expect(screen.getByText("Stripe")).toBeDefined();
    expect(screen.getByText("$200.10")).toBeDefined();
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders Sales Analytics chart and Sales by Countries with Africa stats", () => {
    render(<SalesDashboardView />);
    expect(screen.getByText("Sales Analytics")).toBeDefined();
    expect(screen.getByText("2023")).toBeDefined();
    expect(screen.getByText("Sales by Countries")).toBeDefined();
    expect(screen.getByText("This Week")).toBeDefined();
    expect(screen.getByText("Africa")).toBeDefined();
    expect(screen.getByText("3455 Sales")).toBeDefined();
  });
});
