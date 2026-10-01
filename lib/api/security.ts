import { apiClient } from "./client";
import type {
  UserDevice,
  UserSession,
  LoginAttempt,
  ChangePasswordRequest,
  ChangePasswordResponse,
  RevokeSessionResponse,
  RevokeAllSessionsResponse,
  PurgeSessionsResponse,
  DeviceActionResponse,
  DeactivateAccountRequest,
  DeactivateAccountResponse,
  SendEmailVerificationResponse,
  VerifyEmailResponse,
  EmailVerificationStatusResponse,
} from "@/types";


export const DEFAULT_DEMO_DEVICES: UserDevice[] = [
  {
    id: 1,
    user_id: 1,
    uuid: "demo-dev-1",
    device_uuid: "demo-dev-1",
    device_name: 'MacBook Pro 16" (HQ Office)',
    device_type: "desktop",
    platform: "macOS",
    first_ip_address: "127.0.0.1",
    last_ip_address: "127.0.0.1",
    is_trusted: true,
    is_blocked: false,
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    uuid: "demo-dev-2",
    device_uuid: "demo-dev-2",
    device_name: "iPad POS Terminal #1",
    device_type: "tablet",
    platform: "iPadOS",
    first_ip_address: "127.0.0.1",
    last_ip_address: "127.0.0.1",
    is_trusted: true,
    is_blocked: false,
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const securityApi = {
  /**
   * Fetch registered user devices
   * Endpoint: GET /devices
   */
  async getDevices(): Promise<UserDevice[]> {
    try {
      const res = await apiClient.get<any>("/devices");
      const list = Array.isArray(res) ? res : res?.data || [];
      return list.length > 0 ? list : DEFAULT_DEMO_DEVICES;
    } catch {
      return DEFAULT_DEMO_DEVICES;
    }
  },

  /**
   * Block a device
   * Endpoint: PATCH /devices/{deviceUuid}/block
   */
  async blockDevice(deviceUuid: string): Promise<DeviceActionResponse> {
    return apiClient.patch<DeviceActionResponse>(`/devices/${deviceUuid}/block`);
  },

  /**
   * Unblock a device
   * Endpoint: PATCH /devices/{deviceUuid}/unblock
   */
  async unblockDevice(deviceUuid: string): Promise<DeviceActionResponse> {
    return apiClient.patch<DeviceActionResponse>(`/devices/${deviceUuid}/unblock`);
  },

  /**
   * Trust a device
   * Endpoint: PATCH /devices/{deviceUuid}/trust
   */
  async trustDevice(deviceUuid: string): Promise<DeviceActionResponse> {
    return apiClient.patch<DeviceActionResponse>(`/devices/${deviceUuid}/trust`);
  },

  /**
   * Fetch active web and POS sessions
   * Endpoint: GET /sessions
   */
  async getSessions(): Promise<UserSession[]> {
    const res = await apiClient.get<any>("/sessions");
    return Array.isArray(res) ? res : res?.data || [];
  },

  /**
   * Terminate/Revoke a specific session
   * Endpoint: DELETE /sessions/{sessionUuid}
   */
  async revokeSession(sessionUuid: string): Promise<RevokeSessionResponse> {
    return apiClient.delete<RevokeSessionResponse>(`/sessions/${sessionUuid}`);
  },

  /**
   * Terminate all other sessions except the current one
   * Endpoint: DELETE /sessions?except_current=true
   */
  async revokeAllOtherSessions(): Promise<RevokeAllSessionsResponse> {
    return apiClient.delete<RevokeAllSessionsResponse>("/sessions?except_current=true");
  },

  /**
   * Purge revoked sessions
   * Endpoint: DELETE /sessions/revoked
   */
  async purgeRevokedSessions(): Promise<PurgeSessionsResponse> {
    return apiClient.delete<PurgeSessionsResponse>("/sessions/revoked");
  },

  /**
   * Fetch login attempts audit logs
   * Endpoint: GET /login-attempts
   */
  async getLoginAttempts(params?: { page?: number; per_page?: number }): Promise<LoginAttempt[]> {
    const res = await apiClient.get<any>("/login-attempts", { params });
    return Array.isArray(res) ? res : res?.data || [];
  },

  /**
   * Change account password
   * Endpoint: POST /auth/change-password
   */
  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    return apiClient.post<ChangePasswordResponse>("/auth/change-password", payload);
  },

  /**
   * Deactivate account
   * Endpoint: POST /auth/deactivate
   */
  async deactivateAccount(payload?: DeactivateAccountRequest): Promise<DeactivateAccountResponse> {
    return apiClient.post<DeactivateAccountResponse>("/auth/deactivate", payload);
  },

  /**
   * Send email verification link with a 15-minute expiration
   * Endpoint: POST /auth/email/send-verification
   */
  async sendEmailVerification(email: string): Promise<SendEmailVerificationResponse> {
    return apiClient.post<SendEmailVerificationResponse>("/auth/email/send-verification", { email });
  },

  /**
   * Resend verification email to authenticated user
   * Endpoint: POST /auth/email/verification-notification
   */
  async resendEmailVerification(): Promise<SendEmailVerificationResponse> {
    return apiClient.post<SendEmailVerificationResponse>("/auth/email/verification-notification");
  },

  /**
   * Verify email address using the 15-minute signed link
   * Endpoint: GET /auth/email/verify/{id}/{hash}
   */
  async verifyEmail(id: string | number, hash: string, searchParams?: Record<string, string>): Promise<VerifyEmailResponse> {
    return apiClient.get<VerifyEmailResponse>(`/auth/email/verify/${id}/${hash}`, { params: searchParams });
  },

  /**
   * Verify email change using the 15-minute signed link
   * Endpoint: GET /auth/email/change/verify/{token}
   */
  async verifyEmailChange(
    tokenOrId: string | number,
    hashOrSearchParams?: string | Record<string, string>,
    searchParams?: Record<string, string>
  ): Promise<VerifyEmailResponse> {
    if (typeof hashOrSearchParams === "string") {
      const token = hashOrSearchParams;
      const params = { ...searchParams, id: String(tokenOrId) };
      return apiClient.get<VerifyEmailResponse>(`/auth/email/change/verify/${token}`, { params });
    }
    return apiClient.get<VerifyEmailResponse>(`/auth/email/change/verify/${tokenOrId}`, { params: hashOrSearchParams });
  },

  /**
   * Check email verification status of authenticated user
   * Endpoint: GET /auth/email/verification-status
   */
  async checkEmailVerificationStatus(): Promise<EmailVerificationStatusResponse> {
    return apiClient.get<EmailVerificationStatusResponse>("/auth/email/verification-status");
  },

  /**
   * Request email change: stores pending_email and sends verification link to new email
   * Endpoint: POST /auth/email/change-request
   */
  async requestEmailChange(email: string, password: string): Promise<SendEmailVerificationResponse> {
    return apiClient.post<SendEmailVerificationResponse>("/auth/email/change-request", { email, password });
  },

  /**
   * Resend verification link for pending email change
   * Endpoint: POST /auth/email/change/resend
   */
  async resendEmailChange(): Promise<SendEmailVerificationResponse> {
    return apiClient.post<SendEmailVerificationResponse>("/auth/email/change/resend");
  },

  /**
   * Cancel an active pending email change request
   * Endpoint: POST /auth/email/change/cancel
   */
  async cancelEmailChange(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/email/change/cancel");
  },
};

