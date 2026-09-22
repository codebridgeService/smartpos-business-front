import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle";
import { AlertCircle, Calculator } from "lucide-react";
import { useRegisterStore } from "@/stores/useRegisterStore";
import type { CreateRegisterRequest } from "@/lib/api/registers";

interface CreateRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  outletUuid: string;
}

export function CreateRegisterModal({
  isOpen,
  onClose,
  outletUuid,
}: CreateRegisterModalProps) {
  const { createRegister } = useRegisterStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultCash, setDefaultCash] = useState("0.00");
  const [printerName, setPrinterName] = useState("");
  const [drawerConnected, setDrawerConnected] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const data: CreateRegisterRequest = {
        code,
        name,
        description,
        default_cash_amount: defaultCash,
        receipt_printer_name: printerName,
        is_cash_drawer_connected: drawerConnected,
      };

      await createRegister(outletUuid, data);
      
      // Reset form on success
      setCode("");
      setName("");
      setDescription("");
      setDefaultCash("0.00");
      setPrinterName("");
      setDrawerConnected(false);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create register");
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
          <Calculator className="h-5 w-5 text-primary" />
          Create Register
        </div>
      }
      description="Add a new physical or virtual cash register to this outlet."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !code || !name}>
            {isSubmitting ? "Creating..." : "Create Register"}
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

        <form id="create-register-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="code"
              label="Code"
              placeholder="e.g. REG-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <TextInput
              id="name"
              label="Name"
              placeholder="e.g. Main Counter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="w-full">
            <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              className="w-full rounded-xl border bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              placeholder="Location or purpose"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <TextInput
            id="defaultCash"
            label="Default Opening Cash Float"
            type="number"
            step="0.01"
            min="0"
            value={defaultCash}
            onChange={(e) => setDefaultCash(e.target.value)}
            helperText="The standard amount of cash in the drawer at shift start."
          />

          <TextInput
            id="printerName"
            label="Receipt Printer Name / IP"
            placeholder="e.g. EPSON TM-T88VI or 192.168.1.100"
            value={printerName}
            onChange={(e) => setPrinterName(e.target.value)}
          />

          <div className="p-3 border border-border rounded-lg bg-muted/30">
            <ToggleSwitch
              checked={drawerConnected}
              onChange={setDrawerConnected}
              label="Cash Drawer Connected"
              description="Enable if a physical drawer is attached to this register."
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
