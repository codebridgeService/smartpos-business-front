import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient } from "@/lib/api/client";
import { getApiUrl } from "@/lib/config/env";
import { ApiError, parseApiError, isApiError } from "@/lib/api/errors";
import { authApi } from "@/lib/api/auth";
import { productsApi } from "@/lib/api/products";
import { tokenStorage } from "@/lib/api/token";

describe("Unified API Client & Security Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenStorage.clearTokens();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getApiUrl URL resolution", () => {
    it("returns absolute API URL for relative endpoint with leading slash", () => {
      expect(getApiUrl("/auth/login")).toBe("https://smartpos-api.servicefixit.me/api/v1/auth/login");
    });

    it("returns absolute API URL for relative endpoint without leading slash", () => {
      expect(getApiUrl("auth/refresh")).toBe("https://smartpos-api.servicefixit.me/api/v1/auth/refresh");
    });

    it("preserves already absolute URLs", () => {
      expect(getApiUrl("https://example.com/custom")).toBe("https://example.com/custom");
    });
  });

  describe("ApiError class", () => {
    it("correctly identifies 401 Unauthorized", () => {
      const err = new ApiError(401, "Unauthenticated");
      expect(err.isUnauthorized()).toBe(true);
      expect(err.isForbidden()).toBe(false);
      expect(err.isValidationError()).toBe(false);
      expect(err.isRateLimited()).toBe(false);
      expect(err.isServerError()).toBe(false);
    });

    it("correctly identifies 403 Forbidden", () => {
      const err = new ApiError(403, "Access denied");
      expect(err.isForbidden()).toBe(true);
      expect(err.isUnauthorized()).toBe(false);
    });

    it("correctly identifies 422 Validation Error and extracts field errors", () => {
      const err = new ApiError(422, "Validation failed", {
        email: ["Email is required", "Email is invalid"],
      });
      expect(err.isValidationError()).toBe(true);
      expect(err.getFieldError("email")).toBe("Email is required");
      expect(err.getFieldError("nonexistent")).toBeUndefined();
    });

    it("correctly identifies 429 Rate Limiting with retry_after", () => {
      const err = new ApiError(429, "Too many requests", undefined, { retry_after: 60 });
      expect(err.isRateLimited()).toBe(true);
      expect(err.getRetryAfter()).toBe(60);
    });

    it("correctly identifies 500-599 Server Errors", () => {
      const err500 = new ApiError(500, "Internal Server Error");
      const err502 = new ApiError(502, "Bad Gateway");
      const err503 = new ApiError(503, "Service Unavailable");
      expect(err500.isServerError()).toBe(true);
      expect(err502.isServerError()).toBe(true);
      expect(err503.isServerError()).toBe(true);
      expect(new ApiError(400, "Bad Request").isServerError()).toBe(false);
    });
  });

  describe("isApiError type guard", () => {
    it("returns true for instances of ApiError", () => {
      const err = new ApiError(401, "Unauthorized");
      expect(isApiError(err)).toBe(true);
    });

    it("returns true for duck-typed objects with ApiError structure and restores prototype", () => {
      const detached = {
        name: "ApiError",
        status: 422,
        message: "Validation Error",
        errors: { field: ["Required"] },
      };
      expect(isApiError(detached)).toBe(true);
      expect((detached as unknown as ApiError).isValidationError()).toBe(true);
      expect((detached as unknown as ApiError).getFieldError("field")).toBe("Required");
    });

    it("returns false for standard Error or non-object values", () => {
      expect(isApiError(new Error("Generic"))).toBe(false);
      expect(isApiError(new TypeError("Failed to fetch"))).toBe(false);
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
      expect(isApiError("error string")).toBe(false);
    });
  });

  describe("parseApiError helper", () => {
    it("parses JSON error response with validation error map", async () => {
      const mockResponse = new Response(
        JSON.stringify({
          message: "Invalid input",
          errors: { name: ["The name field is required."] },
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );

      const error = await parseApiError(mockResponse);
      expect(error.status).toBe(422);
      expect(error.message).toBe("Invalid input");
      expect(error.errors?.name).toEqual(["The name field is required."]);
    });

    it("parses text/plain error response", async () => {
      const mockResponse = new Response("Gateway Timeout", {
        status: 504,
        headers: { "Content-Type": "text/plain" },
      });

      const error = await parseApiError(mockResponse);
      expect(error.status).toBe(504);
      expect(error.message).toBe("Gateway Timeout");
    });
  });

  describe("apiClient HTTP methods & Auth Token Injection", () => {
    it("automatically adds Bearer token and targets absolute API URL", async () => {
      tokenStorage.setTokens({
        access_token: "test_access_token_123",
        refresh_token: "test_refresh_token_123",
      });

      let capturedUrl: string | undefined;
      let capturedHeaders: Headers | undefined;
      vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
        capturedUrl = String(input);
        capturedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const result = await apiClient.get<{ success: boolean }>("/test-endpoint", {
        params: { search: "coffee", page: 1 },
      });
      expect(result.success).toBe(true);
      expect(capturedUrl).toBe("https://smartpos-api.servicefixit.me/api/v1/test-endpoint?search=coffee&page=1");
      expect(capturedHeaders?.get("Authorization")).toBe("Bearer test_access_token_123");
      expect(capturedHeaders?.get("Accept")).toBe("application/json");
    });

    it("skips auth token when skipAuth option is true", async () => {
      tokenStorage.setTokens({
        access_token: "test_token",
        refresh_token: "test_refresh",
      });

      let capturedHeaders: Headers | undefined;
      vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      await apiClient.get("/public-endpoint", { skipAuth: true });
      expect(capturedHeaders?.has("Authorization")).toBe(false);
    });

    it("formats POST request body as JSON with Content-Type", async () => {
      let capturedBody: string | undefined;
      let capturedHeaders: Headers | undefined;

      vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
        capturedHeaders = new Headers(init?.headers);
        capturedBody = init?.body as string;
        return new Response(JSON.stringify({ created: true }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      });

      await apiClient.post("/items", { name: "Latte", price: 3.5 });
      expect(capturedHeaders?.get("Content-Type")).toBe("application/json");
      expect(JSON.parse(capturedBody!)).toEqual({ name: "Latte", price: 3.5 });
    });

    it("converts network TypeError (Failed to fetch) into ApiError with status 0", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(apiClient.get("/test-network-error")).rejects.toThrow(ApiError);
      try {
        await apiClient.get("/test-network-error");
      } catch (err) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.status).toBe(0);
          expect(err.message).toContain("Unable to connect to the SmartPOS server");
        }
      }
    });
  });

  describe("authApi", () => {
    it("stores tokens in tokenStorage upon successful login", async () => {
      vi.spyOn(global, "fetch").mockImplementation(async () => {
        return new Response(
          JSON.stringify({
            message: "Login successful",
            user: { id: 1, name: "Admin", email: "admin@smartpos.com" },
            token: {
              access_token: "jwt_access_abc",
              refresh_token: "jwt_refresh_xyz",
              token_type: "Bearer",
              expires_in: "3600",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      });

      const res = await authApi.login({
        email: "admin@smartpos.com",
        password: "password123",
      });

      expect(res.user.email).toBe("admin@smartpos.com");
      expect(tokenStorage.getAccessToken()).toBe("jwt_access_abc");
      expect(tokenStorage.getRefreshToken()).toBe("jwt_refresh_xyz");
    });

    it("clears tokens on logout", async () => {
      tokenStorage.setTokens({
        access_token: "jwt_access",
        refresh_token: "jwt_refresh",
      });

      vi.spyOn(global, "fetch").mockImplementation(async () => {
        return new Response(JSON.stringify({ message: "Logged out" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      await authApi.logout();
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.getRefreshToken()).toBeNull();
    });

    it("sends forgot-password request to /auth/forgot-password", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
        capturedUrl = String(input);
        capturedBody = JSON.parse(String(init?.body));
        return new Response(
          JSON.stringify({ message: "We have emailed your password reset link." }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      });

      const res = await authApi.forgotPassword({ email: "user@example.com" });
      expect(capturedUrl).toContain("/auth/forgot-password");
      expect(capturedBody).toEqual({ email: "user@example.com" });
      expect(res.message).toBe("We have emailed your password reset link.");
    });

    it("sends reset-password request to /auth/reset-password", async () => {
      let capturedUrl = "";
      let capturedBody: any = null;

      vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
        capturedUrl = String(input);
        capturedBody = JSON.parse(String(init?.body));
        return new Response(
          JSON.stringify({ message: "Password has been reset." }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      });

      const res = await authApi.resetPassword({
        email: "user@example.com",
        token: "sample_token_123",
        password: "newpassword123",
        password_confirmation: "newpassword123",
      });
      expect(capturedUrl).toContain("/auth/reset-password");
      expect(capturedBody.token).toBe("sample_token_123");
      expect(capturedBody.password).toBe("newpassword123");
      expect(res.message).toBe("Password has been reset.");
    });
  });

  describe("productsApi", () => {
    it("passes X-Business-Id header when businessId is supplied", async () => {
      let capturedHeaders: Headers | undefined;

      vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response(
          JSON.stringify({
            data: [{ id: 1, name: "Product A" }],
            current_page: 1,
            total: 1,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      });

      const products = await productsApi.getProducts({ business_id: "biz-123" });
      expect(capturedHeaders?.get("X-Business-Id")).toBe("biz-123");
      expect(products.data).toHaveLength(1);
    });
  });
});
