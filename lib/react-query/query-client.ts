import { defaultShouldDehydrateQuery, isServer, QueryClient } from "@tanstack/react-query";

/**
 * Creates and configures a new QueryClient instance.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute
        staleTime: 60 * 1000,
        // Inactive cache lifetime for persistence: 24 hours
        gcTime: 1000 * 60 * 60 * 24,
        // Retry failed requests once before failing
        retry: 1,
        // Avoid automatic refetch when switching browser tabs
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
      dehydrate: {
        // Include pending queries in dehydration if SSR / RSC hydration is used
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a stable QueryClient singleton in the browser, or a new instance per SSR request.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always make a new query client per request to avoid cross-request state leakage
    return makeQueryClient();
  }

  // Browser: keep a single query client instance across renders
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
