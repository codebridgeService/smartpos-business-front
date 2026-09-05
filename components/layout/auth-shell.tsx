"use client";

import React from "react";
import Link from "next/link";
import { Store } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform duration-200">
            <Store className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Smart<span className="text-blue-600 dark:text-blue-400">POS</span>
            </span>
            <span className="block text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
              Business Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-900/5 p-7 sm:p-8 backdrop-blur-xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>

        <div>{children}</div>

        {footer && <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">{footer}</div>}
      </div>

      {/* Legal / Copyright */}
      <div className="relative z-10 mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} SmartPOS. Secured with End-to-End Encryption.
      </div>
    </div>
  );
}
