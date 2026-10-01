import { describe, it, expect, vi, beforeEach } from 'vitest';
import { securityEventsApi } from '@/lib/api/security-events';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Security Events API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists paginated security events with query parameters', async () => {
    const mockPaginator = {
      current_page: 1,
      data: [
        {
          id: 38,
          uuid: '057cb6b2-fd35-49f9-ad98-08b423cab904',
          user_uuid: '78e99ac2-5524-40c3-a0cb-57b42b325ff4',
          event_type: 'LOGIN_SUCCESS',
          severity: 'low',
          ip_address: '187.14.114.26',
        },
      ],
      first_page_url: 'http://api.test/api/v1/security-events?page=1',
      from: 1,
      last_page: 2,
      last_page_url: 'http://api.test/api/v1/security-events?page=2',
      links: [],
      next_page_url: 'http://api.test/api/v1/security-events?page=2',
      path: 'http://api.test/api/v1/security-events',
      per_page: 25,
      prev_page_url: null,
      to: 25,
      total: 38,
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockPaginator);

    const result = await securityEventsApi.getSecurityEvents({
      page: 1,
      per_page: 25,
      severity: 'low',
      event_type: 'LOGIN_SUCCESS',
    });

    expect(apiClient.get).toHaveBeenCalledWith('/security-events', {
      params: {
        page: 1,
        per_page: 25,
        severity: 'low',
        event_type: 'LOGIN_SUCCESS',
      },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].uuid).toBe('057cb6b2-fd35-49f9-ad98-08b423cab904');
    expect(result.total).toBe(38);
  });

  it('retrieves single security event details by UUID', async () => {
    const mockEvent = {
      id: 36,
      uuid: 'ce0deb40-58a5-4855-930b-53e6787bb038',
      event_type: 'UNAUTHORIZED_ROLE_DELEGATION_ATTEMPT',
      severity: 'critical',
      metadata: { attempted_role: 'owner' },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockEvent,
    });

    const result = await securityEventsApi.getSecurityEvent('ce0deb40-58a5-4855-930b-53e6787bb038');

    expect(apiClient.get).toHaveBeenCalledWith('/security-events/ce0deb40-58a5-4855-930b-53e6787bb038');
    expect(result.event_type).toBe('UNAUTHORIZED_ROLE_DELEGATION_ATTEMPT');
    expect(result.severity).toBe('critical');
  });
});
