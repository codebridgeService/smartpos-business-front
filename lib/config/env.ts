/**
 * Environment configuration helper
 * Centralizes and validates access to environment variables.
 */

export const env = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://smartpos-api.servicefixit.me/api/v1",
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
  const base = env.apiBaseUrl.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}
