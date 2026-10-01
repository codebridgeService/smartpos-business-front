"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Clock,
  Calendar,
  Globe,
  User,
  Building2,
  Laptop,
  Key,
  LogIn,
  LogOut,
  Mail,
  Copy,
  Check,
  Terminal,
  Code,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { securityEventsApi } from "@/lib/api/security-events";
import type { SecurityEvent } from "@/types";

export default function SecurityEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const eventUuid = Array.isArray(params.id) ? params.id[0] : params.id;

  const [event, setEvent] = useState<SecurityEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const fetchDetail = async (silent = false) => {
    if (!eventUuid) return;
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await securityEventsApi.getSecurityEvent(eventUuid);
      setEvent(data);
    } catch (err: any) {
      const msg = err?.message || "Failed to load security event details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchDetail();
  }, [eventUuid]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied.`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getSeverityBadge = (severity: string) => {
    const sev = severity?.toLowerCase();
    switch (sev) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="h-3.5 w-3.5" />
            Critical Severity
          </span>
        );
      case "high":
        return (
          <Badge variant="danger" size="md">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            High Severity
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="warning" size="md">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Medium Severity
          </Badge>
        );
      case "low":
        return (
          <Badge variant="success" size="md">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Low Severity
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
      return <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />;
    }
    if (type?.includes("LOGIN_FAILED")) {
      return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
    }
    if (type?.includes("LOGIN_SUCCESS")) {
      return <LogIn className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />;
    }
    if (type?.includes("LOGOUT")) {
      return <LogOut className="h-6 w-6 text-slate-500 dark:text-zinc-400" />;
    }
    if (type?.includes("PASSWORD")) {
      return <Key className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
    if (type?.includes("EMAIL")) {
      return <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
    }
    return <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
  };

  const formatTimestamp = (ts: string | null | undefined): { formatted: string; relative: string } => {
    if (!ts) return { formatted: "N/A", relative: "N/A" };
    const date = new Date(ts);
    return {
      formatted: date.toLocaleString("en-US", {
        weekday: "short",
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
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Link
            href="/admin/security-events"
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Security & Audit Logs
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            {eventUuid}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchDetail(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/security-events")}
            className="text-xs"
          >
            Back to List
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </Card>
      ) : error || !event ? (
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Security Event Not Found
          </h2>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {error || "The requested security audit event could not be found or has expired."}
          </p>
          <Button variant="secondary" size="sm" onClick={() => fetchDetail()}>
            Retry
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main Hero Header Card */}
          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {event.event_type}
                      </h1>
                      {getSeverityBadge(event.severity)}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Event ID #{event.id} • Forensic UUID:{" "}
                      <span className="font-mono text-zinc-700 dark:text-zinc-300">
                        {event.uuid}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(event.uuid, "Event UUID")}
                    className="text-xs flex items-center gap-1.5"
                  >
                    {copiedKey === "Event UUID" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    Copy UUID
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(event, null, 2), "Full Event JSON")}
                    className="text-xs flex items-center gap-1.5"
                  >
                    {copiedKey === "Full Event JSON" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Code className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    Copy Full JSON
                  </Button>
                </div>
              </div>

              {/* Event Description */}
              {event.description ? (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs font-medium leading-relaxed">
                  {event.description}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-400 italic">
                  No descriptive message attached to this security event.
                </div>
              )}

              {/* Quick Stat Pill Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Occurred At
                  </span>
                  <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mt-1">
                    {formatTimestamp(event.occurred_at || event.created_at).formatted}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {formatTimestamp(event.occurred_at || event.created_at).relative}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Client IP Address
                  </span>
                  <div className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-400" />
                    {event.ip_address || "Unknown IP"}
                  </div>
                  {event.ip_address && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(event.ip_address!, "IP Address")}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                    >
                      Copy IP Address
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    API Route & Method
                  </span>
                  <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5 truncate">
                    {event.http_method && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {event.http_method}
                      </span>
                    )}
                    <span className="truncate" title={event.route || ""}>
                      {event.route || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Associated Actor
                  </span>
                  <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5 truncate">
                    <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    {event.user_uuid ? (
                      <span className="truncate" title={event.user_uuid}>
                        {event.user_uuid.slice(0, 10)}...{event.user_uuid.slice(-4)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic font-sans">Anonymous</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identity & Forensic Entity Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Entity & Session Context
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* User UUID */}
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      User UUID
                    </span>
                    <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                      {event.user_uuid || <span className="text-zinc-400 italic font-sans">None</span>}
                    </div>
                  </div>
                  {event.user_uuid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(event.user_uuid!, "User UUID")}
                      className="h-7 w-7 p-0 shrink-0"
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
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Business UUID
                    </span>
                    <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                      {event.business_uuid || <span className="text-zinc-400 italic font-sans">Global Platform (System)</span>}
                    </div>
                  </div>
                  {event.business_uuid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(event.business_uuid!, "Business UUID")}
                      className="h-7 w-7 p-0 shrink-0"
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
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Session UUID
                    </span>
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
                    >
                      {copiedKey === "Session UUID" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Device UUID */}
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Device UUID
                    </span>
                    <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 truncate">
                      {event.device_uuid || <span className="text-zinc-400 italic font-sans">No Device Fingerprint</span>}
                    </div>
                  </div>
                  {event.device_uuid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(event.device_uuid!, "Device UUID")}
                      className="h-7 w-7 p-0 shrink-0"
                    >
                      {copiedKey === "Device UUID" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Network & Client User Agent */}
            <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Network & Client Forensics
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                    HTTP Request Route
                  </span>
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                    {event.http_method && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {event.http_method}
                      </span>
                    )}
                    <span>{event.route || "N/A"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase block mb-1">
                    Client User Agent
                  </span>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 font-mono text-[11px] text-zinc-700 dark:text-zinc-300 break-all leading-normal">
                    {event.user_agent || "No User-Agent provided."}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase block">
                      Created At
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {formatTimestamp(event.created_at).formatted}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase block">
                      Updated At
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {formatTimestamp(event.updated_at).formatted}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forensic Metadata Section */}
          <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Forensic Event Metadata
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRawJson(!showRawJson)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Code className="h-3.5 w-3.5 mr-1" />
                {showRawJson ? "Show Formatted Cards" : "View Raw JSON Payload"}
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {showRawJson ? (
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-zinc-800">
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
                    className="absolute top-3 right-3 h-7 px-2 text-[11px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(event.metadata).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1"
                    >
                      <span className="font-mono text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                        {key}
                      </span>
                      <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 break-all">
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-400 italic">
                  No additional forensic metadata properties recorded for this event.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
