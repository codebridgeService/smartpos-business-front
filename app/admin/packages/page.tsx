"use client";

import React, { useState } from "react";
import {
  Package,
  Check,
  Plus,
  Edit2,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface PlanPackage {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  subscribers: number;
  features: string[];
}

const PACKAGES: PlanPackage[] = [
  {
    id: "pkg-basic",
    name: "Basic Starter",
    monthlyPrice: 29,
    annualPrice: 24,
    subscribers: 284,
    features: [
      "Up to 2 Outlets / Branches",
      "2 Active Cash Registers",
      "5 Staff Logins",
      "Real-time Inventory Tracking",
      "Standard Sales Reports",
      "Community & Email Support",
    ],
  },
  {
    id: "pkg-advanced",
    name: "Advanced Pro",
    monthlyPrice: 79,
    annualPrice: 65,
    popular: true,
    subscribers: 395,
    features: [
      "Up to 6 Outlets / Branches",
      "Unlimited Cash Registers",
      "25 Staff Logins with RBAC",
      "Multi-Warehouse Management",
      "Advanced Analytics & Trends",
      "Barcode & QR Code Printing",
      "Custom Receipts & Tax Profiles",
      "Priority 24/7 Chat Support",
    ],
  },
  {
    id: "pkg-enterprise",
    name: "Enterprise Multi-Store",
    monthlyPrice: 199,
    annualPrice: 169,
    subscribers: 145,
    features: [
      "Unlimited Outlets & Warehouses",
      "Unlimited Staff & Cash Registers",
      "Custom Domain & SSL Provisioning",
      "Dedicated Database & SLA 99.9%",
      "Custom API & ERP Integrations",
      "Automated Daily Offsite Backups",
      "Dedicated Account Manager",
    ],
  },
];

export default function PackagesPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Package className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Subscription Packages & Pricing
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Configure tiered plans, features, pricing models, and subscriber quotas
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Billing Switch */}
      <div className="flex justify-center my-6">
        <div className="inline-flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => {
          const price = billingCycle === "monthly" ? pkg.monthlyPrice : pkg.annualPrice;
          return (
            <div
              key={pkg.id}
              className={`relative bg-white dark:bg-zinc-900 rounded-3xl border transition-all flex flex-col justify-between ${
                pkg.popular
                  ? "border-orange-500 shadow-xl shadow-orange-500/10 dark:border-orange-500"
                  : "border-slate-200/80 dark:border-zinc-800 shadow-sm"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-bold rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Most Popular</span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${price}</span>
                  <span className="text-xs text-slate-400">/ outlet / mo</span>
                </div>

                <div className="mt-2 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-orange-500" />
                  <span>{pkg.subscribers} businesses subscribed</span>
                </div>

                <div className="mt-6 border-t border-slate-150 dark:border-zinc-800 pt-5 space-y-2.5">
                  {pkg.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-zinc-300">
                      <span className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    pkg.popular
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200"
                  }`}
                >
                  Edit Package Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
