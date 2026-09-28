import type { UserDevice, UserSession, LoginAttempt } from "./identity";

export * from "./identity";

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  google_auth_enabled: boolean;
  phone_verified: string;
  email_verified: string;
  last_password_change: string;
}

export interface DeactivateAccountRequest {
  reason?: string;
  password?: string;
}

export interface DeactivateAccountResponse {
  message: string;
}

export interface PurgeSessionsResponse {
  message: string;
  purged_count?: number;
}

export interface DeviceActionResponse {
  message: string;
  device?: UserDevice;
}

// ---------------------------------------------------------------------------
// Email Verification Types
// ---------------------------------------------------------------------------

export interface SendEmailVerificationRequest {
  email: string;
}

export interface SendEmailVerificationResponse {
  message: string;
  sent_to: string | null;
  expires_in_minutes: number;
  expires_at: string;
  verification_url: string;
}

export interface VerifyEmailResponse {
  message?: string;
  [key: string]: unknown;
}

export interface EmailVerificationStatusResponse {
  is_verified: boolean;
  email_verified_at: string | null;
  pending_email?: string | null;
}

export interface RequestEmailChangeResponse {
  message: string;
  pending_email: string;
  expires_in_minutes: number;
  expires_at: string;
  verification_url?: string;
}

export interface ChangeEmailRequest {
  email: string;
}


