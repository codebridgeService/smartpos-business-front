"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Plus,
  RefreshCw,
  ChevronRight,
  Key,
  Edit3,
  Trash2,
  Layers,
  ChevronLeft,
  Sparkles,
  Users,
  Lock,
  Search,
  Filter,
  Crown,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Boxes,
  Building2,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { useRoleStore, DEFAULT_SYSTEM_ROLES } from "@/stores/useRoleStore";
import type { Role, LengthAwarePaginator, ApiListResponse } from "@/types";
import {
  Button,
  Badge,
  SearchInput,
} from "@/components/ui";
import {
  CreateRoleModal,
  EditRoleModal,
  DeleteRoleModal,
  ProvisionRoleModal,
  PermissionMatrixModal,
} from "@/components/admin/roles";
import { UserRoleAssignments } from "@/components/admin/users";

interface RoleThemeConfig {
  gradient: string;
  glow: string;
  iconBg: string;
  iconColor: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  tag: string;
  defaultDescription: string;
  icon: React.ReactNode;
}

const getRoleConfig = (code: string, isSystem: boolean): RoleThemeConfig => {
  switch (code) {
    case "owner":
      return {
        gradient: "from-purple-500/10 via-violet-500/5 to-transparent",
        glow: "group-hover:shadow-purple-500/10",
        iconBg: "bg-purple-100 dark:bg-purple-950/60",
        iconColor: "text-purple-600 dark:text-purple-400",
        borderHover: "hover:border-purple-300 dark:hover:border-purple-800",
        badgeBg: "bg-purple-50 dark:bg-purple-950/50",
        badgeText: "text-purple-700 dark:text-purple-300",
        badgeBorder: "border-purple-200 dark:border-purple-800/60",
        tag: "Root Authority",
        defaultDescription:
          "Full sovereign control across multi-store provisioning, financial audits, cashier management, and fiscal ledger governance.",
        icon: <Crown className="h-5 w-5" />,
      };
    case "admin":
      return {
        gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
        glow: "group-hover:shadow-blue-500/10",
        iconBg: "bg-blue-100 dark:bg-blue-950/60",
        iconColor: "text-blue-600 dark:text-blue-400",
        borderHover: "hover:border-blue-300 dark:hover:border-blue-800",
        badgeBg: "bg-blue-50 dark:bg-blue-950/50",
        badgeText: "text-blue-700 dark:text-blue-300",
        badgeBorder: "border-blue-200 dark:border-blue-800/60",
        tag: "System Admin",
        defaultDescription:
          "System operations, RBAC matrix governance, hardware device credentials, staff assignments, and branch security.",
        icon: <ShieldAlert className="h-5 w-5" />,
      };
    case "manager":
    case "store_manager":
      return {
        gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
        glow: "group-hover:shadow-emerald-500/10",
        iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        borderHover: "hover:border-emerald-300 dark:hover:border-emerald-800",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
        badgeText: "text-emerald-700 dark:text-emerald-300",
        badgeBorder: "border-emerald-200 dark:border-emerald-800/60",
        tag: "Branch Manager",
        defaultDescription:
          "Store branch operations, register shift sign-offs, drawer opening float setup, price overrides, and cash variance reconciliations.",
        icon: <Users className="h-5 w-5" />,
      };
    case "cashier":
      return {
        gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
        glow: "group-hover:shadow-amber-500/10",
        iconBg: "bg-amber-100 dark:bg-amber-950/60",
        iconColor: "text-amber-600 dark:text-amber-400",
        borderHover: "hover:border-amber-300 dark:hover:border-amber-800",
        badgeBg: "bg-amber-50 dark:bg-amber-950/50",
        badgeText: "text-amber-700 dark:text-amber-300",
        badgeBorder: "border-amber-200 dark:border-amber-800/60",
        tag: "Frontline POS",
        defaultDescription:
          "Front counter retail checkout, barcode scanner interactions, tender settlements, discount triggers, and customer receipt printing.",
        icon: <ShieldCheck className="h-5 w-5" />,
      };
    case "inventory_clerk":
    case "clerk":
      return {
        gradient: "from-cyan-500/10 via-sky-500/5 to-transparent",
        glow: "group-hover:shadow-cyan-500/10",
        iconBg: "bg-cyan-100 dark:bg-cyan-950/60",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        borderHover: "hover:border-cyan-300 dark:hover:border-cyan-800",
        badgeBg: "bg-cyan-50 dark:bg-cyan-950/50",
        badgeText: "text-cyan-700 dark:text-cyan-300",
        badgeBorder: "border-cyan-200 dark:border-cyan-800/60",
        tag: "Inventory & Stock",
        defaultDescription:
          "Stock level monitoring, barcode SKU generation, product receiving, catalog price adjustments, and shelf label printing.",
        icon: <Boxes className="h-5 w-5" />,
      };
    default:
      return {
        gradient: "from-indigo-500/10 via-slate-500/5 to-transparent",
        glow: "group-hover:shadow-indigo-500/10",
        iconBg: "bg-indigo-100 dark:bg-indigo-950/60",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        borderHover: "hover:border-indigo-300 dark:hover:border-indigo-800",
        badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
        badgeText: "text-indigo-700 dark:text-indigo-300",
        badgeBorder: "border-indigo-200 dark:border-indigo-800/60",
        tag: isSystem ? "System Role" : "Custom Role",
        defaultDescription:
          "Custom tailored business role configured with specialized operational permissions.",
        icon: <Shield className="h-5 w-5" />,
      };
  }
};

