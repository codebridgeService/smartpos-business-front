"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Building2,
  ShieldCheck,
  AlertCircle,
  Package,
  DollarSign,
  ShoppingCart,
  Users2,
  Layers,
} from "lucide-react";
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
  const [selectedModule, setSelectedModule] = useState<string>("all");
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
      await provisionRoles(businessUuid, selectedModule === "all" ? undefined : selectedModule);

      const selectedName =
        businesses.find((b) => b.uuid === businessUuid)?.name || "selected store";

      const moduleLabel =
        selectedModule === "all"
          ? "All Enterprise Modules"
          : `${selectedModule.toUpperCase()} Module`;

      toast.success(`${moduleLabel} roles provisioned successfully for ${selectedName}!`);
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

  const moduleOptions = [
    { value: "all", label: "All Modules (Full Hierarchical Matrix — 28 Roles)" },
    { value: "inventory", label: "Inventory Module (Inventory Admin + 5 Sub-roles)" },
    { value: "finance", label: "Finance Module (Finance Admin + 9 Sub-roles)" },
    { value: "pos", label: "POS Module (POS Admin + 5 Sub-roles)" },
    { value: "hr", label: "HR Module (HR Admin + 8 Sub-roles)" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Auto-Provision Hierarchical Roles"
      description="Automatically instantiate standard modular roles and granular permissions for a business."
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

        <Select
          id="provision-module"
          label="Module Scope"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          options={moduleOptions}
          helperText="Choose whether to provision the entire matrix or a specific domain."
        />

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-2 text-xs">
          <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Standard Hierarchical Role Packages:
          </p>
          <ul className="space-y-2 pl-1 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-blue-600 dark:text-blue-400">Inventory:</strong> Inventory Admin, Inventory Manager, Warehouse Operator, Planner/Auditor, Purchasing/Procurement, Order Fulfillment.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-rose-600 dark:text-rose-400">Finance:</strong> Finance Admin, Treasury/Cash, Financial Analyst, AR/AP Managers, Auditor, Controller, GL Accountant, AP/AR Clerks.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-emerald-600 dark:text-emerald-400">POS:</strong> POS Admin, Store Manager, Shift Supervisor, Cashier, Stock Clerk, Read-only Reporting Accountant.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Users2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <div>
                <strong className="text-purple-600 dark:text-purple-400">HR:</strong> HR Admin, HR Manager, Payroll Admin, Benefits Admin, Recruiter, People Manager, Compliance Officer, Employee Self-Service.
              </div>
            </li>
          </ul>
        </div>
      </form>
    </Modal>
  );
}
