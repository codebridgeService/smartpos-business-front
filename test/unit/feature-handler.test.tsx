import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  PageFeatureGuard,
  FeatureMaintenanceView,
  FeatureDisabledView,
  FeatureComingSoonView,
  ActionGuard,
} from "@/components/feature-handler";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";

// Mock auth context
vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: { name: "Test Admin", roles: [{ name: "admin" }] },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/roles",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("Feature Handler & Page Status Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when feature is active", async () => {
    render(
      <PageFeatureGuard featureKey="roles.rbac" featureName="Roles & RBAC">
        <div data-testid="roles-content">Roles Management Table</div>
      </PageFeatureGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId("roles-content")).toBeDefined();
      expect(screen.getByText("Roles Management Table")).toBeDefined();
    });
  });

  it("renders FeatureMaintenanceView when page status is MAINTENANCE", () => {
    const refreshMock = vi.fn().mockResolvedValue(undefined);

    render(
      <FeatureMaintenanceView
        featureName="Payments Gateway"
        moduleName="Billing"
        reason="Emergency database update in progress"
        maintenanceType="DATABASE_UPDATE"
        onRefresh={refreshMock}
      />
    );

    expect(screen.getByText(/Payments Gateway is Temporarily Unavailable/i)).toBeDefined();
    expect(screen.getAllByText(/DATABASE UPDATE/i)[0]).toBeDefined();
    expect(screen.getByText(/Emergency database update in progress/i)).toBeDefined();
    expect(screen.getByText(/Check Status Again/i)).toBeDefined();
  });

  it("renders FeatureDisabledView when page status is DISABLED", () => {
    render(
      <FeatureDisabledView
        featureName="Legacy Importer"
        moduleName="Operations"
        reason="Module deprecated by system administration"
      />
    );

    expect(screen.getByText(/Legacy Importer is Currently Closed/i)).toBeDefined();
    expect(screen.getByText(/Module deprecated by system administration/i)).toBeDefined();
    expect(screen.getByText(/Return to Dashboard/i)).toBeDefined();
  });

  it("renders FeatureComingSoonView when page status is COMING_SOON", () => {
    render(
      <FeatureComingSoonView
        featureName="AI Sales Predictor"
        moduleName="Analytics"
        description="Predictive demand forecasting module"
      />
    );

    expect(screen.getByText(/AI Sales Predictor is on the Roadmap/i)).toBeDefined();
    expect(screen.getByText(/Predictive demand forecasting module/i)).toBeDefined();
    expect(screen.getByText(/Coming Soon/i)).toBeDefined();
  });

  it("ActionGuard prevents action execution when feature is in maintenance and shows intercept notice", async () => {
    // Mock store to return feature as maintenance
    vi.spyOn(FeaturesAnnouncementsStore, "getFeatures").mockReturnValue([
      {
        id: "feat-test",
        slug: "roles.create",
        name: "Create Role",
        description: "Role creation",
        module: "System & Governance",
        status: "maintenance",
        is_enabled: false,
        allowed_roles: ["admin"],
        updated_at: new Date().toISOString(),
      },
    ]);

    const handleProceed = vi.fn();

    render(
      <ActionGuard featureKey="roles.create" actionName="Create New Role" onProceed={handleProceed}>
        {({ onClick }) => (
          <button onClick={onClick} data-testid="create-btn">
            Create Role
          </button>
        )}
      </ActionGuard>
    );

    // Wait for usePageFeature to evaluate
    await waitFor(() => {
      expect(screen.getByTestId("create-btn")).toBeDefined();
    });

    const btn = screen.getByTestId("create-btn");
    fireEvent.click(btn);

    // Proceed callback should NOT be called
    expect(handleProceed).not.toHaveBeenCalled();

    // Intercept modal should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Create New Role is Temporarily Paused/i)).toBeDefined();
      expect(screen.getByText(/Company Fix in Progress/i)).toBeDefined();
    });
  });
});
