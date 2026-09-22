"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useBusiness } from "@/context/business-context";
import { outletsApi } from "@/lib/api/outlets";
import { registersApi } from "@/lib/api/registers";
import { shiftsApi } from "@/lib/api/shifts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Outlet, Register } from "@/types";
import {
  History,
  Store,
  Calculator,
  Clock,
  ArrowLeft,
  RefreshCw,
  Wallet,
  Play,
  AlertCircle,
} from "lucide-react";

export default function CashierPosShiftsPage() {
  const { activeBusiness } = useBusiness();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [selectedOutletUuid, setSelectedOutletUuid] = useState<string>("");
  const [selectedRegisterUuid, setSelectedRegisterUuid] = useState<string>("");
  const [shifts, setShifts] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // 3. Fetch Shifts
  const loadShifts = async () => {
    if (!selectedOutletUuid || !selectedRegisterUuid) {
      setShifts([]);
      setActiveShift(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [current, list] = await Promise.all([
        shiftsApi.getCurrentShift(selectedOutletUuid, selectedRegisterUuid).catch(() => null),
        shiftsApi.getShifts(selectedOutletUuid, selectedRegisterUuid).catch(() => []),
      ]);
      setActiveShift(current);
      setShifts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Failed to load shifts:", e);
      setShifts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, [selectedOutletUuid, selectedRegisterUuid]);

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
            <History className="w-3.5 h-3.5" />
            <span>Register Shifts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Register Shifts & Handover
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Opening float verification, shift handovers, and closing reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pos/drawer">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-orange-500" />
              Cash Drawer
            </Button>
          </Link>

          <Link href="/pos">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-1.5 shadow-sm">
              <Calculator className="w-4 h-4" />
              Back to POS
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Selectors Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
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

        <Button
          variant="outline"
          size="sm"
          onClick={loadShifts}
          disabled={isLoading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* 3. Active Shift Card */}
      {activeShift ? (
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20 border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">Active Shift Live</Badge>
                  <span className="text-xs text-zinc-500 font-mono">Shift #{activeShift.id || activeShift.uuid?.slice(0, 8)}</span>
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  Cashier: {activeShift.cashier?.name || activeShift.cashier_name || "Active Cashier"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Opened at {activeShift.opened_at ? new Date(activeShift.opened_at).toLocaleString() : "Recently"} with float ${parseFloat(activeShift.opening_float || "0").toFixed(2)}
                </p>
              </div>
            </div>

            <Link href="/pos">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Open Register in POS
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-500/5 dark:bg-amber-950/20 border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">No Open Shift</Badge>
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  Register Currently Closed
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Start a cashier session in the POS Terminal to open this register.
                </p>
              </div>
            </div>

            <Link href="/pos">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Go to POS Terminal
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 4. Shift Audit Log */}
      <Card className="p-5 border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Shift Audit History
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Previous shifts, reconciliation totals, and cash float logs.
            </p>
          </div>
          <Badge variant="neutral" className="font-mono text-xs">
            {shifts.length} Recorded
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <History className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No Shifts Logged Yet
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Cashier</th>
                  <th className="pb-3 px-3">Opened</th>
                  <th className="pb-3 px-3">Closed</th>
                  <th className="pb-3 px-3 text-right">Opening Float</th>
                  <th className="pb-3 px-3 text-right">Closing Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {shifts.map((shift, idx) => {
                  const isOpen = !shift.closed_at;
                  return (
                    <tr key={shift.uuid || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-3">
                        <Badge variant={isOpen ? "success" : "neutral"} className="text-[10px]">
                          {isOpen ? "Open" : "Closed"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {shift.cashier?.name || shift.cashier_name || "Cashier"}
                      </td>
                      <td className="py-3 px-3 text-zinc-500">
                        {shift.opened_at ? new Date(shift.opened_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-3 text-zinc-500">
                        {shift.closed_at ? new Date(shift.closed_at).toLocaleString() : "In progress"}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        ${parseFloat(shift.opening_float || "0").toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {shift.closing_cash ? `$${parseFloat(shift.closing_cash).toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
