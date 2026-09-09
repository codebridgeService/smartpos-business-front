"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import {
  validateAvatarFile,
  convertImageToWebP,
  formatBytes,
} from "@/lib/utils/image";
import type { User, AvatarUploadResponse } from "@/types";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => Promise<void>;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: AvatarUploadModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [webpBlob, setWebpBlob] = useState<Blob | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setWebpBlob(null);
    setDimensions(null);
    setIsConverting(false);
    setIsUploading(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModalClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    setIsConverting(true);

    try {
      const { blob, width, height, previewUrl: generatedUrl } =
        await convertImageToWebP(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.88 });

      setWebpBlob(blob);
      setDimensions({ width, height });
      setPreviewUrl(generatedUrl);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to process and convert image."
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleUpload = async () => {
    if (!webpBlob || !user.uuid) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      // Ensure file name ends with .webp
      const fileName = selectedFile
        ? selectedFile.name.replace(/\.[^/.]+$/, "") + ".webp"
        : "avatar.webp";

      const fileToUpload = new File([webpBlob], fileName, {
        type: "image/webp",
      });

      formData.append("avatar", fileToUpload);

      await apiClient.post<AvatarUploadResponse>(
        `/users/${user.uuid}/avatar`,
        formData
      );

      toast.success("Profile avatar updated successfully!");
      await onSuccess();
      handleModalClose();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.data?.message ||
        "Failed to upload avatar. Please verify the image file.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Update Profile Avatar"
      description="Upload a personal photo to personalize your SmartPOS account. Image will be converted to high-quality WebP format."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleModalClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleUpload}
            disabled={!webpBlob || isConverting || isUploading}
            isLoading={isUploading}
            leftIcon={<UploadCloud className="h-4 w-4" />}
          >
            Save Avatar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Dropzone or Preview */}
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/50"
            }`}
          >
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                PNG, JPG, JPEG, or WebP up to 5MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
            {/* Avatar Circle Preview */}
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-md bg-zinc-200 dark:bg-zinc-700">
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium"
              >
                <RefreshCw className="h-4 w-4 mb-1" />
                Change
              </button>
            </div>

            {/* Metadata */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>WebP Optimized Preview</span>
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[240px]">
                {selectedFile?.name}
              </p>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
                {dimensions && (
                  <p>
                    Resolution: {dimensions.width} &times; {dimensions.height} px
                  </p>
                )}
                {webpBlob && (
                  <p>
                    Target size:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">
                      {formatBytes(webpBlob.size)}
                    </strong>{" "}
                    (original: {selectedFile ? formatBytes(selectedFile.size) : "—"})
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<ImageIcon className="h-3.5 w-3.5" />}
              >
                Select Different Image
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
