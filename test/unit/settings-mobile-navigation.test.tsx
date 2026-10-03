import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DreamPosSettingsShell } from "@/components/settings/dreampos-settings-shell";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/context/theme-context";

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/settings",
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: { id: "1", name: "Admin User", email: "admin@example.com", role: "admin", roles: [] },
    isAuthenticated: true,
    isLoading: false,
    session: null,
    device: null,
    refreshUser: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("@/components/settings/profile-view", () => ({
  ProfileView: () => <div data-testid="profile-view">Profile Content</div>,
}));

vi.mock("@/components/settings/security-view", () => ({
  SecurityView: () => <div data-testid="security-view">Security Content</div>,
}));

describe("DreamPosSettingsShell Mobile Master-Detail Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders mobile menu directory when visiting without tab query param", () => {
    const { container } = render(
      <ToastProvider>
        <ThemeProvider>
          <DreamPosSettingsShell initialTab="profile" />
        </ThemeProvider>
      </ToastProvider>
    );

    // Sidebar directory is visible on mobile (not hidden lg:block)
    const sidebar = container.querySelector(".lg\\:col-span-3");
    expect(sidebar).not.toBeNull();
    expect(sidebar?.className).toContain("block");
    expect(sidebar?.className).not.toContain("hidden lg:block");

    // Content pane is hidden on mobile
    const content = container.querySelector(".lg\\:col-span-9");
    expect(content).not.toBeNull();
    expect(content?.className).toContain("hidden lg:block");

    // Directory shows Settings header and General Settings group
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getAllByText("General Settings").length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to detail page with 'Back to Settings' button when item is clicked", () => {
    const { container } = render(
      <ToastProvider>
        <ThemeProvider>
          <DreamPosSettingsShell initialTab="profile" />
        </ThemeProvider>
      </ToastProvider>
    );

    // Click on 'Security' in the directory
    const buttons = screen.getAllByRole("button");
    const securityBtn = buttons.find((btn) => btn.textContent?.includes("Security"));
    expect(securityBtn).toBeDefined();
    fireEvent.click(securityBtn!);

    // Router push was called with ?tab=security
    expect(mockPush).toHaveBeenCalledWith("/settings?tab=security", { scroll: false });

    // Sidebar directory is now hidden on mobile
    const sidebar = container.querySelector(".lg\\:col-span-3");
    expect(sidebar?.className).toContain("hidden lg:block");

    // Content pane is now visible on mobile
    const content = container.querySelector(".lg\\:col-span-9");
    expect(content?.className).toContain("block");

    // Mobile detail header with 'Back to Settings' button is rendered
    expect(screen.getByText("Back to Settings")).toBeDefined();
  });

  it("returns to menu directory when 'Back to Settings' button is clicked", () => {
    mockSearchParams = new URLSearchParams("tab=security");

    const { container } = render(
      <ToastProvider>
        <ThemeProvider>
          <DreamPosSettingsShell initialTab="profile" />
        </ThemeProvider>
      </ToastProvider>
    );

    // Starts in detail view
    const backButton = screen.getByText("Back to Settings");
    expect(backButton).toBeDefined();

    // Click 'Back to Settings'
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith("/settings", { scroll: false });

    // Menu directory is visible again
    const sidebar = container.querySelector(".lg\\:col-span-3");
    expect(sidebar?.className).toContain("block");
    expect(sidebar?.className).not.toContain("hidden lg:block");

    // Content pane is hidden on mobile
    const content = container.querySelector(".lg\\:col-span-9");
    expect(content?.className).toContain("hidden lg:block");
  });
});
