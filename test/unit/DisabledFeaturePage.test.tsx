import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisabledFeaturePage } from '@/components/feature-control/DisabledFeaturePage';

describe('DisabledFeaturePage Component', () => {
  it('renders disabled status, title, and reason', () => {
    render(
      <DisabledFeaturePage
        featureName="Product Import"
        featureKey="product.import"
        reason="Temporarily disabled by system admin"
      />
    );

    expect(screen.getByText('Feature Disabled')).toBeDefined();
    expect(screen.getByText('Product Import is Currently Disabled')).toBeDefined();
    expect(screen.getByText('Temporarily disabled by system admin')).toBeDefined();
    expect(screen.getByText('product.import')).toBeDefined();
  });

  it('triggers refresh callback when Check Again button is clicked', () => {
    const onRefreshMock = vi.fn();
    render(
      <DisabledFeaturePage
        featureName="Product Import"
        onRefresh={onRefreshMock}
      />
    );

    const refreshBtn = screen.getByText('Check Again');
    fireEvent.click(refreshBtn);
    expect(onRefreshMock).toHaveBeenCalledTimes(1);
  });
});
