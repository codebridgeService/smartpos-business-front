import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import BusinessSettingsPage from "@/app/businesses/settings/page";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/components/ui/toast";

let mockSearchParams = new URLSearchParams("tab=security");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/businesses/settings",
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      uuid: "user-1",
      name: "Business Manager",
      email: "manager@test.com",
      phone: "+85512345678",
      roles: [{ name: "Owner" }],
    },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/api", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}));

describe("Business Settings Page - Security Tab", () => {
  it("renders Security view when tab=security", async () => {
    mockSearchParams = new URLSearchParams("tab=security");

    render(
      <ToastProvider>
        <ThemeProvider>
          <BusinessSettingsPage />
        </ThemeProvider>
      </ToastProvider>
    );

    // Sidebar navigation groups
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("General Settings")).toBeDefined();
    expect(screen.getAllByText("Security").length).toBeGreaterThanOrEqual(1);

    // Security view content
    expect(screen.getByText("Two Factor Authentication")).toBeDefined();
    expect(screen.getByText("Google Authentication")).toBeDefined();
    expect(screen.getByText("Phone Number Verification")).toBeDefined();
    expect(screen.getByText("Email Verification")).toBeDefined();
  });
});
