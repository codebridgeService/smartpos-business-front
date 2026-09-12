"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  Store,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { FeatureGuard } from "@/components/feature-control/FeatureGuard";

// Sample transaction records matching the design
const RECENT_TRANSACTIONS = [
  {
    id: "#12457",
    company: "Stellar Dynamics",
    date: "14 Jan 2025",
    amount: "+$245",
    plan: "Basic",
    color: "bg-emerald-500",
    initial: "⚡",
  },
  {
    id: "#65974",
    company: "Quantum Nexus",
    date: "10 Jan 2025",
    amount: "+$395",
    plan: "Enterprise",
    color: "bg-blue-500",
    initial: "🔵",
  },
  {
    id: "#22457",
    company: "Aurora Technologies",
    date: "08 Jan 2025",
    amount: "+$145",
    plan: "Advanced",
    color: "bg-purple-500",
    initial: "🔮",
  },
  {
    id: "#43412",
    company: "TerraFusion Energy",
    date: "06 Jan 2025",
    amount: "+$758",
    plan: "Enterprise",
    color: "bg-orange-500",
    initial: "☀️",
  },
  {
    id: "#43567",
    company: "Epicurean Delights",
    date: "03 Jan 2025",
    amount: "+$977",
    plan: "Premium",
    color: "bg-indigo-500",
    initial: "🪐",
  },
];

// Sample registered companies matching the design
const RECENTLY_REGISTERED = [
  {
    name: "Pitch",
    plan: "Basic (Monthly)",
    users: "150 Users",
    initial: "P",
    bg: "bg-black text-white",
  },
  {
    name: "Initech",
    plan: "Enterprise (Yearly)",
    users: "200 Users",
    initial: "I",
    bg: "bg-purple-600 text-white",
  },
  {
    name: "Umbrella Corp",
    plan: "Advanced (Monthly)",
    users: "108 Users",
    initial: "U",
    bg: "bg-amber-500 text-white",
  },
  {
    name: "Capital Partners",
    plan: "Enterprise (Monthly)",
    users: "110 Users",
    initial: "C",
    bg: "bg-rose-500 text-white",
  },
  {
    name: "Massive Dynamic",
    plan: "Premium (Yearly)",
    users: "120 Users",
    initial: "M",
    bg: "bg-zinc-800 text-white",
  },
];

// Sample expired plans with interactive reminder button
const RECENT_EXPIRED = [
  {
    name: "Silicon Corp",
    expiry: "10 Apr 2025",
    icon: "bg-indigo-500",
    initial: "S",
  },
  {
    name: "Hubspot",
    expiry: "12 Jun 2025",
    icon: "bg-orange-500",
    initial: "H",
  },
  {
    name: "Licon Industries",
    expiry: "16 Jun 2025",
    icon: "bg-sky-500",
    initial: "L",
  },
  {
    name: "TerraFusion Energy",
    expiry: "12 May 2025",
    icon: "bg-rose-500",
    initial: "T",
  },
  {
    name: "Epicurean Delights",
    expiry: "15 May 2025",
    icon: "bg-blue-600",
    initial: "E",
  },
];

