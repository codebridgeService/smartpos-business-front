import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  storageCache,
  CACHE_KEYS,
  isSafeCacheKey,
  DEFAULT_CACHE_TTL_SECONDS,
} from "@/lib/storage/storage-cache";

describe("storageCache Service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe("Basic Set & Get Operations", () => {
    it("stores and retrieves cached data correctly", () => {
      const products = [
        { id: 1, name: "Iced Americano", price: 3.0 },
        { id: 2, name: "Latte", price: 3.5 },
      ];

      const success = storageCache.set("smartpos:cache:products", products);
      expect(success).toBe(true);

      const retrieved = storageCache.get<typeof products>("smartpos:cache:products");
      expect(retrieved).toEqual(products);
    });

    it("returns null for non-existent cache keys", () => {
      const retrieved = storageCache.get("smartpos:cache:non-existent");
      expect(retrieved).toBeNull();
    });

    it("checks key existence with has()", () => {
      expect(storageCache.has("smartpos:cache:categories")).toBe(false);

      storageCache.set("smartpos:cache:categories", ["Coffee", "Tea"]);
      expect(storageCache.has("smartpos:cache:categories")).toBe(true);
    });

    it("removes a single key cleanly", () => {
      storageCache.set("smartpos:cache:brands", ["Brand A", "Brand B"]);
      expect(storageCache.has("smartpos:cache:brands")).toBe(true);

      const removed = storageCache.remove("smartpos:cache:brands");
      expect(removed).toBe(true);
      expect(storageCache.has("smartpos:cache:brands")).toBe(false);
      expect(localStorage.getItem("smartpos:cache:brands")).toBeNull();
    });
  });

  describe("TTL Expiration (2-minute default watch)", () => {
    it("defaults to 2-minute expiration (120 seconds)", () => {
      vi.useFakeTimers();
      const startTime = 1000000;
      vi.setSystemTime(startTime);

      storageCache.set("smartpos:cache:api", { status: "ok" });

      const raw = localStorage.getItem("smartpos:cache:api");
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.expires_at).toBe(startTime + DEFAULT_CACHE_TTL_SECONDS * 1000);
      expect(parsed.cached_at).toBe(startTime);

      // Advance by 1 minute (60 seconds) - should still be valid
      vi.advanceTimersByTime(60 * 1000);
      expect(storageCache.get("smartpos:cache:api")).toEqual({ status: "ok" });

      // Advance past 2 minutes (e.g. 121 seconds total) - should expire and evict
      vi.advanceTimersByTime(61 * 1000);
      expect(storageCache.get("smartpos:cache:api")).toBeNull();
      // Should also be cleaned up from localStorage
      expect(localStorage.getItem("smartpos:cache:api")).toBeNull();
    });

    it("supports custom TTL", () => {
      vi.useFakeTimers();
      const startTime = 2000000;
      vi.setSystemTime(startTime);

      // Custom 30 second TTL
      storageCache.set("smartpos:cache:business-settings", { tax: 0.1 }, 30);

      vi.advanceTimersByTime(20 * 1000);
      expect(storageCache.get("smartpos:cache:business-settings")).toEqual({ tax: 0.1 });

      vi.advanceTimersByTime(11 * 1000); // 31 seconds total
      expect(storageCache.get("smartpos:cache:business-settings")).toBeNull();
    });

    it("supports indefinite persistence when ttlSeconds is 0 or null", () => {
      vi.useFakeTimers();
      storageCache.set("smartpos:cache:images", { logo: "https://example.com/logo.png" }, 0);

      // Advance by 10 hours
      vi.advanceTimersByTime(10 * 3600 * 1000);
      expect(storageCache.get("smartpos:cache:images")).toEqual({
        logo: "https://example.com/logo.png",
      });
    });
  });

  describe("Protected Keys Safety Guarantee & Clear All Cache", () => {
    it("never deletes protected tokens, device UUIDs, or offline queues", () => {
      // Setup protected keys
      localStorage.setItem("smartpos:device_uuid", "dev-uuid-12345");
      localStorage.setItem("smartpos:user_preferences", JSON.stringify({ theme: "dark" }));
      localStorage.setItem("smartpos:auth_metadata", JSON.stringify({ loginCount: 5 }));
      localStorage.setItem("smartpos:offline_settings", JSON.stringify({ offlineMode: true }));
      localStorage.setItem("smartpos_access_token", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...");
      localStorage.setItem("smartpos_refresh_token", "refresh-secret-123");
      localStorage.setItem("smartpos:sync_queue", JSON.stringify([{ saleId: "offline-1" }]));
      localStorage.setItem("smartpos:pending_sales", JSON.stringify([{ amount: 45.0 }]));

      // Setup cache keys
      storageCache.set("smartpos:cache:products", [{ id: 1 }]);
      storageCache.set("smartpos:cache:categories", ["Beverage"]);
      storageCache.set("smartpos:cache:brands", ["Brand X"]);
      storageCache.set("smartpos:cache:business-settings", { timezone: "UTC" });

      // Run clearAllCache
      const result = storageCache.clearAllCache();

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(4);

      // Verify safe cache keys were removed
      expect(localStorage.getItem("smartpos:cache:products")).toBeNull();
      expect(localStorage.getItem("smartpos:cache:categories")).toBeNull();
      expect(localStorage.getItem("smartpos:cache:brands")).toBeNull();
      expect(localStorage.getItem("smartpos:cache:business-settings")).toBeNull();

      // CRITICAL ASSERTION: Protected keys MUST remain intact!
      expect(localStorage.getItem("smartpos:device_uuid")).toBe("dev-uuid-12345");
      expect(localStorage.getItem("smartpos:user_preferences")).toBe(
        JSON.stringify({ theme: "dark" })
      );
      expect(localStorage.getItem("smartpos:auth_metadata")).toBe(
        JSON.stringify({ loginCount: 5 })
      );
      expect(localStorage.getItem("smartpos:offline_settings")).toBe(
        JSON.stringify({ offlineMode: true })
      );
      expect(localStorage.getItem("smartpos_access_token")).toBe(
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
      );
      expect(localStorage.getItem("smartpos_refresh_token")).toBe("refresh-secret-123");
      expect(localStorage.getItem("smartpos:sync_queue")).toBe(
        JSON.stringify([{ saleId: "offline-1" }])
      );
      expect(localStorage.getItem("smartpos:pending_sales")).toBe(
        JSON.stringify([{ amount: 45.0 }])
      );
    });

    it("verifies isSafeCacheKey logic correctly", () => {
      // Safe keys
      expect(isSafeCacheKey("smartpos:cache:products")).toBe(true);
      expect(isSafeCacheKey("smartpos:cache:v1:categories")).toBe(true);
      expect(isSafeCacheKey("smartpos:cache:api")).toBe(true);

      // Protected keys must return false
      expect(isSafeCacheKey("smartpos:device_uuid")).toBe(false);
      expect(isSafeCacheKey("smartpos:user_preferences")).toBe(false);
      expect(isSafeCacheKey("smartpos:auth_metadata")).toBe(false);
      expect(isSafeCacheKey("smartpos:offline_settings")).toBe(false);
      expect(isSafeCacheKey("smartpos_access_token")).toBe(false);
      expect(isSafeCacheKey("smartpos_refresh_token")).toBe(false);
      expect(isSafeCacheKey("smartpos:sync_queue")).toBe(false);
    });
  });

  describe("Cache Metrics and Stats", () => {
    it("returns approximate byte size and cache stats accurately", () => {
      storageCache.set("smartpos:cache:products", [{ id: 10 }]);

      const size = storageCache.getApproximateSize();
      expect(size).toBeGreaterThan(0);

      const stats = storageCache.getCacheStats();
      expect(stats.engineStatus).toBe("Active / Operational");
      expect(stats.storageEngine).toBe("Browser localStorage");
      expect(stats.activeKeys).toBe(1);
      expect(stats.totalKeys).toBe(CACHE_KEYS.length);
      expect(stats.entries).toHaveLength(CACHE_KEYS.length);

      const productEntry = stats.entries.find((e) => e.key === "smartpos:cache:products");
      expect(productEntry?.exists).toBe(true);
      expect(productEntry?.sizeBytes).toBeGreaterThan(0);
      expect(productEntry?.ttlRemainingSeconds).toBeGreaterThan(0);
    });
  });
});
