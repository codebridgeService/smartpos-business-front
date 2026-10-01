import { apiClient } from "./client";
import type {
  SecurityEvent,
  SecurityEventsQueryParams,
  SecurityEventDetailResponse,
  LengthAwarePaginator,
} from "@/types";

/**
 * Security Events & Forensic Audit Log API Service
 * OpenAPI: https://smartpos-docs.servicefixit.me/docs/identity/#/operations/securityEvent.index
 */
export const securityEventsApi = {
  /**
   * List paginated security events with flexible filtering
   * GET /security-events
   */
  async getSecurityEvents(
    params?: SecurityEventsQueryParams
  ): Promise<LengthAwarePaginator<SecurityEvent>> {
    const cleanParams: Record<string, string | number | undefined> = {};
    if (params) {
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.per_page !== undefined) cleanParams.per_page = params.per_page;
      if (params.event_type) cleanParams.event_type = params.event_type;
      if (params.severity) cleanParams.severity = params.severity;
      if (params.user_uuid) cleanParams.user_uuid = params.user_uuid;
      if (params.business_uuid) cleanParams.business_uuid = params.business_uuid;
      if (params.session_uuid) cleanParams.session_uuid = params.session_uuid;
      if (params.device_uuid) cleanParams.device_uuid = params.device_uuid;
      if (params.route) cleanParams.route = params.route;
      if (params.from) cleanParams.from = params.from;
      if (params.to) cleanParams.to = params.to;
      if (params.search) cleanParams.search = params.search;
    }

    return apiClient.get<LengthAwarePaginator<SecurityEvent>>("/security-events", {
      params: cleanParams,
    });
  },

  /**
   * Show a single security event details
   * GET /security-events/{securityEvent}
   */
  async getSecurityEvent(securityEventUuid: string): Promise<SecurityEvent> {
    const res = await apiClient.get<SecurityEventDetailResponse | SecurityEvent>(
      `/security-events/${encodeURIComponent(securityEventUuid)}`
    );

    if (res && typeof res === "object" && "data" in res && res.data) {
      return res.data;
    }
    return res as SecurityEvent;
  },
};
