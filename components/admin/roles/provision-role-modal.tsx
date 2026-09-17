"use client";

import React, { useState } from "react";
import { RefreshCw, Building2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useBusiness } from "@/context/business-context";
import { useRoleStore } from "@/stores/useRoleStore";

interface ProvisionRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function ProvisionRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: ProvisionRoleModalProps) {
  const toast = useToast();
  const { businesses, activeBusiness } = useBusiness();
  const { provisionRoles } = useRoleStore();

  const [businessUuid, setBusinessUuid] = useState(
    activeBusiness?.uuid || (businesses.length > 0 ? businesses[0].uuid : "")
  );
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isProvisioning) return;
    setError(null);
    onClose();
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessUuid) {
      setError("Please select a target business.");
      return;
    }

    setIsProvisioning(true);
    setError(null);

    try {
      await provisionRoles(businessUuid);

      const selectedName =
        businesses.find((b) => b.uuid === businessUuid)?.name || "selected store";

      toast.success(`Default roles provisioned successfully for ${selectedName}!`);
      await onSuccess();
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to auto-provision roles.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProvisioning(false);
    }
  };

  const businessOptions = businesses.map((b) => ({
    value: b.uuid,
    label: b.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Auto-Provision Business Roles"
      description="Automatically generate standard operational roles for a business."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isProvisioning}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="provision-roles-form"
            variant="primary"
            size="sm"
            disabled={!businessUuid || isProvisioning}
            isLoading={isProvisioning}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Provision Roles
          </Button>
        </div>
      }
    >
      <form id="provision-roles-form" onSubmit={handleProvision} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <Select
          id="provision-business"
          label="Target Business Store"
          value={businessUuid}
          onChange={(e) => setBusinessUuid(e.target.value)}
          options={businessOptions}
          helperText="Standard templates will be cloned and bound to this business entity."
        />

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-2 text-xs">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Standard Role Templates Generated:
          </p>
          <ul className="space-y-1.5 pl-2 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <strong>Store_Manager:</strong> Full outlet administration, cashier management, cash shifts.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <strong>Cashier:</strong> POS orders checkout, receipt printing, customer lookups.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <strong>Inventory_Clerk:</strong> Stock in/out adjustments, supplier orders, barcode lookup.
            </li>
          </ul>
        </div>
      </form>
    </Modal>
  );
}
