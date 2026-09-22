import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { AlertCircle, DoorOpen } from "lucide-react";
import { useShiftStore } from "@/stores/useShiftStore";

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCash?: string | number;
}

export function OpenShiftModal({
  isOpen,
  onClose,
  defaultCash = "0.00",
}: OpenShiftModalProps) {
  const { openShift } = useShiftStore();

  const [openingCash, setOpeningCash] = useState(defaultCash.toString());
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await openShift({
        opening_cash: openingCash,
        notes: notes || null,
      });
      
      setOpeningCash(defaultCash.toString());
      setNotes("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to open shift");
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
          <DoorOpen className="h-5 w-5 text-primary" />
          Open Register Shift
        </div>
      }
      description="Declare the starting float in the cash drawer to begin a new sales session."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Opening..." : "Open Shift"}
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

        <form id="open-shift-form" onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            id="openingCash"
            label="Opening Cash Amount"
            type="number"
            step="0.01"
            min="0"
            value={openingCash}
            onChange={(e) => setOpeningCash(e.target.value)}
            leftIcon={<span className="text-muted-foreground">$</span>}
            required
          />

          <div className="w-full">
            <label htmlFor="notes" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              className="w-full rounded-xl border bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              placeholder="e.g. Added extra 50s for change"
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
