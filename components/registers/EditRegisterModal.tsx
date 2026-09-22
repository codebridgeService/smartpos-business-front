import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { ToggleSwitch } from "@/components/ui/toggle";
import { AlertCircle, Edit3 } from "lucide-react";
import { useRegisterStore } from "@/stores/useRegisterStore";
import type { Register } from "@/types";
import type { UpdateRegisterRequest } from "@/lib/api/registers";

interface EditRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: Register | null;
}

export function EditRegisterModal({
  isOpen,
  onClose,
  register,
}: EditRegisterModalProps) {
  const { updateRegister } = useRegisterStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [defaultCash, setDefaultCash] = useState("0.00");
  const [printerName, setPrinterName] = useState("");
  const [drawerConnected, setDrawerConnected] = useState(false);
  const [isActive, setIsActive] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (register) {
      setCode(register.code || "");
      setName(register.name || "");
      setDescription(register.description || "");
      setDefaultCash(register.default_cash_amount || "0.00");
      setPrinterName(register.receipt_printer_name || "");
      setDrawerConnected(register.is_cash_drawer_connected || false);
      setIsActive(register.status === "active");
    }
  }, [register]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!register) return;
    
    setError(null);
    setIsSubmitting(true);

    try {
      const data: UpdateRegisterRequest = {
        code,
        name,
        description,
        default_cash_amount: defaultCash,
        receipt_printer_name: printerName,
        is_cash_drawer_connected: drawerConnected,
        status: isActive ? "active" : "inactive",
      };

      await updateRegister(register.uuid, data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update register");
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
          <Edit3 className="h-5 w-5 text-primary" />
          Edit Register
        </div>
      }
      description="Modify register details and hardware settings."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !code || !name}>
            {isSubmitting ? "Saving..." : "Save Changes"}
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

        <form id="edit-register-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              id="edit-code"
              label="Code"
              placeholder="e.g. REG-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <TextInput
              id="edit-name"
              label="Name"
              placeholder="e.g. Main Counter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="w-full">
            <label htmlFor="edit-description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              id="edit-description"
              className="w-full rounded-xl border bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed"
              placeholder="Location or purpose"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <TextInput
            id="edit-defaultCash"
            label="Default Opening Cash Float"
            type="number"
            step="0.01"
            min="0"
            value={defaultCash}
            onChange={(e) => setDefaultCash(e.target.value)}
          />

          <TextInput
            id="edit-printerName"
            label="Receipt Printer Name / IP"
            placeholder="e.g. EPSON TM-T88VI or 192.168.1.100"
            value={printerName}
            onChange={(e) => setPrinterName(e.target.value)}
          />

          <div className="space-y-3">
            <div className="p-3 border border-border rounded-lg bg-muted/30">
              <ToggleSwitch
                checked={drawerConnected}
                onChange={setDrawerConnected}
                label="Cash Drawer Connected"
              />
            </div>

            <div className="p-3 border border-border rounded-lg bg-muted/30">
              <ToggleSwitch
                checked={isActive}
                onChange={setIsActive}
                label="Active Status"
                description="Inactive registers cannot be assigned to shifts."
              />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
