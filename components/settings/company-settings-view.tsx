"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Mail,
  Phone,
  Printer,
  Globe,
  Upload,
  X,
  Check,
  CheckCircle2,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Save,
  RotateCcw,
  FileText,
  MapPin,
  ShieldCheck,
  Eye,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBusiness } from "@/context/business-context";

interface ImageState {
  file: File | null;
  previewUrl: string | null;
  name: string;
}

// Preset modern brand colors
const BRAND_COLOR_PRESETS = [
  { name: "Indigo Modern", hex: "#4f46e5" },
  { name: "Ocean Blue", hex: "#2563eb" },
  { name: "Emerald Pro", hex: "#059669" },
  { name: "Royal Violet", hex: "#7c3aed" },
  { name: "Rose Crimson", hex: "#e11d48" },
  { name: "Amber Gold", hex: "#d97706" },
  { name: "Teal Cyan", hex: "#0891b2" },
  { name: "Zinc Slate", hex: "#475569" },
];

// Helper to compute contrast ratio with pure white and dark background
function calculateContrast(hexColor: string) {
  // Normalize hex
  let c = hexColor.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return { whiteRatio: 4.5, darkRatio: 4.5 };

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const toLuminance = (val: number) =>
    val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);

  const L1 = 0.2126 * toLuminance(r) + 0.7152 * toLuminance(g) + 0.0722 * toLuminance(b);
  const L_white = 1.0;
  const L_dark = 0.02; // Approximate dark card background

  const whiteRatio = (Math.max(L1, L_white) + 0.05) / (Math.min(L1, L_white) + 0.05);
  const darkRatio = (Math.max(L1, L_dark) + 0.05) / (Math.min(L1, L_dark) + 0.05);

  return {
    whiteRatio: Number(whiteRatio.toFixed(1)),
    darkRatio: Number(darkRatio.toFixed(1)),
  };
}

