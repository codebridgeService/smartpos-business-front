"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Business } from "@/types";

interface DeleteBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onConfirm: (uuid: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteBusinessModal({
  isOpen,
  onClose,
  business,
  onConfirm,
  isLoading = false,
}: DeleteBusinessModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!business) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === business.name.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setErrorMessage(null);

    try {
      await onConfirm(business.uuid);
      setConfirmationInput("");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete business.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center">
            <Trash2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Delete Business Tenant
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              Permanent tenant decommissioning
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Caution: This action cannot be reversed</span>
          </div>
          <p className="leading-relaxed text-rose-800 dark:text-rose-300/90">
            Deleting <span className="font-bold underline">{business.name}</span> will immediately
            revoke access to all associated store outlets, cash registers, POS hardware sessions,
            and employee memberships.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            Type <span className="font-bold text-slate-900 dark:text-zinc-100 select-all">"{business.name}"</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={business.name}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-medium"
            autoFocus
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmationInput("");
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!isConfirmed || isLoading}
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isLoading ? "Deleting..." : "Permanently Delete Business"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
