"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useBusiness } from "@/context/business-context";
import { outletsApi } from "@/lib/api/outlets";
import { registersApi } from "@/lib/api/registers";
import { useCashierSessionStore } from "@/stores/useCashierSessionStore";
import { TerminalLockOverlay } from "@/components/pos/terminal/TerminalLockOverlay";
import { CashierProfileModal } from "@/components/pos/terminal/CashierProfileModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { Outlet, Register } from "@/types";
import {
  UserCheck,
  Store,
  Calculator,
  Lock,
  Wallet,
  Clock,
  CreditCard,
  RotateCcw,
  BadgePercent,
  Play,
  Square,
  KeyRound,
  Settings2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

export default function BusinessPosCashierPage() {
  const { activeBusiness } = useBusiness();
  const toast = useToast();

  const {
    currentSession,
    isLocked,
    idleTimeoutSeconds,
    lastActivityTime,
    fetchCurrentSession,
    startSession,
    lockSession,
    endSession,
    recordActivity,
    setIdleTimeout,
  } = useCashierSessionStore();

  // Outlets & Registers
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [selectedOutletUuid, setSelectedOutletUuid] = useState<string>("");
  const [selectedRegisterUuid, setSelectedRegisterUuid] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 1. Fetch Outlets
  useEffect(() => {
    if (!activeBusiness?.uuid) return;

    let isMounted = true;
    const loadOutlets = async () => {
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
        setIsLoading(false);
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
        const fetchedRegisters = await registersApi.getRegisters(selectedOutletUuid);
        if (isMounted) {
          setRegisters(fetchedRegisters);
          if (fetchedRegisters.length > 0) {
            setSelectedRegisterUuid(fetchedRegisters[0].uuid);
          } else {
            setSelectedRegisterUuid("");
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
  }, [selectedOutletUuid]);

  // 3. Load Current Session when outlet changes
  useEffect(() => {
    if (selectedOutletUuid) {
      fetchCurrentSession(selectedOutletUuid);
    }
  }, [selectedOutletUuid, fetchCurrentSession]);

  const handleStartSession = async () => {
    if (!selectedOutletUuid || !selectedRegisterUuid) {
      toast.error("Please select an outlet and cash register first.");
      return;
    }
    try {
      await startSession(selectedOutletUuid, { register_uuid: selectedRegisterUuid });
      toast.success("Cashier Session Started: You are now active on this register.");
    } catch (e: any) {
      toast.error(e.message || "Failed to start cashier session");
    }
  };

  const handleEndSession = async () => {
    if (!selectedOutletUuid) return;
    try {
      await endSession(selectedOutletUuid);
      toast.info("Cashier Session Closed.");
    } catch (e: any) {
      toast.error(e.message || "Failed to close session");
    }
  };

  const selectedRegister = registers.find((r) => r.uuid === selectedRegisterUuid);

  return (
    <div
      className="space-y-6 animate-in fade-in duration-300"
      onMouseMove={recordActivity}
      onKeyDown={recordActivity}
    >
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
            <Link href="/pos" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>POS Terminal</span>
            </Link>
            <span>/</span>
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cashier Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Cashier Profiles & Sessions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Cashier session control, operational privileges, and security lock settings for{" "}
            <strong>{activeBusiness?.name || "this business"}</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link href="/pos">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-sky-500" />
              POS Terminal
            </Button>
          </Link>

          <Link href="/businesses/pos/drawer">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-orange-500" />
              Cash Drawer
            </Button>
          </Link>

          <Button
            onClick={() => selectedOutletUuid && lockSession(selectedOutletUuid)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold flex items-center gap-2 shadow-sm"
          >
            <Lock className="w-4 h-4 text-orange-500" />
            Lock Terminal
          </Button>
        </div>
      </div>

      {/* 2. Outlet & Register Selector Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Register:</span>
            <select
              value={selectedRegisterUuid}
              onChange={(e) => setSelectedRegisterUuid(e.target.value)}
              disabled={registers.length === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
            >
              {registers.map((r) => (
                <option key={r.uuid} value={r.uuid}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">Auto-Lock Idle:</span>
          <select
            value={idleTimeoutSeconds}
            onChange={(e) => setIdleTimeout(Number(e.target.value))}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value={60}>1 min</option>
            <option value={300}>5 mins</option>
            <option value={600}>10 mins</option>
            <option value={0}>Disabled</option>
          </select>
        </div>
      </div>

      {/* 3. Active Cashier Session Card */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {currentSession
                    ? `Active Session #${currentSession.id || currentSession.uuid?.slice(0, 8)}`
                    : "No Active Cashier Session"}
                </h2>
                {currentSession ? (
                  <Badge variant="success">Active Live</Badge>
                ) : (
                  <Badge variant="neutral">Offline / Idle</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {currentSession
                  ? `Started at ${new Date(currentSession.started_at).toLocaleTimeString()}`
                  : "Start a cashier session to begin scanning barcodes, processing tenders, and managing floats."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentSession ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Settings2 className="w-4 h-4 text-zinc-500" />
                  Privileges & PIN
                </Button>

                <Button
                  onClick={handleEndSession}
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Sign Out Session
                </Button>
              </>
            ) : (
              <Button
                onClick={handleStartSession}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-2 px-5 shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Cashier Session
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Operational Permissions Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Checkout Tender</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Allow Sales</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Returns & Refunds</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Authorized
            </div>
          </div>
        </Card>

        <Card className="p-4 border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Max Discount Limit</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              15% Default Max
            </div>
          </div>
        </Card>

        <Card className="p-4 border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Terminal Security</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              4-Digit Fast PIN Active
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Terminal Lock Screen Overlay */}
      {isLocked && selectedOutletUuid && (
        <TerminalLockOverlay
          outletUuid={selectedOutletUuid}
          cashierName="Active Cashier"
          registerName={selectedRegister?.name || "Counter 1"}
          onUnlocked={() => {
            toast.success("Terminal Unlocked: Welcome back!");
          }}
        />
      )}

      {/* 6. Cashier Profile & Permissions Modal */}
      {activeBusiness?.uuid && (
        <CashierProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          businessUuid={activeBusiness.uuid}
          businessUserUuid="current"
          userName="Current Cashier"
          onSuccess={() => selectedOutletUuid && fetchCurrentSession(selectedOutletUuid)}
        />
      )}
    </div>
  );
}
