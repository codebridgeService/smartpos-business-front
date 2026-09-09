"use client";

import React, { useState } from "react";
import { Plus, Trash2, Key, AlertCircle, Layers } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { StorePermissionBatchItem } from "@/types";

interface BatchCreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const MODULE_OPTIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "users", label: "Users & Staff" },
  { value: "roles", label: "Roles & RBAC" },
  { value: "permissions", label: "Permissions" },
  { value: "business", label: "Business & Company" },
  { value: "outlet", label: "Outlets & Branches" },
  { value: "pos", label: "POS & Register" },
  { value: "inventory", label: "Inventory & Products" },
  { value: "orders", label: "Sales & Orders" },
  { value: "reports", label: "Reports & Financials" },
];

export function BatchCreatePermissionModal({
  isOpen,
  onClose,
  onSuccess,
}: BatchCreatePermissionModalProps) {
  const toast = useToast();

  const [items, setItems] = useState<StorePermissionBatchItem[]>([
    { code: "", name: "", module: "inventory", description: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setItems([{ code: "", name: "", module: "inventory", description: "" }]);
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { code: "", name: "", module: "inventory", description: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    field: keyof StorePermissionBatchItem,
    value: string
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.code.trim()) {
        setError(`Row #${i + 1}: Permission code is required.`);
        return;
      }
      if (!item.name.trim()) {
        setError(`Row #${i + 1}: Permission display name is required.`);
        return;
      }
    }

    // Check duplicate codes in payload
    const codes = items.map((it) => it.code.trim().toLowerCase());
    const uniqueCodes = new Set(codes);
    if (uniqueCodes.size !== codes.length) {
      setError("Duplicate permission codes detected in the list.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = items.map((it) => ({
        code: it.code.trim().toLowerCase(),
        name: it.name.trim(),
        module: it.module ? it.module.trim().toLowerCase() : null,
        description: it.description?.trim() || null,
      }));

      await apiClient.post("/permissions", payload);

      toast.success(`Successfully created ${payload.length} permission${payload.length > 1 ? "s" : ""}!`);
      await onSuccess();
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to batch create permissions. Please ensure codes are unique.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Batch Create Permissions"
      description="Define and register multiple authorization permission keys simultaneously."
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            disabled={isSubmitting}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Another Row
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="batch-permission-form"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              leftIcon={<Key className="h-4 w-4" />}
            >
              Create {items.length} Permission{items.length > 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      }
    >
      <form id="batch-permission-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Permission #{idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    title="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextInput
                  id={`perm-code-${idx}`}
                  label="Code (unique key)"
                  placeholder="e.g. inventory.transfer"
                  required
                  value={item.code}
                  onChange={(e) =>
                    handleFieldChange(idx, "code", e.target.value)
                  }
                  className="font-mono text-xs"
                />

                <TextInput
                  id={`perm-name-${idx}`}
                  label="Display Name"
                  placeholder="e.g. Transfer Stock"
                  required
                  value={item.name}
                  onChange={(e) =>
                    handleFieldChange(idx, "name", e.target.value)
                  }
                />

                <Select
                  id={`perm-module-${idx}`}
                  label="Module Scope"
                  value={item.module || "inventory"}
                  onChange={(e) =>
                    handleFieldChange(idx, "module", e.target.value)
                  }
                  options={MODULE_OPTIONS}
                />
              </div>

              <TextInput
                id={`perm-desc-${idx}`}
                label="Description (optional)"
                placeholder="Details on what this capability allows..."
                value={item.description || ""}
                onChange={(e) =>
                  handleFieldChange(idx, "description", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}
