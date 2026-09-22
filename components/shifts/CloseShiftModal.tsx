import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { AlertCircle, DoorClosed, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { useShiftStore } from "@/stores/useShiftStore";
import type { RegisterSession } from "@/types";

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: RegisterSession;
}

export function CloseShiftModal({
  isOpen,
  onClose,
  shift,
}: CloseShiftModalProps) {
  const { closeShift } = useShiftStore();

  const [closingCash, setClosingCash] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The backend API handles the real expected_cash, but we can show it if we fetch the drawer session,
  // or the backend should return it. Wait, the `shift` object has `expected_cash`?
  // Usually expected cash is calculated on close. If we want a blind close, we don't show it.
  // For now, let's just accept the closing cash.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingCash) return;
    
    setError(null);
    setIsSubmitting(true);

    try {
      await closeShift(shift.id, {
        closing_cash: closingCash,
        notes: notes || null,
      });
      
      setClosingCash("");
      setNotes("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to close shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <DoorClosed className="h-5 w-5 text-destructive" />
          Close Register Shift
        </div>
      }
      description="Count the physical cash in the drawer and enter the total amount to reconcile the shift."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="danger"
            onClick={handleSubmit} 
            disabled={isSubmitting || !closingCash}
          >
            {isSubmitting ? "Closing..." : "Close Shift & Z-Report"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2 mb-4">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form id="close-shift-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg border border-border flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Shift Started</span>
            <span className="font-medium text-foreground">
              {new Date(shift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <TextInput
            id="closingCash"
            label="Actual Cash Count (Closing Float)"
            type="number"
            step="0.01"
            min="0"
            className="text-lg font-medium"
            value={closingCash}
            onChange={(e) => setClosingCash(e.target.value)}
            leftIcon={<span className="text-muted-foreground">$</span>}
            required
            autoFocus
          />

          <div className="w-full">
            <label htmlFor="notes" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              End of Day Notes (Optional)
            </label>
            <textarea
              id="notes"
              className="w-full rounded-xl border bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              placeholder="e.g. Discrepancy due to missed change, or safe drop amount"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
