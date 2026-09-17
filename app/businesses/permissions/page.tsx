"use client";

import React from "react";
import Link from "next/link";
import {
  Key,
  Shield,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessPermissionsPage() {
  const { activeBusiness } = useBusiness();

  const matrix = [
    { module: "POS Terminal", permissions: ["pos.checkout", "pos.apply_discount", "pos.open_drawer", "pos.void_order"] },
    { module: "Inventory", permissions: ["inventory.view", "inventory.adjust", "inventory.transfer", "inventory.stock_in"] },
    { module: "Staff", permissions: ["staff.view", "staff.manage_pin", "staff.edit_roles"] },
    { module: "Financials", permissions: ["reports.view_daily", "reports.view_margin", "reports.export"] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <Key className="w-4 h-4" />
            <span>Capability Guard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Permissions Matrix
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Capability limits and security scopes active for {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/businesses/roles">
            <Button variant="outline" className="text-xs font-semibold rounded-xl flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Roles
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matrix.map((cat, i) => (
          <Card key={i} className="p-5 border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              {cat.module}
            </h3>
            <div className="space-y-2">
              {cat.permissions.map((p, pIdx) => (
                <div key={pIdx} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{p}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                    ENABLED
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
