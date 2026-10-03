"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Key,
  Sparkles,
  Users,
  Search,
  Building2,
  ChevronLeft,
  Crown,
  Package,
  DollarSign,
  ShoppingCart,
  Users2,
  Hash,
  ShieldAlert,
  Edit3,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBusiness } from "@/context/business-context";
import { useRoleStore } from "@/stores/useRoleStore";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { permissionsApi } from "@/lib/api/permissions";
import { storageCache } from "@/lib/storage/storage-cache";
import type { Role, Permission } from "@/types";
import {
  CreateRoleModal,
  EditRoleModal,
  DeleteRoleModal,
  ProvisionRoleModal,
  PermissionMatrixModal,
  GranularPermissionMatrix,
  RolesPageSkeleton,
} from "@/components/admin/roles";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { UserRoleAssignments } from "@/components/admin/users";

interface RoleThemeConfig {
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  tag: string;
  defaultDescription: string;
  icon: React.ReactNode;
}

const getRoleConfig = (code: string, isSystem: boolean): RoleThemeConfig => {
  const c = code.toLowerCase().trim();

  // 1. Super Admin / Owner
  if (c === "super_admin" || c === "owner") {
    return {
      iconBg: "bg-purple-100 dark:bg-purple-950/60",
      iconColor: "text-purple-600 dark:text-purple-400",
      badgeBg: "bg-purple-50 dark:bg-purple-950/50",
      badgeText: "text-purple-700 dark:text-purple-300",
      badgeBorder: "border-purple-200 dark:border-purple-800/60",
      tag: c === "super_admin" ? "Super Admin" : "Root Owner",
      defaultDescription:
        "Full sovereign authority across all microservice modules, role governance, multi-tenant businesses, and system operations.",
      icon: <Crown className="h-5 w-5" />,
    };
  }

  // 2. Inventory Module Roles
  if (
    c.startsWith("inventory") ||
    c.includes("warehouse") ||
    c.includes("planner") ||
    c.includes("purchasing") ||
    c.includes("procurement") ||
    c.includes("fulfillment")
  ) {
    return {
      iconBg: "bg-blue-100 dark:bg-blue-950/60",
      iconColor: "text-blue-600 dark:text-blue-400",
      badgeBg: "bg-blue-50 dark:bg-blue-950/50",
      badgeText: "text-blue-700 dark:text-blue-300",
      badgeBorder: "border-blue-200 dark:border-blue-800/60",
      tag: c === "inventory_admin" ? "Inventory Admin" : "Inventory Module",
      defaultDescription:
        "Stock warehousing, inventory counts, supplier purchase orders, product receiving, and order fulfillment workflows.",
      icon: <Package className="h-5 w-5" />,
    };
  }

  // 3. Finance Module Roles
  if (
    c.startsWith("finance") ||
    c.includes("treasury") ||
    c.includes("analyst") ||
    c.includes("ar_") ||
    c.includes("ap_") ||
    c.includes("ledger") ||
    c.includes("controller") ||
    c.includes("accountant")
  ) {
    return {
      iconBg: "bg-rose-100 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-50 dark:bg-rose-950/50",
      badgeText: "text-rose-700 dark:text-rose-300",
      badgeBorder: "border-rose-200 dark:border-rose-800/60",
      tag: c === "finance_admin" ? "Finance Admin" : "Finance Module",
      defaultDescription:
        "General ledger postings, chart of accounts, treasury cash management, vendor bills AP, customer invoices AR, and fiscal reporting.",
      icon: <DollarSign className="h-5 w-5" />,
    };
  }

  // 4. POS Module Roles
  if (
    c.startsWith("pos") ||
    c === "store_manager" ||
    c === "manager" ||
    c === "cashier" ||
    c === "shift_supervisor"
  ) {
    return {
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      badgeBorder: "border-emerald-200 dark:border-emerald-800/60",
      tag: c === "cashier" ? "Terminal Cashier" : "POS Module",
      defaultDescription:
        "Cashier register sessions, item barcode lookup, retail checkout transactions, payment capture, and shift reconciliation.",
      icon: <ShoppingCart className="h-5 w-5" />,
    };
  }

  // 5. HR Module Roles
  if (
    c.startsWith("hr") ||
    c.includes("payroll") ||
    c.includes("recruiter") ||
    c.includes("people_manager")
  ) {
    return {
      iconBg: "bg-violet-100 dark:bg-violet-950/60",
      iconColor: "text-violet-600 dark:text-violet-400",
      badgeBg: "bg-violet-50 dark:bg-violet-950/50",
      badgeText: "text-violet-700 dark:text-violet-300",
      badgeBorder: "border-violet-200 dark:border-violet-800/60",
      tag: c === "hr_admin" ? "HR Admin" : "HR Module",
      defaultDescription:
        "Staff management, payroll processing, benefits administration, recruitment pipelines, attendance, and employee self-service.",
      icon: <Users2 className="h-5 w-5" />,
    };
  }

  // Default / System Administrator
  return {
    iconBg: "bg-indigo-100 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    badgeBorder: "border-indigo-200 dark:border-indigo-800/60",
    tag: isSystem ? "System Role" : "Custom Role",
    defaultDescription:
      "Operational role configured with custom tenant and outlet permissions.",
    icon: <Shield className="h-5 w-5" />,
  };
};

