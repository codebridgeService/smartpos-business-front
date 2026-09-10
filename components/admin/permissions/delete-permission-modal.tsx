"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Permission } from "@/types";

interface DeletePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSuccess: () => Promise<void>;
}

export function DeletePermissionModal({
  isOpen,
  onClose,
  permission,
  onSuccess,
}: DeletePermissionModalProps) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!permission) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`/permissions/${permission.uuid}`);
      toast.success(`Permission "${permission.code}" deleted successfully.`);
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to delete permission.";
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
      title="Delete Permission"
      description={`Are you sure you want to permanently delete permission "${permission.name}"?`}
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
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Permission
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Any custom roles currently assigned to <strong className="font-mono">{permission.code}</strong> will lose access to this feature immediately.
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
