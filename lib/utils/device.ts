import { env } from "@/lib/config/env";

const DEVICE_STORAGE_KEY = "smartpos_device_uuid";

export interface DeviceMetadata {
  device_uuid: string;
  device_name: string;
  device_type: string;
  platform: string;
}

/**
 * Generate a random RFC-compliant UUID (v4)
 */
function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback for environments lacking crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retrieves or initializes the persistent device UUID from localStorage.
 * Safe to call in both browser and server environments (returns a stable fallback on SSR).
 */
export function getOrCreateDeviceUuid(): string {
  if (typeof window === "undefined") {
    return "ssr-device-placeholder";
  }

  try {
    let deviceUuid = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!deviceUuid) {
      deviceUuid = generateUuid();
      localStorage.setItem(DEVICE_STORAGE_KEY, deviceUuid);
    }
    return deviceUuid;
  } catch {
    // If localStorage is blocked by user privacy settings
    return generateUuid();
  }
}

/**
 * Detects the client's operating system platform.
 */
function detectPlatform(): string {
  if (typeof window === "undefined" || !window.navigator) {
    return env.defaultPlatform;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (userAgent.includes("win")) return "Windows";
  if (userAgent.includes("mac") && !userAgent.includes("iphone") && !userAgent.includes("ipad")) return "macOS";
  if (userAgent.includes("linux") && !userAgent.includes("android")) return "Linux";
  if (userAgent.includes("android")) return "Android";
  if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) return "iOS";

  return env.defaultPlatform;
}

/**
 * Detects the device type (mobile, tablet, desktop, or browser).
 */
function detectDeviceType(): string {
  if (typeof window === "undefined" || !window.navigator) {
    return env.defaultDeviceType;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      userAgent
    )
  ) {
    return "mobile";
  }

  return "desktop";
}

/**
 * Detects human-friendly browser name.
 */
function detectBrowser(): string {
  if (typeof window === "undefined" || !window.navigator) {
    return "Browser";
  }

  const ua = window.navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";

  return "Web Browser";
}

/**
 * Returns full device metadata payload required by auth endpoints:
 * - POST /auth/login
 * - POST /auth/register
 */
export function getDeviceInfo(): DeviceMetadata {
  const device_uuid = getOrCreateDeviceUuid();
  const platform = detectPlatform();
  const device_type = detectDeviceType();
  const browser = detectBrowser();
  const device_name = `${browser} on ${platform}`;

  return {
    device_uuid,
    device_name,
    device_type,
    platform,
  };
}
