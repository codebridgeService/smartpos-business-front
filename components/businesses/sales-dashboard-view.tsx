"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { AnimatedNumber } from "@/components/ui/animated-number";

// Best Seller Items from reference
const BEST_SELLERS = [
  {
    id: "1",
    name: "Lobar Handy",
    price: "$260",
    sales: "6547",
    icon: "💺",
    bg: "bg-amber-100/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200",
  },
  {
    id: "2",
    name: "Bold V3.2",
    price: "$1474",
    sales: "3474",
    icon: "🎧",
    bg: "bg-red-100/60 dark:bg-red-950/40 text-red-800 dark:text-red-200",
  },
  {
    id: "3",
    name: "Lenovo 3rd Generation",
    price: "$8784",
    sales: "1478",
    icon: "👟",
    bg: "bg-blue-100/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200",
  },
  {
    id: "4",
    name: "Apple Series 5 Watch",
    price: "$3240",
    sales: "987",
    icon: "⌚",
    bg: "bg-slate-200/80 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200",
  },
  {
    id: "5",
    name: "Lenovo 3rd Generation",
    price: "$597",
    sales: "784",
    icon: "🔊",
    bg: "bg-cyan-100/60 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200",
  },
];

// Recent Transactions from reference
const RECENT_TRANSACTIONS = [
  {
    id: 1,
    name: "Lobar Handy",
    time: "15 Mins",
    paymentMethod: "Paypal",
    reference: "#416645453773",
    status: "Success",
    statusType: "success",
    amount: "$1099.00",
    icon: "💺",
  },
  {
    id: 2,
    name: "Red Premium Handy",
    time: "15 Mins",
    paymentMethod: "Apple Pay",
    reference: "#147784454554",
    status: "Cancelled",
    statusType: "cancelled",
    amount: "$600.55",
    icon: "👜",
  },
  {
    id: 3,
    name: "Iphone 14 Pro",
    time: "15 Mins",
    paymentMethod: "Stripe",
    reference: "#147784454554",
    status: "Pending",
    statusType: "pending",
    amount: "$200.10",
    icon: "📱",
  },
  {
    id: 4,
    name: "Black Slim 200",
    time: "15 Mins",
    paymentMethod: "PayU",
    reference: "#147784454554",
    status: "Success",
    statusType: "success",
    amount: "$1569.00",
    icon: "🪑",
  },
  {
    id: 5,
    name: "Woodcraft Sandal",
    time: "15 Mins",
    paymentMethod: "Paytm",
    reference: "#147784454554",
    status: "Success",
    statusType: "success",
    amount: "$1478.00",
    icon: "🎒",
  },
];

