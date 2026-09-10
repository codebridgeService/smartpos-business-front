/**
 * SmartPOS Feature Control & Maintenance System Types
 */

export type FeatureStatus = 'ACTIVE' | 'SCHEDULED' | 'MAINTENANCE' | 'DISABLED';

export type MaintenanceType =
  | 'BUG_FIX'
  | 'CODE_UPDATE'
  | 'SOFTWARE_UPDATE'
  | 'DATABASE_UPDATE'
  | 'SECURITY_UPDATE'
  | 'SERVER_MAINTENANCE'
  | 'OTHER';

export interface FeatureControl {
  id: number;
  uuid: string;
  business_uuid: string;
  outlet_uuid?: string | null;
  feature_key: string;
  name: string;
  description?: string | null;
  service?: string | null;
  route?: string | null;
  status: FeatureStatus;
  reason?: string | null;
  maintenance_type?: MaintenanceType | null;
  maintenance_started_at?: string | null;
  estimated_completed_at?: string | null;
  completed_at?: string | null;
  show_countdown: boolean;
  allow_owner_bypass: boolean;
  allow_admin_bypass: boolean;
  created_by_uuid?: string | null;
  updated_by_uuid?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureCheckResponse {
  feature_key: string;
  name: string;
  status: FeatureStatus;
  maintenance_type?: MaintenanceType | null;
  reason?: string | null;
  maintenance_started_at?: string | null;
  estimated_completed_at?: string | null;
  show_countdown: boolean;
  allow_owner_bypass: boolean;
  allow_admin_bypass: boolean;
}

export type AnnouncementType = 'INFO' | 'WARNING' | 'MAINTENANCE' | 'UPDATE' | 'URGENT';
export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type AnnouncementTargetType =
  | 'ALL'
  | 'CASHIERS'
  | 'STAFF'
  | 'MANAGERS'
  | 'OWNERS'
  | 'OUTLET'
  | 'SPECIFIC_USERS';

export interface AnnouncementItem {
  id?: number;
  uuid: string;
  business_uuid: string;
  outlet_uuid?: string | null;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  target_type: AnnouncementTargetType;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  reads_count?: number;
  has_read?: boolean;
  read_at?: string | null;
  has_acknowledged?: boolean;
  acknowledged_at?: string | null;
}
