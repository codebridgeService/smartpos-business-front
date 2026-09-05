"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = React.useMemo(
    () => ({
      success: (msg: string, d?: number) => addToast("success", msg, d),
      error: (msg: string, d?: number) => addToast("error", msg, d),
      info: (msg: string, d?: number) => addToast("info", msg, d),
      warning: (msg: string, d?: number) => addToast("warning", msg, d),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg text-sm transition-all animate-in slide-in-from-bottom-2 duration-150"
          >
            {t.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            {t.type === "warning" && (
              <TriangleAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-medium leading-tight mt-0.5">
              {t.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType["toast"] {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
