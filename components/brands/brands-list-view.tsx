"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Database,
  RefreshCw,
  Building2,
  BadgeCheck,
  Tag,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Layers,
  Wifi,
  WifiOff,
  Calendar,
  Code2,
  Trash2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useToast } from "@/components/ui/toast";
import { useBusinessesQuery } from "@/lib/react-query/hooks/use-businesses";
import {
  useBrandsQuery,
  useSyncBrandsMutation,
  useClearBrandCacheMutation,
  useToggleBrandStatusMutation,
} from "@/lib/react-query/hooks/use-brands";
import { deleteFakeDemoBrandsFromIndexedDb } from "@/lib/storage/brand-cache";
import type { Brand } from "@/lib/api/brands";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBrandStore } from "@/stores/useBrandStore";
import { getUserRoleCodes } from "@/lib/utils/roles";

const CreateBrandModal = dynamic(
  () => import("./create-brand-modal").then((mod) => mod.CreateBrandModal),
  { ssr: false }
);
const EditBrandModal = dynamic(
  () => import("./edit-brand-modal").then((mod) => mod.EditBrandModal),
  { ssr: false }
);
const DeleteBrandModal = dynamic(
  () => import("./delete-brand-modal").then((mod) => mod.DeleteBrandModal),
  { ssr: false }
);

