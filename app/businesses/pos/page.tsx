"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  Store,
  CreditCard,
  Receipt,
  UserCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessPosPage() {
  const { activeBusiness } = useBusiness();
  const businessUuid = activeBusiness?.uuid || "";

  const registers = [
    { id: "REG-01", name: "Main Counter Register", outlet: "Downtown Flagship", cashier: "John Cashier", status: "OPEN", balance: "$450.00" },
    { id: "REG-02", name: "Express Register", outlet: "Downtown Flagship", cashier: "Sarah Staff", status: "OPEN", balance: "$220.00" },
    { id: "REG-03", name: "Kiosk Checkout", outlet: "Airport Terminal Kiosk", cashier: "Automated", status: "IDLE", balance: "$150.00" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            <span>Point of Sale Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            POS Terminal & Registers
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage live registers, cashier shifts, and launch checkout sessions for {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/pos`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
              <Store className="w-4 h-4" />
              Open POS Terminal
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Registers List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {registers.map((reg) => (
          <Card key={reg.id} className="p-5 border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="neutral" className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {reg.id}
                </Badge>
                <Badge className={`text-xs ${reg.status === "OPEN" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
                  {reg.status}
                </Badge>
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{reg.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{reg.outlet}</p>
              
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Current Cashier:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200">{reg.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drawer Balance:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{reg.balance}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3">
              <Link href={`/admin/pos`}>
                <Button variant="outline" className="w-full text-xs font-semibold rounded-xl hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-500 transition-colors">
                  Launch Session
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
