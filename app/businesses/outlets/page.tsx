"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Store,
  MapPin,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Calculator,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Percent,
  Clock,
  ExternalLink,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import {
  outletsApi,
  CreateOutletRequest,
  UpdateOutletRequest,
} from "@/lib/api/outlets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Outlet } from "@/types";

export default function BusinessOutletsPage({
  params,
}: {
  params?: Promise<{ business?: string }> | { business?: string };
} = {}) {
  const { activeBusiness, businesses } = useBusiness();
  const businessUuid = activeBusiness?.uuid || (businesses.length > 0 ? businesses[0].uuid : "");
  const toast = useToast();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View switch: Grid vs. Table (persisted in device storage)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("outlets_view_mode") as "grid" | "table" | null;
      if (savedMode === "grid" || savedMode === "table") {
        setViewMode(savedMode);
      }
    } catch {
      // Ignore if localStorage unavailable
    }
  }, []);

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const nextMode = prev === "grid" ? "table" : "grid";
      try {
        localStorage.setItem("outlets_view_mode", nextMode);
      } catch {
        // Ignore
      }
      return nextMode;
    });
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateOutletRequest>({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Phnom Penh",
    country_code: "KH",
    is_main_outlet: false,
    tax_rate: "10.00",
    timezone: "Asia/Phnom_Penh",
  });

  // Edit Modal State
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState<UpdateOutletRequest>({
    code: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    tax_rate: "",
    timezone: "",
    is_main_outlet: false,
    is_active: true,
    receipt_header: "",
    receipt_footer: "",
  });

  // Delete Modal State
  const [deletingOutlet, setDeletingOutlet] = useState<Outlet | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchOutlets = useCallback(async () => {
    if (!businessUuid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await outletsApi.getOutlets(businessUuid);
      setOutlets(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load outlets";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [businessUuid]);

  useEffect(() => {
    void fetchOutlets();
  }, [fetchOutlets]);

  // Filtered outlets
  const filteredOutlets = useMemo(() => {
    return outlets.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.phone && item.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? item.is_active || item.status === "active"
          : !item.is_active || item.status === "inactive");

      return matchesSearch && matchesStatus;
    });
  }, [outlets, searchQuery, statusFilter]);

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessUuid) {
      toast.error("No active business selected");
      return;
    }
    if (!createForm.name.trim() || !createForm.code.trim()) {
      toast.error("Outlet name and code are required");
      return;
    }

    setIsSubmittingCreate(true);
    try {
      await outletsApi.createOutlet(businessUuid, {
        ...createForm,
        code: createForm.code.trim().toUpperCase(),
        name: createForm.name.trim(),
        phone: createForm.phone?.trim() || null,
        email: createForm.email?.trim() || null,
        address: createForm.address?.trim() || null,
      });

      toast.success("Outlet created successfully!");
      setIsCreateOpen(false);
      setCreateForm({
        code: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "Phnom Penh",
        country_code: "KH",
        is_main_outlet: false,
        tax_rate: "10.00",
        timezone: "Asia/Phnom_Penh",
      });
      await fetchOutlets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create outlet";
      toast.error(msg);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setEditForm({
      code: outlet.code,
      name: outlet.name,
      phone: outlet.phone || "",
      email: outlet.email || "",
      address: outlet.address || "",
      city: outlet.city || "",
      tax_rate: outlet.tax_rate || "0.00",
      timezone: outlet.timezone || "Asia/Phnom_Penh",
      is_main_outlet: Boolean(outlet.is_main_outlet),
      is_active: outlet.is_active ?? outlet.status === "active",
      receipt_header: outlet.receipt_header || "",
      receipt_footer: outlet.receipt_footer || "",
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutlet) return;
    if (!editForm.name?.trim() || !editForm.code?.trim()) {
      toast.error("Outlet name and code are required");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await outletsApi.updateOutlet(editingOutlet.uuid, {
        ...editForm,
        code: editForm.code?.trim().toUpperCase(),
        name: editForm.name?.trim(),
        phone: editForm.phone?.trim() || null,
        email: editForm.email?.trim() || null,
        address: editForm.address?.trim() || null,
        city: editForm.city?.trim() || null,
        tax_rate: editForm.tax_rate?.toString() || null,
        timezone: editForm.timezone?.trim() || null,
        receipt_header: editForm.receipt_header?.trim() || null,
        receipt_footer: editForm.receipt_footer?.trim() || null,
      });

      toast.success("Outlet updated successfully!");
      setEditingOutlet(null);
      await fetchOutlets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update outlet";
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!deletingOutlet) return;

    setIsSubmittingDelete(true);
    try {
      await outletsApi.deleteOutlet(deletingOutlet.uuid);
      toast.success(`Outlet "${deletingOutlet.name}" deleted successfully.`);
      setDeletingOutlet(null);
      await fetchOutlets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete outlet";
      toast.error(msg);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Store Branches & Outlets</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Outlets & Branches
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Physical stores, retail locations, and kiosks linked to {activeBusiness?.name || "this business"}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchOutlets}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-orange-500" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Outlet
          </Button>
        </div>
      </div>

      {/* 2. Filter, Search & View Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, phone, or city..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
            <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-800/50">
              {(["all", "active", "inactive"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    statusFilter === st
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle: Single Click Button (Persisted) */}
          <button
            type="button"
            onClick={toggleViewMode}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-150 outline-none focus:outline-none shadow-2xs"
            title={viewMode === "grid" ? "Dense Table View" : "Grid View"}
            aria-label={viewMode === "grid" ? "Dense Table View" : "Grid View"}
          >
            {viewMode === "grid" ? (
              <>
                <List className="w-4 h-4 text-orange-500" />
                <span>Table View</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4 text-orange-500" />
                <span>Grid View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Error State */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-between text-sm text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOutlets}>
            Try Again
          </Button>
        </div>
      )}

      {/* 4. Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-6 w-36 rounded-md" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 5. Empty State */}
      {!isLoading && !error && filteredOutlets.length === 0 && (
        <Card className="p-12 text-center border-dashed border-2 border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 rounded-2xl">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {searchQuery ? "No matching outlets found" : "No outlets created yet"}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-5">
            {searchQuery
              ? `No outlets match your filter "${searchQuery}". Try clearing the search query.`
              : "Set up physical branches, retail kiosks, or flagship stores to start managing cash registers and point-of-sale hardware."}
          </p>
          {searchQuery ? (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          ) : (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Outlet
            </Button>
          )}
        </Card>
      )}

      {/* 6. Outlets Cards Grid View */}
      {!isLoading && !error && filteredOutlets.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOutlets.map((outlet) => {
            const isActive = outlet.is_active || outlet.status === "active";
            const registersCount = outlet.registers_count ?? 0;
            const posDevicesCount = outlet.pos_devices_count ?? outlet.devices_count ?? 0;

            return (
              <Card
                key={outlet.uuid || outlet.id}
                className="p-5 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:border-orange-500/30 transition-all rounded-2xl bg-white dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code, Main Badge, Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="neutral" className="text-xs font-mono font-bold">
                        {outlet.code}
                      </Badge>
                      {outlet.is_main_outlet && (
                        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-semibold">
                          Main Branch
                        </Badge>
                      )}
                    </div>
                    <Badge
                      className={`text-[11px] font-semibold ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-zinc-500/15 text-zinc-500 border-zinc-500/30"
                      }`}
                    >
                      {outlet.status ? outlet.status.toUpperCase() : isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>

                  {/* Outlet Name */}
                  <Link
                    href={`/businesses/outlets/${outlet.uuid}`}
                    className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight hover:text-orange-500 transition-colors inline-block"
                  >
                    {outlet.name}
                  </Link>

                  {/* Contact & Location Info */}
                  <div className="mt-3.5 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {outlet.address
                          ? `${outlet.address}${outlet.city ? `, ${outlet.city}` : ""}`
                          : outlet.city
                          ? outlet.city
                          : "No address specified"}
                        {outlet.country_code ? ` (${outlet.country_code})` : ""}
                      </span>
                    </div>

                    {outlet.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{outlet.phone}</span>
                      </div>
                    )}

                    {outlet.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{outlet.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Counters & Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-center flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        <Calculator className="w-3.5 h-3.5 text-orange-500" />
                        <AnimatedNumber value={registersCount} />
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider font-medium">
                        Cash Registers
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-center flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        <Tablet className="w-3.5 h-3.5 text-blue-500" />
                        <AnimatedNumber value={posDevicesCount} />
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider font-medium">
                        POS Devices
                      </div>
                    </div>
                  </div>

                  {/* Metadata: Tax & Timezone */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-1">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3 h-3 text-zinc-400" />
                      Tax: <strong className="text-zinc-600 dark:text-zinc-300">{outlet.tax_rate ?? "0.00"}%</strong>
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[130px]" title={outlet.timezone || ""}>
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {outlet.timezone || "Asia/Phnom_Penh"}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/pos?outlet=${outlet.uuid}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-2xs transition-all active:scale-95"
                        title={`Open POS Terminal for ${outlet.name}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Open POS</span>
                      </Link>

                      <Link
                        href={`/businesses/outlets/${outlet.uuid}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(outlet)}
                        className="h-8 px-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        title="Edit Outlet Configuration"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingOutlet(outlet)}
                        className="h-8 px-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Delete Outlet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 7. Outlets Dense Table View */}
      {!isLoading && !error && filteredOutlets.length > 0 && viewMode === "table" && (
        <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-900/75">
                  <th className="px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Outlet / Code
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Phone & Email
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Location / City
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">
                    Registers
                  </th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center">
                    POS Devices
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredOutlets.map((outlet) => {
                  const isActive = outlet.is_active || outlet.status === "active";
                  const registersCount = outlet.registers_count ?? 0;
                  const posDevicesCount = outlet.pos_devices_count ?? outlet.devices_count ?? 0;

                  return (
                    <tr
                      key={outlet.uuid || outlet.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Name & Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/businesses/outlets/${outlet.uuid}`}
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-orange-500 transition-colors"
                          >
                            {outlet.name}
                          </Link>
                          {outlet.is_main_outlet && (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 px-1.5 font-semibold">
                              Main
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">
                          {outlet.code}
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-300 space-y-0.5">
                        {outlet.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{outlet.phone}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">No phone</span>
                        )}
                        {outlet.email && (
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{outlet.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Address & City */}
                      <td className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-300">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 max-w-[200px]">
                            {outlet.address ? outlet.address : outlet.city || "—"}
                            {outlet.country_code ? ` (${outlet.country_code})` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Cash Registers */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs">
                          <Calculator className="w-3 h-3" />
                          <AnimatedNumber value={registersCount} />
                        </div>
                      </td>

                      {/* POS Devices */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          <Tablet className="w-3 h-3" />
                          <AnimatedNumber value={posDevicesCount} />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          className={`text-[11px] font-semibold ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-zinc-500/15 text-zinc-500 border-zinc-500/30"
                          }`}
                        >
                          {outlet.status ? outlet.status.toUpperCase() : isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/pos?outlet=${outlet.uuid}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white font-semibold text-xs transition-colors"
                            title={`Open POS Terminal for ${outlet.name}`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>POS</span>
                          </Link>
                          <Link
                            href={`/businesses/outlets/${outlet.uuid}`}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-orange-500 hover:border-orange-500/40 transition-colors"
                            title="View Outlet Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(outlet)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Edit Outlet Configuration"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingOutlet(outlet)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-colors"
                            title="Delete Outlet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Create Outlet Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Outlet"
        description={`Create a new store branch for ${activeBusiness?.name || "this business"}.`}
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Outlet Code *"
              value={createForm.code}
              onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. OUT-001"
              required
            />
            <TextInput
              label="Outlet Name *"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. Downtown Flagship"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Phone Number"
              value={createForm.phone || ""}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              placeholder="e.g. +855 23 999 888"
            />
            <TextInput
              label="Email Address"
              type="email"
              value={createForm.email || ""}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="e.g. outlet@smartpos.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Street Address"
              value={createForm.address || ""}
              onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
              placeholder="e.g. 123 Monivong Blvd"
            />
            <TextInput
              label="City"
              value={createForm.city || ""}
              onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
              placeholder="e.g. Phnom Penh"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={createForm.tax_rate || ""}
              onChange={(e) => setCreateForm({ ...createForm, tax_rate: e.target.value })}
              placeholder="10.00"
            />
            <TextInput
              label="Timezone"
              value={createForm.timezone || ""}
              onChange={(e) => setCreateForm({ ...createForm, timezone: e.target.value })}
              placeholder="Asia/Phnom_Penh"
            />
          </div>

          <div className="pt-2">
            <Checkbox
              id="is_main_outlet"
              label="Set as Main Outlet / Primary Branch"
              description="Primary branch where centralized inventories and company defaults are anchored."
              checked={Boolean(createForm.is_main_outlet)}
              onChange={(e) => setCreateForm({ ...createForm, is_main_outlet: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmittingCreate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingCreate}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {isSubmittingCreate ? "Creating Outlet..." : "Create Outlet"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 9. Edit Outlet Modal (PUT /outlets/{outlet}) */}
      <Modal
        isOpen={Boolean(editingOutlet)}
        onClose={() => setEditingOutlet(null)}
        title={`Edit Outlet: ${editingOutlet?.name || ""}`}
        description={`Update location and configuration details for outlet code ${editingOutlet?.code || ""}.`}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Outlet Code *"
              value={editForm.code || ""}
              onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
              placeholder="e.g. OUT-001"
              required
            />
            <TextInput
              label="Outlet Name *"
              value={editForm.name || ""}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="e.g. Downtown Flagship"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Phone Number"
              value={editForm.phone || ""}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="e.g. +855 23 999 888"
            />
            <TextInput
              label="Email Address"
              type="email"
              value={editForm.email || ""}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              placeholder="e.g. outlet@smartpos.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Street Address"
              value={editForm.address || ""}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              placeholder="e.g. 123 Monivong Blvd"
            />
            <TextInput
              label="City"
              value={editForm.city || ""}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              placeholder="e.g. Phnom Penh"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Tax Rate (%)"
              type="number"
              step="0.01"
              value={editForm.tax_rate || ""}
              onChange={(e) => setEditForm({ ...editForm, tax_rate: e.target.value })}
              placeholder="10.00"
            />
            <TextInput
              label="Timezone"
              value={editForm.timezone || ""}
              onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
              placeholder="Asia/Phnom_Penh"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Receipt Header"
              value={editForm.receipt_header || ""}
              onChange={(e) => setEditForm({ ...editForm, receipt_header: e.target.value })}
              placeholder="e.g. Thank you for visiting us!"
            />
            <TextInput
              label="Receipt Footer"
              value={editForm.receipt_footer || ""}
              onChange={(e) => setEditForm({ ...editForm, receipt_footer: e.target.value })}
              placeholder="e.g. Wifi: SmartPOS / Goods sold are non-refundable"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Checkbox
              id="edit_is_main_outlet"
              label="Set as Main Outlet / Primary Branch"
              description="Designate this branch as the primary anchor for default business policies."
              checked={Boolean(editForm.is_main_outlet)}
              onChange={(e) => setEditForm({ ...editForm, is_main_outlet: e.target.checked })}
            />

            <Checkbox
              id="edit_is_active"
              label="Active Status"
              description="Allow cashiers to open shifts and process sales at this branch."
              checked={Boolean(editForm.is_active)}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingOutlet(null)}
              disabled={isSubmittingEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingEdit}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {isSubmittingEdit ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 10. Delete Outlet Confirmation Modal (DELETE /outlets/{outlet}) */}
      <Modal
        isOpen={Boolean(deletingOutlet)}
        onClose={() => setDeletingOutlet(null)}
        title="Delete Outlet Location"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold">Irreversible Action</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                Deleting this outlet will revoke associated POS terminal assignments and register configurations.
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Are you sure you want to permanently delete{" "}
            <strong className="text-zinc-900 dark:text-white font-semibold">
              {deletingOutlet?.name}
            </strong>{" "}
            (Code: <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{deletingOutlet?.code}</code>)?
          </p>

          {deletingOutlet?.is_main_outlet && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
              <strong>Caution:</strong> This is currently marked as your <strong>Main Branch</strong>. Deleting it may require designating another outlet as primary.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingOutlet(null)}
              disabled={isSubmittingDelete}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={isSubmittingDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isSubmittingDelete ? "Deleting Outlet..." : "Yes, Delete Outlet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
