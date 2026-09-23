/**
 * Environment configuration helper
 * Centralizes and validates access to environment variables.
 */

const DEFAULT_API_BASE_URL = "https://smartpos-api.servicefixit.me/api/v1";

export const env = {
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, ""),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "SmartPOS Business",
  appEnv: process.env.NEXT_PUBLIC_APP_ENV || "development",
  defaultDeviceType: process.env.NEXT_PUBLIC_DEFAULT_DEVICE_TYPE || "browser",
  defaultPlatform: process.env.NEXT_PUBLIC_DEFAULT_PLATFORM || "web",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
} as const;

/**
 * Returns full API URL for a given relative endpoint path
 * @example getApiUrl('/auth/login') -> 'https://smartpos-api.servicefixit.me/api/v1/auth/login'
 */
export function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || env.apiBaseUrl || DEFAULT_API_BASE_URL;
  const base = baseUrl.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${base}${path}`;
}

