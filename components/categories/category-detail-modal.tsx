"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  FolderTree,
  Building2,
  Calendar,
  Code2,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Edit,
} from "lucide-react";
import type { Category } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";

export interface CategoryDetailModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (category: Category) => void;
}

export function CategoryDetailModal({
  category,
  isOpen,
  onClose,
  onEdit,
}: CategoryDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !category || !mounted) return null;

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FE9F43]/10 text-[#FE9F43] flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                {category.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                {category.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Image & Quick Info */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800">
            <div className="w-20 h-20 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden relative shrink-0 flex items-center justify-center">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <FolderTree className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    category.is_active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                      : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  {category.is_active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-slate-400" /> Inactive
                    </>
                  )}
                </span>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Sort: {category.sort_order ?? 0}
                </span>
              </div>

              <div className="text-slate-600 dark:text-zinc-300 text-xs">
                {category.parent ? (
                  <span className="flex items-center gap-1 text-[#FE9F43]">
                    <Layers className="w-3.5 h-3.5" />
                    Subcategory of: <strong>{category.parent.name}</strong>
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-zinc-400">Top-level Category</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
              </span>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 leading-relaxed">
                {category.description}
              </p>
            </div>
          )}

          {/* Children / Subcategories */}
          {category.children && category.children.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-slate-400" /> Subcategories ({category.children.length})
              </span>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 overflow-hidden">
                {category.children.map((child) => (
                  <div key={child.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-3.5 h-3.5 text-[#FE9F43]" />
                      <span className="font-medium text-slate-800 dark:text-zinc-200">
                        {child.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">({child.code})</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        child.is_active
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {child.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
            <div>
              <span className="block text-slate-400">UUID</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300 truncate block">
                {category.uuid}
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Business UUID</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300 truncate block">
                {category.business_uuid}
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Created</span>
              <span className="text-slate-700 dark:text-zinc-300">
                {category.created_at ? new Date(category.created_at).toLocaleString() : "N/A"}
              </span>
            </div>
            <div>
              <span className="block text-slate-400">Last Updated</span>
              <span className="text-slate-700 dark:text-zinc-300">
                {category.updated_at ? new Date(category.updated_at).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-zinc-900/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>

          {onEdit && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(category);
              }}
              className="rounded-xl bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold px-4 gap-1.5 shadow-md shadow-[#FE9F43]/20 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Category
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