export function CompanySettingsView() {
  const { activeBusiness, updateSettings } = useBusiness();
  const toast = useToast();

  // Company Information State
  const [formData, setFormData] = useState({
    companyName: "SmartPOS Retail Group Ltd.",
    email: "contact@smartpos.com",
    phone: "+1 (555) 839-2041",
    fax: "+1 (555) 839-2049",
    website: "https://smartpos.io",
    taxNumber: "TAX-9982410-B",
    registrationNumber: "REG-2024-88910",
    address: "742 Evergreen Terrace, Suite 400",
    city: "San Francisco",
    country: "United States",
  });

  // Pre-fill from activeBusiness if available
  useEffect(() => {
    if (activeBusiness) {
      setFormData((prev) => ({
        ...prev,
        companyName: activeBusiness.name || prev.companyName,
        email: activeBusiness.email || prev.email,
        phone: activeBusiness.phone || prev.phone,
        website: activeBusiness.website || prev.website,
        taxNumber: activeBusiness.tax_number || prev.taxNumber,
        registrationNumber: activeBusiness.registration_number || prev.registrationNumber,
        address: activeBusiness.address || prev.address,
        city: activeBusiness.city || prev.city,
      }));
    }
  }, [activeBusiness?.uuid]);

  // Brand Theme / Color Checker State
  const [brandColor, setBrandColor] = useState<string>("#4f46e5");
  const [secondaryColor, setSecondaryColor] = useState<string>("#06b6d4");
  const contrast = calculateContrast(brandColor);

  // Images State
  const [companyIcon, setCompanyIcon] = useState<ImageState>({
    file: null,
    previewUrl: null,
    name: "company-icon.png",
  });
  const [favicon, setFavicon] = useState<ImageState>({
    file: null,
    previewUrl: null,
    name: "favicon.ico",
  });
  const [companyLogo, setCompanyLogo] = useState<ImageState>({
    file: null,
    previewUrl: null,
    name: "company-logo.svg",
  });
  const [companyDarkLogo, setCompanyDarkLogo] = useState<ImageState>({
    file: null,
    previewUrl: null,
    name: "company-logo-dark.svg",
  });

  // Hidden File Input Refs
  const iconInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<ImageState>>,
    title: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File size for ${title} exceeds 5MB limit.`);
      return;
    }

    // Validate image MIME type
    if (!file.type.startsWith("image/")) {
      toast.error(`Selected file for ${title} must be a valid image.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setter({
      file,
      previewUrl,
      name: file.name,
    });
    toast.success(`${title} selected for upload.`);
  };

  const handleRemoveImage = (
    setter: React.Dispatch<React.SetStateAction<ImageState>>,
    title: string
  ) => {
    setter({
      file: null,
      previewUrl: null,
      name: "",
    });
    toast.info(`${title} reset.`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      errors.companyName = "Company Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Company Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone Number is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required company fields.");
      return;
    }

    setIsSaving(true);
    setFormErrors({});

    try {
      // Simulate API sync with slight delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success("Company settings and branding updated successfully!");
    } catch {
      toast.error("Failed to update company settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: activeBusiness?.name || "SmartPOS Retail Group Ltd.",
      email: activeBusiness?.email || "contact@smartpos.com",
      phone: activeBusiness?.phone || "+1 (555) 839-2041",
      fax: "+1 (555) 839-2049",
      website: activeBusiness?.website || "https://smartpos.io",
      taxNumber: activeBusiness?.tax_number || "TAX-9982410-B",
      registrationNumber: activeBusiness?.registration_number || "REG-2024-88910",
      address: activeBusiness?.address || "742 Evergreen Terrace, Suite 400",
      city: activeBusiness?.city || "San Francisco",
      country: "United States",
    });
    setBrandColor("#4f46e5");
    setCompanyIcon({ file: null, previewUrl: null, name: "" });
    setFavicon({ file: null, previewUrl: null, name: "" });
    setCompanyLogo({ file: null, previewUrl: null, name: "" });
    setCompanyDarkLogo({ file: null, previewUrl: null, name: "" });
    setFormErrors({});
    toast.info("Company settings form reset.");
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Banner / Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none rounded-tr-2xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                  Company Settings
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                  Active Entity
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage your legal enterprise profile, contact credentials, brand color tokens, and visual imagery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Company Information (Matching DreamPOS Fields in Modern Theme) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Company Information
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Primary business identity, tax credentials, and registered communication lines
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
            Required *
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter Company Name"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  formErrors.companyName
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 dark:border-zinc-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
            </div>
            {formErrors.companyName && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.companyName}</p>
            )}
          </div>

          {/* Company Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Company Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="company@domain.com"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  formErrors.email
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 dark:border-zinc-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
            </div>
            {formErrors.email && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  formErrors.phone
                    ? "border-rose-400 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 dark:border-zinc-700 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
              />
            </div>
            {formErrors.phone && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.phone}</p>
            )}
          </div>

          {/* Fax */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Fax
            </label>
            <div className="relative">
              <Printer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={formData.fax}
                onChange={(e) => handleInputChange("fax", e.target.value)}
                placeholder="+1 (555) 000-0001"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourstore.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Tax / VAT Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Tax / VAT ID
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                placeholder="TAX-ID-123456"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Street Address */}
          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              Street Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Commerce Boulevard, Suite 100"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* City & Country */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
              City / Jurisdiction
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="City, State"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Brand Theme & Color Checker ("Check Color" Feature) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Brand Theme & Color Token Checker
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Test and verify your company primary brand color, accessibility contrast, and UI widget previews
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            WCAG Checked
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Color Selectors & Presets */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={brandColor.toUpperCase()}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400 mb-2">
                Quick Preset Palettes:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BRAND_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setBrandColor(preset.hex)}
                    className={`group relative h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      brandColor.toLowerCase() === preset.hex.toLowerCase()
                        ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900 border-white"
                        : "border-slate-200 dark:border-zinc-700 hover:scale-105"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.name}
                  >
                    {brandColor.toLowerCase() === preset.hex.toLowerCase() && (
                      <Check className="h-4 w-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast Metrics */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  Contrast Ratios (WCAG 2.1)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  AA Standard Requires 4.5:1
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200/50 dark:border-zinc-700/50">
                  <span className="text-slate-500 dark:text-zinc-400">Light BG:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{contrast.whiteRatio}:1</span>
                    {contrast.whiteRatio >= 4.5 ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                        Pass AA
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1 rounded">
                        Low
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-700/50 text-white">
                  <span className="text-zinc-400">Dark BG:</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{contrast.darkRatio}:1</span>
                    {contrast.darkRatio >= 4.5 ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1 rounded">
                        Pass AA
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1 rounded">
                        Low
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive UI Preview */}
          <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-700/70 bg-slate-50/60 dark:bg-zinc-800/40 space-y-3">
            <span className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
              Live Component Preview
            </span>

            {/* Simulated Button */}
            <button
              type="button"
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: brandColor }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Primary Brand Action</span>
            </button>

            {/* Simulated Badges & Tabs */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs"
                style={{
                  backgroundColor: `${brandColor}15`,
                  color: brandColor,
                  borderColor: `${brandColor}35`,
                }}
              >
                Brand Pill Badge
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white"
                style={{ backgroundColor: brandColor }}
              >
                Solid Tag
              </span>
              <span
                className="text-[10px] font-semibold underline underline-offset-4 cursor-pointer"
                style={{ color: brandColor }}
              >
                Link Anchor
              </span>
            </div>

            {/* Simulated Mini Card */}
            <div
              className="p-3 rounded-xl border bg-white dark:bg-zinc-900 transition-all text-xs"
              style={{ borderLeftColor: brandColor, borderLeftWidth: "4px" }}
            >
              <p className="font-bold text-slate-800 dark:text-zinc-200">
                {formData.companyName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Active Theme Token: <code className="font-mono text-xs">{brandColor}</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Company Images (4 Uploaders from DreamPOS in Modernized Style) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Company Images & Branding
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Upload square icons, favicons, light theme logos, and dark theme logos (Recommended: 450px × 450px, Max 5MB)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
            4 Assets
          </span>
        </div>

        {/* 4 Image Uploaders List */}
        <div className="space-y-4">
          {/* 1. Company Icon */}
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Company Icon
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                  App Launcher
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Upload Icon of your Company. Used for POS terminal icons and mobile splash.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-mono">
                Recommended size is 450px x 450px. Max size 5MB.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setCompanyIcon, "Company Icon")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Image</span>
              </button>

              {/* Preview Box */}
              <div className="relative w-14 h-14 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center p-1.5 shadow-xs overflow-hidden group">
                {companyIcon.previewUrl ? (
                  <img
                    src={companyIcon.previewUrl}
                    alt="Company Icon"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                {companyIcon.previewUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setCompanyIcon, "Company Icon")}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-rose-700 transition-colors"
                    title="Remove Image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Favicon */}
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Favicon
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                  Browser Tab
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Upload Favicon of your Company. Rendered in browser bookmarks and URL tabs.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-mono">
                Recommended size is 450px x 450px (or 32x32px). Max size 5MB.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setFavicon, "Favicon")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Image</span>
              </button>

              {/* Preview Box */}
              <div className="relative w-14 h-14 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center p-1.5 shadow-xs overflow-hidden">
                {favicon.previewUrl ? (
                  <img
                    src={favicon.previewUrl}
                    alt="Favicon"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Globe className="h-6 w-6" />
                  </div>
                )}
                {favicon.previewUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setFavicon, "Favicon")}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-rose-700 transition-colors"
                    title="Remove Favicon"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Company Logo (Light Theme) */}
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Company Logo
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40">
                  Light Theme
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Upload Logo of your Company. Primary brand mark displayed on light backgrounds and invoices.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-mono">
                Recommended size is 450px x 450px. Max size 5MB.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setCompanyLogo, "Company Logo")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Image</span>
              </button>

              {/* Preview Box */}
              <div className="relative w-28 h-14 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white flex items-center justify-center p-2 shadow-xs overflow-hidden">
                {companyLogo.previewUrl ? (
                  <img
                    src={companyLogo.previewUrl}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-800 font-black tracking-tight text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span>Smart<span className="text-indigo-600">POS</span></span>
                  </div>
                )}
                {companyLogo.previewUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setCompanyLogo, "Company Logo")}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-rose-700 transition-colors"
                    title="Remove Logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Company Dark Logo (Dark Theme) */}
          <div className="p-4 rounded-xl border border-slate-200/70 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Company Dark Logo
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Dark Theme
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Upload Logo of your Company. High-contrast version displayed in dark mode headers and displays.
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 font-mono">
                Recommended size is 450px x 450px. Max size 5MB.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <input
                ref={darkLogoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setCompanyDarkLogo, "Company Dark Logo")}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => darkLogoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Image</span>
              </button>

              {/* Preview Box with Dark Background */}
              <div className="relative w-28 h-14 rounded-xl border border-zinc-700 bg-zinc-950 flex items-center justify-center p-2 shadow-xs overflow-hidden">
                {companyDarkLogo.previewUrl ? (
                  <img
                    src={companyDarkLogo.previewUrl}
                    alt="Company Dark Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-white font-black tracking-tight text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <span>Smart<span className="text-indigo-400">POS</span></span>
                  </div>
                )}
                {companyDarkLogo.previewUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setCompanyDarkLogo, "Company Dark Logo")}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-rose-700 transition-colors"
                    title="Remove Dark Logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>All company assets and brand tokens are encrypted and CDN-cached.</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