export default function AdminRolesPage() {
  const { businesses, activeBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");

  // Zustand Store Integration
  const {
    roles,
    paginator,
    currentPage,
    isLoading,
    searchQuery,
    filterType,
    selectedBusinessUuid,
    isCreateModalOpen,
    isProvisionModalOpen,
    roleToEdit,
    roleToDelete,
    roleForMatrix,
    setSearchQuery,
    setFilterType,
    setSelectedBusinessUuid,
    setCurrentPage,
    setIsCreateModalOpen,
    setIsProvisionModalOpen,
    setRoleToEdit,
    setRoleToDelete,
    setRoleForMatrix,
    fetchRoles,
    getFilteredRoles,
    syncPermissions,
  } = useRoleStore();

  useEffect(() => {
    void fetchRoles(selectedBusinessUuid, currentPage);
  }, [fetchRoles, selectedBusinessUuid, currentPage]);

  const filteredRoles = getFilteredRoles();

  // Statistics
  const totalRolesCount = roles.length;
  const systemRolesCount = roles.filter((r) => r.is_system).length;
  const customRolesCount = roles.filter((r) => !r.is_system).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* 🚀 Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/90 p-6 md:p-8 shadow-sm transition-colors">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-purple-500/5 dark:bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-3">
              <Link href="/admin" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
                Admin
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600" />
              <span className="text-slate-800 dark:text-zinc-200 font-semibold">Roles & RBAC</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                  Access Control & RBAC
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
                  Enterprise Role-Based Access Control, granular permission matrices, and employee authorization security.
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-end lg:self-center">
            <Link href="/admin/permissions">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-all active:scale-[0.98] shadow-xs">
                <Key className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span>Permissions Directory</span>
              </button>
            </Link>

            {activeTab === "roles" && (
              <>
                <button
                  onClick={() => void fetchRoles(selectedBusinessUuid, currentPage)}
                  disabled={isLoading}
                  title="Reload roles"
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
                </button>

                <button
                  onClick={() => setIsProvisionModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 transition-all active:scale-[0.98] shadow-xs"
                >
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                  <span>Auto-Provision Roles</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-[0.98] shadow-sm shadow-blue-600/25"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Create Role</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 📊 KPI Summary Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl p-3.5 border border-slate-200/70 dark:border-zinc-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Roles</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalRolesCount}</div>
          </div>
          <div className="bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl p-3.5 border border-slate-200/70 dark:border-zinc-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">System Templates</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{systemRolesCount}</div>
          </div>
          <div className="bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl p-3.5 border border-slate-200/70 dark:border-zinc-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Custom Tenant Roles</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{customRolesCount}</div>
          </div>
          <div className="bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl p-3.5 border border-slate-200/70 dark:border-zinc-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Security Engine</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              RS256 JWT Active
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Navigation Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "roles"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200/80 dark:ring-zinc-700/60"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300"
            }`}
          >
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Roles & Permissions Matrix</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold">
              {roles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs ring-1 ring-slate-200/80 dark:ring-zinc-700/60"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300"
            }`}
          >
            <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>User Role Assignments</span>
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <UserRoleAssignments />
      ) : (
        <>
          {/* 🔍 Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search roles by name or code (e.g., owner, cashier)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Business Scope Dropdown & Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {businesses.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700/80 shadow-2xs">
                  <Building2 className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Business:</span>
                  <select
                    value={selectedBusinessUuid || ""}
                    onChange={(e) => {
                      const val = e.target.value ? e.target.value : null;
                      setSelectedBusinessUuid(val);
                      void fetchRoles(val, 1);
                    }}
                    className="text-xs font-semibold bg-transparent text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="" className="dark:bg-zinc-900">All (Global & Tenants)</option>
                    {businesses.map((b) => (
                      <option key={b.uuid} value={b.uuid} className="dark:bg-zinc-900">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === "all"
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  All Roles ({roles.length})
                </button>
                <button
                  onClick={() => setFilterType("system")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === "system"
                      ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                      : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  System ({systemRolesCount})
                </button>
                <button
                  onClick={() => setFilterType("custom")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === "custom"
                      ? "bg-purple-600 text-white shadow-xs shadow-purple-500/20"
                      : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  Custom ({customRolesCount})
                </button>
              </div>
            </div>
          </div>

          {/* 💎 Ultra-Modern Roles Cards Grid */}
          {filteredRoles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No roles found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No roles match &quot;{searchQuery}&quot;. Try adjusting your keywords or clearing the filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {filteredRoles.map((role) => {
                const isSystem = Boolean(role.is_system);
                const config = getRoleConfig(role.code, isSystem);
                const permCount = role.permissions?.length ?? 0;

                return (
                  <div
                    key={role.uuid}
                    className={`group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 transition-all duration-300 hover:shadow-xl ${config.glow} ${config.borderHover} flex flex-col justify-between overflow-hidden`}
                  >
                    {/* Top ambient gradient flare */}
                    <div
                      className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${config.gradient} pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
                    />

                    <div>
                      {/* Top Row: Icon + Role Title + Status Badge */}
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`h-12 w-12 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105`}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {role.name.replace(/_/g, " ")}
                              </h3>
                              {isSystem ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                  <Lock className="h-2.5 w-2.5 text-zinc-400" />
                                  System Role
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                  Custom Role
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                              <span>
                                code:{" "}
                                <span className="text-zinc-800 dark:text-zinc-200 font-semibold bg-zinc-100 dark:bg-zinc-800/70 px-1.5 py-0.5 rounded">
                                  {role.code}
                                </span>
                              </span>
                              {role.business_uuid ? (
                                <span className="text-[10px] font-sans font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800/50 flex items-center gap-1">
                                  <Building2 className="h-2.5 w-2.5" />
                                  {businesses.find((b) => b.uuid === role.business_uuid)?.name || "Tenant Scoped"}
                                </span>
                              ) : (
                                <span className="text-[10px] font-sans font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800/70 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-zinc-700/50">
                                  Global Scope
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Right Tag */}
                        <div
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                        >
                          {config.tag}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="relative z-10 text-xs text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed line-clamp-2">
                        {config.defaultDescription}
                      </p>

                      {/* Attached Permissions Preview */}
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="relative z-10 mt-3.5 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-zinc-400 mr-0.5">Attached:</span>
                          {role.permissions.slice(0, 4).map((p) => (
                            <span
                              key={p.uuid || p.code}
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60"
                            >
                              {p.code}
                            </span>
                          ))}
                          {role.permissions.length > 4 && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/60">
                              +{role.permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="relative z-10 pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800/90 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => setRoleForMatrix(role)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-800 transition-all active:scale-[0.98]"
                      >
                        <Key className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Permission Matrix</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {permCount}
                        </span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setRoleToEdit(role)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setRoleToDelete(role)}
                          disabled={isSystem}
                          title={isSystem ? "System roles are protected from deletion" : "Delete custom role"}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isSystem
                              ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                              : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 📄 Pagination Controls */}
          {paginator && paginator.last_page > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 font-medium">
                Page {paginator.current_page} of {paginator.last_page} ({paginator.total} total roles)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= paginator.last_page}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
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
        onSuccess={async (updatedUuids?: string[]) => {
          if (roleForMatrix && updatedUuids) {
            await syncPermissions(roleForMatrix.uuid, updatedUuids).catch(() => {});
          }
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />
    </div>
  );
}
