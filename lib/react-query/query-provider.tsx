"use client";

import React, { useEffect } from "react";
import { QueryClientProvider, dehydrate, hydrate } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./query-client";

export const REACT_QUERY_STORAGE_KEY = "smartpos:cache:react-query";
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper to safely write current query cache to localStorage
    const persistToLocalStorage = () => {
      try {
        const payload = {
          timestamp: Date.now(),
          buster: "v1",
          clientState: dehydrate(queryClient),
        };
        window.localStorage.setItem(REACT_QUERY_STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("[QueryProvider] Failed to persist cache to localStorage:", err);
      }
    };

    // 1. Restore existing cache from localStorage or initialize empty state immediately
    try {
      const stored = window.localStorage.getItem(REACT_QUERY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const isFresh = Date.now() - (parsed.timestamp || 0) < CACHE_MAX_AGE_MS;
        if (isFresh && parsed.clientState) {
          hydrate(queryClient, parsed.clientState);
        } else {
          persistToLocalStorage();
        }
      } else {
        // Guarantee key is immediately visible in DevTools Application -> Local Storage
        persistToLocalStorage();
      }
    } catch {
      persistToLocalStorage();
    }

    // 2. Subscribe to query cache updates and sync immediately to localStorage
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === "updated" || event?.type === "added" || event?.type === "removed") {
        persistToLocalStorage();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
