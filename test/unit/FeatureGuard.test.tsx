import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FeatureGuard, ActionGuard } from '@/components/feature-control/FeatureGuard';
import * as featureApi from '@/lib/api/feature-controls';

vi.mock('@/lib/api/feature-controls', () => ({
  checkFeatureStatus: vi.fn(),
}));

describe('FeatureGuard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when feature is ACTIVE', async () => {
    vi.mocked(featureApi.checkFeatureStatus).mockResolvedValueOnce({
      feature_key: 'dashboard.products',
      name: 'Products Dashboard',
      status: 'ACTIVE',
      show_countdown: false,
      allow_owner_bypass: true,
      allow_admin_bypass: true,
    });

    render(
      <FeatureGuard featureKey="dashboard.products">
        <div data-testid="protected-content">Products Content Loaded</div>
      </FeatureGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeDefined();
    });
  });

  it('renders MaintenancePage when feature is MAINTENANCE', async () => {
    vi.mocked(featureApi.checkFeatureStatus).mockResolvedValueOnce({
      feature_key: 'dashboard.products',
      name: 'Products Dashboard',
      status: 'MAINTENANCE',
      maintenance_type: 'BUG_FIX',
      reason: 'Fixing product table index',
      estimated_completed_at: new Date(Date.now() + 1800000).toISOString(),
      show_countdown: true,
      allow_owner_bypass: true,
      allow_admin_bypass: true,
    });

    render(
      <FeatureGuard featureKey="dashboard.products">
        <div data-testid="protected-content">Products Content</div>
      </FeatureGuard>
    );

    await waitFor(() => {
      expect(screen.getByText(/Products Dashboard is Temporarily Unavailable/i)).toBeDefined();
      expect(screen.queryByTestId('protected-content')).toBeNull();
    });
  });

  it('renders DisabledFeaturePage when feature is DISABLED', async () => {
    vi.mocked(featureApi.checkFeatureStatus).mockResolvedValueOnce({
      feature_key: 'sales.refund',
      name: 'Sales Refund',
      status: 'DISABLED',
      reason: 'Refund policy under review',
      show_countdown: false,
      allow_owner_bypass: false,
      allow_admin_bypass: false,
    });

    render(
      <FeatureGuard featureKey="sales.refund">
        <div data-testid="refund-form">Refund Form</div>
      </FeatureGuard>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sales Refund is Currently Disabled/i)).toBeDefined();
      expect(screen.queryByTestId('refund-form')).toBeNull();
    });
  });
});

describe('ActionGuard Component', () => {
  it('disables button when action is in MAINTENANCE', async () => {
    vi.mocked(featureApi.checkFeatureStatus).mockResolvedValueOnce({
      feature_key: 'product.create',
      name: 'Create Product',
      status: 'MAINTENANCE',
      reason: 'Product onboarding update in progress',
      show_countdown: true,
      allow_owner_bypass: true,
      allow_admin_bypass: true,
    });

    render(
      <ActionGuard featureKey="product.create">
        <button data-testid="create-btn">Create Product</button>
      </ActionGuard>
    );

    await waitFor(() => {
      const btn = screen.getByTestId('create-btn') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('title')).toContain('Product onboarding update in progress');
    });
  });
});
