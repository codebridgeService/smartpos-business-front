import { getApiUrl } from "@/lib/config/env";
import { ApiError, parseApiError } from "./errors";
import { tokenStorage, authEvents } from "./token";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  _retry?: boolean;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
  refresh_expires_at?: string | null;
}

// Queue mechanism for handling concurrent 401 requests during token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
}

/**
 * Executes a token refresh call using the stored refresh_token
 */
async function performTokenRefresh(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    authEvents.emitUnauthorized();
    throw new ApiError(401, "No refresh token available");
  }

  const refreshUrl = getApiUrl("/auth/refresh");

  const response = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clearTokens();
    authEvents.emitUnauthorized();
    onRefreshFailed();
    const error = await parseApiError(response);
    throw error;
  }

  const data: RefreshTokenResponse = await response.json();
  tokenStorage.setTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });

  onTokenRefreshed(data.access_token);
  return data.access_token;
}

/**
 * Builds the full URL with query parameters
 */
function buildUrl(endpoint: string, params?: RequestOptions["params"]): string {
  const fullUrl = new URL(getApiUrl(endpoint));

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  return fullUrl.toString();
}

/**
 * Core request dispatcher
 */
async function request<T>(
  endpoint: string,
  method: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, _retry = false, headers: customHeaders, ...restOptions } = options;

  const url = buildUrl(endpoint, params);
  const headers = new Headers(customHeaders);

  // Set default Accept header
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Inject Bearer token
  if (!skipAuth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  // Handle body formatting
  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      // Browser automatically sets Content-Type with boundary for FormData
      requestBody = body;
    } else if (typeof body === "string") {
      requestBody = body;
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    } else {
      requestBody = JSON.stringify(body);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: requestBody,
    ...restOptions,
  });

  // Check for successful response
  if (response.ok) {
    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  }

  // Handle 401 Unauthorized with Automatic Refresh Queue
  const isAuthEndpoint =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/refresh") ||
    endpoint.includes("/auth/register");

  if (response.status === 401 && !_retry && !isAuthEndpoint) {
    if (isRefreshing) {
      // Wait in line until refresh completes
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          options._retry = true;
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          };
          resolve(request<T>(endpoint, method, body, options));
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await performTokenRefresh();
      isRefreshing = false;

      // Retry the original request with the renewed token
      return await request<T>(endpoint, method, body, {
        ...options,
        _retry: true,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    } catch (refreshErr) {
      isRefreshing = false;
      onRefreshFailed();
      throw refreshErr;
    }
  }

  // Parse and throw standardized API error for all other error codes
  const apiError = await parseApiError(response);
  throw apiError;
}

/**
 * Unified HTTP API client for SmartPOS microservices
 */
export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, "GET", undefined, options);
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, "POST", body, options);
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, "PUT", body, options);
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, "PATCH", body, options);
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, "DELETE", undefined, options);
  },
};
