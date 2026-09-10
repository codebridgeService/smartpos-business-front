"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Role } from "@/types";

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => Promise<void>;
}

export function DeleteRoleModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: DeleteRoleModalProps) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!role) return null;

  const isSystemRole = Boolean(role.is_system);

  const handleDelete = async () => {
    if (isSystemRole) return;

    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`/roles/${role.uuid}`);
      toast.success(`Role "${role.name}" deleted successfully.`);
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to delete role.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isDeleting && onClose()}
      title={isSystemRole ? "Protected System Role" : "Delete Custom Role"}
      description={
        isSystemRole
          ? "System roles cannot be removed as they are essential to system operations."
          : `Are you sure you want to permanently delete role "${role.name}"?`
      }
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            {isSystemRole ? "Close" : "Cancel"}
          </Button>
          {!isSystemRole && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Role
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        {isSystemRole ? (
          /* System Role Prevention Banner */
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              Deletion Blocked: System Protected
            </div>
            <p>
              <strong className="font-semibold">{role.name}</strong> (<code className="font-mono text-[11px]">{role.code}</code>) is marked as a core system role (<code className="font-mono text-[11px]">is_system = true</code>).
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Core system roles are essential for role auto-provisioning and built-in permission matrices. Deletion is blocked to prevent accidental system lockouts.
            </p>
          </div>
        ) : (
          /* Custom Role Deletion Warning */
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Destructive Action:</p>
              <p>
                Deleting this custom role will detach it from all assigned users and revokes all attached role permissions immediately.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