export function BrandsListView() {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const toast = useToast();

  // Purge any legacy 5 fake demo brands from IndexedDB on initial mount
  useEffect(() => {
    deleteFakeDemoBrandsFromIndexedDb().catch((err) => {
      console.warn("[BrandsListView] Could not purge demo items from IndexedDB:", err);
    });
  }, []);

  // Check if current user has platform admin privileges
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
  const [activeBrandModal, setActiveBrandModal] = useState<Brand | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Status Toggle Mutation
  const toggleStatusMutation = useToggleBrandStatusMutation();

  const handleToggleStatus = async (brand: Brand) => {
    try {
      await toggleStatusMutation.mutateAsync({ brand });
      toast.success(
        `Brand "${brand.name}" set to ${!brand.is_active ? "Active" : "Inactive"}.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update brand status.");
    }
  };

  // Zustand Store Integration
  const {
    isCreateModalOpen: isStoreCreateOpen,
    openCreateModal,
    closeCreateModal,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    isDeleteModalOpen,
    openDeleteModal,
    closeDeleteModal,
    selectedBrand,
  } = useBrandStore();
  const isCreateOpen = isCreateModalOpen || isStoreCreateOpen;
  const isEditOpen = Boolean(editingBrand || (isEditModalOpen && selectedBrand));
  const isDeleteOpen = Boolean(deletingBrand || (isDeleteModalOpen && selectedBrand));

  // Active status param calculation
  const isActiveParam = useMemo(() => {
    if (statusFilter === "active") return "true";
    if (statusFilter === "inactive") return "false";
    return undefined;
  }, [statusFilter]);

  // Effective business_uuid for query
  const effectiveBusinessUuid = useMemo(() => {
    if (isAdmin) {
      return selectedBusinessUuid ? selectedBusinessUuid : undefined;
    }
    return activeBusiness?.uuid || undefined;
  }, [isAdmin, selectedBusinessUuid, activeBusiness]);

  // Main Brands Query (backed by IndexedDB cache layer)
  const {
    data: queryResult,
    isLoading,
    isFetching,
    refetch,
  } = useBrandsQuery({
    search: search.trim() || undefined,
    is_active: isActiveParam,
    business_uuid: effectiveBusinessUuid,
    page,
    per_page: perPage,
  });

  const brands = queryResult?.data || [];
  const meta = queryResult?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  };
  const isOffline = Boolean(queryResult?.isOffline);
  const totalCachedInDb = queryResult?.totalCached || 0;

  // Mutations
  const syncMutation = useSyncBrandsMutation();
  const clearCacheMutation = useClearBrandCacheMutation();

  // Handle Manual Synchronize / Re-fetch
  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({
        search: search.trim() || undefined,
        is_active: isActiveParam,
        business_uuid: effectiveBusinessUuid,
        page,
        per_page: perPage,
      });
      toast.success("Brands synchronized with IndexedDB cache!");
    } catch {
      toast.info("Offline: Loaded brands directly from IndexedDB.");
      refetch();
    }
  };

  // Clear IndexedDB Cache
  const handleClearCache = async () => {
    try {
      await clearCacheMutation.mutateAsync();
      toast.info("Brands IndexedDB cache cleared.");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear cache.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FE9F43]/10 text-[#FE9F43] border border-[#FE9F43]/20">
              <BadgeCheck className="w-3.5 h-3.5" />
              Product Catalog
            </span>
            {isOffline ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <WifiOff className="w-3 h-3" />
                IndexedDB Offline Cache
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Wifi className="w-3 h-3" />
                Live API & IndexedDB Synced
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Brands Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            View, search, and filter product brands across business entities. All records are cached in local
            IndexedDB for zero-latency lookups and offline POS reliability.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => {
              setIsCreateModalOpen(true);
              openCreateModal(effectiveBusinessUuid);
            }}
            className="rounded-xl bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold h-9 px-3.5 gap-1.5 shadow-md shadow-[#FE9F43]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brand</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isFetching || syncMutation.isPending}
            className="rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching || syncMutation.isPending ? "animate-spin text-[#FE9F43]" : ""}`} />
            <span>Sync Cache</span>
          </Button>

          {totalCachedInDb > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              title="Clear IndexedDB cache store for brands"
              className="rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium h-9 px-2.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by brand name, code, or description..."
              className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="md:col-span-4 flex items-center bg-slate-100/80 dark:bg-zinc-800/60 p-1 rounded-xl">
            {(
              [
                { id: "all", label: "All Brands" },
                { id: "active", label: "Active" },
                { id: "inactive", label: "Inactive" },
              ] as const
            ).map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Admin Multi-Business Filter Selector */}
          {isAdmin ? (
            <div className="md:col-span-3">
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  aria-label="Filter by Business"
                  value={selectedBusinessUuid}
                  onChange={(e) => {
                    setSelectedBusinessUuid(e.target.value);
                    setPage(1);
                  }}
                  className="w-full appearance-none pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] cursor-pointer"
                >
                  <option value="">All Businesses (Global)</option>
                  {businesses.map((biz) => (
                    <option key={biz.uuid} value={biz.uuid}>
                      {biz.name}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="md:col-span-3 flex items-center justify-end text-xs text-slate-500 dark:text-zinc-400 gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium truncate">{activeBusiness?.name || "My Business"}</span>
            </div>
          )}
        </div>

        {/* Filter Badges Bar */}
        {(search || statusFilter !== "all" || (isAdmin && selectedBusinessUuid)) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                Search: &ldquo;{search}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium capitalize">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isAdmin && selectedBusinessUuid && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                Business: {businesses.find((b) => b.uuid === selectedBusinessUuid)?.name || selectedBusinessUuid}
                <button
                  type="button"
                  onClick={() => setSelectedBusinessUuid("")}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSelectedBusinessUuid("");
                setPage(1);
              }}
              className="text-xs font-semibold text-[#FE9F43] hover:underline cursor-pointer ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Main Table / Card Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Loading Skeleton State */}
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-11 h-11 bg-slate-200 dark:bg-zinc-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-slate-200 dark:bg-zinc-800 rounded" />
                  <div className="w-32 h-3 bg-slate-100 dark:bg-zinc-850 rounded" />
                </div>
                <div className="w-20 h-6 bg-slate-200 dark:bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : brands.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
              <Tag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                No Brands Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== "all" || selectedBusinessUuid
                  ? "No brands match your active search and filter criteria. Try adjusting or clearing your filters."
                  : "Your brand directory is currently empty. Get started by adding your first brand record."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {search || statusFilter !== "all" || selectedBusinessUuid ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setSelectedBusinessUuid("");
                  }}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setIsCreateModalOpen(true);
                    openCreateModal(effectiveBusinessUuid);
                  }}
                  className="rounded-xl bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold shadow-md shadow-[#FE9F43]/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Brand
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Desktop Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Description</th>
                  {isAdmin && <th className="py-3 px-4">Business</th>}
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {brands.map((brand) => (
                  <tr
                    key={brand.uuid || brand.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Brand Logo & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-center shrink-0 shadow-2xs">
                          {brand.logo_url ? (
                            <Image
                              src={brand.logo_url}
                              alt={brand.name}
                              width={40}
                              height={40}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-extrabold text-sm text-[#FE9F43]">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-zinc-100 hover:text-[#FE9F43] transition-colors">
                            {brand.name}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                            UUID: {brand.uuid.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Brand Code */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700">
                        {brand.code}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 dark:text-zinc-400 truncate">
                        {brand.description || "—"}
                      </p>
                    </td>

                    {/* Business (Admin only) */}
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {businesses.find((b) => b.uuid === brand.business_uuid)?.name ||
                            brand.business_uuid.slice(0, 10)}
                        </span>
                      </td>
                    )}

                    {/* Status Badge with Interactive Toggle Switch */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={brand.is_active}
                          aria-label={`Toggle active status for ${brand.name}`}
                          disabled={toggleStatusMutation.isPending}
                          onClick={() => handleToggleStatus(brand)}
                          title={`Click to turn ${brand.is_active ? "Off (Inactive)" : "On (Active)"}`}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            brand.is_active ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              brand.is_active ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-semibold ${
                            brand.is_active
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {brand.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Timestamps */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 text-[11px]">
                      {brand.updated_at
                        ? new Date(brand.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveBrandModal(brand)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-[#FE9F43] hover:bg-[#FE9F43]/10 border border-transparent hover:border-[#FE9F43]/20 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBrand(brand);
                            openEditModal(brand);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-[#FE9F43] hover:bg-[#FE9F43]/10 border border-transparent hover:border-[#FE9F43]/20 transition-all cursor-pointer"
                        >
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingBrand(brand);
                            openDeleteModal(brand);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Footer Info Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-slate-900 dark:text-zinc-100">
                {brands.length > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 dark:text-zinc-100">
                {Math.min(meta.current_page * meta.per_page, meta.total)}
              </strong>{" "}
              of <strong className="text-slate-900 dark:text-zinc-100">{meta.total}</strong> brands
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Database className="w-3 h-3 text-[#FE9F43]" />
              {totalCachedInDb} cached in IndexedDB
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Per-Page Selector */}
            <div className="flex items-center gap-1 mr-2">
              <span className="text-[11px]">Rows:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1 px-2 text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-200 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Prev Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page <= 1}
              className="h-8 px-2.5 rounded-lg border-slate-200 dark:border-zinc-700 text-xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <span className="px-2 font-bold text-slate-800 dark:text-zinc-200">
              Page {meta.current_page} of {Math.max(1, meta.last_page)}
            </span>

            {/* Next Page Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page >= meta.last_page}
              className="h-8 px-2.5 rounded-lg border-slate-200 dark:border-zinc-700 text-xs cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Brand Detail Modal */}
      {activeBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-xs">
                  {activeBrandModal.logo_url ? (
                    <Image
                      src={activeBrandModal.logo_url}
                      alt={activeBrandModal.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-lg text-[#FE9F43]">
                      {activeBrandModal.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-50">
                    {activeBrandModal.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {activeBrandModal.code}
                    </span>
                    {activeBrandModal.is_active ? (
                      <span className="text-[10px] font-bold text-emerald-600">● Active</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">● Inactive</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveBrandModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detail Spec Rows */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Description</span>
                <p className="text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {activeBrandModal.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-400 font-medium block text-[10px]">Brand UUID</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 select-all">
                    {activeBrandModal.uuid}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-400 font-medium block text-[10px]">Business UUID</span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 select-all">
                    {activeBrandModal.business_uuid}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Created: {activeBrandModal.created_at ? new Date(activeBrandModal.created_at).toLocaleString() : "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Updated: {activeBrandModal.updated_at ? new Date(activeBrandModal.updated_at).toLocaleString() : "—"}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const b = activeBrandModal;
                  setActiveBrandModal(null);
                  setDeletingBrand(b);
                  openDeleteModal(b);
                }}
                className="rounded-xl px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const b = activeBrandModal;
                    setActiveBrandModal(null);
                    setEditingBrand(b);
                    openEditModal(b);
                  }}
                  className="rounded-xl px-3.5 text-xs font-semibold text-[#FE9F43] border-[#FE9F43]/30 hover:bg-[#FE9F43]/10 cursor-pointer"
                >
                  Edit Brand
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveBrandModal(null)}
                  className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Brand Modal (Zustand + TanStack Query) */}
      <CreateBrandModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          closeCreateModal();
        }}
        onSuccess={() => refetch()}
      />

      {/* Edit Brand Modal (Zustand + TanStack Query) */}
      <EditBrandModal
        brand={editingBrand || selectedBrand}
        isOpen={isEditOpen}
        onClose={() => {
          setEditingBrand(null);
          closeEditModal();
        }}
        onSuccess={() => refetch()}
      />

      {/* Delete Brand Modal (Zustand + TanStack Query) */}
      <DeleteBrandModal
        brand={deletingBrand || selectedBrand}
        isOpen={isDeleteOpen}
        onClose={() => {
          setDeletingBrand(null);
          closeDeleteModal();
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
