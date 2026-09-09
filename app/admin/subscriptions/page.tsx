"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  Calendar,
  MoreVertical,
} from "lucide-react";

interface Subscription {
  id: string;
  company: string;
  plan: "Enterprise" | "Advanced" | "Basic";
  billingCycle: "Monthly" | "Annual";
  amount: string;
  startDate: string;
  nextBilling: string;
  status: "Active" | "Past Due" | "Cancelled";
  autoRenew: boolean;
}

const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "SUB-9921",
    company: "Freshmart Supermarket Ltd",
    plan: "Enterprise",
    billingCycle: "Annual",
    amount: "$2,388/yr",
    startDate: "12 Jan 2024",
    nextBilling: "12 Jan 2026",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-8842",
    company: "Stellar Coffee Roasters",
    plan: "Advanced",
    billingCycle: "Monthly",
    amount: "$79/mo",
    startDate: "18 Feb 2024",
    nextBilling: "18 Oct 2025",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-7719",
    company: "Urban Kicks Footwear",
    plan: "Basic",
    billingCycle: "Monthly",
    amount: "$29/mo",
    startDate: "03 Mar 2024",
    nextBilling: "03 Oct 2025",
    status: "Past Due",
    autoRenew: false,
  },
  {
    id: "SUB-6624",
    company: "Apex Electronics Hub",
    plan: "Enterprise",
    billingCycle: "Annual",
    amount: "$2,388/yr",
    startDate: "29 May 2024",
    nextBilling: "29 May 2026",
    status: "Active",
    autoRenew: true,
  },
  {
    id: "SUB-5511",
    company: "Boutique Bella Floral",
    plan: "Basic",
    billingCycle: "Monthly",
    amount: "$29/mo",
    startDate: "04 Jun 2024",
    nextBilling: "04 Sep 2025",
    status: "Cancelled",
    autoRenew: false,
  },
];

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = SAMPLE_SUBSCRIPTIONS.filter((sub) => {
    const matchesSearch =
      sub.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Subscriptions & Billing
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage SaaS tenant recurring plans, billing cycles, renewals, and payment statuses
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Monthly Recurring (MRR)</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">$78,450</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Subscribers</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">824</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Repeat className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Annual Contracts</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">62%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Past Due Payments</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">7</div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company or sub ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="flex items-center gap-2">
            {["All", "Active", "Past Due", "Cancelled"].map((status) => (
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
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Billing Cycle</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Next Renewal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-white">
                    {sub.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {sub.company}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.plan === "Enterprise"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                          : sub.plan === "Advanced"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {sub.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{sub.billingCycle}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{sub.amount}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{sub.nextBilling}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        sub.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : sub.status === "Past Due"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {sub.status === "Active" && <CheckCircle2 className="h-2.5 w-2.5" />}
                      {sub.status === "Past Due" && <AlertTriangle className="h-2.5 w-2.5" />}
                      {sub.status === "Cancelled" && <Clock className="h-2.5 w-2.5" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      Manage Plan
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
