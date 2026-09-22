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
  Package,
  DollarSign,
  ShoppingCart,
  Users2,
  Hash,
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
  const c = code.toLowerCase().trim();

  // 1. Super Admin / Owner
  if (c === "super_admin" || c === "owner") {
    return {
      gradient: "from-primary/10 via-primary/5 to-transparent",
      glow: "group-hover:shadow-primary/10",
      iconBg: "bg-purple-100 dark:bg-purple-950/60",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderHover: "hover:border-purple-300 dark:hover:border-purple-800",
      badgeBg: "bg-purple-50 dark:bg-purple-950/50",
      badgeText: "text-purple-700 dark:text-purple-300",
      badgeBorder: "border-purple-200 dark:border-purple-800/60",
      tag: c === "super_admin" ? "Super Admin" : "Root Owner",
      defaultDescription:
        "Full sovereign authority across all microservice modules, role governance, multi-tenant businesses, and system operations.",
      icon: <Crown className="h-5 w-5" />,
    };
  }

  // 2. Inventory Module Roles (Blue)
  if (
    c.startsWith("inventory") ||
    c.includes("warehouse") ||
    c.includes("planner") ||
    c.includes("purchasing") ||
    c.includes("procurement") ||
    c.includes("fulfillment")
  ) {
    return {
      gradient: "from-primary/10 via-primary/5 to-transparent",
      glow: "group-hover:shadow-primary/10",
      iconBg: "bg-blue-100 dark:bg-blue-950/60",
      iconColor: "text-primary",
      borderHover: "hover:border-primary/40",
      badgeBg: "bg-primary/10",
      badgeText: "text-primary",
      badgeBorder: "border-primary/20",
      tag: c === "inventory_admin" ? "Inventory Admin" : "Inventory Module",
      defaultDescription:
        "Stock warehousing, inventory counts, supplier purchase orders, product receiving, and order fulfillment workflows.",
      icon: <Package className="h-5 w-5" />,
    };
  }

  // 3. Finance Module Roles (Coral / Rose)
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
      gradient: "from-primary/10 via-primary/5 to-transparent",
      glow: "group-hover:shadow-primary/10",
      iconBg: "bg-rose-100 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      borderHover: "hover:border-rose-300 dark:hover:border-rose-800",
      badgeBg: "bg-rose-50 dark:bg-rose-950/50",
      badgeText: "text-rose-700 dark:text-rose-300",
      badgeBorder: "border-rose-200 dark:border-rose-800/60",
      tag: c === "finance_admin" ? "Finance Admin" : "Finance Module",
      defaultDescription:
        "General ledger postings, chart of accounts, treasury cash management, vendor bills AP, customer invoices AR, and fiscal reporting.",
      icon: <DollarSign className="h-5 w-5" />,
    };
  }

  // 4. POS Module Roles (Emerald / Green)
  if (
    c.startsWith("pos") ||
    c === "store_manager" ||
    c === "manager" ||
    c === "cashier" ||
    c === "shift_supervisor" ||
    c.includes("reporting_accountant")
  ) {
    return {
      gradient: "from-primary/10 via-primary/5 to-transparent",
      glow: "group-hover:shadow-primary/10",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderHover: "hover:border-emerald-300 dark:hover:border-emerald-800",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      badgeBorder: "border-emerald-200 dark:border-emerald-800/60",
      tag: c === "pos_admin" ? "POS Admin" : "POS Module",
      defaultDescription:
        "Point of sale checkout, cash drawer shifts, terminal quick PINs, barcode scanning, refunds, and store counter operations.",
      icon: <ShoppingCart className="h-5 w-5" />,
    };
  }

  // 5. HR Module Roles (Purple / Violet)
  if (
    c.startsWith("hr") ||
    c.includes("payroll") ||
    c.includes("benefits") ||
    c.includes("recruiter") ||
    c.includes("people_manager") ||
    c.includes("compliance") ||
    c.includes("employee_self_service")
  ) {
    return {
      gradient: "from-primary/10 via-primary/5 to-transparent",
      glow: "group-hover:shadow-primary/10",
      iconBg: "bg-violet-100 dark:bg-violet-950/60",
      iconColor: "text-violet-600 dark:text-violet-400",
      borderHover: "hover:border-violet-300 dark:hover:border-violet-800",
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
    gradient: "from-primary/10 via-primary/5 to-transparent",
    glow: "group-hover:shadow-primary/10",
    iconBg: "bg-indigo-100 dark:bg-indigo-950/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-800",
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
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12 px-2 sm:px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* 🚀 Ultra-Premium Glassmorphic Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-background/70 backdrop-blur-3xl border border-white/50 dark:border-white/5 p-6 md:p-10 shadow-2xl shadow-blue-900/5 dark:shadow-black/40 transition-all">
        {/* Dynamic Abstract Orbs */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-3xl pointer-events-none animate-pulse duration-10000" />
        <div className="absolute right-1/4 -bottom-32 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/20 to-teal-500/20 blur-3xl pointer-events-none animate-pulse duration-7000" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
              <Link href="/admin" className="hover:text-primary transition-colors">
                Admin Workspace
              </Link>
              <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              <span className="text-foreground bg-muted/50 px-2 py-1 rounded-md">Roles & RBAC</span>
            </div>

            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <ShieldCheck className="h-8 w-8 drop-shadow-md" />
              </div>
              <div className="pt-1">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-zinc-400">
                  Access Control Engine
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                  Enterprise-grade Role-Based Access Control (RBAC). Configure granular permission matrices and manage zero-trust employee authorization policies.
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link href="/admin/permissions" className="flex-1 sm:flex-none">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-card/80 hover:bg-card text-foreground border border-border/50 backdrop-blur-md transition-all active:scale-[0.98] shadow-sm hover:shadow-md">
                <Key className="h-4 w-4 text-amber-500" />
                <span>Permissions Library</span>
              </button>
            </Link>

            {activeTab === "roles" && (
              <>
                <button
                  onClick={() => setIsProvisionModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-purple-50/80 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/30 backdrop-blur-md transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>Auto-Provision</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-all active:scale-[0.98] shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 border border-white/10"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>New Role</span>
                </button>
                
                <button
                  onClick={() => void fetchRoles(selectedBusinessUuid, currentPage)}
                  disabled={isLoading}
                  title="Reload roles"
                  className="p-3 rounded-xl bg-card/80 hover:bg-card text-muted-foreground border border-border/50 backdrop-blur-md transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 📊 KPI Summary Floating Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Roles</span>
            <span className="text-3xl font-black text-foreground drop-shadow-sm">{totalRolesCount}</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-border/50 pl-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">System Templates</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 drop-shadow-sm">{systemRolesCount}</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-border/50 pl-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tenant Specific</span>
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 drop-shadow-sm">{customRolesCount}</span>
          </div>
          <div className="flex flex-col gap-1 border-l border-border/50 pl-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Security Engine</span>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">JWT Strict</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Native iOS-style Segmented Control Tabs */}
      <div className="flex justify-center mt-2">
        <div className="inline-flex p-1.5 bg-secondary/50 backdrop-blur-xl rounded-2xl shadow-inner border border-border w-full max-w-2xl">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "roles"
                ? "bg-accent text-foreground shadow-sm ring-1 ring-border"
                : "text-slate-500 hover:text-foreground hover:bg-card/40"
            }`}
          >
            <Shield className={`h-4 w-4 ${activeTab === "roles" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
            <span>Roles Configuration</span>
            {activeTab === "roles" && (
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-black tracking-wider">
                {roles.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "users"
                ? "bg-accent text-foreground shadow-sm ring-1 ring-border"
                : "text-slate-500 hover:text-foreground hover:bg-card/40"
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
          {/* 🔍 Dynamic Command Bar (Search & Filters) */}
          <div className="sticky top-4 z-30 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl p-3 sm:p-4 rounded-[1.5rem] border border-border/60 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search roles by name, module, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm font-medium bg-muted/50 border border-border/80 rounded-2xl text-foreground placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all hover:bg-white dark:hover:bg-zinc-800"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Tenant Dropdown */}
              {businesses.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 hover:bg-accent rounded-2xl border border-border/80 transition-colors cursor-pointer">
                  <Building2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tenant:</span>
                  <select
                    value={selectedBusinessUuid || ""}
                    onChange={(e) => {
                      const val = e.target.value ? e.target.value : null;
                      setSelectedBusinessUuid(val);
                      void fetchRoles(val, 1);
                    }}
                    className="text-sm font-bold bg-transparent text-foreground focus:outline-none cursor-pointer appearance-none pr-4"
                  >
                    <option value="" className="dark:bg-zinc-900 font-medium">Global Core (All)</option>
                    {businesses.map((b) => (
                      <option key={b.uuid} value={b.uuid} className="dark:bg-zinc-900 font-medium">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Minimalist Filter Pills */}
              <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/80 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterType === "all"
                      ? "bg-accent text-foreground shadow-sm ring-1 ring-border"
                      : "text-slate-500 hover:text-foreground"
                  }`}
                >
                  All ({roles.length})
                </button>
                <button
                  onClick={() => setFilterType("system")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterType === "system"
                      ? "bg-blue-600 text-white shadow-md shadow-primary/20"
                      : "text-slate-500 hover:text-primary"
                  }`}
                >
                  System Templates ({systemRolesCount})
                </button>
                <button
                  onClick={() => setFilterType("custom")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterType === "custom"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-500 hover:text-purple-600 dark:hover:text-purple-400"
                  }`}
                >
                  Custom ({customRolesCount})
                </button>
              </div>
            </div>
          </div>

          {/* 💎 Ultra-Modern Roles Cards Grid */}
          {filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-background/40 rounded-[2rem] border border-dashed border-border backdrop-blur-sm animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground mb-6 relative">
                <Search className="h-10 w-10 absolute z-10" />
                <div className="absolute inset-0 rounded-full border-4 border-border animate-[spin_4s_linear_infinite]" />
              </div>
              <h3 className="text-xl font-black text-foreground">Nothing in sight</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto text-center leading-relaxed">
                We couldn't find any roles matching <span className="font-bold text-foreground">"{searchQuery}"</span>. 
                Try a different keyword or adjust your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="mt-6 px-6 py-3 text-sm font-bold rounded-xl bg-foreground text-background hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredRoles.map((role, idx) => {
                const isSystem = Boolean(role.is_system);
                const config = getRoleConfig(role.code, isSystem);
                const permCount = role.permissions?.length ?? 0;

                return (
                  <div
                    key={role.uuid}
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                    className={`group relative rounded-[2rem] bg-card/80 backdrop-blur-xl border border-border/60 p-6 lg:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${config.glow} ${config.borderHover} flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-8`}
                  >
                    {/* Top ambient gradient flare */}
                    <div
                      className={`absolute inset-x-0 -top-10 h-40 bg-gradient-to-b ${config.gradient} blur-2xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100`}
                    />
                    
                    {/* Decorative corner accent */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 dark:bg-black/10 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />

                    <div className="relative z-10">
                      {/* Top Row: Icon + Role Title + Status Badge */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-14 w-14 rounded-2xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-500 dark:group-hover:from-white dark:group-hover:to-zinc-400 transition-all">
                                {role.name.replace(/_/g, " ")}
                              </h3>
                            </div>
                            <div className="text-xs font-mono text-muted-foreground mt-1.5 flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1 text-muted-foreground font-bold bg-muted/80 px-2 py-0.5 rounded-md border border-border/50">
                                <Hash className="h-3 w-3" />
                                {role.code}
                              </span>
                              {role.business_uuid ? (
                                <span className="text-[10px] font-sans font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/50 dark:border-purple-800/40 flex items-center gap-1.5">
                                  <Building2 className="h-3 w-3" />
                                  {businesses.find((b) => b.uuid === role.business_uuid)?.name || "Tenant Scoped"}
                                </span>
                              ) : (
                                <span className="text-[10px] font-sans font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/50 flex items-center gap-1">
                                  <ShieldAlert className="h-3 w-3" />
                                  Global Scope
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top Right Tag */}
                        <div
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder} shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105`}
                        >
                          {config.tag}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mt-5 leading-relaxed line-clamp-3 font-medium">
                        {config.defaultDescription}
                      </p>

                      {/* Attached Permissions Preview */}
                      {role.permissions && role.permissions.length > 0 && (
                        <div className="mt-5 p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-800/30 border border-border/50 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Grants:
                          </span>
                          {role.permissions.slice(0, 4).map((p) => (
                            <span
                              key={p.uuid || p.code}
                              className="px-2 py-1 rounded-lg text-[10px] font-mono font-semibold bg-card text-foreground border border-border shadow-sm hover:shadow-md transition-shadow cursor-default"
                            >
                              {p.code}
                            </span>
                          ))}
                          {role.permissions.length > 4 && (
                            <span className="px-2 py-1 text-[10px] font-black bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-primary rounded-lg border border-blue-200 dark:border-blue-800/40 shadow-sm">
                              +{role.permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="relative z-10 pt-6 mt-6 border-t border-border/50 flex items-center justify-between gap-4">
                      <button
                        onClick={() => setRoleForMatrix(role)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black bg-muted hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 text-foreground transition-all active:scale-[0.98] shadow-sm hover:shadow-xl"
                      >
                        <Key className="h-4 w-4" />
                        <span>Permission Matrix</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/10 dark:bg-white/20">
                          {permCount}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRoleToEdit(role)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 transition-all hover:shadow-md active:scale-95"
                          title="Edit Role"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setRoleToDelete(role)}
                          disabled={isSystem}
                          title={isSystem ? "System roles are protected" : "Delete custom role"}
                          className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
                            isSystem
                              ? "bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                              : "bg-card border-border text-slate-500 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:shadow-md"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
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
            await syncPermissions(roleForMatrix.uuid, updatedUuids).catch(() => { });
          }
          await fetchRoles(selectedBusinessUuid, currentPage);
        }}
      />
    </div>
  );
}
