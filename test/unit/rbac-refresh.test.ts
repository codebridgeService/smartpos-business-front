import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient } from "@/lib/api/client";
import { tokenStorage, authEvents, TokenRefreshedEventDetail } from "@/lib/api/token";
import { hasPermission, hasRole, getUserRoleCodes, isAdminOrOwner } from "@/lib/utils/roles";

describe("RBAC Real-Time Refresh & Guard Resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenStorage.clearTokens();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Token Refresh RBAC Propagation", () => {
    it("updates stored roles and emits refreshed event when token refresh succeeds", async () => {
      tokenStorage.setTokens({
        access_token: "old-access-token",
        refresh_token: "session-123.refresh-secret",
      });
      tokenStorage.setUserRoles(["cashier"]);

      const refreshedListener = vi.fn();
      const unsubscribe = authEvents.onRefreshed(refreshedListener);

      const mockRefreshResponse = {
        access_token: "new-access-token",
        refresh_token: "session-123.new-secret",
        token_type: "Bearer",
        expires_in: 3600,
        roles: ["admin", "manager"],
        permissions: ["products.view", "products.create"],
      };

      const mockDataResponse = {
        data: [{ id: 1, name: "Product A" }],
      };

      let fetchCallCount = 0;
      global.fetch = vi.fn().mockImplementation((url: string) => {
        fetchCallCount++;
        if (url.includes("/products") && fetchCallCount === 1) {
          // First call triggers 401
          return Promise.resolve(
            new Response(JSON.stringify({ message: "Token expired" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        if (url.includes("/auth/refresh")) {
          return Promise.resolve(
            new Response(JSON.stringify(mockRefreshResponse), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        // Retried call with new access token
        return Promise.resolve(
          new Response(JSON.stringify(mockDataResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      const result = await apiClient.get<{ data: any[] }>("/products");

      expect(result).toEqual(mockDataResponse);
      expect(tokenStorage.getAccessToken()).toBe("new-access-token");
      expect(tokenStorage.getUserRoles()).toEqual(["admin", "manager"]);
      expect(refreshedListener).toHaveBeenCalledWith({
        access_token: "new-access-token",
        roles: ["admin", "manager"],
        permissions: ["products.view", "products.create"],
      });

      unsubscribe();
    });

    it("triggers unauthorized event and clears tokens when session is revoked", async () => {
      tokenStorage.setTokens({
        access_token: "revoked-token",
        refresh_token: "session-456.secret",
      });

      const unauthorizedListener = vi.fn();
      const unsubscribe = authEvents.onUnauthorized(unauthorizedListener);

      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/auth/refresh")) {
          return Promise.resolve(
            new Response(JSON.stringify({ message: "Session has been revoked." }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        return Promise.resolve(
          new Response(JSON.stringify({ message: "Unauthenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      await expect(apiClient.get("/products")).rejects.toThrow();
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(unauthorizedListener).toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe("Permission & Role Helper Null Safety", () => {
    it("handles null, undefined, and empty objects without crashing", () => {
      expect(hasRole(null, "admin")).toBe(false);
      expect(hasRole(undefined as any, "admin")).toBe(false);
      expect(hasRole({} as any, "admin")).toBe(false);

      expect(hasPermission(null, "products.view")).toBe(false);
      expect(hasPermission(undefined as any, "products.view")).toBe(false);
      expect(hasPermission({} as any, "products.view")).toBe(false);
      expect(hasPermission({ permissions: null } as any, "")).toBe(false);

      expect(getUserRoleCodes(null)).toEqual([]);
      expect(isAdminOrOwner(null)).toBe(false);
    });

    it("evaluates both direct permissions and nested role permissions correctly", () => {
      const userWithDirect = {
        id: 1,
        name: "Direct User",
        permissions: [{ code: "products.view" }, { code: "products.create" }],
      };

      expect(hasPermission(userWithDirect, "products.view")).toBe(true);
      expect(hasPermission(userWithDirect, "products.create")).toBe(true);
      expect(hasPermission(userWithDirect, "products.delete")).toBe(false);

      const userWithRoles = {
        id: 2,
        name: "Role User",
        roles: [
          {
            id: 1,
            code: "cashier",
            permissions: [{ code: "pos.access" }, { code: "pos.checkout" }],
          },
        ],
      };

      expect(hasPermission(userWithRoles, "pos.access")).toBe(true);
      expect(hasPermission(userWithRoles, "pos.checkout")).toBe(true);
      expect(hasPermission(userWithRoles, "products.delete")).toBe(false);
    });
  });
});
