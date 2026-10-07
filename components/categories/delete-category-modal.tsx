"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useDeleteCategoryMutation } from "@/lib/react-query/hooks/use-categories";
import type { Category } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";

export interface DeleteCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteCategoryModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCategoryModalProps) {
  const toast = useToast();
  const deleteMutation = useDeleteCategoryMutation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;
  if (!mounted && typeof window === "undefined") return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        idOrUuid: category.uuid || category.id,
        businessUuid: category.business_uuid,
      });

      toast.success(`Category "${category.name}" deleted successfully.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete category. Please try again.");
    }
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Delete Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Confirm removal of category from catalog
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
            Are you sure you want to delete category{" "}
            <strong className="text-slate-900 dark:text-zinc-100 font-bold">
              &quot;{category.name}&quot;
            </strong>{" "}
            (<span className="font-mono font-semibold">{category.code}</span>)?
          </p>

          {category.children && category.children.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
              <strong>Warning:</strong> This category contains{" "}
              {category.children.length} subcategory/subcategories. Deleting it may detach or impact its child categories.
            </div>
          )}

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
            This will remove the category from catalog searches, product categorization, and local offline cache.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-zinc-900/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Category</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
