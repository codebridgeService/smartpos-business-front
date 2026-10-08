"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Copy,
  Eye,
  Sparkles,
  Sliders,
  Maximize2,
  ArrowRight,
  Printer,
  QrCode,
  Barcode as BarcodeIcon,
  RefreshCw,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-context";
import { useBusiness } from "@/context/business-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import {
  type LabelTemplate,
  type CreateLabelTemplateInput,
  type UpdateLabelTemplateInput,
} from "@/lib/api";
import {
  useLabelTemplatesQuery,
  useCreateLabelTemplateMutation,
  useUpdateLabelTemplateMutation,
  useDeleteLabelTemplateMutation,
} from "@/lib/react-query";

// Standard preset options for quick creation
export const LABEL_PRESETS = [
  {
    name: "Standard Shelf Tag",
    width_mm: 50,
    height_mm: 30,
    description: "Most popular for retail shelf edges and gondolas",
    show_product_name: true,
    show_variant_name: true,
    show_price: true,
    show_sku: true,
    show_barcode: true,
    show_qrcode: false,
  },
  {
    name: "Compact Barcode Sticker",
    width_mm: 40,
    height_mm: 25,
    description: "Ideal for small items, cosmetics, and accessories",
    show_product_name: true,
    show_variant_name: false,
    show_price: true,
    show_sku: true,
    show_barcode: true,
    show_qrcode: false,
  },
  {
    name: "Square QR Shelf Tag",
    width_mm: 40,
    height_mm: 40,
    description: "Optimized for mobile QR product info & digital menus",
    show_product_name: true,
    show_variant_name: true,
    show_price: true,
    show_sku: false,
    show_barcode: false,
    show_qrcode: true,
  },
  {
    name: "Large Shipping / Carton Label",
    width_mm: 100,
    height_mm: 50,
    description: "Full-detail barcode & QR label for boxes and warehouse bins",
    show_product_name: true,
    show_variant_name: true,
    show_price: true,
    show_sku: true,
    show_barcode: true,
    show_qrcode: true,
  },
];

interface FormState {
  name: string;
  width_mm: number;
  height_mm: number;
  show_product_name: boolean;
  show_variant_name: boolean;
  show_price: boolean;
  show_sku: boolean;
  show_barcode: boolean;
  show_qrcode: boolean;
  is_default: boolean;
  is_active: boolean;
}

const DEFAULT_FORM_STATE: FormState = {
  name: "",
  width_mm: 50,
  height_mm: 30,
  show_product_name: true,
  show_variant_name: true,
  show_price: true,
  show_sku: true,
  show_barcode: true,
  show_qrcode: false,
  is_default: false,
  is_active: true,
};

// Realistic mock product for preview rendering
const PREVIEW_PRODUCT = {
  name: "Organic Espresso Blend",
  variant: "250g Whole Bean",
  sku: "ESP-250-ORG",
  barcode: "893500192837",
  price: "$14.50",
};

/**
 * High-fidelity Vector Barcode & QR Code Preview SVG
 */
