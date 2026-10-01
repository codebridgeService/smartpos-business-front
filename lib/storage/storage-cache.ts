/**
 * SmartPOS Client-Side Safe localStorage Cache Management Service
 *
 * Implements safe, isolated cache storage for transient API and UI datasets
 * (products, categories, brands, settings, images, API responses) with
 * automatic TTL (2-minute default) and protection against clearing
 * sensitive credentials, device UUIDs, or offline sync queues.
 */

export const CACHE_PREFIX = "smartpos:cache";
export const CACHE_VERSION = "v1";

/**
 * Default Time-To-Live: 2 minutes (120 seconds) as per SmartPOS brief
 */
export const DEFAULT_CACHE_TTL_SECONDS = 120;

/**
 * Approved whitelist of cache keys
 */
export const CACHE_KEYS = [
  "smartpos:cache:users",
  "smartpos:cache:roles",
  "smartpos:cache:permissions",
  "smartpos:cache:security-events",
  "smartpos:cache:companies",
  "smartpos:cache:products",
  "smartpos:cache:categories",
  "smartpos:cache:brands",
  "smartpos:cache:business-settings",
  "smartpos:cache:api",
  "smartpos:cache:images",
  "smartpos:cache:react-query",
  "smartpos_system_changelogs_cache",
  "smartpos_announcements",
  "smartpos_feature_controls",
  "smartpos_announcement_reads",
] as const;

export type PredefinedCacheKey = (typeof CACHE_KEYS)[number];

/**
 * Protected key patterns that must NEVER be deleted by cache clearing
 */
export const PROTECTED_KEY_PATTERNS = [
  /^smartpos:device_uuid/,
  /^smartpos_device_uuid/,
  /^smartpos_active_business_uuid/,
  /^smartpos_active_outlet_uuid/,
  /^smartpos:user_preferences/,
  /^smartpos:auth_metadata/,
  /^smartpos:offline_settings/,
  /^smartpos_access_token/,
  /^smartpos_refresh_token/,
  /^smartpos_user_roles/,
  /^smartpos_theme/,
  /^smartpos_layout_customizer/,
  /^smartpos_customizer_settings/,
  /^adminRolesZoom/,
  /^outlets_view_mode/,
  /^smartpos:storage:policy/,
  /^smartpos:sync:/,
  /^smartpos:last_sync/,
  /^smartpos:sync_queue/,
  /^smartpos:pending_sales/,
];

export interface CacheEnvelope<T> {
  value: T;
  cached_at: number;
  expires_at: number | null;
  version?: string;
}

export interface CacheEntryMetadata {
  key: string;
  label: string;
  exists: boolean;
  sizeBytes: number;
  cachedAt: number | null;
  expiresAt: number | null;
  isExpired: boolean;
  ttlRemainingSeconds: number | null;
}

export interface CacheClearResult {
  success: boolean;
  deleted: number;
  deletedKeys: string[];
}

export interface CacheStats {
  engineStatus: "Active / Operational" | "Unavailable";
  storageEngine: "Browser localStorage";
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  totalSizeBytes: number;
  formattedSize: string;
  entries: CacheEntryMetadata[];
}

export const HUMAN_LABELS: Record<string, string> = {
  "smartpos:cache:users": "Users Management Cache",
  "smartpos:cache:roles": "Access Control Engine (Roles) Cache",
  "smartpos:cache:permissions": "System Permissions Matrix Cache",
  "smartpos:cache:security-events": "Security & Forensic Audit Logs Cache",
  "smartpos:cache:companies": "Companies Management Cache",
  "smartpos:cache:products": "Product Cache",
  "smartpos:cache:categories": "Category Cache",
  "smartpos:cache:brands": "Brand Cache",
  "smartpos:cache:business-settings": "Business Settings Cache",
  "smartpos:cache:api": "API Response Cache",
  "smartpos:cache:images": "Image Metadata Cache",
  "smartpos_system_changelogs_cache": "System Changelogs Cache",
  "smartpos_announcements": "System Announcements Cache",
  "smartpos_feature_controls": "Feature Controls Cache",
  "smartpos_announcement_reads": "Announcement Read State",
};

/**
 * Checks if a key is a safe SmartPOS cache key
 */
export function isSafeCacheKey(key: string): boolean {
  // Check if it matches any protected pattern - NEVER clear protected keys
  for (const pattern of PROTECTED_KEY_PATTERNS) {
    if (pattern.test(key)) return false;
  }

  // Whitelisted standalone cache keys
  if (
    key === "smartpos_system_changelogs_cache" ||
    key === "smartpos_announcements" ||
    key === "smartpos_feature_controls" ||
    key === "smartpos_announcement_reads"
  ) {
    return true;
  }

  // Check if it starts with the safe cache prefix or is in CACHE_KEYS
  return key.startsWith(CACHE_PREFIX) || (CACHE_KEYS as readonly string[]).includes(key);
}

