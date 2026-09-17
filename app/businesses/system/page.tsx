"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  Server,
  Activity,
  ShieldCheck,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessSystemPage() {
  const { activeBusiness } = useBusiness();
  const businessUuid = activeBusiness?.uuid || "";

  const services = [
    { name: "POS Transaction Pipeline", latency: "24ms", status: "HEALTHY" },
    { name: "Inventory Sync Service", latency: "18ms", status: "HEALTHY" },
    { name: "Payment Gateway Integration", latency: "65ms", status: "HEALTHY" },
    { name: "Receipt & Cloud Print Service", latency: "32ms", status: "HEALTHY" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Infrastructure & Health</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            System & Diagnostics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time telemetry, service latency, and sync status for {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-xs font-semibold rounded-xl flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Ping Services
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc, i) => (
          <Card key={i} className="p-5 border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{svc.name}</h3>
                  <div className="text-xs text-zinc-500 mt-0.5">Response latency: {svc.latency}</div>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                {svc.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
