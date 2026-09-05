"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { DashboardShell } from "@/components/layout";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import {
  Store,
  CreditCard,
  History,
  Building2,
  Users,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CircleDollarSign,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { activeBusiness, settings } = useBusiness();
  const { activeOutlet } = useOutlet();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 animate-bounce">
            <Store className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Connecting to SmartPOS...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show the Modern Landing & Login Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        {/* Landing Top Nav */}
        <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Smart<span className="text-blue-600 dark:text-blue-400">POS</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto">
          <Badge variant="primary" size="md" className="mb-6" dot>
            Enterprise Cloud POS & Retail Engine
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-white">
            Next-Generation Point of Sale &{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
              Business Operations
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Manage multi-outlet businesses, cash registers, cashier shifts, and secure POS hardware
            terminals with real-time audit control.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-48 shadow-lg shadow-blue-600/20" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Access Portal
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-48">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Key Feature Badges */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-left">
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
              <Building2 className="h-5 w-5 text-blue-600 mb-2" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Multi-Tenancy</h4>
              <p className="text-[11px] text-zinc-500 mt-1">Multi-business & branch architecture</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
              <History className="h-5 w-5 text-indigo-600 mb-2" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Shift Lifecycle</h4>
              <p className="text-[11px] text-zinc-500 mt-1">Opening, cash float & drawer audit</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
              <CreditCard className="h-5 w-5 text-emerald-600 mb-2" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Terminal Security</h4>
              <p className="text-[11px] text-zinc-500 mt-1">Hardware lock & PIN authorization</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
              <ShieldCheck className="h-5 w-5 text-amber-600 mb-2" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Granular RBAC</h4>
              <p className="text-[11px] text-zinc-500 mt-1">Role provisioning & permission matrix</p>
            </div>
          </div>
        </main>

        <footer className="relative z-10 py-6 text-center text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} SmartPOS Business. Live API: smartpos-api.servicefixit.me
        </footer>
      </div>
    );
  }

  // Authenticated State inside DashboardShell
  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 sm:p-8 shadow-xl shadow-blue-600/15">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-md mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Portal Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                You are currently managing{" "}
                <span className="font-semibold text-white">
                  {activeBusiness?.name || "your business"}
                </span>{" "}
                at outlet{" "}
                <span className="font-semibold text-white">
                  {activeOutlet?.name || "Main Store"}
                </span>
                .
              </p>
            </div>

            <Link href="/pos">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-md font-semibold"
                leftIcon={<CreditCard className="h-4 w-4" />}
              >
                Launch POS Terminal
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Active Business Info Card */}
          <Card hoverEffect>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Active Tenant
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {activeBusiness?.name || "No Business Selected"}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">Code: {activeBusiness?.code || "N/A"}</p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Currency:</span>
                <Badge variant="neutral" size="sm">
                  {activeBusiness?.default_currency || "USD"} ({activeBusiness?.currency_symbol || "$"})
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Active Store Branch Card */}
          <Card hoverEffect>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Active Outlet
              </CardTitle>
              <MapPin className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {activeOutlet?.name || "Select Store Branch"}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{activeOutlet?.address || "No address specified"}</p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Status:</span>
                <Badge variant={activeOutlet?.is_active ? "success" : "neutral"} size="sm" dot>
                  {activeOutlet?.is_active ? "Open for Sale" : "Offline"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Shift / Register Status Card */}
          <Card hoverEffect>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Shift & Drawer
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Cash Register Ready
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tax: {settings?.default_tax_percent || "0"}% (
                {settings?.tax_enabled ? "Enabled" : "Disabled"})
              </p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                <Link
                  href="/pos/shifts"
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  Manage Shifts
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Grid */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
            Operations & Management
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/pos" className="group">
              <Card hoverEffect className="h-full group-hover:border-blue-500/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                    POS Terminal
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Process sales transactions, apply discounts & print receipts.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/pos/shifts" className="group">
              <Card hoverEffect className="h-full group-hover:border-blue-500/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <History className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                    Shifts & Registers
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Open/close shifts, count cash float & track variance.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/businesses/outlets" className="group">
              <Card hoverEffect className="h-full group-hover:border-blue-500/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                    Outlets & Branches
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Configure store locations, tax rates & POS hardware.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/businesses/staff" className="group">
              <Card hoverEffect className="h-full group-hover:border-blue-500/50">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                    Staff & Access
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Manage business employees, cashier profiles & PINs.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
