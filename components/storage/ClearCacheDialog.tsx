"use client";

import React from "react";
import { Trash2, ShieldCheck, RefreshCw, HardDrive, Check, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/storage/storage-policy";

interface ClearCacheDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearing: boolean;
  targetBytes: number;
  categoryNames?: string[];
}

export function ClearCacheDialog({
  isOpen,
  onClose,
  onConfirm,
  isClearing,
  targetBytes,
  categoryNames,
}: ClearCacheDialogProps) {
  const isSelective = categoryNames && categoryNames.length > 0;
  const targetLabel = isSelective
    ? categoryNames.join(", ")
    : "All Safe Browser Cache";

  return (
    <Modal
      isOpen={isOpen}
      onClose={isClearing ? () => {} : onClose}
      size="md"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
              {isSelective ? "Clear Selected Cache?" : "Clear Entire Cache?"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
              Free up device storage safely without losing offline sales
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isClearing}
            className="rounded-xl px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isClearing}
            className="rounded-xl px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            {isClearing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Clear Cache ({formatBytes(targetBytes)})</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Metric Callout Card */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">
                Target Category
              </span>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block capitalize">
                {targetLabel}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block">
              Space to Free
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 inline-block">
              {formatBytes(targetBytes)}
            </span>
          </div>
        </div>

        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {isSelective
            ? `Cached temporary files for ${categoryNames?.join(", ")} will be removed from this browser. Fresh records will re-sync automatically from the server on your next view.`
            : `All clearable browser cache will be deleted. The SmartPOS app will automatically re-download fresh catalog data when requested.`}
        </p>

        {/* Protected items guarantee badge card */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Zero Data Loss Protection</span>
          </div>

          <p className="text-[11px] text-emerald-900/80 dark:text-emerald-400/90 leading-normal">
            The following vital business and session data will <strong className="font-semibold text-emerald-950 dark:text-emerald-200">never be removed</strong>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Pending offline sales & queue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Offline cash register ledger</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Authenticated user session</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Hardware device UUID</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
