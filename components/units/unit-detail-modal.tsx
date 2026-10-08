"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Scale,
  Code2,
  Calendar,
  CheckCircle2,
  Edit,
  Hash,
  Copy,
  Check,
  Building2,
} from "lucide-react";
import { type Unit } from "@/lib/api/units";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export interface UnitDetailModalProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (unit: Unit) => void;
}

export function UnitDetailModal({ unit, isOpen, onClose, onEdit }: UnitDetailModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || !unit) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-detail-title"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="unit-detail-title"
                className="text-base font-bold text-slate-900 dark:text-zinc-100"
              >
                Measurement Unit Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Detailed parameters and configuration info.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Main Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-zinc-100">
                  {unit.name}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    unit.is_active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60"
                      : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200"
                  }`}
                >
                  {unit.is_active ? "Active in POS" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <span>Code:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                  {unit.code}
                </span>
                <span>•</span>
                <span>Symbol:</span>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                  {unit.symbol}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-400">Precision</div>
              <div className="text-xl font-mono font-black text-slate-800 dark:text-zinc-100">
                {unit.precision ?? 0}
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="text-slate-400 block text-[11px] font-medium">Unit Code</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {unit.code}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="text-slate-400 block text-[11px] font-medium">Symbol</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {unit.symbol}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="text-slate-400 block text-[11px] font-medium">Decimal Places</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {unit.precision} ({unit.precision === 0 ? "Whole" : `1.${"0".repeat(unit.precision)}`})
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <span className="text-slate-400 block text-[11px] font-medium">Status</span>
              <span className={`font-semibold ${unit.is_active ? "text-emerald-600" : "text-slate-500"}`}>
                {unit.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Metadata & Identifiers */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">System ID / UUID</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                  #{unit.id} • {unit.uuid}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(unit.uuid, "UUID")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Copy UUID"
              >
                {copiedKey === "UUID" ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Business Tenant UUID</span>
                <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                  {unit.business_uuid || "N/A"}
                </span>
              </div>
              {unit.business_uuid && (
                <button
                  type="button"
                  onClick={() => handleCopy(unit.business_uuid, "Business UUID")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  title="Copy Business UUID"
                >
                  {copiedKey === "Business UUID" ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
              <div>Created: {formatDate(unit.created_at)}</div>
              <div>Updated: {formatDate(unit.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-800/30">
          <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
            Close
          </Button>

          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onEdit(unit);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm shadow-orange-500/25 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Unit</span>
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
