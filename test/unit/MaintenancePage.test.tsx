import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaintenancePage } from '@/components/feature-control/MaintenancePage';

describe('MaintenancePage Component', () => {
  it('renders feature name and reason correctly', () => {
    render(
      <MaintenancePage
        featureName="Products Dashboard"
        featureKey="dashboard.products"
        reason="Fixing product loading error"
        maintenanceType="BUG_FIX"
      />
    );

    expect(screen.getByText('Products Dashboard is Temporarily Unavailable')).toBeDefined();
    expect(screen.getByText('Fixing product loading error')).toBeDefined();
    expect(screen.getByText('BUG FIX')).toBeDefined();
    expect(screen.getByText('Under Maintenance')).toBeDefined();
  });

  it('renders live countdown clock when estimated_completed_at is provided', () => {
    const futureTime = new Date(Date.now() + 3600 * 1000 * 2.5).toISOString(); // 2.5 hours in future

    render(
      <MaintenancePage
        featureName="Inventory"
        estimatedCompletedAt={futureTime}
        showCountdown={true}
      />
    );

    expect(screen.getByText('Estimated Remaining Time')).toBeDefined();
    expect(screen.getByText('Hours')).toBeDefined();
    expect(screen.getByText('Minutes')).toBeDefined();
    expect(screen.getByText('Seconds')).toBeDefined();
  });

  it('displays owner bypass banner when user is owner and trigger works', () => {
    const onBypassMock = vi.fn();

    render(
      <MaintenancePage
        featureName="Sales POS"
        isOwner={true}
        onBypass={onBypassMock}
      />
    );

    expect(screen.getByText(/Owner Bypass Active/i)).toBeDefined();
    const bypassButton = screen.getByText(/Enter Feature/i);
    expect(bypassButton).toBeDefined();

    fireEvent.click(bypassButton);
    expect(onBypassMock).toHaveBeenCalledTimes(1);
  });

  it('renders navigation button back to dashboard', () => {
    render(<MaintenancePage featureName="Reports" />);
    const link = screen.getByText('Back to Dashboard');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/admin/dashboard');
  });
});
