"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  Home,
  CreditCard,
  ShieldCheck,
  Crown,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header / Brand */}
      <header className="px-6 py-5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between relative z-10 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25 font-bold text-sm">
            SP
          </div>
          <span className="font-bold text-base tracking-tight">
            Smart<span className="text-blue-600 dark:text-blue-400">POS</span>
          </span>
        </Link>

        <Link
          href="/admin/dashboard"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Center 404 Hero Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 my-auto">
        <div className="max-w-xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <Compass className="h-3.5 w-3.5 animate-spin-slow text-blue-600 dark:text-blue-400" />
            <span>Error 404 • Destination Not Found</span>
          </div>

          {/* Large stylized 404 numeral */}
          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-zinc-900 dark:text-white mb-2 select-none">
            4<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500">0</span>4
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
            Lost in digital space?
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto mb-8">
            The page you are trying to reach doesn&apos;t exist, has been relocated, or is temporarily unavailable.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>

            <Link href="/admin/dashboard">
              <Button
                variant="primary"
                size="md"
                leftIcon={<LayoutDashboard className="h-4 w-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Home className="h-4 w-4" />}
              >
                Home
              </Button>
            </Link>
          </div>

          {/* Quick links grid */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm backdrop-blur-sm text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Popular Quick Links
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 font-medium group"
              >
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</div>
                  <div className="text-[11px] text-zinc-500">Business overview & metrics</div>
                </div>
              </Link>

              <Link
                href="/pos"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 font-medium group"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">POS Terminal</div>
                  <div className="text-[11px] text-zinc-500">Cashier sales & checkout</div>
                </div>
              </Link>

              <Link
                href="/admin/roles"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 font-medium group"
              >
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Roles & RBAC</div>
                  <div className="text-[11px] text-zinc-500">Access control & permissions</div>
                </div>
              </Link>

              <Link
                href="/owner"
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 font-medium group"
              >
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Owner Portal</div>
                  <div className="text-[11px] text-zinc-500">Global enterprise controls</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-zinc-200/60 dark:border-zinc-800/60 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between relative z-10">
        <span>&copy; {new Date().getFullYear()} SmartPOS System. All rights reserved.</span>
        <a
          href="mailto:support@smartpos.local"
          className="hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Contact Support</span>
        </a>
      </footer>
    </div>
  );
}
