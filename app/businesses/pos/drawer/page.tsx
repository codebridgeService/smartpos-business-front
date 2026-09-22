"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useBusiness } from "@/context/business-context";
import { outletsApi } from "@/lib/api/outlets";
import { registersApi } from "@/lib/api/registers";
import { shiftsApi } from "@/lib/api/shifts";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { RecordCashMovementModal } from "@/components/pos/drawer/RecordCashMovementModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Outlet, Register, CashMovementType } from "@/types";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
  Store,
  Calculator,
  Coins,
  History,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function BusinessCashDrawerPage() {
  const { activeBusiness } = useBusiness();
  const {
    activeDrawer,
    movements,
    isLoading,
    isMovementsLoading,
    setContext,
    fetchDrawerDetails,
    fetchMovements,
  } = useDrawerStore();

  // Outlets & Registers selection
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [selectedOutletUuid, setSelectedOutletUuid] = useState<string>("");
  const [selectedRegisterUuid, setSelectedRegisterUuid] = useState<string>("");
  const [activeDrawerUuid, setActiveDrawerUuid] = useState<string>("");

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CashMovementType>("all");

  // 1. Fetch Outlets
  useEffect(() => {
    if (!activeBusiness?.uuid) return;

    let isMounted = true;
    const loadOutlets = async () => {
      setIsDataLoading(true);
      try {
        const fetchedOutlets = await outletsApi.getOutlets(activeBusiness.uuid);
        if (isMounted) {
          setOutlets(fetchedOutlets);
          if (fetchedOutlets.length > 0) {
            setSelectedOutletUuid(fetchedOutlets[0].uuid);
          }
        }
      } catch (e) {
        console.error("Failed to load outlets:", e);
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    };

    loadOutlets();
    return () => {
      isMounted = false;
    };
  }, [activeBusiness?.uuid]);

  // 2. Fetch Registers when outlet changes
  useEffect(() => {
    if (!selectedOutletUuid) {
      setRegisters([]);
      setSelectedRegisterUuid("");
      return;
    }

    let isMounted = true;
    const loadRegisters = async () => {
      try {
        const fetchedRegisters = await registersApi.getRegisters(selectedOutletUuid);
        if (isMounted) {
          setRegisters(fetchedRegisters);
          if (fetchedRegisters.length > 0) {
            setSelectedRegisterUuid(fetchedRegisters[0].uuid);
          } else {
            setSelectedRegisterUuid("");
            setContext(null, null, null);
          }
        }
      } catch (e) {
        console.error("Failed to load registers:", e);
      }
    };

    loadRegisters();
    return () => {
      isMounted = false;
    };
  }, [selectedOutletUuid, setContext]);

  // 3. Fetch Active Shift & Drawer when register changes
  useEffect(() => {
    if (!selectedOutletUuid || !selectedRegisterUuid) return;

    let isMounted = true;
    const loadCurrentDrawer = async () => {
      try {
        const currentShift = await shiftsApi.getCurrentShift(
          selectedOutletUuid,
          selectedRegisterUuid
        );
        if (!isMounted) return;

        const drawerSession =
          (currentShift as any)?.cash_drawer_session?.uuid ||
          (currentShift as any)?.cashDrawerSession?.uuid ||
          currentShift?.uuid;

        if (drawerSession) {
          setActiveDrawerUuid(drawerSession);
          setContext(selectedOutletUuid, selectedRegisterUuid, drawerSession);
        } else {
          setActiveDrawerUuid("");
          setContext(null, null, null);
        }
      } catch (e) {
        console.error("Failed to load current shift drawer:", e);
      }
    };

    loadCurrentDrawer();
    return () => {
      isMounted = false;
    };
  }, [selectedOutletUuid, selectedRegisterUuid, setContext]);

  // Filtered movements list
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchType = typeFilter === "all" || m.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (m.reason && m.reason.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q)) ||
        (m.type && m.type.toLowerCase().includes(q)) ||
        (m.amount && m.amount.includes(q));
      return matchType && matchQuery;
    });
  }, [movements, typeFilter, searchQuery]);

  // Stats
  const openingCash = parseFloat(activeDrawer?.opening_amount || "0");
  const expectedCash = parseFloat(activeDrawer?.expected_amount || "0");

  let totalIn = 0;
  let totalOut = 0;
  movements.forEach((m) => {
    const amt = parseFloat(m.amount || "0");
    if (["cash_in", "deposit", "cash_sale"].includes(m.type)) {
      totalIn += amt;
    } else {
      totalOut += amt;
    }
  });

  const handleRefresh = async () => {
    await Promise.all([fetchDrawerDetails(), fetchMovements()]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
            <Link href="/pos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>POS Terminal</span>
            </Link>
            <span>/</span>
            <Wallet className="w-3.5 h-3.5" />
            <span>Cash Drawer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Cash Drawer & Float Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor real-time cash balances, float adjustments, payouts, and register audit trails for{" "}
            <strong>{activeBusiness?.name || "this business"}</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/businesses/pos/shifts">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-500" />
              Register Shifts
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isMovementsLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setIsMovementModalOpen(true)}
            disabled={!selectedRegisterUuid}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Record Movement
          </Button>
        </div>
      </div>

      {/* 2. Context Selectors Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Outlet Selector */}
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Outlet:</span>
            <select
              value={selectedOutletUuid}
              onChange={(e) => setSelectedOutletUuid(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {outlets.map((o) => (
                <option key={o.uuid} value={o.uuid}>
                  {o.name} ({o.code})
                </option>
              ))}
            </select>
          </div>

          {/* Register Selector */}
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Register:</span>
            <select
              value={selectedRegisterUuid}
              onChange={(e) => setSelectedRegisterUuid(e.target.value)}
              disabled={registers.length === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            >
              {registers.length === 0 ? (
                <option value="">No registers found</option>
              ) : (
                registers.map((r) => (
                  <option key={r.uuid} value={r.uuid}>
                    {r.name} ({r.code})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Active Register Status */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500">Drawer Status:</span>
          {activeDrawerUuid ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Active Shift Open
            </Badge>
          ) : (
            <Badge variant="neutral" className="text-zinc-500 font-medium">
              No Active Drawer Session
            </Badge>
          )}
        </div>
      </div>

      {/* 3. Real-Time Cash Drawer Balance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Expected Cash */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Expected Cash in Drawer
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              ${expectedCash.toFixed(2)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live drawer balance with float
            </p>
          </div>
        </Card>

        {/* Opening Float */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Opening Float
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              ${openingCash.toFixed(2)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Initial float at shift start
            </p>
          </div>
        </Card>

        {/* Total Cash In */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Cash In / Deposits
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              +${totalIn.toFixed(2)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Additional floats & deposits
            </p>
          </div>
        </Card>

        {/* Total Cash Out / Payouts */}
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Total Cash Out / Payouts
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
              -${totalOut.toFixed(2)}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Skims, drops & petty payouts
            </p>
          </div>
        </Card>
      </div>

      {/* 4. Cash Movement History Table & Filters */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xs">
        {/* Table Filters Bar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Cash Movement Audit Log ({filteredMovements.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search reason, note, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 w-48 sm:w-56"
              />
            </div>

            {/* Movement Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Movements</option>
              <option value="cash_in">Cash In</option>
              <option value="cash_out">Cash Out / Skim</option>
              <option value="payout">Payout</option>
              <option value="deposit">Deposit</option>
              <option value="adjustment">Adjustment</option>
              <option value="cash_sale">Cash Sale</option>
              <option value="cash_refund">Cash Refund</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isMovementsLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Coins className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No Cash Movements Found
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No cash in, cash out, or payouts have been logged for this drawer session yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMovementModalOpen(true)}
              className="mt-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Record First Movement
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/50 text-zinc-500 uppercase font-semibold">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredMovements.map((mov) => {
                  const isIn = ["cash_in", "deposit", "cash_sale"].includes(mov.type);
                  return (
                    <tr
                      key={mov.uuid || mov.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-zinc-500 whitespace-nowrap font-mono text-[11px]">
                        {mov.created_at ? new Date(mov.created_at).toLocaleTimeString() : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={isIn ? "success" : "neutral"}
                          className={`text-[11px] font-semibold capitalize ${
                            mov.type === "payout"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : mov.type === "cash_out"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : ""
                          }`}
                        >
                          {mov.type.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                        <div>{mov.reason || "—"}</div>
                        {mov.notes && (
                          <div className="text-[10px] text-zinc-400 font-normal mt-0.5">
                            {mov.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {mov.reference_uuid || mov.reference_type || "—"}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-bold font-mono text-sm ${
                          isIn
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIn ? "+" : "-"}${parseFloat(mov.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Cash Movement Modal */}
      <RecordCashMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
