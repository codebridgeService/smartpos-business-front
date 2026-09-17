"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  Receipt,
  ShoppingCart,
  Plus,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessPurchaseTransactionPage() {
  const { activeBusiness } = useBusiness();
  const businessUuid = activeBusiness?.uuid || "";

  const transactions = [
    { id: "PO-9021", supplier: "Global Beverage Logistics", date: "Today, 10:30 AM", amount: "$1,240.00", items: 48, status: "RECEIVED" },
    { id: "PO-9020", supplier: "Fresh Farms Wholesale", date: "Yesterday", amount: "$890.50", items: 32, status: "RECEIVED" },
    { id: "PO-9019", supplier: "Metro Packaging Supplies", date: "Sep 12, 2026", amount: "$340.00", items: 15, status: "PENDING" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Procurement & Expenses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Purchases & Supplier Orders
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Purchase orders, vendor shipments, and supplier invoices for {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-5 py-3.5">Supplier / Vendor</th>
                <th className="px-5 py-3.5">Order Date</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                    {tx.id}
                  </td>
                  <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {tx.supplier}
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-500">
                    {tx.date}
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-600 dark:text-zinc-400">
                    {tx.items} items
                  </td>
                  <td className="px-5 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                    {tx.amount}
                  </td>
                  <td className="px-5 py-4">
                    <Badge className={`text-xs ${tx.status === "RECEIVED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
