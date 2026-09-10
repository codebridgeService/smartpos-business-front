"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 mb-5 border border-rose-500/30">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold mb-2">Critical Application Error</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            A critical system error prevented the root application layout from loading.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-500 mb-6 p-2 rounded bg-slate-950 border border-slate-800">
              Error Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
