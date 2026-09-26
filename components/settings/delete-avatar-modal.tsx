"use client";

import React, { useState, useEffect } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils/image";
import type { User } from "@/types";

interface DeleteAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => Promise<void>;
}

export function DeleteAvatarModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: DeleteAvatarModalProps) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const avatarSrc = getAvatarUrl(user.avatar_url, user.avatar);

  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  const handleDelete = async () => {
    if (!user.uuid) return;

    setIsDeleting(true);
    setError(null);

    try {
      await apiClient.delete(`/users/${user.uuid}/avatar`);
      toast.success("Profile avatar removed successfully.");
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Failed to delete avatar. Please try again.";
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
      title="Remove Profile Avatar"
      description="Are you sure you want to remove your custom profile avatar? Your avatar will revert to your name initials."
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
            Keep Avatar
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Remove Avatar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="relative">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-red-200 dark:border-red-900/60 bg-zinc-100 dark:bg-zinc-800">
            {avatarSrc && !imageError ? (
              <img
                src={avatarSrc}
                alt={user.name}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-lg text-zinc-500">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-red-600 text-white shadow">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This action will immediately purge the image file from storage and clear your avatar.
        </p>

        {error && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
