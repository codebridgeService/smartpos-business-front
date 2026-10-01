"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Calendar,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Smartphone,
  Key,
  LogIn,
  LogOut,
  Mail,
  User,
  Building2,
  Terminal,
  RefreshCw,
  Code,
  Layers,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { securityEventsApi } from "@/lib/api/security-events";
import type { SecurityEvent } from "@/types";

interface SecurityEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SecurityEvent | null;
  eventUuid?: string | null;
}

export function SecurityEventDetailModal({
  isOpen,
  onClose,
  event: initialEvent,
  eventUuid,
}: SecurityEventDetailModalProps) {
  const toast = useToast();
  const [event, setEvent] = useState<SecurityEvent | null>(initialEvent);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  useEffect(() => {
    if (!isOpen) return;

    const targetUuid = eventUuid || initialEvent?.uuid;
    if (targetUuid && (!initialEvent || initialEvent.uuid !== targetUuid)) {
      void fetchDetail(targetUuid);
    }
  }, [isOpen, eventUuid, initialEvent]);

  const fetchDetail = async (uuid: string) => {
    setIsLoading(true);
    try {
      const data = await securityEventsApi.getSecurityEvent(uuid);
      setEvent(data);
    } catch {
      toast.error("Could not fetch forensic details for this security event.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard.`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const getSeverityBadge = (severity: string) => {
    const sev = severity?.toLowerCase();
    switch (sev) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="h-3.5 w-3.5" />
            Critical
          </span>
        );
      case "high":
        return (
          <Badge variant="danger" size="md">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="warning" size="md">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="success" size="md">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="md">
            <Info className="h-3.5 w-3.5 mr-1" />
            {severity || "Info"}
          </Badge>
        );
    }
  };

  const getEventIcon = (eventType: string) => {
    const type = eventType?.toUpperCase();
    if (type?.includes("CRITICAL") || type?.includes("UNAUTHORIZED")) {
      return <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
    }
    if (type?.includes("LOGIN_FAILED")) {
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    }
    if (type?.includes("LOGIN_SUCCESS")) {
      return <LogIn className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (type?.includes("LOGOUT")) {
      return <LogOut className="h-5 w-5 text-slate-500 dark:text-zinc-400" />;
    }
    if (type?.includes("PASSWORD")) {
      return <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    if (type?.includes("EMAIL")) {
      return <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    }
    return <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  };

  const formatTimestamp = (ts: string | null | undefined): { formatted: string; relative: string } => {
    if (!ts) return { formatted: "N/A", relative: "N/A" };
    const date = new Date(ts);
    return {
      formatted: date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }),
      relative: getRelativeTimeString(date),
    };
  };

  const getRelativeTimeString = (date: Date): string => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100">
            {event ? getEventIcon(event.event_type) : <ShieldAlert className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {event?.event_type || "Security Event Details"}
            </h2>
            <p className="text-xs text-zinc-500 font-normal">
              Forensic audit log inspection
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          {event?.uuid ? (
            <Link
              href={`/admin/security-events/${encodeURIComponent(event.uuid)}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              Open dedicated event page
              <ExternalLink className="h-3 w-3" />
            </Link>
          ) : (
            <div />
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : !event ? (
        <div className="text-center py-10 text-zinc-500 text-sm">
          No security event data available.
        </div>
      ) : (
        <div className="space-y-5 text-sm">
          {/* Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Severity:</span>
              {getSeverityBadge(event.severity)}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>
                {formatTimestamp(event.occurred_at || event.created_at).relative} (
                {formatTimestamp(event.occurred_at || event.created_at).formatted})
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs leading-relaxed font-medium">
              {event.description}
            </div>
          )}

          {/* Identification & UUIDs */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Layers className="h-3.5 w-3.5" />
              <span>Entities & Identifiers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Event UUID */}
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase">Event UUID</div>
                  <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                    {event.uuid}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(event.uuid, "Event UUID")}
                  className="h-7 w-7 p-0 shrink-0"
                  title="Copy UUID"
                >
                  {copiedKey === "Event UUID" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </Button>
              </div>

              {/* User UUID */}
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1">
                    <User className="h-3 w-3" />
                    User UUID
                  </div>
                  <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                    {event.user_uuid || <span className="text-zinc-400 italic font-sans">Anonymous / None</span>}
                  </div>
                </div>
                {event.user_uuid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(event.user_uuid!, "User UUID")}
                    className="h-7 w-7 p-0 shrink-0"
                    title="Copy User UUID"
                  >
                    {copiedKey === "User UUID" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </Button>
                )}
              </div>

              {/* Business UUID */}
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Business UUID
                  </div>
                  <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                    {event.business_uuid || <span className="text-zinc-400 italic font-sans">Global Platform</span>}
                  </div>
                </div>
                {event.business_uuid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(event.business_uuid!, "Business UUID")}
                    className="h-7 w-7 p-0 shrink-0"
                    title="Copy Business UUID"
                  >
                    {copiedKey === "Business UUID" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </Button>
                )}
              </div>

              {/* Session UUID */}
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1">
                    <Laptop className="h-3 w-3" />
                    Session UUID
                  </div>
                  <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                    {event.session_uuid || <span className="text-zinc-400 italic font-sans">No Active Session</span>}
                  </div>
                </div>
                {event.session_uuid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(event.session_uuid!, "Session UUID")}
                    className="h-7 w-7 p-0 shrink-0"
                    title="Copy Session UUID"
                  >
                    {copiedKey === "Session UUID" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Network & HTTP Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
              <Globe className="h-3.5 w-3.5" />
              <span>Network & HTTP Context</span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase">IP Address</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {event.ip_address || "Unknown"}
                    </span>
                    {event.ip_address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(event.ip_address!, "IP Address")}
                        className="h-6 w-6 p-0"
                        title="Copy IP"
                      >
                        {copiedKey === "IP Address" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-zinc-400" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase">HTTP Route & Method</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {event.http_method && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {event.http_method}
                      </span>
                    )}
                    <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate">
                      {event.route || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {event.user_agent && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase mb-1">User Agent</div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 break-all leading-normal">
                    {event.user_agent}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Forensic Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <Terminal className="h-3.5 w-3.5" />
                <span>Forensic Metadata</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Code className="h-3 w-3" />
                {showRawJson ? "Show Structured View" : "View Raw JSON"}
              </button>
            </div>

            {showRawJson ? (
              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed border border-zinc-800">
                  {JSON.stringify(event.metadata ?? {}, null, 2)}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(event.metadata ?? {}, null, 2),
                      "Metadata JSON"
                    )
                  }
                  className="absolute top-2 right-2 h-7 px-2 text-[11px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                >
                  {copiedKey === "Metadata JSON" ? (
                    <Check className="h-3 w-3 text-emerald-400 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  Copy JSON
                </Button>
              </div>
            ) : event.metadata &&
              typeof event.metadata === "object" &&
              Object.keys(event.metadata).length > 0 ? (
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-2">
                {Object.entries(event.metadata).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex flex-wrap items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40"
                  >
                    <span className="font-mono text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      {key}
                    </span>
                    <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100 font-medium">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 italic">
                No extra metadata logged for this event.
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
