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
  ArrowLeft,
} from "lucide-react";

export default function PosCashDrawerPage() {
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

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [selectedOutletUuid, setSelectedOutletUuid] = useState<string>("");
  const [selectedRegisterUuid, setSelectedRegisterUuid] = useState<string>("");

  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CashMovementType>("all");

  // 1. Fetch Outlets
  useEffect(() => {
    if (!activeBusiness?.uuid) return;
    let isMounted = true;
    const loadOutlets = async () => {
      try {
        const fetched = await outletsApi.getOutlets(activeBusiness.uuid);
        if (isMounted && fetched.length > 0) {
          setOutlets(fetched);
          setSelectedOutletUuid(fetched[0].uuid);
        }
      } catch (e) {
        console.error("Failed to load outlets:", e);
      }
    };
    loadOutlets();
    return () => {
      isMounted = false;
    };
  }, [activeBusiness?.uuid]);

  // 2. Fetch Registers
  useEffect(() => {
    if (!selectedOutletUuid) {
      setRegisters([]);
      setSelectedRegisterUuid("");
      return;
    }
    let isMounted = true;
    const loadRegisters = async () => {
      try {
        const fetched = await registersApi.getRegisters(selectedOutletUuid);
        if (isMounted && fetched.length > 0) {
          setRegisters(fetched);
          setSelectedRegisterUuid(fetched[0].uuid);
        } else if (isMounted) {
          setRegisters([]);
          setSelectedRegisterUuid("");
        }
      } catch (e) {
        console.error("Failed to load registers:", e);
      }
    };
    loadRegisters();
    return () => {
      isMounted = false;
    };
  }, [selectedOutletUuid]);

  // 3. Load Active Drawer from Current Shift
  useEffect(() => {
    if (!selectedOutletUuid || !selectedRegisterUuid) {
      setContext(null, null, null);
      return;
    }
    let isMounted = true;
    const loadCurrentDrawer = async () => {
      try {
        const currentShift = await shiftsApi.getCurrentShift(selectedOutletUuid, selectedRegisterUuid);
        const drawerSession =
          (currentShift as any)?.cash_drawer_session?.uuid ||
          (currentShift as any)?.cashDrawerSession?.uuid ||
          currentShift?.uuid;

        if (isMounted && drawerSession) {
          setContext(selectedOutletUuid, selectedRegisterUuid, drawerSession);
        } else if (isMounted) {
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

  // Filtered movements
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 space-y-6">
      {/* 1. Header */}
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
            Real-time cash balances, float adjustments, and register audit log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pos/shifts">
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

      {/* 2. Selectors Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Outlet:</span>
            <select
              value={selectedOutletUuid}
              onChange={(e) => setSelectedOutletUuid(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              {outlets.map((o) => (
                <option key={o.uuid} value={o.uuid}>
                  {o.name} ({o.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Register:</span>
            <select
              value={selectedRegisterUuid}
              onChange={(e) => setSelectedRegisterUuid(e.target.value)}
              disabled={registers.length === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              {registers.map((r) => (
                <option key={r.uuid} value={r.uuid}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Balance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Expected in Drawer</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            ${expectedCash.toFixed(2)}
          </div>
        </Card>

        <Card className="p-5 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Opening Float</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            ${openingCash.toFixed(2)}
          </div>
        </Card>

        <Card className="p-5 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Cash In</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">
            +${totalIn.toFixed(2)}
          </div>
        </Card>

        <Card className="p-5 border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Cash Out</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600">
            -${totalOut.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* 4. Movements Log */}
      <Card className="p-5 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Cash Movement Audit Log
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movements..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800"
              />
            </div>
          </div>
        </div>

        {isMovementsLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Wallet className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-500">No cash movements recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredMovements.map((m) => {
                  const isPositive = ["cash_in", "deposit", "cash_sale"].includes(m.type);
                  return (
                    <tr key={m.uuid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3">
                        <Badge variant={isPositive ? "success" : "neutral"} className="text-[10px]">
                          {m.type.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {isPositive ? `+$${parseFloat(m.amount).toFixed(2)}` : `-$${parseFloat(m.amount).toFixed(2)}`}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                        {m.reason || "Operational float"}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString() : "Recent"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Movement Modal */}
      <RecordCashMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
