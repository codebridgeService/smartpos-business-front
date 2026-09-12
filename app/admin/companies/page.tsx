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
import type { Business, StoreBusinessRequest, UpdateBusinessRequest } from "@/types";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    if (!businesses || businesses.length === 0) return;

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

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shadow-xs">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Companies Management
                </h1>
                <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {businesses.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Oversee all registered tenant businesses, branch scale, registers, and operational credentials
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9 px-3 text-xs rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredBusinesses.length === 0}
            className="h-9 px-3.5 text-xs rounded-xl border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Companies</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isLoading && businesses.length === 0 ? "..." : metrics.total}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40">
            Tenants
          </span>
        </div>

        {/* Active Companies */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Active Tenants</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isLoading && businesses.length === 0 ? "..." : metrics.active}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
            {metrics.total > 0 ? `${Math.round((metrics.active / metrics.total) * 100)}%` : "100%"}
          </span>
        </div>

        {/* Total Outlets */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Outlets</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isLoading && businesses.length === 0 ? "..." : metrics.totalOutlets}
              </div>
            </div>
          </div>
          <Link
            href="/admin/businesses/outlets"
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100 transition-colors"
          >
            Manage
          </Link>
        </div>

        {/* POS Terminals & Devices */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Tablet className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">POS Devices & Regs</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isLoading && businesses.length === 0 ? "..." : metrics.totalDevices + metrics.totalRegisters}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40">
            Hardware
          </span>
        </div>
      </div>

      {/* Main Content: Table & Controls */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Filter & View Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, code, email, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-medium">
              {["All", "Active", "Inactive", "Suspended"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    statusFilter === status
                      ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                }`}
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
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
          <div className="py-16 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Companies Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || statusFilter !== "All"
                ? "No businesses match your current search or status filter criteria."
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
                className="text-xs"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={openCreateModal}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add First Company
              </Button>
            )}
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800 uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location & Currency</th>
                  <th className="py-3 px-4">Scale</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
                {filteredBusinesses.map((b) => {
                  const isCurrentActive = activeBusiness?.uuid === b.uuid;
                  return (
                    <tr
                      key={b.uuid}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Company Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {b.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={b.logo_url} alt={b.name} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                              b.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                                {b.name}
                              </span>
                              {isCurrentActive && (
                                <span className="px-1.5 py-0.2 text-[9.5px] font-bold rounded-md bg-orange-500 text-white">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {b.code}
                              </span>
                              {b.legal_name && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                  {b.legal_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact: Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {b.email ? (
                            <div className="text-[11.5px] text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{b.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No email</span>
                          )}
                          {b.phone && (
                            <div className="text-[10.5px] text-slate-400 flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{b.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location & Currency */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="text-[11.5px] font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{b.city || b.country_code || "Global"}</span>
                          </div>
                          <div className="text-[10.5px] text-slate-400 font-mono">
                            {b.currency_code} ({b.currency_symbol || "$"})
                          </div>
                        </div>
                      </td>

                      {/* Outlets, Registers & Devices */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href="/admin/businesses/outlets"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                            title="View outlets for this company"
                          >
                            <Store className="h-3 w-3 text-slate-400" />
                            <span className="font-semibold">{b.outlets_count ?? 0}</span>
                            <span className="text-[10px] text-slate-400">outlets</span>
                          </Link>

                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400"
                            title={`${b.registers_count ?? 0} registers, ${b.pos_devices_count ?? 0} POS devices`}
                          >
                            <Tablet className="h-3 w-3 text-slate-400" />
                            <span>{(b.registers_count ?? 0) + (b.pos_devices_count ?? 0)}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            b.status === "active"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : b.status === "inactive"
                              ? "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          {b.status === "active" && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {b.status === "inactive" && <Clock className="h-2.5 w-2.5" />}
                          {b.status === "suspended" && <Ban className="h-2.5 w-2.5" />}
                          {b.status}
                        </span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 text-[11px]">
                        {b.created_at
                          ? new Date(b.created_at).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectBusiness(b)}
                            title="Set as active context business"
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors flex items-center gap-1 ${
                              isCurrentActive
                                ? "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 font-semibold"
                                : "border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                            }`}
                          >
                            {copiedId === b.uuid ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span>Active</span>
                              </>
                            ) : isCurrentActive ? (
                              <span>Current</span>
                            ) : (
                              <span>Switch</span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(b)}
                            title="Edit Company Details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(b)}
                            title="Delete Company"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
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
          /* Grid View Cards */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((b) => {
              const isCurrentActive = activeBusiness?.uuid === b.uuid;
              return (
                <div
                  key={b.uuid}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrentActive
                      ? "border-orange-500/50 bg-orange-50/20 dark:bg-orange-950/10 shadow-xs"
                      : "border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {b.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.logo_url} alt={b.name} className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          b.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[140px]">
                            {b.name}
                          </h4>
                          {isCurrentActive && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-orange-500 text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {b.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        b.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : b.status === "inactive"
                          ? "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Scale Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 mb-3 text-center">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {b.outlets_count ?? 0}
                      </div>
                      <div className="text-[10px] text-slate-400">Outlets</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {b.registers_count ?? 0}
                      </div>
                      <div className="text-[10px] text-slate-400">Registers</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {b.pos_devices_count ?? 0}
                      </div>
                      <div className="text-[10px] text-slate-400">POS Devs</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-zinc-400 mb-4">
                    {b.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{b.email}</span>
                      </div>
                    )}
                    {b.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>{b.city ? `${b.city}, ${b.country_code}` : b.country_code || "Global"}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <Button
                      variant={isCurrentActive ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleSelectBusiness(b)}
                      className={`h-8 text-xs flex-1 ${
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
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(b)}
                        title="Delete Company"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
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
