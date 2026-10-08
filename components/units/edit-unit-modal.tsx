"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Tag,
  Code2,
  Scale,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Hash,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useUpdateUnitMutation } from "@/lib/react-query/hooks/use-units";
import { type Unit } from "@/lib/api/units";
import { Button } from "@/components/ui/button";

export interface EditUnitModalProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditUnitModal({ unit, isOpen, onClose, onSuccess }: EditUnitModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [precision, setPrecision] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMutation = useUpdateUnitMutation();

  // Populate form when unit changes
  useEffect(() => {
    if (unit && isOpen) {
      setName(unit.name || "");
      setCode(unit.code || "");
      setSymbol(unit.symbol || "");
      setPrecision(unit.precision ?? 0);
      setIsActive(Boolean(unit.is_active));
      setErrors({});
    }
  }, [unit, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !updateMutation?.isPending) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, updateMutation?.isPending]);

  if (!isOpen || !mounted || !unit) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = "Unit name is required.";
    } else if (name.trim().length > 100) {
      errs.name = "Unit name must not exceed 100 characters.";
    }

    if (!code.trim()) {
      errs.code = "Unit code is required.";
    } else if (code.trim().length > 20) {
      errs.code = "Unit code must not exceed 20 characters.";
    }

    if (!symbol.trim()) {
      errs.symbol = "Symbol is required.";
    } else if (symbol.trim().length > 20) {
      errs.symbol = "Symbol must not exceed 20 characters.";
    }

    if (precision < 0 || precision > 6 || !Number.isInteger(precision)) {
      errs.precision = "Precision must be an integer between 0 and 6.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateMutation.mutateAsync({
        idOrUuid: unit.id || unit.uuid,
        data: {
          name: name.trim(),
          code: code.trim(),
          symbol: symbol.trim(),
          precision: Number(precision),
          is_active: isActive,
          business_uuid: unit.business_uuid,
        },
      });

      toast.success(`Unit "${name.trim()}" updated successfully!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message || err?.message || "Failed to update unit";
      toast.error(apiMsg);
      if (err?.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
        }
        setErrors(fieldErrors);
      }
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updateMutation.isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-unit-title"
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
                id="edit-unit-title"
                className="text-base font-bold text-slate-900 dark:text-zinc-100"
              >
                Edit Measurement Unit
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Update naming, code symbol, and decimal precision.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Unit Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Unit Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Kilogram, Piece, Meter, Liter"
              disabled={updateMutation.isPending}
              maxLength={100}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 outline-none transition-all ${
                errors.name
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                  : "border-slate-200 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Code and Symbol Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-400" />
                Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setErrors((prev) => ({ ...prev, code: "" }));
                }}
                placeholder="e.g. KG, PCS, MTR, LTR"
                disabled={updateMutation.isPending}
                maxLength={20}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-850 text-xs font-mono text-slate-800 dark:text-zinc-200 outline-none transition-all ${
                  errors.code
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.code && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.code}
                </p>
              )}
            </div>

            {/* Symbol */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                Symbol <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  setErrors((prev) => ({ ...prev, symbol: "" }));
                }}
                placeholder="e.g. kg, pc, m, L"
                disabled={updateMutation.isPending}
                maxLength={20}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-850 text-xs font-mono text-slate-800 dark:text-zinc-200 outline-none transition-all ${
                  errors.symbol
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                    : "border-slate-200 dark:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                }`}
              />
              {errors.symbol && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.symbol}
                </p>
              )}
            </div>
          </div>

          {/* Decimal Precision */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Decimal Precision (0 - 6)
              </label>
              <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">
                {precision === 0 ? "0 (Integer only)" : `${precision} decimal places`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={precision}
                onChange={(e) => {
                  setPrecision(Number(e.target.value));
                  setErrors((prev) => ({ ...prev, precision: "" }));
                }}
                disabled={updateMutation.isPending}
                className="flex-1 accent-orange-500 cursor-pointer"
              />
              <div className="w-12 text-center py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-mono font-bold text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                {precision}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              Affects how quantities for products using this unit are formatted and rounded.
            </p>
            {errors.precision && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.precision}
              </p>
            )}
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2 flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                Active in POS & Products
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Allow cashiers and inventory staff to select this unit.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              disabled={updateMutation.isPending}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isActive ? "bg-orange-500" : "bg-slate-300 dark:bg-zinc-700"
              }`}
              aria-label="Toggle active status"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-zinc-800/30">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm shadow-orange-500/25 cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Unit...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
