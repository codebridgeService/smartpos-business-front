"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Store,
  CheckCircle2,
  Clock,
  Ban,
  Mail,
  Phone,
  Download,
  Edit3,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Tablet,
  Check,
  CreditCard,
  Crown,
  Zap,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronRight,
  ArrowRight,
  Sliders,
  DollarSign,
  TrendingUp,
  Award,
} from "lucide-react";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { useBusiness } from "@/context/business-context";
import {
  CreateBusinessModal,
  BusinessProvisionedModal,
  EditBusinessModal,
  DeleteBusinessModal,
} from "@/components/businesses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SwipeButton } from "@/components/ui/swipe-button";
import type { Business, StoreBusinessRequest, UpdateBusinessRequest } from "@/types";

export interface CompanySubscriptionPlan {
  id: string;
  name: string;
  code: string;
  badge: string;
  badgeVariant: "neutral" | "info" | "primary" | "warning" | "success";
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  currency: string;
  maxOutlets: number | "Unlimited";
  maxRegisters: number | "Unlimited";
  maxUsers: number | "Unlimited";
  maxDevices: number | "Unlimited";
  maxProducts: number | "Unlimited";
  features: string[];
  activeSubscribers: number;
  isPopular?: boolean;
  status: "active" | "archived";
}

// Static Company Subscription Plans Data
const STATIC_SUBSCRIPTION_PLANS: CompanySubscriptionPlan[] = [
  {
    id: "plan-starter",
    name: "Starter / Community",
    code: "plan_free",
    badge: "Free Tier",
    badgeVariant: "neutral",
    description: "Ideal for small independent kiosks, single-outlet retail, or pop-up stores.",
    priceMonthly: 0,
    priceAnnually: 0,
    currency: "$",
    maxOutlets: 1,
    maxRegisters: 1,
    maxUsers: 3,
    maxDevices: 2,
    maxProducts: 500,
    features: [
      "Single Outlet Support",
      "Standard Cashier POS Terminal",
      "End of Day Cash Drawer Report",
      "Basic Stock Tracking (500 SKUs)",
      "Standard Receipt Printing",
    ],
    activeSubscribers: 14,
    status: "active",
  },
  {
    id: "plan-growth",
    name: "Growth / Standard",
    code: "plan_growth",
    badge: "Popular",
    badgeVariant: "primary",
    description: "For established retail stores, cafes, and multi-counter branches scaling sales.",
    priceMonthly: 29,
    priceAnnually: 290,
    currency: "$",
    maxOutlets: 3,
    maxRegisters: 6,
    maxUsers: 15,
    maxDevices: 10,
    maxProducts: 5000,
    features: [
      "Up to 3 Outlets / Branches",
      "Multi-Register & Shift Reconciliations",
      "Staff Role & PIN Authorizations",
      "Multi-Currency & Tax Configs",
      "Centralized Inventory & Stock Alerts",
      "Real-time Sales & Profit Analytics",
      "Offline Order Caching & Sync",
    ],
    activeSubscribers: 48,
    isPopular: true,
    status: "active",
  },
  {
    id: "plan-pro",
    name: "Professional / Business",
    code: "plan_pro",
    badge: "Recommended",
    badgeVariant: "warning",
    description: "For restaurant chains, multi-branch department stores, and supermarket brands.",
    priceMonthly: 79,
    priceAnnually: 790,
    currency: "$",
    maxOutlets: 10,
    maxRegisters: 25,
    maxUsers: 50,
    maxDevices: 40,
    maxProducts: "Unlimited",
    features: [
      "Up to 10 Outlets & Central Warehouse",
      "Kitchen Display System (KDS)",
      "Warehouse Location & Bin Management",
      "Forensic Security & Audit Trails",
      "Automated Role & Permission Provisioning",
      "Custom Receipt Templates & QR Codes",
      "Priority SLA Support & Webhooks",
    ],
    activeSubscribers: 26,
    status: "active",
  },
  {
    id: "plan-enterprise",
    name: "Enterprise / Scale",
    code: "plan_enterprise",
    badge: "Enterprise",
    badgeVariant: "success",
    description: "Tailored high-volume architecture for nationwide franchises and wholesale.",
    priceMonthly: 199,
    priceAnnually: 1990,
    currency: "$",
    maxOutlets: "Unlimited",
    maxRegisters: "Unlimited",
    maxUsers: "Unlimited",
    maxDevices: "Unlimited",
    maxProducts: "Unlimited",
    features: [
      "Unlimited Outlets, Registers & Staff",
      "Dedicated Database & Redis Sharding",
      "Single Sign-On (SSO / SAML 2.0)",
      "Custom ERP & Financial Integrations",
      "White-Labeling & Custom Domain",
      "24/7 Dedicated Account Manager",
      "99.99% Uptime Guarantee SLA",
    ],
    activeSubscribers: 8,
    status: "active",
  },
];

