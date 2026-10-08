"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useDeleteUnitMutation } from "@/lib/react-query/hooks/use-units";
import { type Unit } from "@/lib/api/units";
import { Button } from "@/components/ui/button";

export interface DeleteUnitModalProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUnitModal({ unit, isOpen, onClose, onSuccess }: DeleteUnitModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const deleteMutation = useDeleteUnitMutation();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !deleteMutation?.isPending) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, deleteMutation?.isPending]);

  if (!isOpen || !mounted || !unit) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        idOrUuid: unit.id || unit.uuid,
        uuid: unit.uuid,
        businessUuid: unit.business_uuid,
      });

      toast.success(`Unit "${unit.name}" has been removed.`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message || err?.message || "Failed to delete measurement unit.";
      toast.error(apiMsg);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleteMutation.isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-unit-title"
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2
              id="delete-unit-title"
              className="text-lg font-bold text-slate-900 dark:text-zinc-100"
            >
              Delete Measurement Unit
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800 dark:text-zinc-200">"{unit.name}"</strong> (
              <span className="font-mono">{unit.symbol}</span>)?
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-left text-xs text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-0.5">Note on Product Dependencies</p>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              Deleting this unit will prevent new products from selecting it. Products currently using this unit should be re-assigned first.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-zinc-800/30">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm shadow-rose-600/25 cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Unit</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
