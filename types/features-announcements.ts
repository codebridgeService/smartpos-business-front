/**
 * Types for Feature Controls and System Announcements
 */

export type FeatureStatus = "active" | "coming_soon" | "maintenance" | "disabled";

export type FeatureModule =
  | "Inventory"
  | "POS & Registers"
  | "Operations & Store"
  | "System & Governance"
  | "Billing & SaaS";

export interface FeatureControl {
  id: string;
  slug: string;
  name: string;
  description: string;
  module: FeatureModule;
  status: FeatureStatus;
  is_enabled: boolean;
  announcement_id?: string | null;
  allowed_roles?: string[];
  updated_at: string;
}

export type AnnouncementType = "maintenance" | "update" | "feature" | "alert" | "info";
export type AnnouncementPriority = "urgent" | "normal" | "low";
export type TargetAudience = "all" | "role" | "users";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  published_at: string;
  expires_at: string | null;
  is_active: boolean;
  target_audience: TargetAudience;
  target_roles?: string[];
  created_at: string;
  reads_count: number;
}

export interface AnnouncementUser {
  announcement_id: string;
  user_uuid: string;
  user_name?: string;
  user_role?: string;
}

export interface AnnouncementRead {
  announcement_id: string;
  user_uuid: string;
  user_name: string;
  user_role?: string;
  read_at: string;
}
