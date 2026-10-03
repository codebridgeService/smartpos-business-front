import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  cleanupExpiredLocalStorageCache,
  runStorageCleanup,
} from "@/lib/storage/storage-cleanup";
import {
  DEFAULT_STORAGE_POLICY,
  retentionToMs,
} from "@/lib/storage/storage-policy";
import { type PosStoragePolicy } from "@/lib/storage/storage-types";
import { storageCache } from "@/lib/storage/storage-cache";

describe("Auto-Remove Retention Policies Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe("Time Conversions (Hour, Day, Week, Month)", () => {
    it("converts 1_hour to 3600000 ms", () => {
      expect(retentionToMs("1_hour")).toBe(1 * 60 * 60 * 1000);
    });

    it("converts 1_day to 86400000 ms", () => {
      expect(retentionToMs("1_day")).toBe(24 * 60 * 60 * 1000);
    });

    it("converts 3_days to 259200000 ms", () => {
      expect(retentionToMs("3_days")).toBe(3 * 24 * 60 * 60 * 1000);
    });

    it("converts 1_week to 604800000 ms", () => {
      expect(retentionToMs("1_week")).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("converts 1_month to 2592000000 ms", () => {
      expect(retentionToMs("1_month")).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it("converts never to null", () => {
      expect(retentionToMs("never")).toBeNull();
    });
  });

  describe("Auto-Remove by Day, Time, Week, and Month", () => {
    it("prunes items expired by 1_hour retention policy", () => {
      const now = Date.now();
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;

      // Seed a user cache envelope older than 1 hour
      const envelope = {
        value: [{ id: 1, name: "Admin" }],
        cached_at: twoHoursAgo,
        expires_at: null,
      };
      localStorage.setItem("smartpos:cache:users", JSON.stringify(envelope));

      const policy: PosStoragePolicy = {
        ...DEFAULT_STORAGE_POLICY,
        retention: {
          ...DEFAULT_STORAGE_POLICY.retention,
          users: "1_hour",
        },
      };

      const result = cleanupExpiredLocalStorageCache(policy);
      expect(result.expiredCount).toBe(1);
      expect(localStorage.getItem("smartpos:cache:users")).toBeNull();
    });

    it("keeps items newer than 1_day and prunes items older than 1_day", () => {
      const now = Date.now();
      const twelveHoursAgo = now - 12 * 60 * 60 * 1000; // < 1 day (keep)
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000; // > 1 day (prune)

      localStorage.setItem(
        "smartpos:cache:roles",
        JSON.stringify({ value: ["Manager"], cached_at: twelveHoursAgo, expires_at: null })
      );
      localStorage.setItem(
        "smartpos:cache:permissions",
        JSON.stringify({ value: ["read"], cached_at: twoDaysAgo, expires_at: null })
      );

      const policy: PosStoragePolicy = {
        ...DEFAULT_STORAGE_POLICY,
        retention: {
          ...DEFAULT_STORAGE_POLICY.retention,
          roles: "1_day",
          permissions: "1_day",
        },
      };

      const result = cleanupExpiredLocalStorageCache(policy);
      expect(result.expiredCount).toBe(1);
      expect(localStorage.getItem("smartpos:cache:roles")).not.toBeNull();
      expect(localStorage.getItem("smartpos:cache:permissions")).toBeNull();
    });

    it("prunes items older than 1_week and preserves items newer than 1_week", () => {
      const now = Date.now();
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000; // 3 days < 1 week
      const nineDaysAgo = now - 9 * 24 * 60 * 60 * 1000; // 9 days > 1 week

      localStorage.setItem(
        "smartpos_system_changelogs_cache",
        JSON.stringify({ value: { v: "1.0" }, cached_at: threeDaysAgo, expires_at: null })
      );
      localStorage.setItem(
        "smartpos_announcements",
        JSON.stringify({ value: [{ title: "Old" }], cached_at: nineDaysAgo, expires_at: null })
      );

      const policy: PosStoragePolicy = {
        ...DEFAULT_STORAGE_POLICY,
        retention: {
          ...DEFAULT_STORAGE_POLICY.retention,
          temp: "1_week",
        },
      };

      const result = cleanupExpiredLocalStorageCache(policy);
      expect(result.expiredCount).toBe(1);
      expect(localStorage.getItem("smartpos_system_changelogs_cache")).not.toBeNull();
      expect(localStorage.getItem("smartpos_announcements")).toBeNull();
    });

    it("prunes items older than 1_month and never prunes items set to never", () => {
      const now = Date.now();
      const fortyDaysAgo = now - 40 * 24 * 60 * 60 * 1000; // > 1 month
      const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000; // 1 year ago

      localStorage.setItem(
        "smartpos:cache:security-events",
        JSON.stringify({ value: [], cached_at: fortyDaysAgo, expires_at: null })
      );
      localStorage.setItem(
        "smartpos:cache:products",
        JSON.stringify({ value: [{ id: 99 }], cached_at: oneYearAgo, expires_at: null })
      );

      const policy: PosStoragePolicy = {
        ...DEFAULT_STORAGE_POLICY,
        retention: {
          ...DEFAULT_STORAGE_POLICY.retention,
          audit: "1_month",
          products: "never", // MUST NEVER BE PRUNED
        },
      };

      const result = cleanupExpiredLocalStorageCache(policy);
      expect(result.expiredCount).toBe(1);
      expect(localStorage.getItem("smartpos:cache:security-events")).toBeNull();
      expect(localStorage.getItem("smartpos:cache:products")).not.toBeNull();
    });

    it("strictly NEVER prunes protected keys (tokens, UUIDs, offline sync queue)", () => {
      const ancientTime = 1000; // Epoch from year 1970

      localStorage.setItem("smartpos_access_token", "jwt-secret-token");
      localStorage.setItem("smartpos:device_uuid", "device-uuid-1234");
      localStorage.setItem("smartpos_active_business_uuid", "biz-uuid-5678");
      localStorage.setItem("smartpos:pending_sales", JSON.stringify([{ id: 101 }]));

      const policy: PosStoragePolicy = {
        ...DEFAULT_STORAGE_POLICY,
        retention: {
          ...DEFAULT_STORAGE_POLICY.retention,
          temp: "1_hour",
          other: "1_hour",
        },
      };

      const result = cleanupExpiredLocalStorageCache(policy);
      expect(result.expiredCount).toBe(0);
      expect(localStorage.getItem("smartpos_access_token")).toBe("jwt-secret-token");
      expect(localStorage.getItem("smartpos:device_uuid")).toBe("device-uuid-1234");
      expect(localStorage.getItem("smartpos_active_business_uuid")).toBe("biz-uuid-5678");
      expect(localStorage.getItem("smartpos:pending_sales")).not.toBeNull();
    });
  });
});
