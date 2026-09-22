"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { useDrawerStore } from "@/stores/useDrawerStore";
import { useToast } from "@/components/ui/toast";
import type { CashMovementType } from "@/types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Wallet,
  Coins,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface RecordCashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MOVEMENT_TYPES: {
  type: CashMovementType;
  label: string;
  description: string;
  direction: "in" | "out";
  icon: any;
  color: string;
}[] = [
  {
    type: "cash_in",
    label: "Cash In (Add Float)",
    description: "Add extra working cash float to drawer",
    direction: "in",
    icon: ArrowDownLeft,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    type: "cash_out",
    label: "Cash Out (Skim / Drop)",
    description: "Remove excess cash to safe or bank",
    direction: "out",
    icon: ArrowUpRight,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    type: "payout",
    label: "Payout (Expense)",
    description: "Pay for petty cash expense, delivery, supplies",
    direction: "out",
    icon: Receipt,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
  {
    type: "deposit",
    label: "Deposit",
    description: "Deposit funds into register float",
    direction: "in",
    icon: Wallet,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  {
    type: "adjustment",
    label: "Float Adjustment",
    description: "Audit correction for float discrepancy",
    direction: "in",
    icon: Coins,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
];

const QUICK_AMOUNTS = [10, 20, 50, 100, 200];

export function RecordCashMovementModal({
  isOpen,
  onClose,
  onSuccess,
}: RecordCashMovementModalProps) {
  const { recordMovement, isSubmittingMovement, activeDrawer } = useDrawerStore();
  const toast = useToast();

  const [movementType, setMovementType] = useState<CashMovementType>("cash_in");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const currentTypeConfig = MOVEMENT_TYPES.find((t) => t.type === movementType) || MOVEMENT_TYPES[0];

  const handleQuickAdd = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError("Please enter a valid positive cash amount.");
      return;
    }

    // Cash-out check: verify not taking more than available cash
    if (currentTypeConfig.direction === "out" && activeDrawer?.expected_amount) {
      const currentExpected = parseFloat(activeDrawer.expected_amount);
      if (numAmount > currentExpected) {
        setValidationError(
          `Warning: Cash out ($${numAmount.toFixed(2)}) exceeds current expected drawer balance ($${currentExpected.toFixed(2)}).`
        );
        return;
      }
    }

    try {
      await recordMovement({
        type: movementType,
        amount: numAmount.toFixed(2),
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      toast.success(
        `Cash Movement Recorded: Successfully logged ${currentTypeConfig.label} of $${numAmount.toFixed(2)}`
      );

      // Reset form
      setAmount("");
      setReason("");
      setNotes("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setValidationError(err.message || "Failed to record cash movement");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Cash Movement"
      description="Record cash entering or leaving the register drawer."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {validationError && (
          <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Movement Type Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Movement Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {MOVEMENT_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = movementType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setMovementType(t.type)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? `${t.color} ring-2 ring-orange-500/20 shadow-xs`
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300">
                      {t.direction === "in" ? "+ Cash In" : "- Cash Out"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{t.label}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Amount ($ USD) <span className="text-rose-500">*</span>
            </label>
            {activeDrawer?.expected_amount && (
              <span className="text-xs text-zinc-500">
                Current Drawer Balance:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  ${parseFloat(activeDrawer.expected_amount).toFixed(2)}
                </strong>
              </span>
            )}
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-lg font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              required
              autoFocus
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
              >
                +${val}
              </button>
            ))}
            {amount && (
              <button
                type="button"
                onClick={() => setAmount("")}
                className="px-2.5 py-1 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-400 hover:text-rose-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 3. Reason & Reference Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Reason / Category
            </label>
            <input
              type="text"
              placeholder="e.g. Office Supplies, Morning Float Top-up"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Reference / Invoice #
            </label>
            <input
              type="text"
              placeholder="e.g. REC-84920, Safe Bag #4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmittingMovement}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmittingMovement || !amount}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5"
          >
            {isSubmittingMovement ? "Recording..." : `Confirm ${currentTypeConfig.label}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
