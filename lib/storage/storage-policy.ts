/**
 * SmartPOS Storage Policy Configuration
 * Stored strictly in localStorage under key 'smartpos:storage:policy'
 */

import {
  type CacheCategory,
  type CacheRetention,
  type PosStoragePolicy,
} from "./storage-types";

export const STORAGE_POLICY_KEY = "smartpos:storage:policy";

export const DEFAULT_STORAGE_POLICY: PosStoragePolicy = {
  maxCacheBytes: 524288000, // 500 MB
  retention: {
    products: "never",     // Blue icon with Never >
    categories: "never",   // Amber/Orange icon with Never >
    images: "1_month",     // Green icon with 1 month >
    inventory: "1_week",   // Orange icon with 1 week >
    reports: "1_week",     // Pink/Red icon with 1 week >
    receipts: "1_month",   // Purple icon with 1 month >
    api: "1_day",          // Indigo icon with 1 day >
    users: "1_day",        // Users Management
    roles: "1_day",        // Access Control Engine
    permissions: "1_day",  // System Permissions Matrix
    audit: "3_days",       // Security & Forensic Audit Logs
    temp: "1_day",
    other: "1_week",
  },
};


export const MAX_CACHE_SIZE_OPTIONS: Array<{
  label: string;
  bytes: number | null;
}> = [
  { label: "100 MB", bytes: 100 * 1024 * 1024 },
  { label: "250 MB", bytes: 250 * 1024 * 1024 },
  { label: "500 MB", bytes: 500 * 1024 * 1024 },
  { label: "1 GB", bytes: 1024 * 1024 * 1024 },
  { label: "No Limit", bytes: null },
];

export const RETENTION_OPTIONS: Array<{
  value: CacheRetention;
  label: string;
}> = [
  { value: "1_hour", label: "1 hour" },
  { value: "1_day", label: "1 day" },
  { value: "3_days", label: "3 days" },
  { value: "1_week", label: "1 week" },
  { value: "1_month", label: "1 month" },
  { value: "never", label: "Never" },
];

export const CATEGORY_METADATA: Record<
  CacheCategory,
  { name: string; color: string; description: string }
> = {
  products: {
    name: "Products",
    color: "#3b82f6", // Blue (--primary-500)
    description: "Cached product catalog and pricing metadata",
  },
  categories: {
    name: "Categories",
    color: "#FE9F43", // Warm Orange / Amber (--amber-500)
    description: "Cached hierarchical category trees, taxonomy, and subcategories",
  },
  images: {
    name: "Product Images",
    color: "#10b981", // Green (--success-500)
    description: "High-resolution product & barcode media thumbnails",
  },
  inventory: {
    name: "Inventory",
    color: "#f59e0b", // Orange / Amber (--warning-500)
    description: "Cached inventory stock levels & warehouse snapshot",
  },
  reports: {
    name: "Reports",
    color: "#f43f5e", // Pink / Rose (--pink-500 / rose)
    description: "Generated sales reports, daily Z-reports & exports",
  },
  receipts: {
    name: "Receipts",
    color: "#9333ea", // Purple (--purple-600)
    description: "Completed digital receipt templates and previews",
  },
  api: {
    name: "API Cache",
    color: "#6366f1", // Indigo
    description: "Read-only GET endpoint responses and lookups",
  },
  users: {
    name: "Users Management",
    color: "#2563eb", // Corporate Blue (--primary-600)
    description: "Cached user profiles, operators, and staff directory records",
  },
  roles: {
    name: "Access Control Engine",
    color: "#7c3aed", // Violet (--purple-700)
    description: "Cached role definitions and assignable capability rules",
  },
  permissions: {
    name: "System Permissions Matrix",
    color: "#14b8a6", // Teal (--teal-500)
    description: "Cached system permissions matrix and route-level authorization gates",
  },
  audit: {
    name: "Security & Forensic Audit Logs",
    color: "#ef4444", // Crimson Danger (--danger-500)
    description: "Cached security incidents, auth anomalies, and forensic audit logs",
  },
  temp: {
    name: "Temporary Files",
    color: "#64748b", // Slate (--neutral-500)
    description: "Intermediate print spool buffers and session caches",
  },
  other: {
    name: "Other",
    color: "#94a3b8", // Grey (--neutral-400)
    description: "Miscellaneous client buffers and font assets",
  },
};



/**
 * Convert human-readable retention string to milliseconds.
 * Returns null if retention is "never".
 */
export function retentionToMs(retention: CacheRetention): number | null {
  switch (retention) {
    case "1_hour":
      return 60 * 60 * 1000;
    case "1_day":
      return 24 * 60 * 60 * 1000;
    case "3_days":
      return 3 * 24 * 60 * 60 * 1000;
    case "1_week":
      return 7 * 24 * 60 * 60 * 1000;
    case "1_month":
      return 30 * 24 * 60 * 60 * 1000;
    case "never":
      return null;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Retrieve current storage policy from localStorage.
 * Falls back to DEFAULT_STORAGE_POLICY if not yet set or invalid.
 */
export function getStoragePolicy(): PosStoragePolicy {
  if (typeof window === "undefined") {
    return DEFAULT_STORAGE_POLICY;
  }

  try {
    const raw = localStorage.getItem(STORAGE_POLICY_KEY);
    if (!raw) {
      return DEFAULT_STORAGE_POLICY;
    }

    const parsed = JSON.parse(raw);
    return {
      maxCacheBytes:
        parsed.maxCacheBytes !== undefined
          ? parsed.maxCacheBytes
          : DEFAULT_STORAGE_POLICY.maxCacheBytes,
      retention: {
        ...DEFAULT_STORAGE_POLICY.retention,
        ...(parsed.retention || {}),
      },
    };
  } catch (err) {
    console.warn("[StoragePolicy] Failed to read policy from localStorage:", err);
    return DEFAULT_STORAGE_POLICY;
  }
}

/**
 * Save updated storage policy to localStorage.
 */
export function saveStoragePolicy(policy: PosStoragePolicy): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_POLICY_KEY, JSON.stringify(policy));
  } catch (err) {
    console.error("[StoragePolicy] Failed to save policy to localStorage:", err);
  }
}

/**
 * Reset storage policy to system default.
 */
export function resetStoragePolicy(): PosStoragePolicy {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        STORAGE_POLICY_KEY,
        JSON.stringify(DEFAULT_STORAGE_POLICY)
      );
    } catch {
      // ignore
    }
  }
  return DEFAULT_STORAGE_POLICY;
}

export { formatBytes } from "./storage-cache";

