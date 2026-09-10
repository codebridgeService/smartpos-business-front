"use client";

import React, { useState } from "react";
import { Plus, Shield, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useBusiness } from "@/context/business-context";
import { apiClient } from "@/lib/api";
import type { Role, StoreRoleRequest } from "@/types";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function CreateRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRoleModalProps) {
  const toast = useToast();
  const { businesses, activeBusiness } = useBusiness();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [businessUuid, setBusinessUuid] = useState(activeBusiness?.uuid || "");
  const [isSystem, setIsSystem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCode("");
    setBusinessUuid(activeBusiness?.uuid || "");
    setIsSystem(false);
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-suggest code from name if user hasn't typed a custom code
    if (!code || code === name.toLowerCase().replace(/[^a-z0-9]/g, "_")) {
      setCode(val.toLowerCase().trim().replace(/[^a-z0-9]/g, "_"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }

    if (!code.trim()) {
      setError("Role code is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: StoreRoleRequest = {
        name: name.trim(),
        code: code.trim().toLowerCase(),
        business_uuid: businessUuid || null,
        is_system: isSystem,
      };

      await apiClient.post<Role>("/roles", payload);

      toast.success(`Role "${name}" created successfully!`);
      await onSuccess();
      handleClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to create role. Please verify role code uniqueness.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessOptions = [
    { value: "", label: "Global Role Template (No specific business)" },
    ...businesses.map((b) => ({ value: b.uuid, label: b.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Role"
      description="Create a role template or custom business role with tailored access privileges."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
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
            form="create-role-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<Shield className="h-4 w-4" />}
          >
            Create Role
          </Button>
        </div>
      }
    >
      <form id="create-role-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <TextInput
          id="role-name"
          label="Role Display Name"
          placeholder="e.g. Shift Supervisor"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />

        <TextInput
          id="role-code"
          label="Role Code (Identifier)"
          placeholder="e.g. shift_supervisor"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          helperText="Unique lowercase identifier used for programmatic checks."
          className="font-mono text-xs"
        />

        <Select
          id="role-business"
          label="Store / Business Scope"
          value={businessUuid}
          onChange={(e) => setBusinessUuid(e.target.value)}
          options={businessOptions}
          helperText="Select a store to scope this role exclusively to that business."
        />
      </form>
    </Modal>
  );
}
