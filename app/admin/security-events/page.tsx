"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  Globe,
  User,
  Building2,
  Laptop,
  Key,
  LogIn,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  X,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  FileCode,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { securityEventsApi } from "@/lib/api/security-events";
import { SecurityEventDetailModal } from "@/components/admin/security-events";
import { storageCache } from "@/lib/storage/storage-cache";
import type { SecurityEvent, LengthAwarePaginator } from "@/types";

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All Event Types" },
  { value: "LOGIN_SUCCESS", label: "Login Success (LOGIN_SUCCESS)" },
  { value: "LOGIN_FAILED", label: "Login Failed (LOGIN_FAILED)" },
  { value: "LOGOUT", label: "Logout (LOGOUT)" },
  { value: "UNAUTHORIZED_ROLE_DELEGATION_ATTEMPT", label: "Unauthorized Role Delegation Attempt" },
  { value: "EMAIL_CHANGE_REQUESTED", label: "Email Change Requested" },
  { value: "EMAIL_CHANGED", label: "Email Changed" },
  { value: "PASSWORD_CHANGED", label: "Password Changed" },
];

const SEVERITY_OPTIONS = [
  { value: "", label: "All Severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const PER_PAGE_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

export default function SecurityEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // State
  const [paginator, setPaginator] = useState<LengthAwarePaginator<SecurityEvent> | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Advanced filters state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [userUuidFilter, setUserUuidFilter] = useState("");
  const [businessUuidFilter, setBusinessUuidFilter] = useState("");
  const [sessionUuidFilter, setSessionUuidFilter] = useState("");
  const [deviceUuidFilter, setDeviceUuidFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");

  // Inspection Modal
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load events
  const loadEvents = useCallback(
    async (showSilentLoading = false) => {
      const isDefaultQuery =
        currentPage === 1 &&
        !eventTypeFilter &&
        !severityFilter &&
        !userUuidFilter &&
        !businessUuidFilter &&
        !sessionUuidFilter &&
        !deviceUuidFilter &&
        !routeFilter &&
        !fromDate &&
        !toDate &&
        !searchQuery;

      if (!showSilentLoading) {
        if (isDefaultQuery) {
          const cached = storageCache.get<LengthAwarePaginator<SecurityEvent>>(
            "smartpos:cache:security-events"
          );
          if (cached && cached.data?.length > 0) {
            setPaginator(cached);
            setEvents(cached.data || []);
            setIsLoading(false);
          } else {
            setIsLoading(true);
          }
        } else {
          setIsLoading(true);
        }
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const response = await securityEventsApi.getSecurityEvents({
          page: currentPage,
          per_page: perPage,
          event_type: eventTypeFilter || undefined,
          severity: severityFilter || undefined,
          user_uuid: userUuidFilter || undefined,
          business_uuid: businessUuidFilter || undefined,
          session_uuid: sessionUuidFilter || undefined,
          device_uuid: deviceUuidFilter || undefined,
          route: routeFilter || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
          search: searchQuery || undefined,
        });

        if (isDefaultQuery) {
          storageCache.set("smartpos:cache:security-events", response, 120);
        }

        setPaginator(response);
        setEvents(response.data || []);
      } catch (err: any) {
        const message = err?.message || "Failed to load security audit events.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      currentPage,
      perPage,
      eventTypeFilter,
      severityFilter,
      userUuidFilter,
      businessUuidFilter,
      sessionUuidFilter,
      deviceUuidFilter,
      routeFilter,
      fromDate,
      toDate,
      searchQuery,
      toast,
    ]
  );

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  // Check if a specific event UUID was passed via query parameter
  useEffect(() => {
    const eventParam = searchParams.get("event");
    if (eventParam && events.length > 0) {
      const match = events.find((e) => e.uuid === eventParam);
      if (match) {
        setSelectedEvent(match);
        setIsModalOpen(true);
      }
    }
  }, [searchParams, events]);

  // Reset all filters
  const resetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSeverityFilter("");
    setEventTypeFilter("");
    setFromDate("");
    setToDate("");
    setUserUuidFilter("");
    setBusinessUuidFilter("");
    setSessionUuidFilter("");
    setDeviceUuidFilter("");
    setRouteFilter("");
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (severityFilter) count++;
    if (eventTypeFilter) count++;
    if (fromDate) count++;
    if (toDate) count++;
    if (userUuidFilter) count++;
    if (businessUuidFilter) count++;
    if (sessionUuidFilter) count++;
    if (deviceUuidFilter) count++;
    if (routeFilter) count++;
    return count;
  }, [
    searchQuery,
    severityFilter,
    eventTypeFilter,
    fromDate,
    toDate,
    userUuidFilter,
    businessUuidFilter,
    sessionUuidFilter,
    deviceUuidFilter,
    routeFilter,
  ]);

  // Calculated Metrics from loaded dataset
  const metrics = useMemo(() => {
    const total = paginator?.total ?? events.length;
    const criticalCount = events.filter((e) => e.severity?.toLowerCase() === "critical").length;
    const highCount = events.filter((e) => e.severity?.toLowerCase() === "high").length;
    const failedLogins = events.filter((e) => e.event_type === "LOGIN_FAILED").length;
    return {
      total,
      criticalHigh: criticalCount + highCount,
      failedLogins,
      currentPageCount: events.length,
    };
  }, [paginator, events]);

  const copyToClipboard = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard.`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getSeverityBadge = (severity: string) => {
    const sev = severity?.toLowerCase();
    switch (sev) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="h-3 w-3" />
            Critical
          </span>
        );
      case "high":
        return (
          <Badge variant="danger" size="sm">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="warning" size="sm">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="success" size="sm">
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {severity || "Info"}
          </Badge>
        );
    }
  };

  const getEventIcon = (eventType: string) => {
    const type = eventType?.toUpperCase();
    if (type?.includes("CRITICAL") || type?.includes("UNAUTHORIZED")) {
      return <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
    }
    if (type?.includes("LOGIN_FAILED")) {
      return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }
    if (type?.includes("LOGIN_SUCCESS")) {
      return <LogIn className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (type?.includes("LOGOUT")) {
      return <LogOut className="h-4 w-4 text-slate-500 dark:text-zinc-400" />;
    }
    if (type?.includes("PASSWORD")) {
      return <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
    if (type?.includes("EMAIL")) {
      return <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
    }
    return <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
  };

  const formatDateTime = (ts: string | null) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getRelativeTime = (ts: string | null) => {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Security & Forensic Audit Logs
              </h1>
              <p className="text-xs text-zinc-500">
                Surveillance and audit trail for security events, authentication attempts, and authorization anomalies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadEvents(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Total Events
              </span>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {metrics.total.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400">logged records</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Critical & High
              </span>
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                {metrics.criticalHigh}
              </span>
              <span className="text-[11px] text-zinc-400">on current slice</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Failed Logins
              </span>
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                {metrics.failedLogins}
              </span>
              <span className="text-[11px] text-zinc-400">investigation alerts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Active Filters
              </span>
              <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {activeFiltersCount}
              </span>
              <span className="text-[11px] text-zinc-400">applied filters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Filter Bar */}
      <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardContent className="p-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search event, IP, route, description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <Select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={SEVERITY_OPTIONS}
              className="text-xs"
            />

            {/* Event Type Filter */}
            <Select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={EVENT_TYPE_OPTIONS}
              className="text-xs"
            />

            {/* Advanced Filters Button */}
            <Button
              type="button"
              variant={isAdvancedOpen || activeFiltersCount > 0 ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold"
            >
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters & Date Range</span>
              </div>
              {isAdvancedOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Collapsible Advanced Filters */}
          {isAdvancedOpen && (
            <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in-50 duration-200">
              {/* Date From */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* User UUID */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  User UUID
                </label>
                <input
                  type="text"
                  placeholder="Filter by user UUID..."
                  value={userUuidFilter}
                  onChange={(e) => {
                    setUserUuidFilter(e.target.value.trim());
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Route */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  API Route
                </label>
                <input
                  type="text"
                  placeholder="e.g. api/v1/auth/login"
                  value={routeFilter}
                  onChange={(e) => {
                    setRouteFilter(e.target.value.trim());
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        {error ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Could not load security audit events
            </div>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => loadEvents()}>
              Retry Request
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-80 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No security events found
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              There are no audit log events matching the selected filters.
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Event & Summary</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Network & Route</th>
                  <th className="py-3 px-4">Actor / Subject</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {events.map((item) => (
                  <tr
                    key={item.uuid}
                    onClick={() => {
                      setSelectedEvent(item);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Event & Summary */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          {getEventIcon(item.event_type)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{item.event_type}</span>
                          </div>
                          {item.description ? (
                            <p className="text-[11px] text-zinc-500 truncate max-w-sm mt-0.5">
                              {item.description}
                            </p>
                          ) : (
                            <p className="text-[11px] text-zinc-400 italic mt-0.5">
                              No description provided
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(item.severity)}
                    </td>

                    {/* Network & Route */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                          {item.http_method && (
                            <span className="px-1 py-0.2 rounded text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {item.http_method}
                            </span>
                          )}
                          <span className="truncate max-w-[200px]" title={item.route || ""}>
                            {item.route || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                          <Globe className="h-3 w-3" />
                          <span>{item.ip_address || "Unknown IP"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                          <User className="h-3 w-3 text-zinc-400" />
                          {item.user_uuid ? (
                            <span title={item.user_uuid}>
                              {item.user_uuid.slice(0, 8)}...{item.user_uuid.slice(-4)}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic font-sans text-xs">Anonymous</span>
                          )}
                          {item.user_uuid && (
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(e, item.user_uuid!, `user-${item.uuid}`)}
                              className="p-0.5 hover:text-blue-600 text-zinc-400 ml-0.5"
                              title="Copy User UUID"
                            >
                              {copiedKey === `user-${item.uuid}` ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          )}
                        </div>
                        {item.business_uuid && (
                          <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[140px]">
                            biz: {item.business_uuid.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {formatDateTime(item.occurred_at || item.created_at)}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {getRelativeTime(item.occurred_at || item.created_at)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(item);
                            setIsModalOpen(true);
                          }}
                          className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Inspect
                        </Button>
                        <Link
                          href={`/admin/security-events/${encodeURIComponent(item.uuid)}`}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Open standalone page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {paginator && paginator.last_page > 1 && (
          <div className="p-3.5 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <span>
                Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.from ?? 0}</span> to{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.to ?? 0}</span> of{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.total}</span> events
              </span>

              <div className="w-28">
                <Select
                  value={String(perPage)}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={PER_PAGE_OPTIONS}
                  className="py-1 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>

              <div className="flex items-center px-2 font-medium text-zinc-700 dark:text-zinc-300">
                Page {currentPage} of {paginator.last_page}
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= paginator.last_page}
                onClick={() => setCurrentPage((p) => Math.min(paginator.last_page, p + 1))}
                className="h-8 px-2.5"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Forensic Detail Modal */}
      <SecurityEventDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </div>
  );
}