// Sparkline data components
const SparkBars = ({ color = "bg-orange-500" }: { color?: string }) => (
  <div className="flex items-end gap-1 h-9 shrink-0">
    <span className={`w-1.5 h-3 rounded-full ${color}`} />
    <span className={`w-1.5 h-6 rounded-full ${color}`} />
    <span className={`w-1.5 h-8 rounded-full ${color}`} />
    <span className={`w-1.5 h-5 rounded-full ${color}`} />
    <span className={`w-1.5 h-7 rounded-full ${color}`} />
    <span className={`w-1.5 h-9 rounded-full ${color}`} />
    <span className={`w-1.5 h-6 rounded-full ${color}`} />
  </div>
);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { businesses } = useBusiness();
  const [remindedList, setRemindedList] = useState<Record<string, boolean>>({});

  const handleSendReminder = (companyName: string) => {
    setRemindedList((prev) => ({ ...prev, [companyName]: true }));
  };

  return (
    <FeatureGuard featureKey="dashboard.reports" fallbackTitle="Dashboard & Reports">
      <div className="space-y-6 w-full pb-12 select-none">
      {/* 1. Header Title & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            You have <span className="font-bold text-orange-500">200+</span> Orders, Today
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors self-start sm:self-auto"
        >
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>01 Jan 2024 - 07 Jan 2024</span>
        </button>
      </div>

      {/* 2. Vibrant Orange Hero Banner with 3D Spheres */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-6 sm:p-7 text-white shadow-lg shadow-orange-500/15">
        {/* Subtle decorative 3D sphere glows */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-8 w-48 h-48 bg-amber-400/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-4 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome Back, {user?.name?.split(" ")[0] || "Adrian"}
            </h2>
            <p className="text-orange-100 text-xs sm:text-sm font-medium">
              14 New Companies Subscribed Today !!!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/companies"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Companies
            </Link>
            <Link
              href="/coming-soon?feature=packages"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              All Packages
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 4-Column KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Companies */}
        <Link
          href="/admin/companies"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-orange-500/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[#0e2238] text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-5 w-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
              Active
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {businesses?.length ?? 0}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                Total Companies
              </div>
            </div>
            <SparkBars color="bg-orange-500" />
          </div>
        </Link>

        {/* Active Companies */}
        <Link
          href="/admin/companies"
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[#0e2238] text-white flex items-center justify-center shadow-xs">
              <Store className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
              Live
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {businesses?.filter((b) => b.status === "active").length ?? 0}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                Active Companies
              </div>
            </div>
            <SparkBars color="bg-purple-500" />
          </div>
        </Link>

        {/* Total Subscribers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[#0e2238] text-white flex items-center justify-center shadow-xs">
              <Users className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
              +6%
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                3698
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                Total Subscribers
              </div>
            </div>
            <SparkBars color="bg-cyan-500" />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-[#0e2238] text-white flex items-center justify-center shadow-xs">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50">
              -16%
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                $89,878.58
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-0.5">
                Total Earnings
              </div>
            </div>
            <SparkBars color="bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* 4. Middle Analytics Row (Companies Weekly, Revenue Monthly, Top Plans) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Companies Weekly Chart */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Companies</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <Calendar className="h-3 w-3" />
              <span>This Week</span>
            </button>
          </div>

          {/* Weekly Bar Graph */}
          <div className="mt-6 flex items-end justify-between h-44 px-2">
            {[
              { day: "M", height: "45%", star: false },
              { day: "T", height: "80%", star: true },
              { day: "W", height: "30%", star: false },
              { day: "T", height: "95%", star: true },
              { day: "F", height: "70%", badge: "100" },
              { day: "S", height: "75%", star: false },
              { day: "S", height: "75%", star: false },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                {item.badge && (
                  <span className="text-[9px] font-bold text-white bg-orange-500 px-1 py-0.5 rounded shadow-xs mb-0.5">
                    {item.badge}
                  </span>
                )}
                {item.star && <Star className="h-2.5 w-2.5 text-slate-900 dark:text-white fill-current mb-0.5" />}
                {!item.badge && !item.star && <div className="h-4" />}

                <div
                  className={`w-3.5 rounded-full transition-all duration-300 ${
                    item.badge ? "bg-orange-500" : "bg-[#0e2238] dark:bg-slate-700 hover:bg-slate-700"
                  }`}
                  style={{ height: item.height }}
                />
                <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
              +6%
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              5 Companies from last month
            </span>
          </div>
        </div>

        {/* Revenue 12-Month Bar Chart */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">$45787</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  +40% increased from last year
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-medium">Revenue</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
              >
                <Calendar className="h-3 w-3" />
                <span>2025</span>
              </button>
            </div>
          </div>

          {/* 12 Months Bars */}
          <div className="mt-6 flex items-end justify-between h-44 gap-1.5 sm:gap-2 px-1">
            {[
              { m: "Jan", val: 55 },
              { m: "Feb", val: 42 },
              { m: "Mar", val: 60, ring: true },
              { m: "Apr", val: 38 },
              { m: "May", val: 75 },
              { m: "Jun", val: 82 },
              { m: "Jul", val: 76 },
              { m: "Aug", val: 88 },
              { m: "Sep", val: 88 },
              { m: "Oct", val: 92 },
              { m: "Nov", val: 32 },
              { m: "Dec", val: 90 },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                {item.ring && (
                  <div className="h-4 w-4 rounded-full border-2 border-pink-500 mb-1 flex items-center justify-center animate-pulse" />
                )}
                {!item.ring && <div className="h-5" />}

                {/* Track Background */}
                <div className="w-full max-w-[24px] h-32 rounded-full bg-slate-100 dark:bg-zinc-800 flex flex-col justify-end p-0.5">
                  <div
                    className="w-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{ height: `${item.val}%` }}
                  />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-2">
                  {item.m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Plans Donut Chart */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Plans</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <Calendar className="h-3 w-3" />
              <span>This Month</span>
            </button>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="currentColor"
                className="text-slate-100 dark:text-zinc-800"
                strokeWidth="14"
              />
              {/* Enterprise segment (Blue: 20%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#2563eb"
                strokeWidth="14"
                strokeDasharray="238.76"
                strokeDashoffset="0"
              />
              {/* Premium segment (Yellow: 20%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#eab308"
                strokeWidth="14"
                strokeDasharray="47.75 191.01"
                strokeDashoffset="-47.75"
              />
              {/* Basic segment (Orange: 60%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f97316"
                strokeWidth="14"
                strokeDasharray="143.25 95.51"
                strokeDashoffset="-95.51"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">60%</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Basic</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Premium</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Enterprise</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">20%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom 3-Column Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <Link
              href="/coming-soon?feature=transactions"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 mt-1">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl ${tx.color} text-white flex items-center justify-center text-xs shadow-xs shrink-0`}
                  >
                    {tx.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {tx.company}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      <span className="font-mono text-blue-600 dark:text-blue-400">{tx.id}</span> • {tx.date}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {tx.amount}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">{tx.plan}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Registered */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recently Registered</h3>
            <Link
              href="/admin/businesses/outlets"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 mt-1">
            {RECENTLY_REGISTERED.map((reg, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-9 w-9 rounded-xl ${reg.bg} flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                  >
                    {reg.initial}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {reg.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{reg.plan}</div>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
                  {reg.users}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Plan Expired */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Plan Expired</h3>
            <Link
              href="/coming-soon?feature=expired-plans"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 mt-1">
            {RECENT_EXPIRED.map((exp, idx) => {
              const hasReminded = remindedList[exp.name];

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-xl ${exp.icon} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                    >
                      {exp.initial}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {exp.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Expired : {exp.expiry}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendReminder(exp.name)}
                    disabled={hasReminded}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                      hasReminded
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
                        : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    }`}
                  >
                    {hasReminded ? "Sent ✓" : "Send Reminder"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </FeatureGuard>
);
}
