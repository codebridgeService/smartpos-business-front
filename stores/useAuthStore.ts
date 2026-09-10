import { create } from "zustand";
import type { User, Role, Permission, AuthMeResponse } from "@/types";
import { tokenStorage } from "@/lib/api/token";
import { apiClient } from "@/lib/api";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeBusinessId: string | null;
  activeOutletId: string | null;

  // Actions
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setActiveBusinessId: (id: string | null) => void;
  setActiveOutletId: (id: string | null) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;

  // Computed / Helper selectors
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  activeBusinessId: null,
  activeOutletId: null,

  setAuth: (user, token) => {
    tokenStorage.setAccessToken(token);
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  setToken: (token) => {
    if (token) {
      tokenStorage.setAccessToken(token);
    } else {
      tokenStorage.clearTokens();
    }
    set({
      token,
      isAuthenticated: !!token,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setActiveBusinessId: (activeBusinessId) => set({ activeBusinessId }),

  setActiveOutletId: (activeOutletId) => set({ activeOutletId }),

  clearAuth: () => {
    tokenStorage.clearTokens();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      activeBusinessId: null,
      activeOutletId: null,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    if (!tokenStorage.hasTokens()) {
      get().clearAuth();
      return false;
    }

    set({ isLoading: true });
    try {
      const res = await apiClient.get<AuthMeResponse>("/auth/me");
      if (res && res.user) {
        const token = tokenStorage.getAccessToken();
        set({
          user: res.user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      get().clearAuth();
      return false;
    } catch {
      get().clearAuth();
      return false;
    }
  },

  hasRole: (role) => {
    const user = get().user;
    if (!user || !user.roles) return false;
    const userRoleCodes = user.roles.map((r: Role) => r.code.toLowerCase());
    if (Array.isArray(role)) {
      return role.some((r) => userRoleCodes.includes(r.toLowerCase()));
    }
    return userRoleCodes.includes(role.toLowerCase());
  },

  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;

    // Direct permissions on user
    const directPerms = (user.permissions || []).map((p: Permission) => p.code.toLowerCase());

    // Permissions aggregated via roles
    const rolePerms = (user.roles || []).flatMap((r: Role) =>
      (r.permissions || []).map((p: Permission) => p.code.toLowerCase())
    );

    const allPerms = new Set([...directPerms, ...rolePerms]);

    if (Array.isArray(permission)) {
      return permission.some((p) => allPerms.has(p.toLowerCase()));
    }
    return allPerms.has(permission.toLowerCase());
  },
}));
