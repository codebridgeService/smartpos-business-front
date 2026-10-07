"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  Search,
  RefreshCw,
  FolderOpen,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  useTrashedCategoriesQuery,
  useRestoreCategoryMutation,
  useForceDeleteCategoryMutation,
} from "@/lib/react-query/hooks/use-categories";
import type { Category } from "@/lib/api/categories";
import { hasPermission, getUserRoleCodes } from "@/lib/utils/roles";

export interface CategoryTrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessUuid?: string;
  onRestored?: (category: Category) => void;
}

export function CategoryTrashModal({
  isOpen,
  onClose,
  businessUuid,
  onRestored,
}: CategoryTrashModalProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Confirmation state for permanent purge
  const [purgingCategory, setPurgingCategory] = useState<Category | null>(null);

  // Security & RBAC permission checks
  const isAdminOrOwner = useMemo(() => {
    const roles = getUserRoleCodes(user);
    return roles.includes("admin") || roles.includes("super_admin") || roles.includes("owner");
  }, [user]);

  const canRestore = useMemo(() => {
    return (
      isAdminOrOwner ||
      hasPermission(user, "categories.delete") ||
      hasPermission(user, "categories.update")
    );
  }, [user, isAdminOrOwner]);

  const canForceDelete = useMemo(() => {
    return isAdminOrOwner || hasPermission(user, "categories.delete");
  }, [user, isAdminOrOwner]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (purgingCategory) {
          setPurgingCategory(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, purgingCategory]);

  // Query Trashed Categories
  const {
    data: trashData,
    isLoading,
    isFetching,
    refetch,
  } = useTrashedCategoriesQuery(
    {
      business_uuid: businessUuid,
      search: search.trim() || undefined,
      page,
      per_page: perPage,
    },
    isOpen
  );

  const restoreMutation = useRestoreCategoryMutation();
  const forceDeleteMutation = useForceDeleteCategoryMutation();

  const trashedItems = trashData?.data || [];
  const meta = trashData?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: trashedItems.length,
  };

  const handleRestore = async (cat: Category) => {
    try {
      const res = await restoreMutation.mutateAsync({
        idOrUuid: cat.uuid || cat.id,
        businessUuid: cat.business_uuid || businessUuid,
      });
      toast.success(`Category "${cat.name}" restored successfully.`);
      if (res.data) {
        onRestored?.(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore category");
    }
  };

  const handleConfirmForceDelete = async () => {
    if (!purgingCategory) return;
    try {
      await forceDeleteMutation.mutateAsync({
        idOrUuid: purgingCategory.uuid || purgingCategory.id,
        businessUuid: purgingCategory.business_uuid || businessUuid,
      });
      toast.success(`Category "${purgingCategory.name}" permanently deleted.`);
      setPurgingCategory(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to permanently delete category");
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Unknown";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !purgingCategory) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-rose-50/40 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                  Category Trash Bin
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  {meta.total} {meta.total === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                View soft-deleted categories. Restore them to catalog or permanently purge them.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Refresh */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search soft-deleted categories by name or code..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl px-3 gap-1.5 text-xs text-slate-600 dark:text-zinc-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="space-y-2.5 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850/50 flex items-center justify-between animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-zinc-700" />
                    <div className="space-y-1.5">
                      <div className="w-32 h-3.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                      <div className="w-20 h-2.5 bg-slate-200 dark:bg-zinc-700 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-16 h-7 bg-slate-200 dark:bg-zinc-700 rounded-lg" />
                    <div className="w-16 h-7 bg-slate-200 dark:bg-zinc-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : trashedItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
                <FolderOpen className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Trash is Empty
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                {search
                  ? "No soft-deleted categories match your search criteria."
                  : "There are currently no soft-deleted categories in the trash bin."}
              </p>
            </div>
          ) : (
            trashedItems.map((cat) => {
              const isRestoringThis =
                restoreMutation.isPending &&
                (restoreMutation.variables?.idOrUuid === cat.uuid ||
                  restoreMutation.variables?.idOrUuid === cat.id);

              return (
                <div
                  key={cat.uuid || cat.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  {/* Category Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-100/70 dark:bg-orange-950/40 text-[#FE9F43] flex items-center justify-center shrink-0 overflow-hidden relative">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <span className="font-bold text-xs uppercase">
                          {cat.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {cat.name}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                          {cat.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-500" />
                          Deleted: {formatDate(cat.deleted_at)}
                        </span>
                        {cat.description && (
                          <span className="hidden md:inline truncate max-w-xs">
                            • {cat.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {canRestore && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleRestore(cat)}
                        disabled={isRestoringThis || forceDeleteMutation.isPending}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 h-8 gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/20"
                      >
                        {isRestoringThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Restore</span>
                      </Button>
                    )}

                    {canForceDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPurgingCategory(cat)}
                        disabled={isRestoringThis || forceDeleteMutation.isPending}
                        className="rounded-xl border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold px-3 py-1.5 h-8 gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div>
            Showing <span className="font-semibold">{trashedItems.length}</span> of{" "}
            <span className="font-semibold">{meta.total}</span> deleted items
          </div>
          {meta.last_page > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 px-2.5 rounded-lg text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="font-medium">
                {page} / {meta.last_page}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="h-7 px-2.5 rounded-lg text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Force Delete Confirmation Dialog */}
      {purgingCategory && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !forceDeleteMutation.isPending) {
              setPurgingCategory(null);
            }
          }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 p-5 border-b border-slate-100 dark:border-zinc-800 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50">
                  Permanently Purge Category?
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  This action is irreversible and permanent.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                You are about to permanently purge category{" "}
                <strong className="text-slate-900 dark:text-zinc-100 font-bold">
                  &quot;{purgingCategory.name}&quot;
                </strong>{" "}
                (<span className="font-mono font-semibold">{purgingCategory.code}</span>).
              </p>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
                <strong>Permanent Removal:</strong> This will completely erase the database record
                and purge any associated images from disk storage. It cannot be recovered later.
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-zinc-900/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPurgingCategory(null)}
                disabled={forceDeleteMutation.isPending}
                className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmForceDelete}
                disabled={forceDeleteMutation.isPending}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
              >
                {forceDeleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Purge</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