export function SalesDashboardView() {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedCountryTime, setSelectedCountryTime] = useState("This Week");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-6 w-full pb-16 select-none animate-in fade-in duration-300">
      {/* 1. Header Row: Greeting & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>👋</span>
            <span>
              Hi <strong className="font-extrabold">{user?.name || activeBusiness?.name || "John Smilga"}</strong>,
              here&apos;s what&apos;s happening with your store today.
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Date Range Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-2xs">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>01 Jan 2024 - 07 Jan 2024</span>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-2xs transition-colors"
            title="Refresh dashboard data"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Toggle collapse */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-2xs transition-colors"
            title={isCollapsed ? "Expand Top Stats" : "Collapse Top Stats"}
          >
            <ChevronUp className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Weekly Earning + No of Total Sales + No of Purchased Goods) */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Weekly Earning Card (Left Wide Card, 6 cols) */}
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs smooth-card flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-bold text-orange-500 tracking-tight">
                Weekly Earning
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={95000.45} prefix="$" decimals={2} />
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-emerald-500">
                <span className="flex items-center">
                  <ArrowUp className="h-3.5 w-3.5 mr-0.5" />
                  48%
                </span>
                <span className="text-slate-400 dark:text-zinc-500 font-normal">
                  increase compare to last week
                </span>
              </div>
            </div>

            {/* Money Bag Graphic SVG */}
            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
                <defs>
                  <linearGradient id="sackGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                </defs>

                {/* Ascending 3D Bar Chart */}
                <rect x="70" y="55" width="10" height="40" rx="3" fill="url(#barGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                <rect x="84" y="40" width="10" height="55" rx="3" fill="url(#barGrad)" stroke="#ca8a04" strokeWidth="1.5" />
                <rect x="98" y="24" width="10" height="71" rx="3" fill="url(#barGrad)" stroke="#ca8a04" strokeWidth="1.5" />

                {/* Trending Up Arrow */}
                <path
                  d="M62 48 L95 18 L84 16 M95 18 L96 29"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Money Sack Body */}
                <path
                  d="M48 35 C48 30 54 26 58 26 C62 26 68 30 68 35 C64 39 52 39 48 35 Z"
                  fill="#15803d"
                  stroke="#14532d"
                  strokeWidth="2"
                />
                <ellipse cx="58" cy="38" rx="10" ry="3" fill="#ca8a04" />
                <path
                  d="M32 46 C20 54 18 80 24 94 C30 106 66 108 80 96 C90 84 88 56 76 46 C66 42 42 42 32 46 Z"
                  fill="url(#sackGrad)"
                  stroke="#14532d"
                  strokeWidth="3"
                />

                {/* Dollar Coin on Sack */}
                <circle cx="56" cy="74" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.5" />
                <text
                  x="56"
                  y="80"
                  textAnchor="middle"
                  fill="#854d0e"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  $
                </text>
              </svg>
            </div>
          </div>

          {/* No of Total Sales (Solid Orange Card, 3 cols) */}
          <div className="md:col-span-3 p-6 rounded-2xl bg-[#f97316] text-white shadow-md shadow-orange-500/20 smooth-card relative flex flex-col justify-between overflow-hidden">
            <div className="flex items-start justify-between">
              {/* Stack of Coins Icon */}
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2 L20 6 L12 10 L4 6 Z" fill="currentColor" fillOpacity="0.3" />
                  <path d="M4 10 L12 14 L20 10" />
                  <path d="M4 14 L12 18 L20 14" />
                  <path d="M4 18 L12 22 L20 18" />
                  <path d="M16 4 L21 4 L21 9" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M14 11 L21 4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <button
                type="button"
                className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95"
                title="Refresh Total Sales"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-5">
              <div className="text-3xl font-extrabold tracking-tight">
                <AnimatedNumber value={10000} suffix="+" />
              </div>
              <div className="text-xs font-medium text-orange-100 mt-1">No of Total Sales</div>
            </div>
          </div>

          {/* No of Purchased Goods (Deep Navy Card, 3 cols) */}
          <div className="md:col-span-3 p-6 rounded-2xl bg-[#0b192c] text-white shadow-md smooth-card relative flex flex-col justify-between overflow-hidden">
            <div className="flex items-start justify-between">
              {/* Shopping Goods Icon */}
              <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 L18 2 L20 7 L4 7 Z" fill="currentColor" fillOpacity="0.3" />
                  <rect x="4" y="7" width="16" height="14" rx="2" strokeWidth="2" />
                  <path d="M10 11 C10 12.5 11 13.5 12 13.5 C13 13.5 14 12.5 14 11" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <button
                type="button"
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-95"
                title="Refresh Purchased Goods"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-5">
              <div className="text-3xl font-extrabold tracking-tight">
                <AnimatedNumber value={800} suffix="+" />
              </div>
              <div className="text-xs font-medium text-slate-300 mt-1">No of Purchased Goods</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Middle Section: Best Seller (Left, 4-5 cols) & Recent Transactions (Right, 7-8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Best Seller Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs smooth-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Best Seller</h3>
            <Link href="/coming-soon?feature=best-sellers">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                View All
              </button>
            </Link>
          </div>

          {/* Best Seller Items */}
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 mt-1">
            {BEST_SELLERS.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-11 w-11 rounded-xl ${item.bg} flex items-center justify-center text-xl shrink-0 shadow-2xs`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                      {item.price}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Sales</div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">
                    {item.sales}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Card */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <Link href="/businesses/purchase-transaction">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                View All
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-2 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Order Details</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {RECENT_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-2 text-center text-slate-400 font-medium">
                      {tx.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                          {tx.icon}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {tx.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{tx.time}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-700 dark:text-zinc-300 leading-tight">
                        {tx.paymentMethod}
                      </div>
                      <span className="text-[11px] text-blue-500 hover:underline cursor-pointer">
                        {tx.reference}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          tx.statusType === "success"
                            ? "bg-[#22c55e] text-white"
                            : tx.statusType === "cancelled"
                            ? "bg-[#ef4444] text-white"
                            : "bg-[#0284c7] text-white"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Sales Analytics (Left, 8 cols) & Sales by Countries (Right, 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Analytics Card */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Analytics</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>{selectedYear}</span>
            </button>
          </div>

          {/* Area Chart with SVG Canvas */}
          <div className="relative mt-4 h-64 w-full">
            <svg viewBox="0 0 800 240" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#f97316" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              <line x1="50" y1="20" x2="760" y2="20" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="1" />
              <line x1="50" y1="56" x2="760" y2="56" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="1" />
              <line x1="50" y1="92" x2="760" y2="92" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="1" />
              <line x1="50" y1="128" x2="760" y2="128" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="1" />
              <line x1="50" y1="164" x2="760" y2="164" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="1" />
              <line x1="50" y1="200" x2="760" y2="200" stroke="currentColor" className="text-slate-100 dark:text-zinc-800" strokeWidth="1" />

              {/* Y-Axis Labels */}
              <text x="35" y="24" textAnchor="end" className="fill-slate-400 dark:fill-zinc-500 text-[11px]">60k</text>
              <text x="35" y="60" textAnchor="end" className="fill-slate-400 dark:fill-zinc-500 text-[11px]">50k</text>
              <text x="35" y="96" textAnchor="end" className="fill-slate-400 dark:fill-zinc-500 text-[11px]">40k</text>
              <text x="35" y="132" textAnchor="end" className="fill-slate-400 dark:fill-zinc-500 text-[11px]">30k</text>
              <text x="35" y="168" textAnchor="end" className="fill-slate-400 dark:fill-zinc-500 text-[11px]">20k</text>
              <text x="35" y="204" textAnchor="end" className="fill-slate-400 dark:fill-zinc-500 text-[11px]">10k</text>

              {/* Area Gradient Path */}
              <path
                d="M 60 160 C 100 160, 110 135, 145 135 C 180 135, 195 180, 230 180 C 265 180, 280 165, 315 165 C 350 165, 365 170, 400 170 C 435 170, 450 115, 485 115 C 520 115, 535 170, 570 170 C 605 170, 620 175, 655 175 C 690 175, 705 185, 740 185 L 740 200 L 60 200 Z"
                fill="url(#salesOrangeGrad)"
              />

              {/* Smooth Spline Curve Line */}
              <path
                d="M 60 160 C 100 160, 110 135, 145 135 C 180 135, 195 180, 230 180 C 265 180, 280 165, 315 165 C 350 165, 365 170, 400 170 C 435 170, 450 115, 485 115 C 520 115, 535 170, 570 170 C 605 170, 620 175, 655 175 C 690 175, 705 185, 740 185"
                fill="none"
                stroke="#f97316"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Markers for Points */}
              <circle cx="60" cy="160" r="3.5" fill="#f97316" />
              <circle cx="145" cy="135" r="3.5" fill="#f97316" />
              <circle cx="230" cy="180" r="3.5" fill="#f97316" />
              <circle cx="315" cy="165" r="3.5" fill="#f97316" />
              <circle cx="400" cy="170" r="3.5" fill="#f97316" />

              {/* Highlight Peak at June */}
              <circle cx="485" cy="115" r="14" fill="#f97316" fillOpacity="0.25" className="animate-pulse" />
              <circle cx="485" cy="115" r="6" fill="#f97316" stroke="#ffffff" strokeWidth="2.5" />

              <circle cx="570" cy="170" r="3.5" fill="#f97316" />
              <circle cx="655" cy="175" r="3.5" fill="#f97316" />
              <circle cx="740" cy="185" r="3.5" fill="#f97316" />

              {/* Month Names */}
              <text x="60" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Jan</text>
              <text x="145" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Feb</text>
              <text x="230" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Mar</text>
              <text x="315" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Apr</text>
              <text x="400" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">May</text>
              <text x="485" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Jun</text>
              <text x="570" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">July</text>
              <text x="655" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Aug</text>
              <text x="740" y="225" textAnchor="middle" className="fill-slate-400 dark:fill-zinc-500 text-[11px] font-medium">Sep</text>
            </svg>
          </div>
        </div>

        {/* Sales by Countries Card */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales by Countries</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>{selectedCountryTime}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Stylized Vector World Map with Africa Tooltip */}
          <div className="relative my-4 flex items-center justify-center min-h-[190px]">
            <svg viewBox="0 0 340 180" className="w-full h-auto max-w-[320px]">
              {/* North America (Dark Navy) */}
              <path
                d="M 25 35 C 30 25, 60 25, 75 35 C 80 45, 65 65, 55 70 C 45 75, 25 60, 25 35 Z"
                fill="#1e293b"
                className="opacity-90"
              />
              {/* South America (Light Orange) */}
              <path
                d="M 65 80 C 75 80, 85 95, 80 115 C 75 130, 70 145, 65 140 C 60 135, 55 95, 65 80 Z"
                fill="#fb923c"
                className="opacity-90"
              />
              {/* Europe / Russia (Dark Navy) */}
              <path
                d="M 120 25 C 145 20, 195 20, 210 35 C 205 50, 185 55, 175 45 C 165 40, 140 45, 120 25 Z"
                fill="#1e293b"
                className="opacity-90"
              />
              {/* Africa (Vibrant Solid Orange) */}
              <path
                d="M 125 55 C 145 52, 170 58, 168 85 C 165 105, 145 130, 135 125 C 125 120, 115 80, 125 55 Z"
                fill="#f97316"
              />
              {/* Asia & India (Dark Navy) */}
              <path
                d="M 215 35 C 240 30, 275 45, 260 75 C 245 85, 220 70, 215 35 Z"
                fill="#1e293b"
                className="opacity-90"
              />
              {/* Southeast Asia Islands */}
              <ellipse cx="255" cy="95" rx="14" ry="4" fill="#1e293b" />
              {/* Australia (Soft Slate) */}
              <path
                d="M 265 115 C 285 115, 295 130, 285 145 C 275 150, 260 140, 265 115 Z"
                fill="#cbd5e1"
                className="dark:opacity-30"
              />
            </svg>

            {/* Floating Tooltip Card on Africa */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none drop-shadow-md">
              <div className="bg-[#f97316] text-white text-[11px] font-bold px-3 py-1 rounded-t-lg shadow-xs">
                Africa
              </div>
              <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 text-xs font-extrabold px-3 py-1.5 rounded-b-lg shadow-sm">
                3455 Sales
              </div>
            </div>
          </div>

          {/* Footer Metric */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
            <span className="text-emerald-500 font-bold text-xs inline-flex items-center gap-1">
              <ArrowUp className="h-3.5 w-3.5" />
              48%
              <span className="font-normal text-slate-400 dark:text-zinc-500">
                increase compare to last week
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
