/**
 * Token management and persistence helper.
 * Handles access_token and refresh_token storage with cookie sync for SSR/middleware support.
 */

const ACCESS_TOKEN_KEY = "smartpos_access_token";
const REFRESH_TOKEN_KEY = "smartpos_refresh_token";

/**
 * Cookie helper for client-side cookies
 */
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
    } catch {
      return getCookie(ACCESS_TOKEN_KEY);
    }
  },

  setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {
      // localStorage may fail in private mode
    }
    setCookie(ACCESS_TOKEN_KEY, token, 7);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
    } catch {
      return getCookie(REFRESH_TOKEN_KEY);
    }
  },

  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // localStorage may fail in private mode
    }
    setCookie(REFRESH_TOKEN_KEY, token, 30);
  },

  setTokens(tokens: { access_token: string; refresh_token: string }): void {
    this.setAccessToken(tokens.access_token);
    this.setRefreshToken(tokens.refresh_token);
  },

  clearTokens(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
  },

  hasTokens(): boolean {
    return Boolean(this.getAccessToken() || this.getRefreshToken());
  },
};

/**
 * Event emitter for auth-related events across components
 */
export const authEvents = {
  emitUnauthorized() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("smartpos:unauthorized"));
    }
  },

  onUnauthorized(callback: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => callback();
    window.addEventListener("smartpos:unauthorized", handler);
    return () => window.removeEventListener("smartpos:unauthorized", handler);
  },
};