/**
 * Formats byte size into human readable string (B, KB, MB, GB, TB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  const val = bytes / Math.pow(k, i);
  const formatted = val.toFixed(decimals).replace(/\.0+$/, "");
  return `${formatted} ${sizes[i]}`;
}


export const storageCache = {
  /**
   * Store data in localStorage with optional TTL (defaults to 2 minutes / 120 seconds).
   * Set ttlSeconds to 0 or null for persistent cache without expiration.
   */
  set<T>(
    key: string,
    value: T,
    ttlSeconds: number | null = DEFAULT_CACHE_TTL_SECONDS,
    version: string = CACHE_VERSION
  ): boolean {
    if (typeof window === "undefined") return false;

    try {
      const now = Date.now();
      const expires_at =
        ttlSeconds && ttlSeconds > 0 ? now + ttlSeconds * 1000 : null;

      const envelope: CacheEnvelope<T> = {
        value,
        cached_at: now,
        expires_at,
        version,
      };

      localStorage.setItem(key, JSON.stringify(envelope));
      return true;
    } catch (err) {
      console.warn(`[storageCache] Failed to store key "${key}":`, err);
      return false;
    }
  },

  /**
   * Retrieve cached data. If the item has expired (> expires_at),
   * it is automatically purged from localStorage and returns null.
   */
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const data = JSON.parse(raw) as Partial<CacheEnvelope<T>>;

      // Handle raw non-envelope format gracefully
      if (data && typeof data === "object" && "value" in data && "cached_at" in data) {
        // Check TTL expiration (default 2 min watch)
        if (data.expires_at && Date.now() > data.expires_at) {
          localStorage.removeItem(key);
          return null;
        }
        return data.value as T;
      }

      // Legacy fallback
      return data as unknown as T;
    } catch {
      // Corrupt payload, evict
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      return null;
    }
  },

  /**
   * Check if a cache key exists and has not expired.
   */
  has(key: string): boolean {
    if (typeof window === "undefined") return false;
    return this.get(key) !== null;
  },

  /**
   * Remove a single cache key safely.
   */
  remove(key: string): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Clears ALL safe SmartPOS cache keys.
   * NEVER deletes protected authentication, offline queue, or device settings.
   * Does NOT call localStorage.clear()!
   */
  clearAllCache(): CacheClearResult {
    if (typeof window === "undefined") {
      return { success: false, deleted: 0, deletedKeys: [] };
    }

    let deleted = 0;
    const deletedKeys: string[] = [];

    // 1. Clear predefined whitelisted keys
    for (const key of CACHE_KEYS) {
      try {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          deleted++;
          deletedKeys.push(key);
        }
      } catch {
        // continue
      }
    }

    // 2. Discover and clear any dynamic smartpos:cache:* keys while protecting sensitive keys
    try {
      const allStorageKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) allStorageKeys.push(k);
      }

      for (const k of allStorageKeys) {
        if (isSafeCacheKey(k) && !deletedKeys.includes(k)) {
          localStorage.removeItem(k);
          deleted++;
          deletedKeys.push(k);
        }
      }
    } catch {
      // ignore
    }

    return {
      success: true,
      deleted,
      deletedKeys,
    };
  },

  /**
   * Get all active (existing) safe cache keys in localStorage
   */
  getCacheKeys(): string[] {
    if (typeof window === "undefined") return [];

    const found: string[] = [];

    // Check predefined
    for (const key of CACHE_KEYS) {
      if (localStorage.getItem(key) !== null) {
        found.push(key);
      }
    }

    // Check dynamic
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isSafeCacheKey(k) && !found.includes(k)) {
        found.push(k);
      }
    }

    return found;
  },

  /**
   * Calculate approximate byte size of all safe cache data
   */
  getApproximateSize(): number {
    if (typeof window === "undefined") return 0;

    let bytes = 0;
    const keys = this.getCacheKeys();

    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val) {
        bytes += (key.length + val.length) * 2; // rough UTF-16 representation
      }
    }

    return bytes;
  },

  /**
   * Get comprehensive metadata for all whitelisted cache items
   * for display on the Storage Settings page.
   */
  getCacheStats(): CacheStats {
    if (typeof window === "undefined") {
      return {
        engineStatus: "Unavailable",
        storageEngine: "Browser localStorage",
        totalKeys: CACHE_KEYS.length,
        activeKeys: 0,
        expiredKeys: 0,
        totalSizeBytes: 0,
        formattedSize: "0 B",
        entries: [],
      };
    }

    const now = Date.now();
    let totalSizeBytes = 0;
    let activeKeys = 0;
    let expiredKeys = 0;

    const entries: CacheEntryMetadata[] = CACHE_KEYS.map((key) => {
      const raw = localStorage.getItem(key);
      const label = HUMAN_LABELS[key] || key;

      if (!raw) {
        return {
          key,
          label,
          exists: false,
          sizeBytes: 0,
          cachedAt: null,
          expiresAt: null,
          isExpired: false,
          ttlRemainingSeconds: null,
        };
      }

      const sizeBytes = (key.length + raw.length) * 2;
      totalSizeBytes += sizeBytes;

      let cachedAt: number | null = null;
      let expiresAt: number | null = null;
      let isExpired = false;
      let ttlRemainingSeconds: number | null = null;

      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          cachedAt = parsed.cached_at ?? null;
          expiresAt = parsed.expires_at ?? null;

          if (expiresAt) {
            if (now > expiresAt) {
              isExpired = true;
              expiredKeys++;
              ttlRemainingSeconds = 0;
            } else {
              activeKeys++;
              ttlRemainingSeconds = Math.max(0, Math.round((expiresAt - now) / 1000));
            }
          } else {
            activeKeys++;
          }
        } else {
          activeKeys++;
        }
      } catch {
        activeKeys++;
      }

      return {
        key,
        label,
        exists: true,
        sizeBytes,
        cachedAt,
        expiresAt,
        isExpired,
        ttlRemainingSeconds,
      };
    });

    return {
      engineStatus: "Active / Operational",
      storageEngine: "Browser localStorage",
      totalKeys: CACHE_KEYS.length,
      activeKeys,
      expiredKeys,
      totalSizeBytes,
      formattedSize: formatBytes(totalSizeBytes),
      entries,
    };
  },
};
