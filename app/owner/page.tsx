"use client";

import React from "react";
import Link from "next/link";
import {
  Crown,
  Building2,
  MapPin,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  ArrowRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  Store,
  Sliders,
  Warehouse,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from "@/components/ui";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const { activeBusiness, settings } = useBusiness();
  const { outlets } = useOutlet();

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-indigo-950 to-zinc-900 text-white p-6 sm:p-8 border border-purple-800/40 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Executive Owner Portal &bull; /owner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, Owner {user?.name}
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm leading-relaxed">
              You hold root ownership privileges over{" "}
              <span className="text-white font-semibold">{activeBusiness?.name || "your enterprise"}</span>.
              Manage fiscal settings, control outlet deployment, monitor business revenue, and oversee
              administrative governance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/pos">
              <Button
                variant="primary"
                size="md"
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20"
                leftIcon={<CreditCard className="h-4 w-4" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Launch POS
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient Light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Business Fiscal & Operational Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Primary Currency</span>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {activeBusiness?.default_currency || "USD"} ({activeBusiness?.currency_symbol || "$"})
            </div>
            <p className="text-xs text-zinc-500 mt-1">Tenant Code: {activeBusiness?.code || "N/A"}</p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Store Branches</span>
              <Store className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {outlets.length} Outlets
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {outlets.filter((o) => o.is_active).length} active for sale
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Tax Configuration</span>
              <Sliders className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {settings?.default_tax_percent || "0"}%
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {settings?.tax_enabled ? "Automatic VAT applied" : "Tax calculations disabled"}
            </p>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Discount Limit</span>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {settings?.allow_discount ? `${settings.max_discount_percent || 100}%` : "Disabled"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Negative stock: {settings?.allow_negative_stock ? "Allowed" : "Blocked"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Owner Quick Controls Grid */}
      <div>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
          Store Owner Master Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/warehouses" className="group">
            <Card hoverEffect className="h-full group-hover:border-purple-500/50">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <Warehouse className="h-5 w-5" />
                </div>
                <CardTitle className="text-base group-hover:text-purple-600 transition-colors">
                  Warehouses & Stock
                </CardTitle>
                <CardDescription className="text-xs">
                  Central storage facilities, stock replenishment, and inventory transfer nodes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400 gap-1 mt-2">
                  <span>Manage Warehouses</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/businesses/outlets" className="group">
            <Card hoverEffect className="h-full group-hover:border-purple-500/50">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <MapPin className="h-5 w-5" />
                </div>
                <CardTitle className="text-base group-hover:text-indigo-600 transition-colors">
                  Branch Outlets & Locations
                </CardTitle>
                <CardDescription className="text-xs">
                  Add new physical retail stores, bind POS terminals, and set outlet addresses.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 gap-1 mt-2">
                  <span>Manage Outlets</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/businesses/staff" className="group">
            <Card hoverEffect className="h-full group-hover:border-purple-500/50">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-base group-hover:text-amber-600 transition-colors">
                  Staff & Employee Access
                </CardTitle>
                <CardDescription className="text-xs">
                  Hire staff members, assign cashier roles, and create 4-6 digit numeric POS PINs.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1 mt-2">
                  <span>Manage Staff Members</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
