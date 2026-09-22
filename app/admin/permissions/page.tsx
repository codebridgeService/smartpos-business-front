"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Key,
  Shield,
  ShieldCheck,
  Search,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Calculator,
  Tablet,
  CreditCard,
  Package,
  FolderTree,
  Tag,
  Scale,
  Barcode,
  Smartphone,
  History,
  Lock,
  Boxes,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  FolderClosed,
  Plus,
  Edit3,
  Trash2,
  Landmark,
  Briefcase,
  Receipt,
} from "lucide-react";
import { usePermissionStore } from "@/stores/usePermissionStore";
import {
  BatchCreatePermissionModal,
  EditPermissionModal,
  DeletePermissionModal,
} from "@/components/admin/permissions";
import type { Permission } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  SearchInput,
} from "@/components/ui";

// Module metadata (Display name, Icon, Description, Theme accent)
interface ModuleMeta {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const MODULE_REGISTRY: Record<string, ModuleMeta> = {
  dashboard: {
    title: "Dashboard & Analytics",
    description: "Executive KPIs, sales metrics, and administrative overviews",
    icon: <LayoutDashboard className="h-4.5 w-4.5 text-orange-500" />,
    accent: "border-orange-200 dark:border-orange-900/50",
  },
  finance: {
    title: "Finance & General Ledger",
    description: "Chart of accounts, treasury cash management, AR/AP, and fiscal reporting",
    icon: <Landmark className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  hr: {
    title: "Human Resources & Payroll",
    description: "Employee directories, payroll runs, attendance tracking, and benefits",
    icon: <Briefcase className="h-4.5 w-4.5 text-blue-500" />,
    accent: "border-blue-200 dark:border-blue-900/50",
  },
  businesses: {
    title: "Business & Tenancy",
    description: "Multi-tenant company profiles, settings, and regional currencies",
    icon: <Store className="h-4.5 w-4.5 text-blue-500" />,
    accent: "border-blue-200 dark:border-blue-900/50",
  },
  business_users: {
    title: "Business Staff & Members",
    description: "Employee assignment, tenant memberships, and user provisioning",
    icon: <Users className="h-4.5 w-4.5 text-indigo-500" />,
    accent: "border-indigo-200 dark:border-indigo-900/50",
  },
  outlets: {
    title: "Outlets & Branches",
    description: "Store branches, physical locations, and regional outlet management",
    icon: <Building2 className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  registers: {
    title: "Cash Registers & Cashiers",
    description: "POS physical cash counters, drawer management, and shift balances",
    icon: <Calculator className="h-4.5 w-4.5 text-teal-500" />,
    accent: "border-teal-200 dark:border-teal-900/50",
  },
  pos_devices: {
    title: "POS Hardware Devices",
    description: "Android tablets, receipt printers, customer displays, and device tokens",
    icon: <Tablet className="h-4.5 w-4.5 text-cyan-500" />,
    accent: "border-cyan-200 dark:border-cyan-900/50",
  },
  pos: {
    title: "POS & Sales Checkout",
    description: "Live point of sale terminal operations, refunds, and split tenders",
    icon: <CreditCard className="h-4.5 w-4.5 text-amber-500" />,
    accent: "border-amber-200 dark:border-amber-900/50",
  },
  pos_pin: {
    title: "POS Quick PIN",
    description: "Cashier rapid terminal unlocking, PIN security, and fast authentication",
    icon: <Lock className="h-4.5 w-4.5 text-amber-500" />,
    accent: "border-amber-200 dark:border-amber-900/50",
  },
  inventory: {
    title: "Inventory & Warehouses",
    description: "Central warehouse stocks, batch transfers, and count adjustments",
    icon: <Layers className="h-4.5 w-4.5 text-purple-500" />,
    accent: "border-purple-200 dark:border-purple-900/50",
  },
  products: {
    title: "Product Catalog",
    description: "Master product catalog, SKU variants, and barcode lookups",
    icon: <Package className="h-4.5 w-4.5 text-rose-500" />,
    accent: "border-rose-200 dark:border-rose-900/50",
  },
  categories: {
    title: "Categories & Taxonomies",
    description: "Product categories, sub-categories, and navigation trees",
    icon: <FolderTree className="h-4.5 w-4.5 text-lime-500" />,
    accent: "border-lime-200 dark:border-lime-900/50",
  },
  brands: {
    title: "Brands & Manufacturers",
    description: "Product brand registry, vendor details, and trade marks",
    icon: <Tag className="h-4.5 w-4.5 text-pink-500" />,
    accent: "border-pink-200 dark:border-pink-900/50",
  },
  units: {
    title: "Units of Measurement",
    description: "Measurement units (kg, pcs, boxes) and conversion formulas",
    icon: <Scale className="h-4.5 w-4.5 text-violet-500" />,
    accent: "border-violet-200 dark:border-violet-900/50",
  },
  product_codes: {
    title: "Barcodes & SKUs",
    description: "Product barcode generation, SKU registry, and automated code lookups",
    icon: <Barcode className="h-4.5 w-4.5 text-indigo-500" />,
    accent: "border-indigo-200 dark:border-indigo-900/50",
  },
  product_prices: {
    title: "Product Pricing Tiers",
    description: "Wholesale, retail, and promotional tier price structures",
    icon: <CreditCard className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  product_images: {
    title: "Product Gallery & Media",
    description: "Product photography, variant media uploads, and catalog galleries",
    icon: <FolderOpen className="h-4.5 w-4.5 text-cyan-500" />,
    accent: "border-cyan-200 dark:border-cyan-900/50",
  },
  labels: {
    title: "Barcodes & Thermal Labels",
    description: "Barcode and QR code generator and printing specifications",
    icon: <Barcode className="h-4.5 w-4.5 text-slate-500" />,
    accent: "border-slate-200 dark:border-slate-800",
  },
  roles: {
    title: "Roles & RBAC Policies",
    description: "Role templates, tenant permissions, and access assignment",
    icon: <ShieldCheck className="h-4.5 w-4.5 text-sky-500" />,
    accent: "border-sky-200 dark:border-sky-900/50",
  },
  permissions: {
    title: "System Permissions",
    description: "Master list of granular capabilities and API access rules",
    icon: <Key className="h-4.5 w-4.5 text-amber-500" />,
    accent: "border-amber-200 dark:border-amber-900/50",
  },
  users: {
    title: "User Accounts",
    description: "User profile directory, account verification, and status",
    icon: <Users className="h-4.5 w-4.5 text-blue-500" />,
    accent: "border-blue-200 dark:border-blue-900/50",
  },
  devices: {
    title: "Device Security",
    description: "Browser fingerprinting, trusted device registry, and blocklist",
    icon: <Smartphone className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  sessions: {
    title: "Active Sessions",
    description: "JWT tokens, refresh sessions, and remote session revocation",
    icon: <History className="h-4.5 w-4.5 text-orange-500" />,
    accent: "border-orange-200 dark:border-orange-900/50",
  },
  security: {
    title: "Security & Audit Logs",
    description: "Brute-force protection, login attempts, and pentest monitoring",
    icon: <Lock className="h-4.5 w-4.5 text-rose-500" />,
    accent: "border-rose-200 dark:border-rose-900/50",
  },
};

export default function AdminPermissionsPage() {
  const {
    permissions,
    isLoading,
    error,
    searchQuery,
    selectedModule,
    selectedAction,
    collapsedModules,
    isBatchModalOpen,
    permissionToEdit,
    permissionToDelete,
    setSearchQuery,
    setSelectedModule,
    setSelectedAction,
    toggleModuleCollapse,
    toggleAllModules,
    openBatchModal,
    closeBatchModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    fetchPermissions,
    getModules,
    getGroupedMatrix,
  } = usePermissionStore();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  // Copy code handler with visual feedback
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  // Derive unique modules and grouped permissions directly from PermissionState getters
  const allModules = useMemo(() => getModules(), [permissions, getModules]);
  const groupedPermissions = useMemo(
    () => getGroupedMatrix(),
    [permissions, searchQuery, selectedModule, selectedAction, getGroupedMatrix]
  );

  // Helper for action badge styling
  const getActionBadge = (code: string) => {
    const action = code.split(".").pop()?.toLowerCase() || "";

    if (action.includes("create") || action.includes("assign")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          Create
        </span>
      );
    }
    if (action.includes("update") || action.includes("trust") || action.includes("verify")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          Update
        </span>
      );
    }
    if (action.includes("delete") || action.includes("remove") || action.includes("block") || action.includes("revoke")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          Delete
        </span>
      );
    }
    if (action.includes("manage") || action.includes("access") || action.includes("checkout")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
          Manage
        </span>
      );
    }
    if (action.includes("print")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
          Print
        </span>
      );
    }

