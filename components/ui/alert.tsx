"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  const styles = {
    info: {
      container: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200",
      icon: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />,
    },
    success: {
      container: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
    warning: {
      container: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200",
      icon: <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    },
    error: {
      container: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200",
      icon: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    },
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-2xl border p-4 text-sm transition-all ${current.container} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="text-xs sm:text-sm leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
