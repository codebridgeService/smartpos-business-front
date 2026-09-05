"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { apiClient, tokenStorage, authEvents } from "@/lib/api";
import { getDeviceInfo } from "@/lib/utils/device";
import type {
  User,
  UserDevice,
  UserSession,
  AuthMeResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types";

export type LoginCredentials = Pick<LoginRequest, "login" | "password">;
export type RegisterPayload = Omit<
  RegisterRequest,
  "device_uuid" | "device_name" | "device_type" | "platform"
>;

interface AuthContextType {
  user: User | null;
  session: UserSession | AuthMeResponse["session"] | null;
  device: UserDevice | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | AuthMeResponse["session"] | null>(null);
  const [device, setDevice] = useState<UserDevice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    if (!tokenStorage.hasTokens()) {
      setUser(null);
      setSession(null);
      setDevice(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.get<AuthMeResponse>("/auth/me");
      setUser(res.user);
      setSession(res.session);
      setDevice(res.device);
    } catch {
      // If /auth/me fails even after refresh attempt
      tokenStorage.clearTokens();
      setUser(null);
      setSession(null);
      setDevice(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const deviceInfo = getDeviceInfo();
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        {
          login: credentials.login,
          password: credentials.password,
          ...deviceInfo,
        },
        { skipAuth: true }
      );

      tokenStorage.setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      setUser(response.user);
      // Asynchronously load session details in background
      void refreshUser();

      return response;
    },
    [refreshUser]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<RegisterResponse> => {
      const deviceInfo = getDeviceInfo();
      const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        {
          ...payload,
          ...deviceInfo,
        },
        { skipAuth: true }
      );

      tokenStorage.setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      setUser(response.user);
      void refreshUser();

      return response;
    },
    [refreshUser]
  );

  const logout = useCallback(async (): Promise<void> => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // Suppress errors during logout
      }
    }

    tokenStorage.clearTokens();
    setUser(null);
    setSession(null);
    setDevice(null);
  }, []);

  // Listen to unauthorized events from API client
  useEffect(() => {
    const unsubscribe = authEvents.onUnauthorized(() => {
      tokenStorage.clearTokens();
      setUser(null);
      setSession(null);
      setDevice(null);
    });

    return unsubscribe;
  }, []);

  // Initial authentication check on application mount
  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      session,
      device,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, session, device, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
