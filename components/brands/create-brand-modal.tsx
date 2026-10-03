"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Building2,
  Tag,
  Code2,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useToast } from "@/components/ui/toast";
import { useBusinessesQuery } from "@/lib/react-query/hooks/use-businesses";
import { useCreateBrandMutation } from "@/lib/react-query/hooks/use-brands";
import { useBrandStore } from "@/stores/useBrandStore";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5120 KB (5MB)

export interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

import { getUserRoleCodes } from "@/lib/utils/roles";

export function CreateBrandModal({ isOpen, onClose, onSuccess }: CreateBrandModalProps) {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const toast = useToast();
  const storeActiveBizUuid = useBrandStore((state) => state.activeBusinessUuid);

  const isAdmin = useMemo(() => {
    const roles = getUserRoleCodes(user);
    return roles.includes("admin") || roles.includes("super_admin") || roles.includes("owner");
  }, [user]);

  const { data: businesses = [] } = useBusinessesQuery(undefined, isAdmin);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [businessUuid, setBusinessUuid] = useState(
    storeActiveBizUuid || activeBusiness?.uuid || ""
  );
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync businessUuid when activeBusiness changes or store provides it
  useEffect(() => {
    if (!businessUuid) {
      const fallback = storeActiveBizUuid || activeBusiness?.uuid || "";
      if (fallback) {
        setBusinessUuid(fallback);
      }
    }
  }, [storeActiveBizUuid, activeBusiness?.uuid, businessUuid]);

  // Create Mutation (TanStack Query)
  const createMutation = useCreateBrandMutation();

  if (!isOpen) return null;

  // Auto-generate code from name if code is empty or untouched
  const handleNameChange = (val: string) => {
    setName(val);
    if (formErrors.name) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleGenerateCode = () => {
    if (!name.trim()) return;
    const generated = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    setCode(generated);
    if (formErrors.code) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.code;
        return next;
      });
    }
  };

  // Handle Logo File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFileError("Please select a valid image file (PNG, JPG, SVG, WEBP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File exceeds the maximum allowed size of 5MB (5120 KB).");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Brand name is required.";
    } else if (name.trim().length > 150) {
      errors.name = "Brand name must be 150 characters or fewer.";
    }

    if (!code.trim()) {
      errors.code = "Brand code is required.";
    } else if (code.trim().length > 50) {
      errors.code = "Brand code must be 50 characters or fewer.";
    }

    const targetBizUuid = businessUuid || activeBusiness?.uuid;
    if (!targetBizUuid) {
      errors.business_uuid = "Business assignment is required.";
    }

    if (selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES) {
      errors.logo = "Logo file exceeds maximum size of 5MB.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const targetBizUuid = businessUuid || activeBusiness?.uuid || "";

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        business_uuid: targetBizUuid,
        description: description.trim() || null,
        logo: selectedFile,
        is_active: isActive,
      });

      toast.success("Brand created successfully.");
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
      toast.error(err?.message || "Failed to create brand. Please check submitted fields.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FE9F43]/10 text-[#FE9F43] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-50">
                Create New Brand
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Add a product brand with image logo upload support
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Business Entity Selection (Admin or Regular) */}
          {isAdmin ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Business <strong className="text-rose-500">*</strong></span>
              </label>
              <select
                aria-label="Target Business"
                value={businessUuid}
                onChange={(e) => {
                  setBusinessUuid(e.target.value);
                  if (formErrors.business_uuid) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.business_uuid;
                      return next;
                    });
                  }
                }}
                className={`w-full py-2 px-3 text-xs bg-slate-50 dark:bg-zinc-800/80 border rounded-xl text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] ${
                  formErrors.business_uuid ? "border-rose-500" : "border-slate-200 dark:border-zinc-700"
                }`}
              >
                <option value="">Select a Business...</option>
                {businesses.map((biz) => (
                  <option key={biz.uuid} value={biz.uuid}>
                    {biz.name} ({biz.uuid.slice(0, 8)}...)
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
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-2 text-xs">
              <Building2 className="w-4 h-4 text-slate-400" />
              <div className="flex-1 truncate">
                <span className="text-slate-400 text-[10px] block">Assigned Business</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                  {activeBusiness?.name || "Current Business"}
                </span>
              </div>
            </div>
          )}

          {/* Row 1: Brand Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Brand Name <strong className="text-rose-500">*</strong>
              </label>
              <input
                type="text"
                placeholder="e.g. Apple, Nike, Sony"
                value={name}
                maxLength={150}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full py-2 px-3 text-xs bg-slate-50 dark:bg-zinc-800/80 border rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] ${
                  formErrors.name ? "border-rose-500" : "border-slate-200 dark:border-zinc-700"
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Brand Code <strong className="text-rose-500">*</strong>
                </label>
                {name && !code && (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[10px] text-[#FE9F43] font-semibold hover:underline cursor-pointer"
                  >
                    Auto-generate
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. APPL, NIKE, SONY"
                value={code}
                maxLength={50}
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
                className={`w-full py-2 px-3 text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-zinc-800/80 border rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] ${
                  formErrors.code ? "border-rose-500" : "border-slate-200 dark:border-zinc-700"
                }`}
              />
              {formErrors.code && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  {formErrors.code}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Brief description or categories associated with this brand..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43]"
            />
          </div>

          {/* Logo Image Upload with Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
              Brand Logo Image <span className="text-slate-400 font-normal">(Max 5MB)</span>
            </label>

            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-zinc-800">
              {/* Thumbnail Preview Box */}
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Logo preview"
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300 dark:text-zinc-600" />
                )}
              </div>

              {/* Upload Action / File Info */}
              <div className="flex-1 space-y-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                  id="brand-logo-file-input"
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl h-8 px-3 text-xs font-semibold border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5 text-[#FE9F43]" />
                    {selectedFile ? "Change Logo" : "Choose Image"}
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
                  ? "Brand will immediately appear in POS product catalog and search"
                  : "Brand will be hidden from active POS operations"}
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
                  <span>Saving Brand...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Create Brand</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
