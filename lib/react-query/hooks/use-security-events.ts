"use client";

import { useQuery } from "@tanstack/react-query";
import { securityEventsApi } from "@/lib/api/security-events";
import { queryKeys } from "../query-keys";
import type { SecurityEvent, SecurityEventsQueryParams, LengthAwarePaginator } from "@/types";

/**
 * Hook to fetch paginated security events audit log
 */
export function useSecurityEventsQuery(params?: SecurityEventsQueryParams, enabled = true) {
  return useQuery<LengthAwarePaginator<SecurityEvent>>({
    queryKey: queryKeys.security.events(params as Record<string, unknown>),
    queryFn: () => securityEventsApi.getSecurityEvents(params),
    enabled,
  });
}

/**
 * Hook to fetch single security event details
 */
export function useSecurityEventQuery(uuid?: string | null, enabled = true) {
  return useQuery<SecurityEvent>({
    queryKey: queryKeys.security.event(uuid ?? ""),
    queryFn: () => securityEventsApi.getSecurityEvent(uuid!),
    enabled: Boolean(uuid && enabled),
  });
}
