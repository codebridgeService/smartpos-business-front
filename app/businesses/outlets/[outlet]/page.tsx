"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Store,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Calculator,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Percent,
  Clock,
  ArrowLeft,
  Edit2,
  Trash2,
  Printer,
  ShieldCheck,
  Globe,
  Warehouse as WarehouseIcon,
  Receipt,
  AlertTriangle,
  ExternalLink,
  Laptop,
  Check,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { outletsApi, UpdateOutletRequest } from "@/lib/api/outlets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Outlet, Register, PosDevice } from "@/types";

export default function OutletDetailPage({
  params,
}: {
  params: Promise<{ outlet: string }> | { outlet: string };
}) {
  const resolvedParams =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<{ outlet: string }>)
      : (params as { outlet: string });
  const outletUuid = resolvedParams.outlet;
  const router = useRouter();
  const { activeBusiness } = useBusiness();
  const toast = useToast();

  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"overview" | "registers" | "devices" | "warehouses">("overview");

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchOutlet = useCallback(async () => {
    if (!outletUuid) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await outletsApi.getOutlet(outletUuid);
      setOutlet(data);
      setEditForm({
        code: data.code,
        name: data.name,
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        tax_rate: data.tax_rate || "0.00",
        timezone: data.timezone || "Asia/Phnom_Penh",
        is_main_outlet: Boolean(data.is_main_outlet),
        is_active: data.is_active ?? data.status === "active",
        receipt_header: data.receipt_header || "",
        receipt_footer: data.receipt_footer || "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load outlet details";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [outletUuid]);

  useEffect(() => {
    void fetchOutlet();
  }, [fetchOutlet]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outlet) return;
    if (!editForm.name?.trim() || !editForm.code?.trim()) {
      toast.error("Outlet name and code are required");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const updated = await outletsApi.updateOutlet(outlet.uuid, {
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

      setOutlet((prev) => (prev ? { ...prev, ...updated } : updated));
      toast.success("Outlet configuration updated successfully!");
      setIsEditOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update outlet";
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!outlet) return;
    setIsSubmittingDelete(true);
    try {
      await outletsApi.deleteOutlet(outlet.uuid);
      toast.success(`Outlet "${outlet.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      router.push("/businesses/outlets");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete outlet";
      toast.error(msg);
      setIsSubmittingDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-2 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 w-full lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !outlet) {
    return (
      <Card className="p-12 text-center border-dashed border-2 border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 rounded-2xl">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {error || "Outlet not found"}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
          The requested store location could not be loaded or you do not have permission to view it.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/businesses/outlets")}>
            Back to Outlets
          </Button>
          <Button onClick={fetchOutlet} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const isActive = outlet.is_active || outlet.status === "active";
  const registers: Register[] = outlet.registers || [];
  const posDevices: PosDevice[] = outlet.posDevices || outlet.pos_devices || [];
  const warehouses: any[] = outlet.warehouses || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Breadcrumbs & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/businesses/outlets"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Back to Outlets"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-500 uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>{activeBusiness?.name || "Business"} &bull; Outlets</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
              {outlet.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchOutlet}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-orange-500" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 border-zinc-300 dark:border-zinc-700"
          >
            <Edit2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            <span>Edit Outlet</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeleteOpen(true)}
            className="border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* 2. Hero Overview Card */}
      <Card className="p-6 border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral" className="text-xs font-mono font-bold px-2 py-0.5">
                {outlet.code}
              </Badge>
              {outlet.is_main_outlet && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold">
                  Main Branch
                </Badge>
              )}
              <Badge
                className={`text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : "bg-zinc-500/15 text-zinc-500 border-zinc-500/30"
                }`}
              >
                {outlet.status ? outlet.status.toUpperCase() : isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>
                {outlet.address ? outlet.address : "No street address"}{" "}
                {outlet.city ? `, ${outlet.city}` : ""}{" "}
                {outlet.country_code ? `(${outlet.country_code})` : ""}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            {outlet.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{outlet.phone}</span>
              </div>
            )}
            {outlet.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{outlet.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              Cash Registers
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Calculator className="w-4 h-4 text-orange-500" />
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                <AnimatedNumber value={registers.length || outlet.registers_count || 0} />
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              POS Terminals
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Tablet className="w-4 h-4 text-blue-500" />
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                <AnimatedNumber value={posDevices.length || outlet.pos_devices_count || outlet.devices_count || 0} />
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              Tax Rate
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Percent className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                <AnimatedNumber value={parseFloat(outlet.tax_rate ?? "0")} decimals={2} suffix="%" />
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              Timezone
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={outlet.timezone || ""}>
                {outlet.timezone || "Asia/Phnom_Penh"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-px">
        {[
          { key: "overview", label: "Overview & Config", count: null },
          { key: "registers", label: "Cash Registers", count: registers.length },
          { key: "devices", label: "POS Hardware & Devices", count: posDevices.length },
          { key: "warehouses", label: "Warehouses & Stock", count: warehouses.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-orange-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 4. Tab 1: Overview & Config */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location & Contact Details */}
          <Card className="p-5 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              Branch Location & Contacts
            </h3>
            <div className="space-y-3 text-sm divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Street Address:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 text-right">
                  {outlet.address || "None specified"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">City / Province:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {outlet.city || "—"} {outlet.province ? `, ${outlet.province}` : ""}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Country Code:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {outlet.country_code || "KH"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Phone Number:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {outlet.phone || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Email Address:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {outlet.email || "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Operational & Receipt Settings */}
          <Card className="p-5 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-500" />
              Receipt & Financial Policies
            </h3>
            <div className="space-y-3 text-sm divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Default Tax Rate:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {outlet.tax_rate ?? "0.00"}%
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Branch Timezone:</span>
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {outlet.timezone || "Asia/Phnom_Penh"}
                </span>
              </div>
              <div className="py-2 space-y-1">
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                  Receipt Header Preview:
                </span>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
                  {outlet.receipt_header || <em>No header customized</em>}
                </div>
              </div>
              <div className="py-2 space-y-1">
                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                  Receipt Footer Preview:
                </span>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 font-mono text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
                  {outlet.receipt_footer || <em>No footer customized</em>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 5. Tab 2: Connected Registers */}
      {activeTab === "registers" && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Connected Cash Registers ({registers.length})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Registers deployed for cashier checkout shifts at {outlet.name}.
              </p>
            </div>
            <Link
              href={`/outlets/${outlet.uuid}/registers`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <span>Manage Registers in Terminal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {registers.length === 0 ? (
            <div className="p-10 text-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <Calculator className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                No cash registers configured for this outlet
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Registers track opening balances, shifts, and cash drawer transactions during business hours.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Register Code</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Default Float</th>
                    <th className="py-3 px-4">Drawer Connected</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {registers.map((reg) => (
                    <tr key={reg.uuid || reg.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-xs">{reg.code}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {reg.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        ${Number(reg.default_cash_amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={reg.is_cash_drawer_connected ? "success" : "neutral"}
                          className="text-[11px]"
                        >
                          {reg.is_cash_drawer_connected ? "Connected" : "No Drawer"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={reg.is_active || reg.status === "active" ? "success" : "neutral"}
                          className="text-[11px]"
                        >
                          {(reg.status || (reg.is_active ? "active" : "inactive")).toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 6. Tab 3: Connected POS Hardware & Terminals */}
      {activeTab === "devices" && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Connected POS Hardware & Terminals ({posDevices.length})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Physical tablets, mobile POS, and desktop hardware registered at {outlet.name}.
              </p>
            </div>
          </div>

          {posDevices.length === 0 ? (
            <div className="p-10 text-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <Laptop className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                No POS devices paired to this outlet yet
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Pair Android terminals, iPad registers, or desktop POS clients using device authentication codes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Machine ID</th>
                    <th className="py-3 px-4">Device Code / Name</th>
                    <th className="py-3 px-4">Model & Platform</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {posDevices.map((dev) => (
                    <tr key={dev.uuid || dev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-xs">{dev.machine_id}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        {dev.device_name || dev.name || dev.device_code || "POS Terminal"}
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-500">
                        {dev.device_model || dev.platform || "Standard POS"}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-zinc-400">
                        {dev.ip_address || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={dev.status === "active" ? "success" : "neutral"}
                          className="text-[11px]"
                        >
                          {String(dev.status || "active").toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 7. Tab 4: Warehouses & Stock Hubs */}
      {activeTab === "warehouses" && (
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Connected Warehouses & Stock Hubs ({warehouses.length})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Storage locations and fulfillment inventory associated with {outlet.name}.
              </p>
            </div>
            <Link
              href="/businesses/warehouses"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
            >
              <span>View Business Warehouses</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {warehouses.length === 0 ? (
            <div className="p-10 text-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
              <WarehouseIcon className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                No dedicated warehouse tied directly to this branch
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                This branch fulfills inventory directly from business central stock or designated warehouse hubs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouses.map((wh) => (
                <div
                  key={wh.uuid || wh.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{wh.name}</span>
                    <Badge variant="neutral" className="font-mono text-xs">{wh.code}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {wh.address || wh.city || "No address provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* 8. Edit Outlet Modal (PUT /outlets/{outlet}) */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Outlet: ${outlet.name}`}
        description={`Update location and configuration details for outlet code ${outlet.code}.`}
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
              id="detail_edit_is_main_outlet"
              label="Set as Main Outlet / Primary Branch"
              description="Designate this branch as the primary anchor for default business policies."
              checked={Boolean(editForm.is_main_outlet)}
              onChange={(e) => setEditForm({ ...editForm, is_main_outlet: e.target.checked })}
            />

            <Checkbox
              id="detail_edit_is_active"
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
              onClick={() => setIsEditOpen(false)}
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

      {/* 9. Delete Confirmation Modal (DELETE /outlets/{outlet}) */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Outlet Location"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold">Irreversible Action</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                Deleting this outlet will permanently revoke register and device mappings.
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Are you sure you want to delete <strong className="text-zinc-900 dark:text-white font-semibold">{outlet.name}</strong> ({outlet.code})?
          </p>

          {outlet.is_main_outlet && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
              <strong>Warning:</strong> This is marked as your <strong>Main Branch</strong>.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
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
              {isSubmittingDelete ? "Deleting..." : "Yes, Delete Outlet"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