    // Default: View
    return (
      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
        View
      </span>
    );
  };

  const areAllCollapsed =
    allModules.length > 0 && allModules.every((mod) => collapsedModules[mod]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <Link href="/admin" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/roles" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
              Roles & RBAC
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-zinc-100 font-semibold">Permissions Directory</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60">
              <Key className="h-6 w-6" />
            </div>
            System Permissions Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            List of all granular permissions ordered by module for role assignment and API capability enforcement.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/roles">
            <Button variant="outline" size="md" leftIcon={<Shield className="h-4 w-4" />}>
              Manage Roles
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="md"
            onClick={() => void fetchPermissions(true)}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Reload
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={openBatchModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Batch Create
          </Button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div
          data-testid="permissions-error-banner"
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Server Notice:</strong> {error}. Showing offline fallback catalog.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchPermissions(true)}
            isLoading={isLoading}
            className="shrink-0"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Permissions</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {permissions.length}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Active Modules</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {allModules.length}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">RBAC Enforcement</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Identity Service</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Filtered Results</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {groupedPermissions.totalMatching}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchInput
              placeholder="Search by permission code, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Module Filter Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Module:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all">All Modules ({allModules.length})</option>
                {allModules.map((mod) => (
                  <option key={mod} value={mod}>
                    {MODULE_REGISTRY[mod]?.title || mod.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
              <span>Action:</span>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all">All Actions</option>
                <option value="view">View</option>
                <option value="create">Create / Add</option>
                <option value="update">Update / Edit</option>
                <option value="delete">Delete / Remove</option>
                <option value="manage">Manage / Operate</option>
              </select>
            </div>

            {/* Expand / Collapse All */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAllModules(areAllCollapsed)}
              leftIcon={
                areAllCollapsed ? (
                  <FolderOpen className="h-3.5 w-3.5" />
                ) : (
                  <FolderClosed className="h-3.5 w-3.5" />
                )
              }
            >
              {areAllCollapsed ? "Expand All" : "Collapse All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Permissions List Grouped and Ordered by Module */}
      {groupedPermissions.sortedModuleKeys.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">
            No permissions match your search criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the module selector, or clearing active filters.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedModule("all");
                setSelectedAction("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedPermissions.sortedModuleKeys.map((moduleKey) => {
            const modulePerms = groupedPermissions.groups[moduleKey];
            const meta = MODULE_REGISTRY[moduleKey] || {
              title: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
              description: `Operations and access control for ${moduleKey}`,
              icon: <Layers className="h-4.5 w-4.5 text-slate-500" />,
              accent: "border-slate-200 dark:border-zinc-800",
            };
            const isCollapsed = collapsedModules[moduleKey] ?? false;

            return (
              <div
                key={moduleKey}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-150"
              >
                {/* Module Header / Accordion Bar */}
                <div
                  onClick={() => toggleModuleCollapse(moduleKey)}
                  className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 shadow-xs shrink-0">
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {meta.title}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold uppercase">
                          {moduleKey}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900/60">
                      {modulePerms.length} {modulePerms.length === 1 ? "Permission" : "Permissions"}
                    </span>
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Module Permissions Table / List */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {modulePerms.map((perm) => {
                      const isCopied = copiedCode === perm.code;

                      return (
                        <div
                          key={perm.code}
                          className="px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                                {perm.name}
                              </span>
                              {getActionBadge(perm.code)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {perm.description || "Grants access to this operation."}
                            </p>
                          </div>

                          {/* Permission Code Key with Quick Copy & Row Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 font-mono text-[11px] text-slate-700 dark:text-zinc-300 select-all">
                              <span>{perm.code}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(perm.code)}
                                title="Copy permission code"
                                className={`p-1 rounded transition-colors ${isCopied
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                  }`}
                              >
                                {isCopied ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openEditModal(perm)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              title="Edit permission"
                              aria-label="Edit permission"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(perm)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete permission"
                              aria-label="Delete permission"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Permissions Modals */}
      <BatchCreatePermissionModal
        isOpen={isBatchModalOpen}
        onClose={closeBatchModal}
        onSuccess={async () => {
          await fetchPermissions(true);
        }}
      />

      <EditPermissionModal
        isOpen={Boolean(permissionToEdit)}
        onClose={closeEditModal}
        permission={permissionToEdit}
        onSuccess={async () => {
          await fetchPermissions(true);
        }}
      />

      <DeletePermissionModal
        isOpen={Boolean(permissionToDelete)}
        onClose={closeDeleteModal}
        permission={permissionToDelete}
        onSuccess={async () => {
          await fetchPermissions(true);
        }}
      />
    </div>
  );
}
