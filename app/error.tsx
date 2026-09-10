"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RotateCcw,
  LayoutDashboard,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log the error to console or error reporting service
    console.error("Application Error Boundary caught error:", error);
  }, [error]);

  const copyErrorDetails = () => {
    const errorText = `SmartPOS Error Report\nMessage: ${error.message}\nDigest: ${error.digest || "N/A"}\nStack: ${error.stack || "N/A"}`;
    navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col justify-between relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-rose-500/10 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
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

      {/* Main Error Box */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 my-auto">
        <div className="max-w-xl w-full text-center">
          {/* Warning Icon Badge */}
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 mb-6 shadow-lg shadow-rose-500/10 animate-bounce-short">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-3">
            Application Exception
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
            Something unexpected occurred
          </h1>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md mx-auto mb-8">
            An unexpected error occurred while rendering this view. Our team has been notified. You can try recovering the session or returning to the dashboard.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Button
              variant="primary"
              size="md"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={() => reset()}
            >
              Try Again
            </Button>

            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="md"
                leftIcon={<LayoutDashboard className="h-4 w-4" />}
              >
                Return to Dashboard
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="md"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>

          {/* Collapsible Error Diagnostic Details */}
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 shadow-sm backdrop-blur-sm text-left overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Technical Diagnostics {error.digest && `(${error.digest})`}
              </span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>

            {showDetails && (
              <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Error Message
                  </span>
                  <button
                    type="button"
                    onClick={copyErrorDetails}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Diagnostic</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="text-xs font-mono p-3 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-900 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed border border-zinc-800">
                  {error.message || "Unknown error occurred."}
                  {error.digest && `\nDigest: ${error.digest}`}
                  {error.stack && `\n\nStack:\n${error.stack}`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-zinc-200/60 dark:border-zinc-800/60 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between relative z-10">
        <span>SmartPOS Resilience &amp; Error Boundary</span>
        <a
          href="mailto:support@smartpos.local"
          className="hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors"
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          <span>Contact Tech Support</span>
        </a>
      </footer>
    </div>
  );
}
