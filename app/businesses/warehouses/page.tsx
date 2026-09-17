"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  Boxes,
  Package,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  MapPin,
  TrendingDown,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessWarehousesPage() {
  const { activeBusiness } = useBusiness();
  const businessUuid = activeBusiness?.uuid || "";

  const warehouses = [
    {
      id: "WH-01",
      name: "Central Distribution Center",
      location: "Phnom Penh Special Economic Zone",
      totalSkus: 1420,
      stockValue: "$68,400.00",
      status: "ACTIVE",
    },
    {
      id: "WH-02",
      name: "Downtown Outlet Stockroom",
      location: "123 Monivong Blvd Basement",
      totalSkus: 380,
      stockValue: "$12,350.00",
      status: "ACTIVE",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Inventory Logistics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Warehouses & Storage
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Supply hubs, stock distribution points, and stockrooms for {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="p-5 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="neutral" className="text-xs font-mono mb-2">
                  {wh.id}
                </Badge>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{wh.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{wh.location}</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                {wh.status}
              </Badge>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                <div className="text-zinc-500">Tracked SKUs</div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{wh.totalSkus} items</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
                <div className="text-zinc-500">Total Valuation</div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{wh.stockValue}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
