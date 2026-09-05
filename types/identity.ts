/**
 * Types and DTOs for SmartPOS Identity Service
 * OpenAPI Specification: https://smartpos-api.servicefixit.me/docs/identity
 */

export interface Permission {
  id: number;
  uuid: string;
  code: string;
  name: string;
  module: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Role {
  id: number;
  uuid: string;
  business_uuid: string | null;
  name: string;
  code: string;
  is_system: boolean;
  created_at: string | null;
  updated_at: string | null;
  permissions?: Permission[];
}

export type UserStatus = "active" | "inactive" | "blocked";

export interface User {
  id: number;
  uuid: string;
  name: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  status: UserStatus;
  email_verified_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  avatar_url: string;
  roles?: Role[];
  permissions?: Permission[];
}

export interface UserDevice {
  id: number;
  uuid: string;
  user_id: number;
  device_uuid: string;
  device_name: string | null;
  device_type: string | null;
  platform: string | null;
  first_ip_address: string | null;
  last_ip_address: string | null;
  is_trusted: boolean;
  is_blocked: boolean;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserSession {
  id: number;
  uuid: string;
  user_id: number;
  user_device_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  last_activity_at: string | null;
  expires_at: string;
  revoked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface LoginAttempt {
  id: number;
  uuid?: string;
  user_id?: number | null;
  login: string;
  ip_address: string | null;
  user_agent: string | null;
  is_successful: boolean;
  failure_reason?: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Authentication Request & Response DTOs
// ---------------------------------------------------------------------------

export interface LoginRequest {
  login: string;
  password: string;
  device_uuid: string;
  device_name?: string | null;
  device_type?: string | null;
  platform?: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: string;
  refresh_expires_at: string | null;
  user: User;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  password: string;
  password_confirmation: string;
  device_uuid: string;
  device_name?: string | null;
  device_type?: string | null;
  platform?: string | null;
}

export type RegisterResponse = LoginResponse;

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: string;
  refresh_expires_at: string | null;
  roles?: Role[];
  permissions?: Permission[];
}

export interface AuthMeResponse {
  user: User;
  session: {
    uuid: string;
    expires_at: string | null;
    last_activity_at: string | null;
  };
  device: UserDevice | null;
}

// ---------------------------------------------------------------------------
// Password Recovery DTOs
// ---------------------------------------------------------------------------

export interface ForgotPasswordSendCodeRequest {
  email: string;
}

export interface ForgotPasswordSendCodeResponse {
  message: string;
  expires_in?: number;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponse {
  message: string;
  otp_uuid: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp_uuid: string;
  password: string;
  password_confirmation: string;
}

// ---------------------------------------------------------------------------
// User & Role Management DTOs
// ---------------------------------------------------------------------------

export interface StoreUserRequest {
  name: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  status?: UserStatus | null;
  role_code?: string;
  role_uuid?: string;
  business_uuid?: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  password?: string | null;
  status?: UserStatus;
}

export interface StoreRoleRequest {
  name: string;
  code: string;
  business_uuid?: string | null;
  is_system?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  code?: string;
}

export interface ProvisionRolesRequest {
  business_uuid: string;
}

export interface SyncRolePermissionsRequest {
  all?: boolean;
  permission_uuids?: string[];
}

export interface StorePermissionBatchItem {
  code: string;
  name: string;
  module?: string | null;
  description?: string | null;
}

export interface UpdatePermissionRequest {
  name?: string;
  module?: string | null;
  description?: string | null;
}

// ---------------------------------------------------------------------------
// POS Fast-Access PIN DTOs
// ---------------------------------------------------------------------------

export interface SetPosPinRequest {
  business_uuid: string;
  pin: string;
}

export interface SetPosPinResponse {
  message: string;
  data: {
    uuid: string;
    user_uuid: string;
    business_uuid: string;
    is_active: boolean;
  };
}

export interface VerifyPosPinRequest {
  business_uuid: string;
  pin: string;
}

export interface VerifyPosPinResponse {
  message: string;
  data: {
    user_uuid: string;
    business_uuid: string;
  };
}
