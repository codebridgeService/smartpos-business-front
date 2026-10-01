import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import { QueryProvider, getQueryClient, queryKeys } from "@/lib/react-query";

function TestConsumer() {
  const { data, isLoading } = useQuery({
    queryKey: ["test"],
    queryFn: async () => "query data resolved",
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data}</div>;
}

describe("TanStack Query Setup", () => {
  it("creates a stable QueryClient with expected default options", () => {
    const client = getQueryClient();
    expect(client).toBeDefined();

    const defaultQueryOptions = client.getDefaultOptions().queries;
    expect(defaultQueryOptions?.staleTime).toBe(60 * 1000);
    expect(defaultQueryOptions?.retry).toBe(1);
    expect(defaultQueryOptions?.refetchOnWindowFocus).toBe(false);
  });

  it("provides QueryClient context via QueryProvider", async () => {
    render(
      <QueryProvider>
        <TestConsumer />
      </QueryProvider>
    );

    expect(screen.getByText(/Loading\.\.\./i)).toBeDefined();
    const resolvedEl = await screen.findByText("query data resolved");
    expect(resolvedEl).toBeDefined();
  });

  it("generates structured query keys", () => {
    expect(queryKeys.businesses.all).toEqual(["businesses"]);
    expect(queryKeys.businesses.list({ search: "cafe" })).toEqual([
      "businesses",
      "list",
      { search: "cafe" },
    ]);
    expect(queryKeys.outlets.detail("outlet-123")).toEqual([
      "outlets",
      "detail",
      "outlet-123",
    ]);
  });

  it("bridges queries with storageCache for offline support", async () => {
    const { createCachedQueryFn } = await import("@/lib/react-query/storage-cache-bridge");
    const { storageCache } = await import("@/lib/storage/storage-cache");

    const mockFetcher = async () => [{ id: "u1", name: "Test User" }];
    const cachedFn = createCachedQueryFn("smartpos:cache:users", mockFetcher, 60);

    const result = await cachedFn();
    expect(result).toEqual([{ id: "u1", name: "Test User" }]);

    // Verify written to storageCache
    const inCache = storageCache.get("smartpos:cache:users");
    expect(inCache).toEqual([{ id: "u1", name: "Test User" }]);
  });

  it("persists TanStack Query client to localStorage under smartpos:cache:react-query", async () => {
    const { REACT_QUERY_STORAGE_KEY } = await import("@/lib/react-query/query-provider");
    expect(REACT_QUERY_STORAGE_KEY).toBe("smartpos:cache:react-query");

    render(
      <QueryProvider>
        <div>Loaded</div>
      </QueryProvider>
    );

    const stored = localStorage.getItem("smartpos:cache:react-query");
    expect(stored).toBeDefined();
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.buster).toBe("v1");
  });
});