export default function AdminRolesPage() {
  const toast = useToast();
  const { businesses } = useBusiness();
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [viewMode, setViewMode] = useState<"table" | "matrix">("table");

  // ----- Zoom handling -----
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.0;
  const ZOOM_STEP = 0.1;

  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("adminRolesZoom");
      return stored ? Number(stored) : 1;
    }
    return 1;
  });

  // Persist zoom level
  useEffect(() => {
    localStorage.setItem("adminRolesZoom", zoom.toString());
  }, [zoom]);

  // Wheel listener for Ctrl/Cmd + scroll
  useEffect(() => {
    const wrapper = document.getElementById("zoom-wrapper");
    if (!wrapper) return;
    const handleWheel = (e: WheelEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      setZoom((prev) => {
        const newZoom = delta > 0 ? prev - ZOOM_STEP : prev + ZOOM_STEP;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
      });
    };
    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapper.removeEventListener("wheel", handleWheel);
  }, []);


  // Role Store
  const {
    roles,
    paginator,
    currentPage,
    isLoading,
    searchQuery,
    filterType,
    selectedBusinessUuid,
    fetchRoles,
    setSearchQuery,
    setFilterType,
    setSelectedBusinessUuid,
    setCurrentPage,
    syncPermissions,
  } = useRoleStore();

  const [allPermissions, setAllPermissions] = useState<Permission[]>(
    () => usePermissionStore.getState().permissions
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleForMatrix, setRoleForMatrix] = useState<Role | null>(null);

  // Inline Matrix view state
  const [inlineRoleUuid, setInlineRoleUuid] = useState<string | null>(null);
  const inlineSelectedRole = useMemo(() => {
    if (inlineRoleUuid) {
      const found = roles.find((r) => r.uuid === inlineRoleUuid);
      if (found) return found;
    }
    return roles[0] || null;
  }, [roles, inlineRoleUuid]);
  const [inlineSelectedUuids, setInlineSelectedUuids] = useState<Set<string>>(new Set());
  const [isInlineSaving, setIsInlineSaving] = useState(false);

  useEffect(() => {
    if (inlineSelectedRole && inlineSelectedRole.permissions) {
      setInlineSelectedUuids(new Set(inlineSelectedRole.permissions.map((p) => p.uuid).filter(Boolean)));
    }
  }, [inlineSelectedRole]);

  // Initial Fetch: Roles & Complete Permissions Catalog
  useEffect(() => {
    void fetchRoles(selectedBusinessUuid, currentPage);
  }, [fetchRoles, selectedBusinessUuid, currentPage]);

  useEffect(() => {
    void (async () => {
      try {
        const perms = await permissionsApi.getAllPermissions();
        if (Array.isArray(perms) && perms.length > 0) {
          setAllPermissions(perms);
          storageCache.set("smartpos:cache:permissions", perms, 120);
        } else {
          setAllPermissions(usePermissionStore.getState().permissions);
        }
      } catch {
        setAllPermissions(usePermissionStore.getState().permissions);
      }
    })();
  }, []);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return roles.filter((role) => {
      // 1. Filter Type (all, system, custom)
      if (filterType === "system" && !role.is_system) return false;
      if (filterType === "custom" && role.is_system) return false;

      // 2. Keyword Search
      if (q) {
        const matchesName = role.name.toLowerCase().includes(q);
        const matchesCode = role.code.toLowerCase().includes(q);
        const roleConfig = getRoleConfig(role.code, role.is_system);
        const matchesDesc = (role.description || roleConfig.defaultDescription || "").toLowerCase().includes(q);
        const matchesPerms = role.permissions?.some((p) =>
          p.code.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCode && !matchesDesc && !matchesPerms) {
          return false;
        }
      }

      return true;
    });
  }, [roles, searchQuery, filterType]);

  // Statistics
  const totalRolesCount = roles.length;
  const systemRolesCount = roles.filter((r) => r.is_system).length;
  const customRolesCount = roles.filter((r) => !r.is_system).length;

  if (isLoading && roles.length === 0) {
    return <RolesPageSkeleton />;
  }

  return (
    <div id="zoom-wrapper" style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', width: '100%', minHeight: '100vh', overflow: 'auto' }} className="space-y-6 max-w-[1600px] mx-auto pb-12 px-2 sm:px-4">
      {/* 🚀 Header & Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 p-6 md:p-8 shadow-xs transition-all">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400 mb-3">
              <Link href="/admin" className="hover:text-blue-600 transition-colors">
                Admin Workspace
              </Link>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <span className="text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-semibold">
                Roles & RBAC
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
                <Shield className="h-7 w-7 text-white stroke-[2.2] drop-shadow-md" />
              </div>
              <div className="pt-0.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Access Control Engine
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  Enterprise-grade Role-Based Access Control (RBAC). Configure granular permission matrices and manage zero-trust employee authorization policies.
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link href="/admin/permissions" className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-all active:scale-[0.98] shadow-2xs">
                <Key className="h-4 w-4 text-amber-500" />
                <span>Permissions Library</span>
              </button>
            </Link>

            {activeTab === "roles" && (
              <>
                <button
                  onClick={() => setIsProvisionModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FAF5FF] dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 text-[#7E22CE] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 transition-all active:scale-[0.98] shadow-2xs"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Auto-Provision</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white transition-all active:scale-[0.98] shadow-sm hover:shadow"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>New Role</span>
                </button>

                <button
                  onClick={() => void fetchRoles(selectedBusinessUuid, currentPage)}
                  disabled={isLoading}
                  title="Reload roles"
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xs"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 📊 KPI Summary Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Total Roles</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">{totalRolesCount}</span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-slate-100 dark:border-zinc-800 pl-6">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">System Templates</span>
            <span className="text-3xl font-extrabold text-[#2563eb] dark:text-blue-400 drop-shadow-sm">{systemRolesCount}</span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-slate-100 dark:border-zinc-800 pl-6">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Tenant Specific</span>
            <span className="text-3xl font-extrabold text-[#9333ea] dark:text-purple-400 drop-shadow-sm">{customRolesCount}</span>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-slate-100 dark:border-zinc-800 pl-6">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Security Engine</span>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 w-fit">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">JWT Strict</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Segmented Control Tabs */}
      <div className="flex justify-center my-2">
        <div className="inline-flex p-1 bg-slate-500/20 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-inner border border-slate-300/30 dark:border-white/5 w-full max-w-lg">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === "roles"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <Shield className={`h-4 w-4 ${activeTab === "roles" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
            <span>Roles Configuration</span>
            {activeTab === "roles" && (
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                <AnimatedNumber value={roles.length} />
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === "users"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-md"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
          >
            <Users className={`h-4 w-4 ${activeTab === "users" ? "text-purple-600 dark:text-purple-400" : ""}`} />
            <span>User Assignments</span>
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <UserRoleAssignments />
      ) : (
        <>
          {/* 🔍 Search & Filters Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search roles by name, module, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Tenant Dropdown */}
              <div className="relative">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 transition-colors cursor-pointer">
                  <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">TENANT:</span>
                  <select
                    value={selectedBusinessUuid || ""}
                    onChange={(e) => {
                      const val = e.target.value ? e.target.value : null;
                      setSelectedBusinessUuid(val);
                      void fetchRoles(val, 1);
                    }}
                    className="text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer appearance-none pr-5"
                  >
                    <option value="" className="dark:bg-zinc-900 font-medium">Global Core (All)</option>
                    {businesses.map((b) => (
                      <option key={b.uuid} value={b.uuid} className="dark:bg-zinc-900 font-medium">
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 pointer-events-none absolute right-3" />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-zinc-800 pl-3">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === "all"
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300"
                    }`}
                >
                  All ({roles.length})
                </button>
                <button
                  onClick={() => setFilterType("system")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === "system"
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300"
                    }`}
                >
                  System Templates ({systemRolesCount})
                </button>
                <button
                  onClick={() => setFilterType("custom")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === "custom"
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300"
                    }`}
                >
                  Custom ({customRolesCount})
                </button>
              </div>

              {/* View Switcher: Table vs Inline Matrix */}
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-zinc-800 pl-3">
                <button
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "table"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <TableIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("matrix")}
                  title="Granular Matrix View"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "matrix"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 📋 TABLE STYLE VIEW */}
          {viewMode === "table" ? (
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#edf2f9] dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 text-xs font-semibold select-none border-b border-slate-200/80 dark:border-zinc-700/60">
                      <th className="py-3 px-6 font-semibold">ROLE</th>
                      <th className="py-3 px-4 font-semibold">TYPE & SCOPE</th>
                      <th className="py-3 px-4 font-semibold hidden lg:table-cell">DESCRIPTION</th>
                      <th className="py-3 px-4 font-semibold">PERMISSIONS</th>
                      <th className="py-3 px-6 text-right font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-xs text-slate-400">
                          No roles found matching "{searchQuery}".
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((role) => {
                        const isSystem = Boolean(role.is_system);
                        const config = getRoleConfig(role.code, isSystem);
                        const permCount = role.permissions?.length ?? 0;

                        return (
                          <tr
                            key={role.uuid}
                            className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                          >
                            {/* Role Column */}
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3.5">
                                <div
                                  className={`h-10 w-10 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                                >
                                  {config.icon}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                                    {role.name.replace(/_/g, " ")}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <Hash className="h-3 w-3" />
                                      {role.code}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Type & Scope Column */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1 items-start">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                                >
                                  {config.tag}
                                </span>
                                {role.business_uuid ? (
                                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/40 flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    {businesses.find((b) => b.uuid === role.business_uuid)?.name || "Tenant Scoped"}
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <ShieldAlert className="h-3 w-3 text-slate-400" />
                                    Global Scope
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Description Column */}
                            <td className="py-3.5 px-4 hidden lg:table-cell">
                              <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 max-w-sm leading-relaxed">
                                {config.defaultDescription}
                              </p>
                            </td>

                            {/* Permissions Column */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1.5 items-start">
                                <button
                                  onClick={() => setRoleForMatrix(role)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                                  title="Open Granular Permission Matrix"
                                >
                                  <Key className="h-3 w-3 text-amber-500" />
                                  <span>{permCount} permissions</span>
                                </button>
                                {role.permissions && role.permissions.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {role.permissions.slice(0, 2).map((p) => (
                                      <span
                                        key={p.uuid || p.code}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800"
                                      >
                                        {p.code}
                                      </span>
                                    ))}
                                    {role.permissions.length > 2 && (
                                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                        +{role.permissions.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="py-3.5 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setRoleForMatrix(role)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-900 hover:text-white dark:bg-zinc-800 dark:hover:bg-white dark:hover:text-slate-900 text-slate-800 dark:text-zinc-100 transition-all active:scale-[0.98] shadow-2xs"
                                >
                                  <Key className="h-3.5 w-3.5" />
                                  <span>Matrix</span>
                                </button>

                                <button
                                  onClick={() => setRoleToEdit(role)}
                                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all active:scale-95 shadow-2xs"
                                  title="Edit Role"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => setRoleToDelete(role)}
                                  disabled={isSystem}
                                  title={isSystem ? "System roles are protected" : "Delete custom role"}
                                  className={`h-8 w-8 flex items-center justify-center rounded-xl border transition-all active:scale-95 shadow-2xs ${isSystem
                                      ? "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                                      : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                                    }`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginator && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
                  <span>
                    Page {paginator.current_page} of {paginator.last_page} ({paginator.total} total roles)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage >= paginator.last_page}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 🎛️ INLINE GRANULAR MATRIX VIEW */
            roles.length > 0 && inlineSelectedRole && (
              <GranularPermissionMatrix
                roles={roles}
                selectedRole={inlineSelectedRole}
                onSelectRole={(r) => setInlineRoleUuid(r.uuid)}
                allPermissions={allPermissions}
                selectedUuids={inlineSelectedUuids}
                onToggleUuid={(uuid) => {
                  setInlineSelectedUuids((prev) => {
                    const next = new Set(prev);
                    if (next.has(uuid)) next.delete(uuid);
                    else next.add(uuid);
                    return next;
                  });
                }}
                onToggleBatch={(uuids, shouldSelect) => {
                  setInlineSelectedUuids((prev) => {
                    const next = new Set(prev);
                    uuids.forEach((id) => (shouldSelect ? next.add(id) : next.delete(id)));
                    return next;
                  });
                }}
                onSave={async () => {
                  setIsInlineSaving(true);
                  try {
                    const updatedUuids = Array.from(inlineSelectedUuids);
                    await syncPermissions(inlineSelectedRole.uuid, updatedUuids);
                    toast.success(`Permission matrix for "${inlineSelectedRole.name}" updated successfully!`);
                    await fetchRoles(selectedBusinessUuid, currentPage);
                  } catch {
                    toast.error("Failed to save permission matrix.");
                  } finally {
                    setIsInlineSaving(false);
                  }
                }}
                isSaving={isInlineSaving}
                hasUnsavedChanges={true}
                compact={true}
              />
            )
          )}
        </>
      )}

      {/* Supporting Modals */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />

      <EditRoleModal
        isOpen={Boolean(roleToEdit)}
        onClose={() => setRoleToEdit(null)}
        role={roleToEdit}
        onSuccess={async () => {
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />

      <DeleteRoleModal
        isOpen={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        role={roleToDelete}
        onSuccess={async () => {
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />

      <ProvisionRoleModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onSuccess={async () => {
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />

      <PermissionMatrixModal
        isOpen={Boolean(roleForMatrix)}
        onClose={() => setRoleForMatrix(null)}
        role={roleForMatrix}
        roles={roles}
        onSuccess={async (updatedUuids?: string[]) => {
          if (roleForMatrix && updatedUuids) {
            await syncPermissions(roleForMatrix.uuid, updatedUuids).catch(() => { });
          }
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />
    </div>

  );
}
