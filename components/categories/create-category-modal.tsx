"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Upload,
  Building2,
  FolderTree,
  Code2,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useToast } from "@/components/ui/toast";
import { useBusinessesQuery } from "@/lib/react-query/hooks/use-businesses";
import { useCreateCategoryMutation, useCategoriesQuery } from "@/lib/react-query/hooks/use-categories";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { Button } from "@/components/ui/button";
import { getUserRoleCodes } from "@/lib/utils/roles";
import type { Category } from "@/lib/api/categories";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultParentId?: number | null;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  defaultParentId = null,
}: CreateCategoryModalProps) {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const toast = useToast();
  const storeActiveBizUuid = useCategoryStore((state) => state.activeBusinessUuid);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    const roles = getUserRoleCodes(user);
    return roles.includes("admin") || roles.includes("super_admin") || roles.includes("owner");
  }, [user]);

  const { data: businesses = [] } = useBusinessesQuery(undefined, isAdmin);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState<number | null>(defaultParentId);
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [businessUuid, setBusinessUuid] = useState(
    storeActiveBizUuid || activeBusiness?.uuid || ""
  );
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories for the selected business to populate Parent dropdown
  const { data: existingCategoriesData } = useCategoriesQuery(
    businessUuid ? { business_uuid: businessUuid, per_page: 100 } : undefined,
    isOpen && Boolean(businessUuid)
  );
  const existingCategories = existingCategoriesData?.data || [];

  // Sync businessUuid when activeBusiness changes or store provides it
  useEffect(() => {
    if (!businessUuid) {
      const fallback = storeActiveBizUuid || activeBusiness?.uuid || "";
      if (fallback) {
        setBusinessUuid(fallback);
      }
    }
  }, [storeActiveBizUuid, activeBusiness?.uuid, businessUuid]);

  // Sync defaultParentId
  useEffect(() => {
    if (defaultParentId !== undefined) {
      setParentId(defaultParentId);
    }
  }, [defaultParentId]);

  // ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setCode("");
      setParentId(defaultParentId ?? null);
      setDescription("");
      setSortOrder(0);
      setIsActive(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileError(null);
      setFormErrors({});
      setBusinessUuid(storeActiveBizUuid || activeBusiness?.uuid || "");
    }
  }, [isOpen, defaultParentId, storeActiveBizUuid, activeBusiness?.uuid]);

  // Auto-generate code from name
  const handleGenerateCode = () => {
    if (!name.trim()) return;
    const generated = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setCode(generated);
    if (formErrors.code) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.code;
        return next;
      });
    }
  };

  // Image handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("Image file exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setFileError("Invalid image type. Please select PNG, JPG, WEBP, or SVG.");
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createMutation = useCreateCategoryMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Category name is required";
    }
    if (!code.trim()) {
      errors.code = "Category code is required";
    }
    if (!businessUuid.trim()) {
      errors.business_uuid = "Business context is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("code", code.trim());
      formData.append("business_uuid", businessUuid.trim());
      if (parentId !== null && parentId !== undefined) {
        formData.append("parent_id", String(parentId));
      }
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      formData.append("sort_order", String(sortOrder));
      formData.append("is_active", isActive ? "1" : "0");
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await createMutation.mutateAsync(formData);

      toast.success(`Category "${name}" created successfully!`);
      handleRemoveFile();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([field, msgs]) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            backendErrors[field] = msgs[0] as string;
          }
        });
        setFormErrors(backendErrors);
      }
      toast.error(err?.message || "Failed to create category. Please check submitted fields.");
    }
  };

  if (!isOpen || !mounted) return null;

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
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FE9F43]/10 text-[#FE9F43] flex items-center justify-center font-bold">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Create New Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Add a product category or subcategory to your catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Business Selector (Admin only) */}
          {isAdmin && businesses.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Target Business <span className="text-rose-500">*</span>
              </label>
              <select
                value={businessUuid}
                onChange={(e) => setBusinessUuid(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all cursor-pointer"
              >
                <option value="">Select a business...</option>
                {businesses.map((biz) => (
                  <option key={biz.uuid} value={biz.uuid}>
                    {biz.name}
                  </option>
                ))}
              </select>
              {formErrors.business_uuid && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.business_uuid}
                </p>
              )}
            </div>
          )}

          {/* Name & Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Beverages, Electronics"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all"
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Category Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  Code <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={!name.trim()}
                  className="text-[11px] text-[#FE9F43] hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-slug
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. BEV, ELEC"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (formErrors.code) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.code;
                      return next;
                    });
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all"
              />
              {formErrors.code && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.code}
                </p>
              )}
            </div>
          </div>

          {/* Parent Category & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Parent Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-slate-400" />
                Parent Category (Optional)
              </label>
              <select
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all cursor-pointer"
              >
                <option value="">None (Top-level Root Category)</option>
                {existingCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                Display Sort Order
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Brief description for category context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all resize-none"
            />
          </div>

          {/* Category Image Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              Category Image (Optional, Max 5MB)
            </label>

            <div className="flex items-start gap-3">
              {/* Preview Thumbnail */}
              <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-850 flex items-center justify-center shrink-0 overflow-hidden relative">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Category preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <FolderTree className="w-6 h-6 text-slate-300 dark:text-zinc-600" />
                )}
              </div>

              {/* Upload & Clear Controls */}
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl h-8 px-3 text-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1 text-[#FE9F43]" />
                    {selectedFile ? "Change Image" : "Upload Image"}
                  </Button>

                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="rounded-xl h-8 px-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400">
                  {selectedFile
                    ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
                    : "Recommended: 450x450px. Max size 5MB (PNG, JPG, WEBP, SVG)."}
                </p>
              </div>
            </div>

            {fileError && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {fileError}
              </p>
            )}
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                Active Status
              </span>
              <span className="text-[10px] text-slate-400">
                {isActive
                  ? "Category will immediately appear in POS product catalog and navigation"
                  : "Category will be hidden from POS operations"}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="rounded-xl px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="rounded-xl bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold px-4 gap-1.5 shadow-md shadow-[#FE9F43]/20 cursor-pointer"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Category...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Create Category</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
