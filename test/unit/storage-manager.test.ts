import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DEFAULT_STORAGE_POLICY,
  STORAGE_POLICY_KEY,
  getStoragePolicy,
  saveStoragePolicy,
  resetStoragePolicy,
  retentionToMs,
  formatBytes,
  CATEGORY_METADATA,
} from "@/lib/storage/storage-policy";
import {
  PROTECTED_STORES,
  CLEARABLE_STORES,
} from "@/lib/storage/indexeddb-storage";
import { POS_CACHES } from "@/lib/storage/storage-manager";
import {
  type CacheCategory,
  type PosStoragePolicy,
} from "@/lib/storage/storage-types";

describe("SmartPOS Telegram Storage & Policy System", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Storage Policy Management", () => {
    it("returns default storage policy when localStorage is empty", () => {
      const policy = getStoragePolicy();
      expect(policy).toEqual(DEFAULT_STORAGE_POLICY);
      expect(policy.maxCacheBytes).toBe(524288000); // 500 MB
      expect(policy.retention.products).toBe("never");
      expect(policy.retention.images).toBe("1_month");
      expect(policy.retention.inventory).toBe("1_week");

      expect(policy.retention.reports).toBe("1_week");
      expect(policy.retention.receipts).toBe("1_month");
      expect(policy.retention.api).toBe("1_day");
      expect(policy.retention.temp).toBe("1_day");
    });

    it("saves and loads custom policy under smartpos:storage:policy", () => {
      const customPolicy: PosStoragePolicy = {
        maxCacheBytes: 104857600, // 100 MB
        retention: {
          products: "1_week",
          images: "1_week",
          inventory: "1_hour",
          reports: "3_days",
          receipts: "1_week",
          api: "1_hour",
          temp: "1_hour",
        },
      };

      saveStoragePolicy(customPolicy);

      const raw = localStorage.getItem(STORAGE_POLICY_KEY);
      expect(raw).not.toBeNull();

      const retrieved = getStoragePolicy();
      expect(retrieved.maxCacheBytes).toBe(104857600);
      expect(retrieved.retention.products).toBe("1_week");
      expect(retrieved.retention.inventory).toBe("1_hour");
    });

    it("resets policy to system defaults cleanly", () => {
      saveStoragePolicy({
        maxCacheBytes: 1073741824, // 1 GB
        retention: {
          products: "never",
          images: "never",
          inventory: "never",
          reports: "never",
          receipts: "never",
          api: "never",
          temp: "never",
        },
      });

      const reset = resetStoragePolicy();
      expect(reset.maxCacheBytes).toBe(524288000);
      expect(getStoragePolicy().maxCacheBytes).toBe(524288000);
    });

    it("supports No Limit (null) for maxCacheBytes", () => {
      const policy = getStoragePolicy();
      policy.maxCacheBytes = null;
      saveStoragePolicy(policy);

      const retrieved = getStoragePolicy();
      expect(retrieved.maxCacheBytes).toBeNull();
    });
  });

  describe("Retention Period Conversion", () => {
    it("converts retention periods to exact millisecond durations", () => {
      expect(retentionToMs("1_hour")).toBe(60 * 60 * 1000);
      expect(retentionToMs("1_day")).toBe(24 * 60 * 60 * 1000);
      expect(retentionToMs("3_days")).toBe(3 * 24 * 60 * 60 * 1000);
      expect(retentionToMs("1_week")).toBe(7 * 24 * 60 * 60 * 1000);
      expect(retentionToMs("1_month")).toBe(30 * 24 * 60 * 60 * 1000);
      expect(retentionToMs("never")).toBeNull();
    });
  });

  describe("Cache Storage Namespaces & Category Colors", () => {
    it("defines isolated Cache Storage namespaces for all SmartPOS categories", () => {
      expect(POS_CACHES.products).toBe("smartpos-products-v1");
      expect(POS_CACHES.images).toBe("smartpos-images-v1");
      expect(POS_CACHES.inventory).toBe("smartpos-inventory-v1");
      expect(POS_CACHES.reports).toBe("smartpos-reports-v1");
      expect(POS_CACHES.receipts).toBe("smartpos-receipts-v1");
      expect(POS_CACHES.api).toBe("smartpos-api-v1");
      expect(POS_CACHES.temp).toBe("smartpos-temp-v1");
    });

    it("provides designated Telegram-inspired colors for each category", () => {
      const categories: CacheCategory[] = [
        "products",
        "categories",
        "images",
        "inventory",
        "reports",
        "receipts",
        "api",
        "temp",
      ];

      for (const cat of categories) {
        expect(CATEGORY_METADATA[cat]).toBeDefined();
        expect(CATEGORY_METADATA[cat].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(CATEGORY_METADATA[cat].name.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Protected POS Offline Storage Isolation", () => {
    it("strictly separates clearable stores from protected offline stores", () => {
      expect(PROTECTED_STORES).toContain("pending_sales");
      expect(PROTECTED_STORES).toContain("pending_payments");
      expect(PROTECTED_STORES).toContain("sync_queue");

      expect(CLEARABLE_STORES).toContain("cache_metadata");
      expect(CLEARABLE_STORES).toContain("cached_products");
      expect(CLEARABLE_STORES).toContain("cached_categories");
      expect(CLEARABLE_STORES).toContain("cached_inventory");

      // No intersection between protected and clearable stores
      const protectedSet = new Set<string>(PROTECTED_STORES);
      for (const clearable of CLEARABLE_STORES) {
        expect(protectedSet.has(clearable)).toBe(false);
      }
    });

    it("ensures critical application settings in localStorage are never cleared", () => {
      localStorage.setItem("smartpos:device_uuid", "device-test-1234");
      localStorage.setItem("smartpos_access_token", "jwt-token-abcd");
      localStorage.setItem("smartpos:user_preferences", JSON.stringify({ theme: "dark" }));

      // Simulating a cache operation should preserve these
      const savedPolicy = getStoragePolicy();
      saveStoragePolicy({ ...savedPolicy, maxCacheBytes: 262144000 });

      expect(localStorage.getItem("smartpos:device_uuid")).toBe("device-test-1234");
      expect(localStorage.getItem("smartpos_access_token")).toBe("jwt-token-abcd");
      expect(localStorage.getItem("smartpos:user_preferences")).toContain("dark");
    });
  });

  describe("Format Bytes Utility", () => {
    it("formats 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 B");
    });

    it("formats kilobytes and megabytes accurately", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(342988800)).toBe("327.1 MB");
    });

    it("formats gigabytes cleanly", () => {
      expect(formatBytes(1073741824)).toBe("1 GB");
    });
  });
});
