"use client";

import React, { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Role, UpdateRoleRequest } from "@/types";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => Promise<void>;
}

export function EditRoleModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: EditRoleModalProps) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name || "");
      setCode(role.code || "");
      setError(null);
    }
  }, [role]);

  if (!role) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Role name is required.");
      return;
    }
    if (!code.trim()) {
      setError("Role code is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: UpdateRoleRequest = {
        name: name.trim(),
        code: code.trim().toLowerCase(),
      };

      await apiClient.put(`/roles/${role.uuid}`, payload);

      toast.success(`Role "${name}" updated successfully.`);
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to update role details.";
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
      title="Edit Role Details"
      description={`Update configuration for ${role.name}`}
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
            form="edit-role-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Role
          </Button>
        </div>
      }
    >
      <form id="edit-role-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {role.is_system && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs">
            <strong>System Template:</strong> This is a core system role. Updating the code might affect role-based redirects and permissions checks.
          </div>
        )}

        <TextInput
          id="edit-role-name"
          label="Role Display Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextInput
          id="edit-role-code"
          label="Role Code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          className="font-mono text-xs"
        />
      </form>
    </Modal>
  );
}
