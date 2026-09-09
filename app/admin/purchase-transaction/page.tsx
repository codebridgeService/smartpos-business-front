"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowUpRight,
  DollarSign,
  FileText,
  CreditCard,
  Building2,
} from "lucide-react";

interface TransactionRecord {
  id: string;
  invoiceNo: string;
  company: string;
  plan: string;
  amount: string;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Refunded";
}

const TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx-1",
    invoiceNo: "INV-2025-00142",
    company: "Stellar Dynamics",
    plan: "Basic Starter",
    amount: "$245.00",
    date: "14 Jan 2025",
    method: "Credit Card (•••• 4242)",
    status: "Completed",
  },
  {
    id: "tx-2",
    invoiceNo: "INV-2025-00139",
    company: "Quantum Nexus",
    plan: "Enterprise",
    amount: "$2,388.00",
    date: "10 Jan 2025",
    method: "Stripe",
    status: "Completed",
  },
  {
    id: "tx-3",
    invoiceNo: "INV-2025-00125",
    company: "Aurora Technologies",
    plan: "Advanced Pro",
    amount: "$145.00",
    date: "08 Jan 2025",
    method: "PayPal",
    status: "Completed",
  },
  {
    id: "tx-4",
    invoiceNo: "INV-2025-00118",
    company: "TerraFusion Energy",
    plan: "Enterprise",
    amount: "$758.00",
    date: "06 Jan 2025",
    method: "Bank Wire Transfer",
    status: "Pending",
  },
  {
    id: "tx-5",
    invoiceNo: "INV-2025-00104",
    company: "Epicurean Delights",
    plan: "Advanced Pro",
    amount: "$977.00",
    date: "03 Jan 2025",
    method: "Credit Card (•••• 8812)",
    status: "Refunded",
  },
];

export default function PurchaseTransactionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Receipt className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Purchase Transactions
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Audit log of subscriber payments, invoices, refunds, and billing records
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export All Invoices</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Revenue Processed</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">$451,280</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Invoices Settled</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">1,842</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Refund Ratio</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">0.4%</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            {["All", "Completed", "Pending", "Refunded"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === status
                    ? "bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800 uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                    {tx.invoiceNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {tx.company}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">
                      {tx.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {tx.amount}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                    {tx.method}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                    {tx.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        tx.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : tx.status === "Pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {tx.status === "Completed" && <CheckCircle2 className="h-2.5 w-2.5" />}
                      {tx.status === "Pending" && <Clock className="h-2.5 w-2.5" />}
                      {tx.status === "Refunded" && <RotateCcw className="h-2.5 w-2.5" />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors inline-flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