function VisualLabelMockup({
  template,
  scale = 1,
  className = "",
}: {
  template: {
    name?: string;
    width_mm: number | string;
    height_mm: number | string;
    show_product_name: boolean;
    show_variant_name: boolean;
    show_price: boolean;
    show_sku: boolean;
    show_barcode: boolean;
    show_qrcode: boolean;
  };
  scale?: number;
  className?: string;
}) {
  const widthMm = Number(template.width_mm) || 50;
  const heightMm = Number(template.height_mm) || 30;
  const aspectRatio = widthMm / heightMm;

  return (
    <div
      className={`relative mx-auto bg-white text-slate-900 rounded-lg shadow-sm border border-slate-300/80 p-3 flex flex-col justify-between overflow-hidden select-none transition-all duration-200 ${className}`}
      style={{
        aspectRatio: `${widthMm} / ${heightMm}`,
        maxWidth: "100%",
        maxHeight: "220px",
      }}
    >
      {/* Subtle thermal paper label perforations marker */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

      {/* Header: Product Name & Variant */}
      <div className="space-y-0.5 min-w-0">
        {template.show_product_name && (
          <div className="font-bold text-[11px] leading-tight text-slate-900 truncate">
            {PREVIEW_PRODUCT.name}
          </div>
        )}
        {template.show_variant_name && (
          <div className="text-[9px] font-medium text-slate-500 truncate">
            {PREVIEW_PRODUCT.variant}
          </div>
        )}
      </div>

      {/* Middle/Bottom: Price, Barcode, and/or QR */}
      <div className="flex items-end justify-between gap-2 mt-auto pt-1">
        {/* Left Column: Barcode & SKU */}
        <div className="flex-1 min-w-0 space-y-1">
          {template.show_barcode && (
            <div className="w-full">
              {/* Vector Barcode rendering */}
              <svg
                viewBox="0 0 120 28"
                className="w-full h-6 object-contain text-slate-900"
                fill="currentColor"
                preserveAspectRatio="none"
              >
                <rect x="0" y="0" width="3" height="28" />
                <rect x="5" y="0" width="1.5" height="28" />
                <rect x="9" y="0" width="4" height="28" />
                <rect x="15" y="0" width="2" height="28" />
                <rect x="19" y="0" width="1" height="28" />
                <rect x="23" y="0" width="3.5" height="28" />
                <rect x="29" y="0" width="2" height="28" />
                <rect x="33" y="0" width="5" height="28" />
                <rect x="40" y="0" width="1.5" height="28" />
                <rect x="44" y="0" width="3" height="28" />
                <rect x="49" y="0" width="2" height="28" />
                <rect x="54" y="0" width="4" height="28" />
                <rect x="60" y="0" width="2" height="28" />
                <rect x="64" y="0" width="1.5" height="28" />
                <rect x="68" y="0" width="3" height="28" />
                <rect x="73" y="0" width="4.5" height="28" />
                <rect x="80" y="0" width="2" height="28" />
                <rect x="84" y="0" width="1.5" height="28" />
                <rect x="88" y="0" width="3.5" height="28" />
                <rect x="94" y="0" width="2" height="28" />
                <rect x="98" y="0" width="4" height="28" />
                <rect x="104" y="0" width="1.5" height="28" />
                <rect x="108" y="0" width="3" height="28" />
                <rect x="113" y="0" width="2" height="28" />
                <rect x="117" y="0" width="3" height="28" />
              </svg>
            </div>
          )}

          {template.show_sku && (
            <div className="text-[8px] font-mono font-semibold tracking-wider text-slate-700 truncate">
              {PREVIEW_PRODUCT.sku}
            </div>
          )}
        </div>

        {/* Right Column: Price and/or QR Code */}
        <div className="flex flex-col items-end shrink-0 pl-1">
          {template.show_qrcode && (
            <div className="w-8 h-8 mb-1 bg-white p-0.5 border border-slate-200 rounded">
              <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm3 3h2v5h-5v-2h3v-3zm-6 2h3v3h-3v-3zm0-5h3v3h-3v-3z" />
              </svg>
            </div>
          )}

          {template.show_price && (
            <div className="text-right">
              <span className="font-extrabold text-[13px] leading-tight text-slate-950">
                {PREVIEW_PRODUCT.price}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dimension Tag on Hover */}
      <div className="absolute bottom-1 right-1 opacity-0 hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[7px] px-1 rounded pointer-events-none">
        {widthMm}×{heightMm}mm
      </div>
    </div>
  );
}

export function LabelTemplatesView() {
  const toast = useToast();
  const { themeColor } = useTheme();
  const { activeBusiness } = useBusiness();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Dialog & Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [previewModalTemplate, setPreviewModalTemplate] = useState<LabelTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<LabelTemplate | null>(null);

  // Form values
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);

  // API Queries & Mutations
  const businessUuid = activeBusiness?.uuid;
  const {
    data: responseData,
    isLoading,
    isError,
    refetch,
  } = useLabelTemplatesQuery({
    business_uuid: businessUuid,
  });

  const createMutation = useCreateLabelTemplateMutation();
  const updateMutation = useUpdateLabelTemplateMutation();
  const deleteMutation = useDeleteLabelTemplateMutation();

  const templates: LabelTemplate[] = useMemo(() => {
    return responseData?.data || [];
  }, [responseData]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${t.width_mm}x${t.height_mm}`.includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? Boolean(t.is_active)
          : !t.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [templates, searchQuery, statusFilter]);

  // Open modal for Create
  const handleOpenCreate = (preset?: (typeof LABEL_PRESETS)[0]) => {
    setEditingTemplate(null);
    if (preset) {
      setFormData({
        name: preset.name,
        width_mm: preset.width_mm,
        height_mm: preset.height_mm,
        show_product_name: preset.show_product_name,
        show_variant_name: preset.show_variant_name,
        show_price: preset.show_price,
        show_sku: preset.show_sku,
        show_barcode: preset.show_barcode,
        show_qrcode: preset.show_qrcode,
        is_default: false,
        is_active: true,
      });
    } else {
      setFormData({
        ...DEFAULT_FORM_STATE,
        is_default: templates.length === 0, // auto default if first
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (template: LabelTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      width_mm: Number(template.width_mm) || 50,
      height_mm: Number(template.height_mm) || 30,
      show_product_name: Boolean(template.show_product_name),
      show_variant_name: Boolean(template.show_variant_name),
      show_price: Boolean(template.show_price),
      show_sku: Boolean(template.show_sku),
      show_barcode: Boolean(template.show_barcode),
      show_qrcode: Boolean(template.show_qrcode),
      is_default: Boolean(template.is_default),
      is_active: Boolean(template.is_active),
    });
    setIsModalOpen(true);
  };

  // Duplicate an existing template
  const handleDuplicate = (template: LabelTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      width_mm: Number(template.width_mm) || 50,
      height_mm: Number(template.height_mm) || 30,
      show_product_name: Boolean(template.show_product_name),
      show_variant_name: Boolean(template.show_variant_name),
      show_price: Boolean(template.show_price),
      show_sku: Boolean(template.show_sku),
      show_barcode: Boolean(template.show_barcode),
      show_qrcode: Boolean(template.show_qrcode),
      is_default: false,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Fast Toggle Active Status
  const handleToggleActive = async (template: LabelTemplate) => {
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        businessUuid,
        input: {
          is_active: !template.is_active,
        },
      });
      toast.success(
        `Template "${template.name}" ${!template.is_active ? "activated" : "deactivated"}.`
      );
    } catch {
      toast.error("Failed to update template status. Please try again.");
    }
  };

  // Fast Toggle Default Template
  const handleSetDefault = async (template: LabelTemplate) => {
    if (template.is_default) return;
    try {
      await updateMutation.mutateAsync({
        id: template.id,
        businessUuid,
        input: {
          is_default: true,
        },
      });
      toast.success(`"${template.name}" is now the default label template.`);
    } catch {
      toast.error("Failed to set default template.");
    }
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a template name.");
      return;
    }

    if (formData.width_mm < 10 || formData.width_mm > 500) {
      toast.error("Width must be between 10mm and 500mm.");
      return;
    }

    if (formData.height_mm < 10 || formData.height_mm > 500) {
      toast.error("Height must be between 10mm and 500mm.");
      return;
    }

    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          businessUuid,
          input: {
            ...formData,
            business_uuid: businessUuid,
          },
        });
        toast.success(`Template "${formData.name}" updated successfully.`);
      } else {
        await createMutation.mutateAsync({
          businessUuid,
          input: {
            ...formData,
            business_uuid: businessUuid,
          },
        });
        toast.success(`Template "${formData.name}" created successfully.`);
      }
      setIsModalOpen(false);
    } catch {
      toast.error("An error occurred while saving the label template.");
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;
    try {
      await deleteMutation.mutateAsync({
        id: deletingTemplate.id,
        businessUuid,
      });
      toast.success(`Template "${deletingTemplate.name}" deleted.`);
      setDeletingTemplate(null);
    } catch {
      toast.error("Failed to delete template. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-xs">
              <BarcodeIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                  Barcode & Label Templates
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  Thermal & Sticky Tags
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Configure custom dimensions, barcodes, QR codes, and shelf price stickers for thermal label printers (Zebra, Brother, Xprinter, Dymo).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer shadow-xs"
              title="Refresh templates"
              aria-label="Refresh templates"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-purple-600" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreate()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* QUICK PRESETS BANNER */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick Standard Presets:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {LABEL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleOpenCreate(preset)}
                className="group flex flex-col p-3 rounded-xl border border-slate-200/70 dark:border-zinc-800 hover:border-purple-500/40 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {preset.width_mm}×{preset.height_mm}mm
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name or size..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-zinc-100 shadow-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xs self-start sm:self-auto">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize cursor-pointer ${
                statusFilter === status
                  ? "bg-purple-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* TEMPLATE CARDS GRID / SKELETON LOADERS */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs"
            >
              {/* Header skeleton */}
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>

              {/* Preview Box skeleton */}
              <div className="h-32 rounded-xl bg-slate-100/80 dark:bg-zinc-800/50 p-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/2" />
                </div>
                <div className="flex items-end justify-between">
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>

              {/* Badges skeleton */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>

              {/* Actions skeleton */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-between">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-12 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center mx-auto shadow-sm">
              <Tag className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {searchQuery || statusFilter !== "all"
                  ? "No matching label templates found"
                  : "No label templates created yet"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {searchQuery || statusFilter !== "all"
                  ? "Try resetting your search query or status filter to see all templates."
                  : "Create your first custom barcode and price label template, or start with one of our ready-to-use retail presets."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {searchQuery || statusFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenCreate(LABEL_PRESETS[0])}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Standard Template</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TEMPLATE CARDS LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const widthMm = Number(template.width_mm) || 50;
            const heightMm = Number(template.height_mm) || 30;

            return (
              <div
                key={template.id}
                className={`group relative bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  template.is_default
                    ? "border-purple-500/50 dark:border-purple-600/60 ring-1 ring-purple-500/20"
                    : "border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">
                          {template.name}
                        </h3>
                        {template.is_default && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 shrink-0">
                            <Sparkles className="h-2.5 w-2.5" />
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          {widthMm} × {heightMm} mm
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                          Ratio {(widthMm / heightMm).toFixed(2)}:1
                        </span>
                      </div>
                    </div>

                    {/* Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(template)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        template.is_active ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700"
                      }`}
                      title={template.is_active ? "Active template" : "Inactive template"}
                      aria-label="Toggle active status"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          template.is_active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* VISUAL MOCKUP PREVIEW */}
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 rounded-xl p-3 my-3">
                    <VisualLabelMockup template={template} />
                  </div>

                  {/* ELEMENT FEATURE BADGES */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {template.show_product_name && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        Product Name
                      </span>
                    )}
                    {template.show_variant_name && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        Variant
                      </span>
                    )}
                    {template.show_price && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
                        Price
                      </span>
                    )}
                    {template.show_barcode && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50">
                        Barcode
                      </span>
                    )}
                    {template.show_qrcode && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/50">
                        QR Code
                      </span>
                    )}
                    {template.show_sku && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        SKU
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD FOOTER & ACTIONS */}
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!template.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(template)}
                        className="text-[11px] font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewModalTemplate(template)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Large Preview"
                      aria-label="Large Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(template)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Duplicate Template"
                      aria-label="Duplicate Template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(template)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Edit Template"
                      aria-label="Edit Template"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingTemplate(template)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Template"
                      aria-label="Delete Template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarcodeIcon className="h-4 w-4" />
            </div>
            <span>{editingTemplate ? "Edit Label Template" : "New Barcode & Label Template"}</span>
          </div>
        }
        description="Configure dimensions (mm) and visible product attributes for label printing."
      >
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Template Name */}
              <div>
                <label
                  htmlFor="template-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                >
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="template-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard 50x30mm Shelf Label"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-zinc-100"
                />
              </div>

              {/* Dimensions: Width & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="template-width"
                    className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Width (mm) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="template-width"
                      type="number"
                      min={10}
                      max={500}
                      step={0.5}
                      required
                      value={formData.width_mm}
                      onChange={(e) =>
                        setFormData({ ...formData, width_mm: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-zinc-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-mono">
                      mm
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="template-height"
                    className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Height (mm) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="template-height"
                      type="number"
                      min={10}
                      max={500}
                      step={0.5}
                      required
                      value={formData.height_mm}
                      onChange={(e) =>
                        setFormData({ ...formData, height_mm: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-purple-500 text-slate-900 dark:text-zinc-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-mono">
                      mm
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Dimension Presets */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-1.5">
                  Apply Preset Dimensions:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LABEL_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          width_mm: p.width_mm,
                          height_mm: p.height_mm,
                          show_barcode: p.show_barcode,
                          show_qrcode: p.show_qrcode,
                        })
                      }
                      className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/50 dark:hover:text-purple-400 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer border border-slate-200/60 dark:border-zinc-700"
                    >
                      {p.width_mm}×{p.height_mm}mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Visible Elements Toggles */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Label Content Elements
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_product_name}
                      onChange={(e) =>
                        setFormData({ ...formData, show_product_name: e.target.checked })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-zinc-300">Product Name</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_variant_name}
                      onChange={(e) =>
                        setFormData({ ...formData, show_variant_name: e.target.checked })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-zinc-300">Variant Name</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_price}
                      onChange={(e) =>
                        setFormData({ ...formData, show_price: e.target.checked })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-zinc-300">Selling Price</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_sku}
                      onChange={(e) =>
                        setFormData({ ...formData, show_sku: e.target.checked })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-zinc-300">SKU Code</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, show_barcode: e.target.checked })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-zinc-300">Barcode</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_qrcode}
                      onChange={(e) =>
                        setFormData({ ...formData, show_qrcode: e.target.checked })
                      }
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-zinc-300">QR Code</span>
                  </label>
                </div>
              </div>

              {/* Status & Default Settings */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Set as default template for barcode printing
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-zinc-300">
                    Template is active and selectable
                  </span>
                </label>
              </div>
            </div>

            {/* LIVE PREVIEW COLUMN */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60">
              <div className="w-full flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-purple-600" />
                  Live Preview:
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-500">
                  {formData.width_mm} × {formData.height_mm} mm
                </span>
              </div>

              <div className="w-full py-4 flex items-center justify-center">
                <VisualLabelMockup template={formData} />
              </div>

              <div className="w-full text-center mt-3 text-[11px] text-slate-400">
                Rendered preview automatically scales to actual aspect ratio.
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>{editingTemplate ? "Save Changes" : "Create Template"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* FULL-SIZE PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewModalTemplate)}
        onClose={() => setPreviewModalTemplate(null)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <Printer className="h-4 w-4 text-purple-600" />
            <span>Label Print Simulation</span>
          </div>
        }
        description={`Previewing physical proportions of ${previewModalTemplate?.name}`}
      >
        {previewModalTemplate && (
          <div className="space-y-5">
            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center">
              <VisualLabelMockup template={previewModalTemplate} className="shadow-lg" />
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Thermal Printer Compatibility:</p>
                <p className="text-[11px] opacity-90">
                  Ready for direct ESC/POS or ZPL label rendering. Test print will output at{" "}
                  {previewModalTemplate.width_mm}mm width by {previewModalTemplate.height_mm}mm height.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalTemplate(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deletingTemplate)}
        onClose={() => setDeletingTemplate(null)}
        size="sm"
        title="Delete Label Template"
        description="Are you sure you want to delete this template?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            Template <span className="font-bold text-slate-900 dark:text-zinc-100">"{deletingTemplate?.name}"</span> will be permanently removed. Any products configured with this template will default to the primary system template.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setDeletingTemplate(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-600/30 cursor-pointer disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Template"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
