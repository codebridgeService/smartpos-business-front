/**
 * SmartPOS Telegram-Style Storage & Cache System
 * Type definitions for Cache Storage, IndexedDB, and localStorage policies.
 */

export type CacheCategory =
  | "products"
  | "images"
  | "inventory"
  | "reports"
  | "receipts"
  | "api"
  | "users"
  | "roles"
  | "permissions"
  | "audit"
  | "temp"
  | "other";

export type CacheRetention =
  | "1_hour"
  | "1_day"
  | "3_days"
  | "1_week"
  | "1_month"
  | "never";

export interface CacheCategoryUsage {
  key: CacheCategory;
  name: string;
  bytes: number;
  percentage: number;
  itemCount: number;
  color: string;
  description?: string;
}

export interface StorageUsage {
  totalBytes: number;
  originUsageBytes: number;
  originQuotaBytes: number;
  diskUsagePercentage: number;
  categories: CacheCategoryUsage[];
}

export interface PosStoragePolicy {
  maxCacheBytes: number | null; // null represents "No Limit"
  retention: {
    products: CacheRetention;
    images: CacheRetention;
    inventory: CacheRetention;
    reports: CacheRetention;
    receipts: CacheRetention;
    api: CacheRetention;
    users?: CacheRetention;
    roles?: CacheRetention;
    permissions?: CacheRetention;
    audit?: CacheRetention;
    temp: CacheRetention;
    other?: CacheRetention;
  };
}


export interface CacheMetadataRecord {
  id?: number;
  cache_key: string;
  category: CacheCategory;
  size_bytes: number;
  cached_at: number;
  last_accessed_at: number;
  expires_at: number | null;
  content_type?: string;
  storage_target?: "cache_storage" | "indexed_db" | "both";
}

export interface OfflineDataStatus {
  pendingSalesCount: number;
  pendingPaymentsCount: number;
  syncQueueCount: number;
  isProtected: boolean;
}

export interface ClearCacheResult {
  success: boolean;
  clearedBytes: number;
  clearedItemsCount: number;
  clearedCategories: CacheCategory[];
  protectedSkipped: boolean;
}

export interface CleanupResult {
  expiredFreedBytes: number;
  expiredCount: number;
  limitFreedBytes: number;
  limitEvictedCount: number;
  totalFreedBytes: number;
}
