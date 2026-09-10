"use client";

import React, { useState, useEffect } from "react";
import { Edit3, AlertCircle, Save } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Permission, UpdatePermissionRequest } from "@/types";

interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
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

export function EditPermissionModal({
  isOpen,
  onClose,
  permission,
  onSuccess,
}: EditPermissionModalProps) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [module, setModule] = useState("inventory");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permission) {
      setName(permission.name || "");
      setModule(permission.module || "inventory");
      setDescription(permission.description || "");
      setError(null);
    }
  }, [permission]);

  if (!permission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: UpdatePermissionRequest = {
        name: name.trim(),
        module: module.trim().toLowerCase(),
        description: description.trim() || null,
      };

      await apiClient.put(`/permissions/${permission.uuid}`, payload);

      toast.success(`Permission "${name}" updated successfully.`);
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to update permission details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Edit Permission"
      description={`Modify authorization metadata for ${permission.code}`}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-permission-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form id="edit-permission-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Readonly Code */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Permission Code (Key)
          </label>
          <input
            type="text"
            readOnly
            value={permission.code}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/60 px-3.5 py-2.5 text-xs font-mono text-zinc-500 select-all cursor-not-allowed"
          />
        </div>

        <TextInput
          id="edit-perm-name"
          label="Display Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. View Products"
        />

        <Select
          id="edit-perm-module"
          label="Module Scope"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          options={MODULE_OPTIONS}
        />

        <TextInput
          id="edit-perm-description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe which actions this permission authorizes..."
        />
      </form>
    </Modal>
  );
}
