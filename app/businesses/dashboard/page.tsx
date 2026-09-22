"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SalesDashboardView } from "@/components/businesses/sales-dashboard-view";
import {
  Calendar,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  ShoppingBag,
  RotateCcw,
  TrendingUp,
  Clock,
  CircleDollarSign,
  CreditCard,
  ShoppingCart,
  User,
  Users,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/ui/animated-number";

// Top Selling Products Data
const TOP_SELLING_PRODUCTS = [
  {
    id: "1",
    name: "Chargor Cable - Lighting",
    price: "$187",
    sales: "247+ Sales",
    change: "+25%",
    trend: "up",
    image: "🔌",
    bgColor: "bg-orange-50 dark:bg-orange-950/40 text-orange-600",
  },
  {
    id: "2",
    name: "Yves Saint Eau De Parfum",
    price: "$145",
    sales: "289+ Sales",
    change: "+28%",
    trend: "up",
    image: "🧴",
    bgColor: "bg-rose-50 dark:bg-rose-950/40 text-rose-600",
  },
  {
    id: "3",
    name: "Apple Airpods 2",
    price: "$458",
    sales: "300+ Sales",
    change: "+25%",
    trend: "up",
    image: "🎧",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
  },
  {
    id: "4",
    name: "Vacuum Cleaner",
    price: "$139",
    sales: "225+ Sales",
    change: "-23%",
    trend: "down",
    image: "🧹",
    bgColor: "bg-sky-50 dark:bg-sky-950/40 text-sky-600",
  },
  {
    id: "5",
    name: "Samsung Galaxy S21 Fe 5g",
    price: "$898",
    sales: "365+ Sales",
    change: "+28%",
    trend: "up",
    image: "📱",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600",
  },
];

// Low Stock Products Data
const LOW_STOCK_PRODUCTS = [
  {
    id: "1",
    name: "Vacuum Cleaner Robot",
    code: "#940004",
    stock: 21,
    image: "🤖",
    bgColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-600",
  },
  {
    id: "2",
    name: "Dell XPS 13",
    code: "#665814",
    stock: "08",
    image: "💻",
    bgColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-600",
  },
  {
    id: "3",
    name: "KitchenAid Stand Mixer",
    code: "#325569",
    stock: 14,
    image: "🥣",
    bgColor: "bg-orange-50 dark:bg-orange-950/40 text-orange-600",
  },
  {
    id: "4",
    name: "Levi's Trucker Jacket",
    code: "#124588",
    stock: 12,
    image: "🧥",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
  },
  {
    id: "5",
    name: "Lay's Classic",
    code: "#366586",
    stock: 10,
    image: "🍟",
    bgColor: "bg-purple-50 dark:bg-purple-950/40 text-purple-600",
  },
];

// Recent Sales Data
const RECENT_SALES = [
  {
    id: "1",
    name: "Apple Watch Series 9",
    category: "Electronics",
    price: "$640",
    date: "Today",
    status: "Processing",
    statusColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    image: "⌚",
  },
  {
    id: "2",
    name: "Gold Bracelet",
    category: "Fashion",
    price: "$126",
    date: "Today",
    status: "Cancelled",
    statusColor: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
    image: "📿",
  },
  {
    id: "3",
    name: "Parachute Down Duvet",
    category: "Health",
    price: "$89",
    date: "15 Jan 2025",
    status: "On Hold",
    statusColor: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800",
    image: "🛏️",
  },
  {
    id: "4",
    name: "YETI Rambler Tumbler",
    category: "Sports",
    price: "$65",
    date: "12 Jan 2025",
    status: "Processing",
    statusColor: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    image: "🥤",
  },
  {
    id: "5",
    name: "Osmo Genius Starter Kit",
    category: "Lifestyles",
    price: "$87.56",
    date: "11 Jan 2025",
    status: "Completed",
    statusColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    image: "🧩",
  },
];

// Recent Transactions Data
const RECENT_TRANSACTIONS = [
  {
    id: "1",
    date: "24 May 2025",
    customer: "Andrea Willer",
    code: "#114589",
    status: "Completed",
    statusColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    total: "$4560",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    date: "23 May 2025",
    customer: "Timothy Sands",
    code: "#114589",
    status: "Completed",
    statusColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    total: "$3569",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    date: "22 May 2025",
    customer: "Bonnie Rodrigues",
    code: "#114589",
    status: "Draft",
    statusColor: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
    total: "$2659",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    date: "21 May 2025",
    customer: "Randy McCree",
    code: "#114589",
    status: "Completed",
    statusColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    total: "$2155",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
];

// Top Customers Data
const TOP_CUSTOMERS = [
  {
    name: "Carlos Curran",
    country: "USA",
    orders: "24 Orders",
    total: "$8965",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Stan Gaunter",
    country: "UAE",
    orders: "22 Orders",
    total: "$6985",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Richard Wilson",
    country: "Germany",
    orders: "14 Orders",
    total: "$5366",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Mary Bronson",
    country: "Belgium",
    orders: "08 Orders",
    total: "$4569",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
  },
  {
    name: "Annie Tremblay",
    country: "Greenland",
    orders: "14 Orders",
    total: "$35,698",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
];

// Heatmap Matrix Data (Hours vs Days)
const HEATMAP_HOURS = ["12mp", "12pm", "02pm", "12am", "10am", "8am", "6am", "4am", "2am"];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];

const HEATMAP_VALUES: number[][] = [
  [0, 0, 0, 1, 1, 3, 3], // 12mp
  [0, 0, 0, 4, 1, 2, 1], // 12pm (has 297 Orders tooltip on Wed/Thur)
  [1, 0, 1, 1, 1, 1, 1], // 02pm
  [0, 1, 1, 1, 1, 1, 1], // 12am
  [3, 3, 3, 1, 1, 3, 3], // 10am
  [1, 1, 1, 1, 1, 1, 1], // 8am
  [1, 1, 1, 1, 1, 1, 1], // 6am
  [3, 3, 3, 3, 1, 1, 1], // 4am
  [2, 3, 3, 2, 1, 1, 1], // 2am
];

function BusinessDashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams?.get("view");
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [salesTimeframe, setSalesTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "6M" | "1Y">("1Y");
  const [activeTxTab, setActiveTxTab] = useState<"Sale" | "Purchase" | "Quotation" | "Expenses" | "Invoices">("Sale");

  if (view === "sales") {
    return <SalesDashboardView />;
  }

  return (
    <div className="space-y-6 w-full pb-16 select-none animate-fade-in">
      {/* 1. Page Header: Welcome & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, {user?.name || activeBusiness?.name || "Admin"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            You have <span className="font-bold text-orange-500">200+</span> Orders, Today
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>01 Jan 2024 - 07 Jan 2024</span>
        </button>
      </div>

      {/* 2. Low Stock Warning Alert Banner */}
      {!isAlertDismissed && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-orange-50/90 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/50 text-xs text-slate-700 dark:text-zinc-300 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-3 w-3" />
            </div>
            <span>
              Your Product <strong className="font-bold text-orange-600 dark:text-orange-400">Apple Iphone 15</strong> is running Low, already below 5 Pcs.,{" "}
              <Link href="/coming-soon?feature=stock-adjustment" className="font-semibold text-orange-600 dark:text-orange-400 underline underline-offset-2 hover:opacity-80">
                Add Stock
              </Link>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAlertDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Primary Metrics (4 Colored Gradient Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales (Orange) */}
        <div className="smooth-card relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/15">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/30">
              +22%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-orange-100">Total Sales</div>
            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
              <AnimatedNumber value={48988078} prefix="$" />
            </div>
          </div>
        </div>

        {/* Total Sales Return (Deep Navy #0e2238) */}
        <div className="smooth-card relative overflow-hidden p-5 rounded-2xl bg-[#0e2238] text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <RefreshCw className="h-5 w-5 text-sky-400" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-rose-300 border border-white/20">
              -22%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-300">Total Sales Return</div>
            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
              <AnimatedNumber value={16478145} prefix="$" />
            </div>
          </div>
        </div>

        {/* Total Purchase (Teal #0d9488) */}
        <div className="smooth-card relative overflow-hidden p-5 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/15">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/30">
              -21%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-teal-100">Total Purchase</div>
            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
              <AnimatedNumber value={24145789} prefix="$" />
            </div>
          </div>
        </div>

        {/* Total Purchase Return (Blue #2563eb) */}
        <div className="smooth-card relative overflow-hidden p-5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/15">
          <div className="flex items-center justify-between">
            <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <RotateCcw className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/30">
              -22%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-blue-100">Total Purchase Return</div>
            <div className="text-2xl font-extrabold tracking-tight mt-0.5">
              <AnimatedNumber value={18458747} prefix="$" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Secondary Financial KPI Cards (4 White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profit */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={8458798} prefix="$" />
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">Profit</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              +35% <span className="text-slate-400 font-normal">vs Last Month</span>
            </span>
            <Link href="/coming-soon?feature=profit" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 font-medium underline text-[11px]">
              View All
            </Link>
          </div>
        </div>

        {/* Invoice Due */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={4898878} prefix="$" />
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">Invoice Due</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
              -19% <span className="text-slate-400 font-normal">vs Last Month</span>
            </span>
            <Link href="/coming-soon?feature=invoices" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 font-medium underline text-[11px]">
              View All
            </Link>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={8980097} prefix="$" />
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">Total Expenses</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              +41% <span className="text-slate-400 font-normal">vs Last Month</span>
            </span>
            <Link href="/coming-soon?feature=expenses" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 font-medium underline text-[11px]">
              View All
            </Link>
          </div>
        </div>

        {/* Total Payment */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                <AnimatedNumber value={7896500} prefix="$" />
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">Total Payment</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
              -20% <span className="text-slate-400 font-normal">vs Last Month</span>
            </span>
            <Link href="/coming-soon?feature=payment-returns" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 font-medium underline text-[11px]">
              View All
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Middle Section: Sales & Purchase (2/3) + Overall Info & Customers Overview (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales & Purchase Bar Chart (8 Columns) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales & Purchase</h3>
            </div>

            {/* Timeframe selector pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              {(["1D", "1W", "1M", "3M", "6M", "1Y"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setSalesTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${salesTimeframe === tf
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Legends */}
          <div className="flex items-center gap-6 mt-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fed7aa]" />
              <span className="text-slate-500 dark:text-zinc-400">Total Purchase</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">49K</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="text-slate-500 dark:text-zinc-400">Total Sales</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">38K</span>
            </div>
          </div>

          {/* Dual Bar Chart (Jan - Dec) */}
          <div className="mt-6 flex items-end gap-2 sm:gap-3 h-56 pt-6">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 dark:text-zinc-500 pr-2">
              <span>60K</span>
              <span>50K</span>
              <span>40K</span>
              <span>30K</span>
              <span>20K</span>
              <span>10K</span>
              <span>0</span>
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end justify-between h-full gap-2 sm:gap-3 border-b border-slate-100 dark:border-zinc-800 pb-1">
              {[
                { month: "Jan", purchase: 52, sales: 18 },
                { month: "Feb", purchase: 60, sales: 28 },
                { month: "Mar", purchase: 42, sales: 25 },
                { month: "Apr", purchase: 30, sales: 12 },
                { month: "May", purchase: 46, sales: 28 },
                { month: "Jun", purchase: 62, sales: 30 },
                { month: "July", purchase: 40, sales: 15 },
                { month: "Aug", purchase: 38, sales: 12 },
                { month: "Sep", purchase: 60, sales: 50 },
                { month: "Oct", purchase: 44, sales: 20 },
                { month: "Nov", purchase: 55, sales: 25 },
                { month: "Dec", purchase: 42, sales: 28 },
              ].map((col) => (
                <div key={col.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full max-w-[28px] relative flex flex-col items-center justify-end h-full">
                    {/* Background Purchase Bar */}
                    <div
                      className="w-full bg-[#fed7aa] dark:bg-amber-950/60 rounded-t-md transition-all duration-300"
                      style={{ height: `${col.purchase}%` }}
                    />
                    {/* Foreground Sales Bar */}
                    <div
                      className="w-full bg-orange-500 rounded-t-md absolute bottom-0 transition-all duration-300 group-hover:bg-orange-600"
                      style={{ height: `${col.sales}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-2">
                    {col.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Information & Customers Overview (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Overall Information */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <span className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                i
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overall Information</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center mx-auto mb-1.5">
                  <User className="h-4 w-4" />
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Suppliers</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">6987</div>
              </div>

              <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40">
                <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-600 flex items-center justify-center mx-auto mb-1.5">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Customer</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">4896</div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
                <div className="h-8 w-8 rounded-lg bg-teal-500/15 text-teal-600 flex items-center justify-center mx-auto mb-1.5">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Orders</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">487</div>
              </div>
            </div>
          </div>

          {/* Customers Overview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customers Overview</h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
              >
                <Calendar className="h-3 w-3" />
                <span>Today</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              {/* Radial Donut Progress Ring */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100 dark:text-zinc-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* First-time Customers Ring (Orange) */}
                  <path
                    className="text-orange-500"
                    strokeDasharray="60, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Returning Customers Inner Ring (Teal) */}
                  <path
                    className="text-teal-500"
                    strokeDasharray="40, 100"
                    strokeDashoffset="-60"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              {/* Stats on the right */}
              <div className="space-y-4 flex-1">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">5.5K</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">First Time</div>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                    ▲ 25%
                  </span>
                </div>

                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">3.5K</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Return</div>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                    ▲ 21%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Triple Row: Top Selling Products + Low Stock Products + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Selling Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-[10px]">
                ★
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Selling Products</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <span>Today</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 mt-2">
            {TOP_SELLING_PRODUCTS.map((prod) => (
              <div key={prod.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${prod.bgColor} flex items-center justify-center text-lg shrink-0`}>
                    {prod.image}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">{prod.price}</span> • {prod.sales}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${prod.trend === "up"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900"
                    : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:border-rose-900"
                    }`}
                >
                  {prod.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Low Stock Products</h3>
            </div>
            <Link href="/coming-soon?feature=low-stock" className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 mt-2">
            {LOW_STOCK_PRODUCTS.map((prod) => (
              <div key={prod.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${prod.bgColor} flex items-center justify-center text-lg shrink-0`}>
                    {prod.image}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      ID : <span className="font-semibold">{prod.code}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Instock</div>
                  <div className="text-sm font-bold text-rose-600 dark:text-rose-400">{prod.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Sales</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <span>Today</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 mt-2">
            {RECENT_SALES.map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {sale.image}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {sale.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {sale.category} • <span className="font-semibold text-slate-800 dark:text-zinc-200">{sale.price}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400">{sale.date}</div>
                  <span className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${sale.statusColor}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Middle Row: Sales Statics (1/2) + Recent Transactions (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Statics (Bi-directional Bar Chart) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Statics</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <Calendar className="h-3 w-3" />
              <span>2025</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Revenue & Expense Pills */}
          <div className="flex items-center gap-4 mt-4">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-3 flex-1">
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">$48,988,078</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Revenue</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200">
                +25%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-3 flex-1">
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">$12,189</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Expense</div>
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded border border-rose-200">
                -5.9%
              </span>
            </div>
          </div>

          {/* Divergent Bars Chart: -30K to +30K */}
          <div className="mt-6 flex items-center h-48">
            <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 pr-2">
              <span>30K</span>
              <span>20K</span>
              <span>10K</span>
              <span>0</span>
              <span>-10K</span>
              <span>-20K</span>
              <span>-30K</span>
            </div>

            {/* Bars container */}
            <div className="flex-1 flex justify-between items-center h-full relative border-l border-slate-100 dark:border-zinc-800 pl-2">
              {/* Center baseline 0 line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-slate-200 dark:bg-zinc-700" />

              {[
                { month: "Jan", rev: 10, exp: 20 },
                { month: "Feb", rev: 35, exp: 35 },
                { month: "Mar", rev: 32, exp: 30 },
                { month: "Apr", rev: 25, exp: 20 },
                { month: "May", rev: 28, exp: 36 },
                { month: "Jun", rev: 25, exp: 38 },
                { month: "Jul", rev: 38, exp: 40 },
                { month: "Aug", rev: 26, exp: 28 },
                { month: "Sep", rev: 32, exp: 30 },
                { month: "Oct", rev: 12, exp: 16 },
                { month: "Nov", rev: 10, exp: 12 },
                { month: "Dec", rev: 30, exp: 28 },
              ].map((item) => (
                <div key={item.month} className="flex flex-col items-center justify-between h-full z-10">
                  {/* Revenue bar (above 0, Teal) */}
                  <div className="flex-1 flex items-end justify-center w-3">
                    <div
                      className="w-2.5 bg-teal-500 rounded-t-sm"
                      style={{ height: `${item.rev}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 py-1">{item.month}</span>
                  {/* Expense bar (below 0, Orange) */}
                  <div className="flex-1 flex items-start justify-center w-3">
                    <div
                      className="w-2.5 bg-orange-500 rounded-b-sm"
                      style={{ height: `${item.exp}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            </div>
            <Link href="/coming-soon?feature=transactions" className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white underline">
              View All
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-4 mt-3 border-b border-slate-100 dark:border-zinc-800 text-xs font-semibold">
            {(["Sale", "Purchase", "Quotation", "Expenses", "Invoices"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTxTab(tab)}
                className={`pb-2 transition-colors relative ${activeTxTab === tab
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Transaction Table */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 dark:text-zinc-500 font-semibold border-b border-slate-100 dark:border-zinc-800">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {RECENT_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 text-slate-500 dark:text-zinc-400">{tx.date}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tx.avatar}
                          alt={tx.customer}
                          className="h-7 w-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-zinc-200">{tx.customer}</div>
                          <div className="text-[10px] text-slate-400">{tx.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.statusColor}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      {tx.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 8. Bottom Row: Top Customers + Top Categories + Order Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Customers</h3>
            </div>
            <Link href="/coming-soon?feature=customers" className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 mt-2">
            {TOP_CUSTOMERS.map((cust, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={cust.avatar}
                    alt={cust.name}
                    className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{cust.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      {cust.country} • {cust.orders}
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs font-extrabold text-slate-900 dark:text-white">
                  {cust.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Categories</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <span>Weekly</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Donut Chart & Breakdown */}
          <div className="mt-4 flex items-center justify-between gap-4">
            {/* Donut Chart */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#fed7aa]"
                  strokeDasharray="50, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-500"
                  strokeDasharray="24, 100"
                  strokeDashoffset="-50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray="16, 100"
                  strokeDashoffset="-74"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-800 dark:text-zinc-100">
                50%
              </span>
            </div>

            {/* Sales breakdown */}
            <div className="space-y-3 text-xs flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Electronics</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  698 <span className="text-[11px] font-normal text-slate-400">Sales</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>Sports</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  545 <span className="text-[11px] font-normal text-slate-400">Sales</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-[#fed7aa]" />
                  <span>Lifestyles</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  456 <span className="text-[11px] font-normal text-slate-400">Sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Statistics Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-1.5">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Category Statistics
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Total Number Of Categories
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">698</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Total Number Of Products
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">7899</span>
            </div>
          </div>
        </div>

        {/* Order Statistics Heatmap Grid */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Order Statistics</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800"
            >
              <span>Weekly</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Matrix Heatmap */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2 pl-8">
              {HEATMAP_DAYS.map((d) => (
                <span key={d} className="flex-1 text-center text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                  {d}
                </span>
              ))}
            </div>

            <div className="space-y-1.5">
              {HEATMAP_HOURS.map((hr, rowIdx) => (
                <div key={hr} className="flex items-center gap-2">
                  <span className="w-8 text-[10px] text-slate-400 dark:text-zinc-500 text-right shrink-0">
                    {hr}
                  </span>
                  <div className="flex-1 flex items-center gap-1.5">
                    {HEATMAP_DAYS.map((_, colIdx) => {
                      const val = HEATMAP_VALUES[rowIdx]?.[colIdx] ?? 0;
                      // Determine background color based on intensity val
                      let bgClass = "bg-orange-50/80 dark:bg-orange-950/20";
                      if (val === 1) bgClass = "bg-[#ffedd5] dark:bg-orange-900/30";
                      if (val === 2) bgClass = "bg-[#fed7aa] dark:bg-orange-800/40";
                      if (val === 3) bgClass = "bg-orange-500";
                      if (val === 4) bgClass = "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"; // Tooltip cell

                      return (
                        <div
                          key={colIdx}
                          className={`h-4.5 flex-1 rounded-sm ${bgClass} transition-colors flex items-center justify-center relative group cursor-pointer`}
                        >
                          {val === 4 ? (
                            <span className="text-[8px] font-bold px-1 whitespace-nowrap">
                              297 Orders
                            </span>
                          ) : (
                            <div className="hidden group-hover:flex absolute -top-6 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20 pointer-events-none">
                              {val * 75 + 20} Orders
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Peak Activity: Wednesday 12:00 PM</span>
            <span className="font-semibold text-orange-500">297 peak orders</span>
          </div>
        </div>
      </div>

      {/* 9. DreamsPOS Footer */}
      <footer className="pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 dark:text-zinc-500">
        <div>2014-2025 © DreamsPOS. All Right Reserved</div>
        <div>Designed &amp; Developed By <strong className="font-semibold text-slate-700 dark:text-zinc-300">Dreams</strong></div>
      </footer>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl bg-slate-900/5 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl w-full">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Metrics Row Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 space-y-3 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BusinessDashboardContent />
    </Suspense>
  );
}
