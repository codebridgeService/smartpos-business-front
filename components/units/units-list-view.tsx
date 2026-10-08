"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  RefreshCw,
  Building2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Plus,
  Scale,
  Code2,
  Hash,
  Database,
  Wifi,
  WifiOff,
  Edit,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useToast } from "@/components/ui/toast";
import { useBusinessesQuery } from "@/lib/react-query/hooks/use-businesses";
import {
  useUnitsQuery,
  useToggleUnitStatusMutation,
  useClearUnitCacheMutation,
} from "@/lib/react-query/hooks/use-units";
import { type Unit } from "@/lib/api/units";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { getUserRoleCodes } from "@/lib/utils/roles";
import { CreateUnitModal } from "./create-unit-modal";
import { EditUnitModal } from "./edit-unit-modal";
import { DeleteUnitModal } from "./delete-unit-modal";
import { UnitDetailModal } from "./unit-detail-modal";
import { AddPresetsModal } from "./add-presets-modal";

export function UnitsListView() {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const toast = useToast();

  const isAdmin = useMemo(() => {
    const roles = getUserRoleCodes(user);
    return roles.includes("admin") || roles.includes("super_admin") || roles.includes("owner");
  }, [user]);

  // Query businesses for Admin selector
  const { data: businesses = [] } = useBusinessesQuery(undefined, isAdmin);

  // Filter & Pagination States
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedBusinessUuid, setSelectedBusinessUuid] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // Modals state
  const [activeUnitModal, setActiveUnitModal] = useState<Unit | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);

  // Active business UUID determination
  const currentBusinessUuid = useMemo(() => {
    if (isAdmin && selectedBusinessUuid) {
      return selectedBusinessUuid;
    }
    return activeBusiness?.uuid || "";
  }, [isAdmin, selectedBusinessUuid, activeBusiness?.uuid]);

  // Query Params
  const queryParams = useMemo(() => {
    return {
      business_uuid: currentBusinessUuid || undefined,
      search: search.trim() || undefined,
      is_active: statusFilter === "all" ? undefined : statusFilter === "active",
      page,
      per_page: perPage,
    };
  }, [currentBusinessUuid, search, statusFilter, page, perPage]);

  // Query Units
  const {
    data: unitsData,
    isLoading: isUnitsLoading,
    isFetching: isUnitsFetching,
    refetch: refetchUnits,
  } = useUnitsQuery(queryParams, Boolean(currentBusinessUuid || isAdmin));

  const units = unitsData?.data || [];
  const existingCodes = useMemo(() => units.map((u) => u.code), [units]);
  const meta = unitsData?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: units.length,
  };
  const isOffline = unitsData?.isOffline || false;

  // Toggle Status Mutation
  const toggleStatusMutation = useToggleUnitStatusMutation();
  const clearCacheMutation = useClearUnitCacheMutation();

  const handleToggleStatus = async (unit: Unit) => {
    try {
      await toggleStatusMutation.mutateAsync({
        unit,
        businessUuid: currentBusinessUuid || unit.business_uuid,
      });
      toast.success(
        `Unit "${unit.name}" set to ${!unit.is_active ? "Active" : "Inactive"}.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update unit status.");
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCacheMutation.mutateAsync();
      await refetchUnits();
      toast.success("Offline units cache cleared and refreshed.");
    } catch {
      toast.error("Failed to clear offline cache.");
    }
  };

  const handleRefresh = async () => {
    await refetchUnits();
    toast.success("Units catalog updated.");
  };

  // KPI calculations
  const kpiStats = useMemo(() => {
    const total = meta.total || units.length;
    const active = units.filter((u) => u.is_active).length;
    const inactive = units.filter((u) => !u.is_active).length;
    const scaled = units.filter((u) => (u.precision ?? 0) > 0).length;
    return { total, active, inactive, scaled };
  }, [meta.total, units]);

  return (
    <div className="space-y-6 w-full pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
            <span>Businesses</span>
            <span>/</span>
            <span className="text-orange-600 dark:text-orange-400">Units & Scaling</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FE9F43]/10 text-[#FE9F43] flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                Measurement Units
                {isOffline && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline Cached
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Configure measurement units, symbols, and precision scaling for product catalog and POS sales.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={clearCacheMutation.isPending}
            className="text-xs gap-1.5 h-9 rounded-xl border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 cursor-pointer"
            title="Clear IndexedDB local cache"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Clear Cache</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isUnitsFetching}
            className="text-xs gap-1.5 h-9 rounded-xl border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 cursor-pointer"
            title="Refresh Units"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUnitsFetching ? "animate-spin text-orange-500" : ""}`} />
            <span>Refresh</span>
          </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPresetsModalOpen(true)}
              className="text-xs gap-1.5 h-9 rounded-xl border-orange-200 dark:border-orange-850/60 bg-orange-50/50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100/70 hover:text-orange-800 cursor-pointer font-medium"
              title="Add Standard Presets"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Standard Presets</span>
            </Button>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs gap-1.5 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm shadow-orange-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Unit</span>
            </Button>
          </div>
        </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Total Units
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber value={kpiStats.total} loading={isUnitsLoading} />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Active in POS
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber value={kpiStats.active} loading={isUnitsLoading} />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Inactive Units
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber value={kpiStats.inactive} loading={isUnitsLoading} />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Decimal Scaling
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber value={kpiStats.scaled} loading={isUnitsLoading} />
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search units by name, code (e.g. KG), or symbol..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Target Business Select (Admin) */}
            {isAdmin && businesses.length > 0 && (
              <div className="relative">
                <select
                  value={selectedBusinessUuid}
                  onChange={(e) => {
                    setSelectedBusinessUuid(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 pr-8 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Businesses</option>
                  {businesses.map((b) => (
                    <option key={b.uuid} value={b.uuid}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Status Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-850 border border-slate-200/70 dark:border-zinc-750 text-xs">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-white dark:bg-zinc-750 text-slate-900 dark:text-zinc-50 shadow-2xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Reset Filter Button */}
            {(search || statusFilter !== "all" || selectedBusinessUuid) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setSelectedBusinessUuid("");
                  setPage(1);
                }}
                className="h-8 px-2.5 text-xs text-slate-500 hover:text-rose-600 gap-1 cursor-pointer"
                title="Reset filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Units Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850/60 text-slate-600 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {units.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                        <Scale className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                          {search || statusFilter !== "all"
                            ? "No measurement units matched your filters"
                            : "No measurement units created yet"}
                        </p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {search || statusFilter !== "all"
                            ? "Try refining your search keyword or resetting status filters."
                            : "Define measurement units like Pieces (pcs), Kilograms (kg), or Meters (m) to start selling products."}
                        </p>
                      </div>
                      {search || statusFilter !== "all" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                            setSelectedBusinessUuid("");
                            setPage(1);
                          }}
                          className="mt-2 text-xs cursor-pointer"
                        >
                          Clear Filters
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                          <Button
                            size="sm"
                            onClick={() => setIsPresetsModalOpen(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shadow-sm shadow-orange-500/25 cursor-pointer text-xs font-semibold"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Seed Standard Units</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-xs gap-1.5 border-slate-200 dark:border-zinc-750 text-slate-700 dark:text-zinc-200 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create First Unit</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr
                    key={unit.uuid || unit.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-850/50 transition-colors group"
                  >
                    {/* Unit Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100/70 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 font-bold text-xs">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-zinc-100 block truncate">
                            {unit.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            #{unit.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-zinc-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px]">
                        {unit.code}
                      </span>
                    </td>

                    {/* Symbol */}
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200/50 dark:border-orange-800/40 text-[11px]">
                        {unit.symbol}
                      </span>
                    </td>

                    {/* Precision */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {unit.precision} decimals
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {unit.precision === 0 ? "Whole (1)" : `Scaling (1.${"0".repeat(unit.precision)})`}
                        </span>
                      </div>
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(unit)}
                        disabled={toggleStatusMutation.isPending}
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          unit.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
                        }`}
                        title="Click to toggle active status"
                      >
                        {unit.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveUnitModal(unit)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUnit(unit)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer"
                          title="Edit Unit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUnit(unit)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Meta Footer */}
        {meta.total > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {(meta.current_page - 1) * meta.per_page + (units.length > 0 ? 1 : 0)} -{" "}
                {Math.min(meta.current_page * meta.per_page, meta.total)}
              </span>
              <span>of</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">{meta.total}</span>
              <span>units</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] hidden sm:inline">Rows per page:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs font-semibold cursor-pointer outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                <span className="px-2 font-mono font-bold text-slate-800 dark:text-zinc-200">
                  {meta.current_page} / {meta.last_page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  disabled={page >= meta.last_page}
                  className="h-7 w-7 p-0 rounded-lg cursor-pointer disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUnitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetchUnits()}
      />

      <EditUnitModal
        unit={editingUnit}
        isOpen={Boolean(editingUnit)}
        onClose={() => setEditingUnit(null)}
        onSuccess={() => refetchUnits()}
      />

      <DeleteUnitModal
        unit={deletingUnit}
        isOpen={Boolean(deletingUnit)}
        onClose={() => setDeletingUnit(null)}
        onSuccess={() => refetchUnits()}
      />

      <UnitDetailModal
        unit={activeUnitModal}
        isOpen={Boolean(activeUnitModal)}
        onClose={() => setActiveUnitModal(null)}
        onEdit={(unit) => setEditingUnit(unit)}
      />

      <AddPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSuccess={() => refetchUnits()}
        existingCodes={existingCodes}
        defaultBusinessUuid={currentBusinessUuid}
      />
    </div>
  );
}