export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const { activeBusiness, selectBusiness, fetchBusinesses: refreshContextBusinesses } = useBusiness();

  const {
    businesses,
    isLoading,
    isSaving,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedBusiness,
    provisionedResult,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    clearProvisionedResult,
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
  } = useBusinessStore();

  const [activeTab, setActiveTab] = useState<"companies" | "subscriptions">("companies");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subscription Plans State
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState<CompanySubscriptionPlan | null>(null);
  const [targetCompanyUuid, setTargetCompanyUuid] = useState<string>("");
  const [isAssignSuccess, setIsAssignSuccess] = useState(false);

  // Load all system businesses on mount
  useEffect(() => {
    void fetchBusinesses();
  }, [fetchBusinesses]);

  // Open create modal if URL query param has ?action=new
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openCreateModal();
    }
  }, [searchParams, openCreateModal]);

  // Filtered businesses based on search and status
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.legal_name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.phone?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.currency_code?.toLowerCase().includes(q) ||
        b.uuid?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && b.status === "active") ||
        (statusFilter === "Inactive" && b.status === "inactive") ||
        (statusFilter === "Suspended" && b.status === "suspended");

      return matchesSearch && matchesStatus;
    });
  }, [businesses, searchTerm, statusFilter]);

  // KPI Metrics computed from actual businesses
  const metrics = useMemo(() => {
    const total = businesses.length;
    const active = businesses.filter((b) => b.status === "active").length;
    const totalOutlets = businesses.reduce((sum, b) => sum + (Number(b.outlets_count) || 0), 0);
    const totalRegisters = businesses.reduce((sum, b) => sum + (Number(b.registers_count) || 0), 0);
    const totalDevices = businesses.reduce((sum, b) => sum + (Number(b.pos_devices_count) || 0), 0);
    return { total, active, totalOutlets, totalRegisters, totalDevices };
  }, [businesses]);

  // Subscription KPIs from static data
  const subscriptionStats = useMemo(() => {
    const totalSubscribers = STATIC_SUBSCRIPTION_PLANS.reduce((acc, p) => acc + p.activeSubscribers, 0);
    const monthlyMRR = STATIC_SUBSCRIPTION_PLANS.reduce((acc, p) => acc + p.priceMonthly * p.activeSubscribers, 0);
    const averagePlanPrice = Math.round(monthlyMRR / (totalSubscribers || 1));
    return {
      totalPlans: STATIC_SUBSCRIPTION_PLANS.length,
      totalSubscribers,
      monthlyMRR,
      averagePlanPrice,
    };
  }, []);

  const handleRefresh = async () => {
    await Promise.all([fetchBusinesses(), refreshContextBusinesses()]);
  };

  const handleCreateSubmit = async (data: StoreBusinessRequest) => {
    await createBusiness(data);
    await refreshContextBusinesses();
  };

  const handleUpdateSubmit = async (uuid: string, data: UpdateBusinessRequest) => {
    await updateBusiness(uuid, data);
    await refreshContextBusinesses();
  };

  const handleDeleteSubmit = async (uuid: string) => {
    await deleteBusiness(uuid);
    await refreshContextBusinesses();
  };

  const handleSelectBusiness = async (b: Business) => {
    try {
      await selectBusiness(b.uuid);
      setCopiedId(b.uuid);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleExportCsv = () => {
    if (filteredBusinesses.length === 0) return;

    const headers = [
      "ID",
      "UUID",
      "Name",
      "Code",
      "Legal Name",
      "Email",
      "Phone",
      "City",
      "Country",
      "Currency",
      "Status",
      "Outlets",
      "Registers",
      "POS Devices",
      "Created At",
    ];

    const rows = filteredBusinesses.map((b) => [
      b.id,
      b.uuid,
      `"${(b.name || "").replace(/"/g, '""')}"`,
      b.code || "",
      `"${(b.legal_name || "").replace(/"/g, '""')}"`,
      b.email || "",
      b.phone || "",
      `"${(b.city || "").replace(/"/g, '""')}"`,
      b.country_code || "",
      b.currency_code || "",
      b.status,
      b.outlets_count || 0,
      b.registers_count || 0,
      b.pos_devices_count || 0,
      b.created_at || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `smartpos_companies_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmAssignPlan = () => {
    if (!targetCompanyUuid || !selectedPlanForAssign) return;
    setIsAssignSuccess(true);
    setTimeout(() => {
      setIsAssignSuccess(false);
      setSelectedPlanForAssign(null);
      setTargetCompanyUuid("");
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Breadcrumb & Page Header */}
      <div className="space-y-3">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
          <Link href="/admin/dashboard" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Super Admin</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-zinc-200 font-semibold">Companies Management</span>
          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-900/40">
            Multi-Tenant
          </span>
        </div>

        {/* Main Title Row & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Companies Management
                </h1>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  {businesses.length} {businesses.length === 1 ? "Company" : "Companies"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Oversee all registered tenant businesses, branch scale, registers, and company subscription tiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9.5 px-3 text-xs font-medium rounded-xl border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 shadow-2xs cursor-pointer transition-all active:scale-97"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredBusinesses.length === 0}
              className="h-9.5 px-3.5 text-xs font-medium rounded-xl border-slate-200 dark:border-zinc-700/80 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 shadow-2xs cursor-pointer transition-all active:scale-97 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              onClick={openCreateModal}
              className="h-9.5 px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/25 cursor-pointer transition-all hover:shadow-lg hover:shadow-orange-500/30 active:scale-97"
            >
              <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
              <span>Add Company</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("companies")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "companies"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
              : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-700"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Tenant Companies Directory</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === "companies" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300"
          }`}>
            {businesses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "subscriptions"
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
              : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-700"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Subscription Plans & Tiers</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === "subscriptions" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300"
          }`}>
            {STATIC_SUBSCRIPTION_PLANS.length} Plans
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COMPANIES DIRECTORY & STATS */}
      {/* ========================================================================= */}
      {activeTab === "companies" && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Companies */}
            <div className="group bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-orange-300/80 dark:hover:border-orange-500/40 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200/60 dark:border-orange-900/40 group-hover:scale-105 transition-transform">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40">
                  Tenants
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isLoading && businesses.length === 0 ? "..." : metrics.total}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Total Registered Companies
                </div>
              </div>
            </div>

            {/* Active Companies */}
            <div className="group bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-emerald-300/80 dark:hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/40 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                  {metrics.total > 0 ? `${Math.round((metrics.active / metrics.total) * 100)}% Active` : "100% Active"}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isLoading && businesses.length === 0 ? "..." : metrics.active}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Active Tenants
                </div>
              </div>
            </div>

            {/* Total Outlets */}
            <div className="group bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-blue-300/80 dark:hover:border-blue-500/40 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40 group-hover:scale-105 transition-transform">
                  <Store className="h-5 w-5" />
                </div>
                <Link
                  href="/admin/businesses/outlets"
                  className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                >
                  Manage Branches →
                </Link>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isLoading && businesses.length === 0 ? "..." : metrics.totalOutlets}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Total Outlets & Branches
                </div>
              </div>
            </div>

            {/* POS Terminals & Devices */}
            <div className="group bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-purple-300/80 dark:hover:border-purple-500/40 transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-900/40 group-hover:scale-105 transition-transform">
                  <Tablet className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40">
                  Hardware
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isLoading && businesses.length === 0 ? "..." : metrics.totalDevices + metrics.totalRegisters}
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  POS Devices & Registers
                </div>
              </div>
            </div>
          </div>

          {/* Main Companies Table & Search Bar */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
            {/* Filter & View Bar */}
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40 dark:bg-zinc-850/20">
              <div className="relative w-full sm:w-88">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by company name, code, email, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Status Pills */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
                  {["All", "Active", "Inactive", "Suspended"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                        statusFilter === status
                          ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs font-semibold"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    title="Table View"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs font-semibold"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    <TableIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="Grid Cards View"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs font-semibold"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content View: Table or Grid */}
            {isLoading && businesses.length === 0 ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="py-20 px-4 text-center">
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-orange-100 to-amber-100 dark:from-orange-950/60 dark:to-amber-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Companies Found</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
                  {searchTerm || statusFilter !== "All"
                    ? "No businesses match your current search query or status filter criteria."
                    : "There are currently no tenant companies registered in the SmartPOS ecosystem."}
                </p>
                {searchTerm || statusFilter !== "All" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                    }}
                    className="text-xs rounded-xl px-4 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={openCreateModal}
                    className="text-xs rounded-xl px-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/25 cursor-pointer"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    <span>Create First Business</span>
                  </Button>
                )}
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-850/60 text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-[10.5px] border-b border-slate-200/80 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Company Profile</th>
                      <th className="py-3.5 px-4 font-semibold">Contact & Location</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Outlets</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Registers</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Staff Users</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredBusinesses.map((b) => {
                      const isCurrentActive = activeBusiness?.uuid === b.uuid;
                      return (
                        <tr
                          key={b.uuid}
                          className={`hover:bg-orange-50/40 dark:hover:bg-zinc-800/50 transition-colors ${
                            isCurrentActive ? "bg-orange-50/60 dark:bg-orange-950/20" : ""
                          }`}
                        >
                          {/* Company Name & Code */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 font-bold text-xs shrink-0 border border-slate-200/80 dark:border-zinc-700">
                                {b.name ? b.name.substring(0, 2).toUpperCase() : "SP"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                                    {b.name}
                                  </span>
                                  {isCurrentActive && (
                                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-orange-500 text-white flex items-center gap-0.5">
                                      <Check className="h-2.5 w-2.5 stroke-[3]" /> Active
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10.5px] text-slate-400 dark:text-zinc-500">
                                    {b.code}
                                  </span>
                                  {b.legal_name && (
                                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 hidden md:inline">
                                      • {b.legal_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact & Location */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              {b.email && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400 text-[11.5px]">
                                  <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-44">{b.email}</span>
                                </div>
                              )}
                              {b.city && (
                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500 text-[11px]">
                                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                  <span>
                                    {b.city}, {b.country_code || "KH"} ({b.currency_code || "USD"})
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Outlets Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs">
                              {b.outlets_count ?? 0}
                            </span>
                          </td>

                          {/* Registers Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs">
                              {b.registers_count ?? 0}
                            </span>
                          </td>

                          {/* Staff Users Count */}
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs">
                              {b.business_users_count ?? 0}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                b.status === "active"
                                  ? "success"
                                  : b.status === "inactive"
                                  ? "neutral"
                                  : "danger"
                              }
                              className="capitalize text-[10.5px]"
                            >
                              {b.status}
                            </Badge>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant={isCurrentActive ? "primary" : "outline"}
                                size="sm"
                                onClick={() => handleSelectBusiness(b)}
                                className={`h-7.5 px-2.5 text-[11px] font-medium rounded-lg cursor-pointer ${
                                  isCurrentActive
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                }`}
                              >
                                {isCurrentActive ? "Active" : "Switch"}
                              </Button>

                              <button
                                type="button"
                                onClick={() => openEditModal(b)}
                                title="Edit Company Settings"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => openDeleteModal(b)}
                                title="Delete Company"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBusinesses.map((b) => {
                  const isCurrentActive = activeBusiness?.uuid === b.uuid;
                  return (
                    <div
                      key={b.uuid}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrentActive
                          ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/10 ring-2 ring-orange-500/20"
                          : "border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-zinc-300">
                            {b.name ? b.name.substring(0, 2).toUpperCase() : "SP"}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                              {b.name}
                            </h4>
                            <p className="font-mono text-[10.5px] text-slate-400 dark:text-zinc-500">
                              {b.code}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            b.status === "active"
                              ? "success"
                              : b.status === "inactive"
                              ? "neutral"
                              : "danger"
                          }
                          className="capitalize text-[10px]"
                        >
                          {b.status}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 py-2 border-y border-slate-100 dark:border-zinc-800 text-[11.5px] text-slate-600 dark:text-zinc-400">
                        {b.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{b.email}</span>
                          </div>
                        )}
                        {b.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{b.phone}</span>
                          </div>
                        )}
                        {b.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{b.city}, {b.country_code || "KH"}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-3 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.outlets_count ?? 0}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Outlets</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.registers_count ?? 0}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Registers</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {b.business_users_count ?? 0}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">Staff</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <Button
                          variant={isCurrentActive ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handleSelectBusiness(b)}
                          className={`h-8 text-xs flex-1 cursor-pointer ${
                            isCurrentActive
                              ? "bg-orange-500 hover:bg-orange-600 text-white"
                              : "text-slate-700 dark:text-zinc-300"
                          }`}
                        >
                          {isCurrentActive ? "Active Context" : "Switch Context"}
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            title="Edit Company"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(b)}
                            title="Delete Company"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMPANY SUBSCRIPTION PLANS TABLE & PRICING (STATIC DATA) */}
      {/* ========================================================================= */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          {/* Subscription KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200/60 dark:border-orange-900/40 font-bold">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                  Tiers
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {subscriptionStats.totalPlans} Plans
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Available Subscription Plans
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/40 font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  Subscribers
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {subscriptionStats.totalSubscribers} Companies
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Active Paying Tenants
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40 font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  MRR Est.
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${subscriptionStats.monthlyMRR.toLocaleString()} / mo
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Monthly Recurring Revenue
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/60 dark:border-purple-900/40 font-bold">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  ARPU
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${subscriptionStats.averagePlanPrice} / company
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  Avg. Revenue Per User
                </div>
              </div>
            </div>
          </div>

          {/* Table Container & Billing Switcher */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40 dark:bg-zinc-850/20">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Crown className="h-4 w-4 text-orange-500" />
                  <span>Company Subscription Plans & Feature Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Configured tenant quotas, branch ceilings, and hardware terminal allowances
                </p>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    billingCycle === "monthly"
                      ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annually")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === "annually"
                      ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Comprehensive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                <thead className="bg-slate-50 dark:bg-zinc-850/60 text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-[10.5px] border-b border-slate-200/80 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Plan & Tier</th>
                    <th className="py-3.5 px-4 font-semibold">Pricing</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Max Outlets</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Max Registers</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Staff Seats</th>
                    <th className="py-3.5 px-4 font-semibold">SKU Limit</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Active Tenants</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {STATIC_SUBSCRIPTION_PLANS.map((plan) => {
                    const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually;
                    const period = billingCycle === "monthly" ? "mo" : "yr";

                    return (
                      <tr
                        key={plan.id}
                        className="hover:bg-orange-50/40 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        {/* Plan Name & Code */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              plan.code === "plan_enterprise"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                : plan.code === "plan_pro"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                                : plan.code === "plan_growth"
                                ? "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400"
                                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                            }`}>
                              {plan.code === "plan_enterprise" ? (
                                <Crown className="h-4.5 w-4.5" />
                              ) : plan.code === "plan_pro" ? (
                                <Sparkles className="h-4.5 w-4.5" />
                              ) : plan.code === "plan_growth" ? (
                                <Zap className="h-4.5 w-4.5" />
                              ) : (
                                <Store className="h-4.5 w-4.5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  {plan.name}
                                </span>
                                <Badge variant={plan.badgeVariant} className="text-[9.5px]">
                                  {plan.badge}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                                {plan.code}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {plan.currency}{price}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 ml-1">
                              /{period}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {plan.priceMonthly === 0 ? "Always Free" : billingCycle === "monthly" ? "Billed Monthly" : "Billed Annually"}
                          </p>
                        </td>

                        {/* Max Outlets */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                            {plan.maxOutlets}
                          </span>
                        </td>

                        {/* Max Registers */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                            {plan.maxRegisters}
                          </span>
                        </td>

                        {/* Staff Seats */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                            {plan.maxUsers}
                          </span>
                        </td>

                        {/* SKU Limit */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-xs text-slate-700 dark:text-zinc-300">
                            {typeof plan.maxProducts === "number" ? `${plan.maxProducts.toLocaleString()} SKUs` : "Unlimited"}
                          </span>
                        </td>

                        {/* Active Tenants */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 text-xs">
                            {plan.activeSubscribers} Tenants
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge variant="success" className="capitalize text-[10.5px]">
                            {plan.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPlanForAssign(plan)}
                            className="h-7.5 px-3 text-[11px] font-semibold rounded-lg border-orange-200 dark:border-orange-900/60 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400 cursor-pointer"
                          >
                            Assign to Company
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATIC_SUBSCRIPTION_PLANS.map((plan) => {
              const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnually;
              const period = billingCycle === "monthly" ? "month" : "year";

              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    plan.isPopular
                      ? "border-orange-500 bg-white dark:bg-zinc-900 shadow-md shadow-orange-500/10 ring-2 ring-orange-500/20"
                      : "border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      <Badge variant={plan.badgeVariant} className="text-[9.5px]">
                        {plan.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                      {plan.description}
                    </p>

                    <div className="py-3 border-y border-slate-100 dark:border-zinc-800 mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {plan.currency}{price}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                          /{period}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-tight"
                        >
                          <Check className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant={plan.isPopular ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlanForAssign(plan)}
                    className={`w-full text-xs font-semibold rounded-xl h-9 cursor-pointer ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/25"
                        : ""
                    }`}
                  >
                    Assign {plan.name}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ASSIGN SUBSCRIPTION PLAN MODAL (STATIC INTERACTION) */}
      {/* ========================================================================= */}
      {selectedPlanForAssign && (
        <Modal
          isOpen={Boolean(selectedPlanForAssign)}
          onClose={() => {
            setSelectedPlanForAssign(null);
            setIsAssignSuccess(false);
          }}
          size="md"
          title={
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Assign Subscription Plan
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {selectedPlanForAssign.name} (${selectedPlanForAssign.priceMonthly}/mo)
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {isAssignSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Plan Assigned Successfully!
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  The company subscription tier has been updated. Quotas have been applied.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Select Target Company <span className="text-orange-500">*</span>
                  </label>
                  <select
                    value={targetCompanyUuid}
                    onChange={(e) => setTargetCompanyUuid(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="">-- Choose a company tenant --</option>
                    {businesses.map((b) => (
                      <option key={b.uuid} value={b.uuid}>
                        {b.name} ({b.code}) - {b.outlets_count || 1} Outlets
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span>Outlets Allowance:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedPlanForAssign.maxOutlets}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registers Allowance:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedPlanForAssign.maxRegisters}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staff User Seats:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedPlanForAssign.maxUsers}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                      <span>Swipe right to apply plan:</span>
                      {!targetCompanyUuid && (
                        <span className="text-orange-500 text-[10px]">Select a tenant above first</span>
                      )}
                    </div>
                    <SwipeButton
                      variant="orange"
                      label="Swipe to Apply Plan"
                      loadingLabel="Applying plan..."
                      successLabel="Plan Assigned Successfully!"
                      disabled={!targetCompanyUuid}
                      onConfirm={handleConfirmAssignPlan}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlanForAssign(null)}
                      className="rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* 4 Reusable Modals */}
      <CreateBusinessModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        isLoading={isSaving}
      />

      <BusinessProvisionedModal
        isOpen={Boolean(provisionedResult)}
        onClose={clearProvisionedResult}
        data={provisionedResult}
      />

      <EditBusinessModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        business={selectedBusiness}
        onSubmit={handleUpdateSubmit}
        isLoading={isSaving}
      />

      <DeleteBusinessModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        business={selectedBusiness}
        onConfirm={handleDeleteSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}
