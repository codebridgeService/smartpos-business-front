import { apiClient } from "./client";
import { tokenStorage } from "./token";
import type { User } from "@/types";

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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

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
   * Send password reset email
   * Endpoint: POST /auth/forgot-password
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/forgot-password", payload, {
      skipAuth: true,
    });
  },

  /**
   * Reset password with reset token
   * Endpoint: POST /auth/reset-password
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/reset-password", payload, {
      skipAuth: true,
    });
  },
};
