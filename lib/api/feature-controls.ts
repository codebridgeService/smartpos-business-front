import { apiClient } from './client';
import {
  FeatureControl,
  FeatureCheckResponse,
  MaintenanceType,
  AnnouncementItem,
} from '@/types/feature-control';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Fast check for a feature status (public or authenticated)
 */
export async function checkFeatureStatus(featureKey: string): Promise<FeatureCheckResponse> {
  try {
    const res = await apiClient.get<ApiResponse<FeatureCheckResponse>>(
      `/feature-controls/check/${featureKey}`
    );
    if (res?.data) return res.data;
  } catch {
    // Fallback if backend service is offline or unconfigured
  }

  // When the bug fix is completed, status is set to 'ACTIVE'
  if (featureKey === 'dashboard.reports') {
    return {
      feature_key: 'dashboard.reports',
      name: 'Dashboard & Reports',
      status: 'ACTIVE', // Fix completed: set back to ACTIVE
      maintenance_type: null,
      reason: null,
      maintenance_started_at: null,
      estimated_completed_at: null,
      show_countdown: false,
      allow_owner_bypass: true,
      allow_admin_bypass: true,
    };
  }

  return {
    feature_key: featureKey,
    name: featureKey,
    status: 'ACTIVE',
    maintenance_type: null,
    reason: null,
    maintenance_started_at: null,
    estimated_completed_at: null,
    show_countdown: false,
    allow_owner_bypass: true,
    allow_admin_bypass: true,
  };
}

/**
 * List all feature controls for the current business
 */
export async function getFeatureControls(params?: {
  status?: string;
  search?: string;
  outlet_uuid?: string;
}): Promise<FeatureControl[]> {
  const queryParams: Record<string, string> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;
  if (params?.outlet_uuid) queryParams.outlet_uuid = params.outlet_uuid;

  const res = await apiClient.get<ApiResponse<FeatureControl[]>>('/feature-controls', {
    params: queryParams,
  });
  return res.data || [];
}

/**
 * Get a single feature control by UUID
 */
export async function getFeatureControl(uuid: string): Promise<FeatureControl> {
  const res = await apiClient.get<ApiResponse<FeatureControl>>(`/feature-controls/${uuid}`);
  return res.data;
}

/**
 * Create a new feature control rule
 */
export async function createFeatureControl(
  data: Partial<FeatureControl> & { business_uuid: string; feature_key: string; name: string }
): Promise<FeatureControl> {
  const res = await apiClient.post<ApiResponse<FeatureControl>>('/feature-controls', data);
  return res.data;
}

/**
 * Update a feature control
 */
export async function updateFeatureControl(
  uuid: string,
  data: Partial<FeatureControl>
): Promise<FeatureControl> {
  const res = await apiClient.put<ApiResponse<FeatureControl>>(`/feature-controls/${uuid}`, data);
  return res.data;
}

/**
 * Delete a feature control rule
 */
export async function deleteFeatureControl(uuid: string): Promise<void> {
  await apiClient.delete(`/feature-controls/${uuid}`);
}

/**
 * Start maintenance mode on a feature
 */
export async function startMaintenance(
  uuid: string,
  data: {
    maintenance_type: MaintenanceType;
    reason: string;
    estimated_completed_at: string;
    show_countdown?: boolean;
  }
): Promise<FeatureControl> {
  const res = await apiClient.post<ApiResponse<FeatureControl>>(
    `/feature-controls/${uuid}/maintenance`,
    data
  );
  return res.data;
}

/**
 * Complete maintenance / activate feature
 */
export async function activateFeature(uuid: string): Promise<FeatureControl> {
  const res = await apiClient.post<ApiResponse<FeatureControl>>(
    `/feature-controls/${uuid}/activate`
  );
  return res.data;
}

/**
 * Disable feature
 */
export async function disableFeature(uuid: string, reason?: string): Promise<FeatureControl> {
  const res = await apiClient.post<ApiResponse<FeatureControl>>(
    `/feature-controls/${uuid}/disable`,
    { reason }
  );
  return res.data;
}

/**
 * Extend maintenance completion time
 */
export async function extendMaintenance(
  uuid: string,
  data: { minutes?: number; new_estimated_completed_at?: string }
): Promise<FeatureControl> {
  const res = await apiClient.post<ApiResponse<FeatureControl>>(
    `/feature-controls/${uuid}/extend`,
    data
  );
  return res.data;
}

/**
 * Restore soft-deleted feature control
 */
export async function restoreFeatureControl(uuid: string): Promise<FeatureControl> {
  const res = await apiClient.post<ApiResponse<FeatureControl>>(
    `/feature-controls/${uuid}/restore`
  );
  return res.data;
}

/* ====================================================================
   Announcements API Client
   ==================================================================== */

/**
 * List all announcements
 */
export async function getAnnouncements(params?: {
  type?: string;
  target_type?: string;
  is_active?: boolean;
}): Promise<AnnouncementItem[]> {
  const queryParams: Record<string, string> = {};
  if (params?.type) queryParams.type = params.type;
  if (params?.target_type) queryParams.target_type = params.target_type;
  if (typeof params?.is_active === 'boolean') queryParams.is_active = String(params.is_active);

  const res = await apiClient.get<ApiResponse<AnnouncementItem[]>>('/announcements', {
    params: queryParams,
  });
  return res.data || [];
}

/**
 * Fetch announcements targeted to current user (Cashier / Staff / Manager / Owner)
 */
export async function getMyAnnouncements(): Promise<AnnouncementItem[]> {
  const res = await apiClient.get<ApiResponse<AnnouncementItem[]>>('/announcements/my');
  return res.data || [];
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(
  data: Partial<AnnouncementItem> & { business_uuid: string; title: string; message: string }
): Promise<AnnouncementItem> {
  const res = await apiClient.post<ApiResponse<AnnouncementItem>>('/announcements', data);
  return res.data;
}

/**
 * Mark announcement as read
 */
export async function markAnnouncementRead(uuid: string): Promise<void> {
  await apiClient.post(`/announcements/${uuid}/read`);
}

/**
 * Acknowledge announcement ("I Understand")
 */
export async function acknowledgeAnnouncement(uuid: string): Promise<void> {
  await apiClient.post(`/announcements/${uuid}/acknowledge`);
}
