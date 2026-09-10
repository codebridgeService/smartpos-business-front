import { describe, it, expect, vi } from 'vitest';
import { checkFeatureStatus } from '@/lib/api/feature-controls';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Feature Controls API Client', () => {
  it('returns API response data on successful check', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: {
        feature_key: 'dashboard.products',
        name: 'Products Dashboard',
        status: 'MAINTENANCE',
        maintenance_type: 'BUG_FIX',
        reason: 'Fixing bug',
        show_countdown: true,
      },
    });

    const result = await checkFeatureStatus('dashboard.products');
    expect(result.feature_key).toBe('dashboard.products');
    expect(result.status).toBe('MAINTENANCE');
    expect(result.maintenance_type).toBe('BUG_FIX');
  });

  it('gracefully falls back to ACTIVE when request fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await checkFeatureStatus('dashboard.inventory');
    expect(result.feature_key).toBe('dashboard.inventory');
    expect(result.status).toBe('ACTIVE');
    expect(result.allow_owner_bypass).toBe(true);
  });
});
