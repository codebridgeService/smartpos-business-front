import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PermissionsPageSkeleton } from "@/components/admin/permissions/PermissionsPageSkeleton";
import { RolesPageSkeleton } from "@/components/admin/roles/RolesPageSkeleton";
import { BrandsListSkeleton } from "@/components/brands/BrandsListSkeleton";
import { CategoriesListSkeleton } from "@/components/categories/CategoriesListSkeleton";
import { PosPageSkeleton } from "@/components/pos/PosPageSkeleton";
import { SettingsPageSkeleton } from "@/components/settings/SettingsPageSkeleton";
import { AuthPageSkeleton } from "@/components/auth/AuthPageSkeleton";
import { CommonTablePageSkeleton } from "@/components/common/CommonTablePageSkeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";

describe("Page Skeletons & Animated Elements", () => {
  it("renders PermissionsPageSkeleton with shimmer wave placeholders", () => {
    render(<PermissionsPageSkeleton />);
    const skeletonContainer = screen.getByTestId("permissions-page-skeleton");
    expect(skeletonContainer).toBeDefined();

    // Verify shimmer keyframe classes are attached
    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(10);
  });

  it("renders RolesPageSkeleton with table and metric cards shimmer placeholders", () => {
    render(<RolesPageSkeleton />);
    const skeletonContainer = screen.getByTestId("roles-page-skeleton");
    expect(skeletonContainer).toBeDefined();

    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(10);
  });

  it("renders BrandsListSkeleton with card grid shimmer placeholders", () => {
    render(<BrandsListSkeleton />);
    const skeletonContainer = screen.getByTestId("brands-list-skeleton");
    expect(skeletonContainer).toBeDefined();
    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(10);
  });

  it("renders CategoriesListSkeleton with shimmer and respects SkeletonProps animation", () => {
    const { rerender } = render(<CategoriesListSkeleton />);
    const skeletonContainer = screen.getByTestId("categories-list-skeleton");
    expect(skeletonContainer).toBeDefined();

    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(10);

    // Test SkeletonProps custom animation (pulse)
    rerender(<CategoriesListSkeleton animation="pulse" />);
    const pulses = skeletonContainer.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBeGreaterThan(10);
  });

  it("renders PosPageSkeleton with product grid and checkout sidebar placeholders", () => {
    render(<PosPageSkeleton />);
    const skeletonContainer = screen.getByTestId("pos-page-skeleton");
    expect(skeletonContainer).toBeDefined();
    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(10);
  });

  it("renders SettingsPageSkeleton with tabs and form placeholders", () => {
    render(<SettingsPageSkeleton />);
    const skeletonContainer = screen.getByTestId("settings-page-skeleton");
    expect(skeletonContainer).toBeDefined();
    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(5);
  });

  it("renders AuthPageSkeleton with auth card placeholder", () => {
    render(<AuthPageSkeleton />);
    const skeletonContainer = screen.getByTestId("auth-page-skeleton");
    expect(skeletonContainer).toBeDefined();
    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(3);
  });

  it("renders CommonTablePageSkeleton with table rows and KPI cards placeholders", () => {
    render(<CommonTablePageSkeleton columns={4} rows={5} showKpis={true} />);
    const skeletonContainer = screen.getByTestId("common-table-page-skeleton");
    expect(skeletonContainer).toBeDefined();
    const shimmers = skeletonContainer.querySelectorAll(".animate-shimmer");
    expect(shimmers.length).toBeGreaterThan(10);
  });

  it("renders AnimatedNumber with skeleton placeholder when loading is true", () => {
    const { container } = render(<AnimatedNumber value={100} loading={true} />);
    const shimmer = container.querySelector(".animate-shimmer");
    expect(shimmer).toBeDefined();
    expect(shimmer).not.toBeNull();
  });

  it("renders AnimatedNumber with numerical value when loading is false", () => {
    render(<AnimatedNumber value={102} loading={false} />);
    expect(screen.getByText("102")).toBeDefined();
  });
});
