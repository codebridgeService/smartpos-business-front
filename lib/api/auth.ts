import { apiClient } from "./client";
import { tokenStorage } from "./token";
import type {
  User,
  ForgotPasswordSendCodeRequest,
  ForgotPasswordSendCodeResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
  ResetPasswordRequest,
} from "@/types";

export interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password?: string;
  pin_code?: string;
  device_name?: string;
  device_type?: string;
  platform?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone_number?: string;
  password?: string;
  password_confirmation?: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token?: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: string;
  };
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: string;
}

export type ForgotPasswordPayload = ForgotPasswordSendCodeRequest;

export type ResetPasswordPayload = ResetPasswordRequest | {
  email: string;
  token?: string;
  otp_uuid?: string;
  password: string;
  password_confirmation: string;
};

export const authApi = {
  /**
   * Log in user with credentials and device metadata
   * Endpoint: POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials, {
      skipAuth: true,
    });

    const accessToken = response.access_token || response.token?.access_token;
    const refreshToken = response.refresh_token || response.token?.refresh_token;

    if (accessToken && refreshToken) {
      tokenStorage.setTokens({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    if (response.user?.roles) {
      const roles = Array.isArray(response.user.roles)
        ? response.user.roles.map((r: any) => typeof r === "string" ? r : r.code || r.name || "")
        : [];
      tokenStorage.setUserRoles(roles.filter(Boolean));
    }

    return response;
  },

  /**
   * Register a new user
   * Endpoint: POST /auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", payload, {
      skipAuth: true,
    });

    const accessToken = response.access_token || response.token?.access_token;
    const refreshToken = response.refresh_token || response.token?.refresh_token;

    if (accessToken && refreshToken) {
      tokenStorage.setTokens({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    if (response.user?.roles) {
      const roles = Array.isArray(response.user.roles)
        ? response.user.roles.map((r: any) => typeof r === "string" ? r : r.code || r.name || "")
        : [];
      tokenStorage.setUserRoles(roles.filter(Boolean));
    }

    return response;
  },

  /**
   * Get current authenticated user profile
   * Endpoint: GET /auth/me
   */
  async getMe(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>("/auth/me");
  },

  /**
   * Terminate current session and invalidate tokens
   * Endpoint: POST /auth/logout
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>("/auth/logout");
      return response;
    } finally {
      tokenStorage.clearTokens();
    }
  },

  /**
   * Send forgot-password OTP verification code to email
   * Endpoint: POST /auth/forgot-password/send-code
   */
  async sendForgotPasswordCode(
    payload: ForgotPasswordSendCodeRequest
  ): Promise<ForgotPasswordSendCodeResponse> {
    return apiClient.post<ForgotPasswordSendCodeResponse>(
      "/auth/forgot-password/send-code",
      payload,
      { skipAuth: true }
    );
  },

  /**
   * Alias for sendForgotPasswordCode
   */
  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<ForgotPasswordSendCodeResponse> {
    return this.sendForgotPasswordCode(payload);
  },

  /**
   * Verify forgot-password OTP verification code
   * Endpoint: POST /auth/verify-reset-code
   */
  async verifyResetCode(
    payload: VerifyResetCodeRequest
  ): Promise<VerifyResetCodeResponse> {
    return apiClient.post<VerifyResetCodeResponse>(
      "/auth/verify-reset-code",
      payload,
      { skipAuth: true }
    );
  },

  /**
   * Reset password with verified OTP
   * Endpoint: POST /auth/reset-password
   */
  async resetPassword(
    payload: ResetPasswordPayload
  ): Promise<{ message: string }> {
    const otpUuid =
      "otp_uuid" in payload && payload.otp_uuid
        ? payload.otp_uuid
        : "token" in payload
        ? (payload as any).token
        : "";

    const body: ResetPasswordRequest = {
      email: payload.email,
      otp_uuid: otpUuid,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    };

    return apiClient.post<{ message: string }>("/auth/reset-password", body, {
      skipAuth: true,
    });
  },
};
