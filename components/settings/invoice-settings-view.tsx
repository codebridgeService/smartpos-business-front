"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  ChevronDown,
  X,
  FileText,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  DollarSign,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTheme } from "@/context/theme-context";
import { useBusiness } from "@/context/business-context";

export const LOCAL_STORAGE_KEY = "smartpos_invoice_settings";

export const INVOICE_DUE_DAYS_OPTIONS = [
  "1",
  "3",
  "5",
  "7",
  "10",
  "14",
  "15",
  "30",
  "45",
  "60",
  "90",
];

export const ROUND_OFF_OPTIONS = [
  "Round Off Up",
  "Round Off Down",
  "Normal Round Off",
];

export interface InvoiceSettingsData {
  invoiceLogo: string | null;
  invoicePrefix: string;
  invoiceDue: string;
  roundOffEnabled: boolean;
  roundOffType: string;
  showCompanyDetails: boolean;
  headerTerms: string;
  footerTerms: string;
}

const DEFAULT_INVOICE_SETTINGS: InvoiceSettingsData = {
  invoiceLogo: null,
  invoicePrefix: "INV - ",
  invoiceDue: "5",
  roundOffEnabled: true,
  roundOffType: "Round Off Up",
  showCompanyDetails: true,
  headerTerms: "",
  footerTerms: "",
};

export function InvoiceSettingsView() {
  const toast = useToast();
  const { themeColor } = useTheme();
  const { activeBusiness } = useBusiness();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [invoiceLogo, setInvoiceLogo] = useState<string | null>(
    DEFAULT_INVOICE_SETTINGS.invoiceLogo
  );
  const [invoicePrefix, setInvoicePrefix] = useState<string>(
    DEFAULT_INVOICE_SETTINGS.invoicePrefix
  );
  const [invoiceDue, setInvoiceDue] = useState<string>(
    DEFAULT_INVOICE_SETTINGS.invoiceDue
  );
  const [roundOffEnabled, setRoundOffEnabled] = useState<boolean>(
    DEFAULT_INVOICE_SETTINGS.roundOffEnabled
  );
  const [roundOffType, setRoundOffType] = useState<string>(
    DEFAULT_INVOICE_SETTINGS.roundOffType
  );
  const [showCompanyDetails, setShowCompanyDetails] = useState<boolean>(
    DEFAULT_INVOICE_SETTINGS.showCompanyDetails
  );
  const [headerTerms, setHeaderTerms] = useState<string>(
    DEFAULT_INVOICE_SETTINGS.headerTerms
  );
  const [footerTerms, setFooterTerms] = useState<string>(
    DEFAULT_INVOICE_SETTINGS.footerTerms
  );

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Partial<InvoiceSettingsData> = JSON.parse(stored);
        if (parsed.invoiceLogo !== undefined) setInvoiceLogo(parsed.invoiceLogo);
        if (parsed.invoicePrefix !== undefined) setInvoicePrefix(parsed.invoicePrefix);
        if (parsed.invoiceDue !== undefined) setInvoiceDue(parsed.invoiceDue);
        if (parsed.roundOffEnabled !== undefined) setRoundOffEnabled(parsed.roundOffEnabled);
        if (parsed.roundOffType !== undefined) setRoundOffType(parsed.roundOffType);
        if (parsed.showCompanyDetails !== undefined) setShowCompanyDetails(parsed.showCompanyDetails);
        if (parsed.headerTerms !== undefined) setHeaderTerms(parsed.headerTerms);
        if (parsed.footerTerms !== undefined) setFooterTerms(parsed.footerTerms);
      }
    } catch {}
  }, []);

  // Handle Logo File Upload (Max 5MB)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setInvoiceLogo(base64Url);
      toast.success("Logo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setInvoiceLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Invoice logo removed.");
  };

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const settingsData: InvoiceSettingsData = {
        invoiceLogo,
        invoicePrefix,
        invoiceDue,
        roundOffEnabled,
        roundOffType,
        showCompanyDetails,
        headerTerms,
        footerTerms,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settingsData));

      // Dispatch event for POS print engines or other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("smartpos:invoice-settings-updated", {
            detail: settingsData,
          })
        );
      }

      await new Promise((res) => setTimeout(res, 250));
      toast.success("Invoice settings saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save invoice settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Revert / Cancel changes
  const handleCancel = () => {
    let target = { ...DEFAULT_INVOICE_SETTINGS };
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        target = { ...target, ...JSON.parse(stored) };
      }
    } catch {}

    setInvoiceLogo(target.invoiceLogo);
    setInvoicePrefix(target.invoicePrefix);
    setInvoiceDue(target.invoiceDue);
    setRoundOffEnabled(target.roundOffEnabled);
    setRoundOffType(target.roundOffType);
    setShowCompanyDetails(target.showCompanyDetails);
    setHeaderTerms(target.headerTerms);
    setFooterTerms(target.footerTerms);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.info("Invoice changes discarded.");
  };

  // Primary accent helper
  const accentColorHex =
    themeColor === "purple"
      ? "#7059FF"
      : themeColor === "blue"
      ? "#2E7DFF"
      : themeColor === "amber"
      ? "#C85A17"
      : "#FE9F43";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
            Invoice Settings
          </h1>
        </div>

        {/* Live Simulator Preview Toggle */}
        <button
          type="button"
          onClick={() => setShowLivePreview(!showLivePreview)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          {showLivePreview ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Hide Preview</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Live Receipt Preview</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* ROW 1: Invoice Logo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="lg:w-1/3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Invoice Logo
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Upload Logo of your Company to display in Invoice
            </p>
          </div>

          <div className="lg:w-2/3 flex items-center justify-between gap-6">
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ backgroundColor: accentColorHex }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:brightness-95 shadow-sm transition-all cursor-pointer"
              >
                <UploadCloud className="h-4 w-4 stroke-[2.5]" />
                <span>Upload Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                aria-label="Upload Invoice Logo File"
              />

              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
                For better preview recommended size is 450px x 450px. Max size 5mb.
              </p>
            </div>

            {/* Logo Preview Square */}
            <div className="relative group shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center p-2 overflow-hidden shadow-2xs">
                {invoiceLogo ? (
                  <img
                    src={invoiceLogo}
                    alt="Invoice Company Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-50 dark:bg-zinc-850 flex items-center justify-center relative">
                    {/* Default DreamsPOS Icon Mockup from screenshot */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-10 h-10 rounded-xl bg-[#1E293B] text-white flex items-center justify-center shadow-xs">
                        <ShoppingBag className="h-5 w-5 text-white" />
                      </div>
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-800 flex items-center justify-center"
                        style={{ backgroundColor: accentColorHex }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {invoiceLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  title="Remove Logo"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Invoice Prefix */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Invoice Prefix
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Add prefix to your invoice
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="INV - "
              aria-label="Invoice Prefix"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-mono font-medium"
            />
          </div>
        </div>

        {/* ROW 3: Invoice Due */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Invoice Due
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Select due date to display in Invoice
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-28">
              <select
                value={invoiceDue}
                onChange={(e) => setInvoiceDue(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all cursor-pointer font-medium"
              >
                {INVOICE_DUE_DAYS_OPTIONS.map((days) => (
                  <option key={days} value={days}>
                    {days}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300">
              Days
            </span>
          </div>
        </div>

        {/* ROW 4: Invoice Round Off */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Invoice Round Off
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Value Roundoff in Invoice
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={roundOffEnabled}
              onClick={() => setRoundOffEnabled(!roundOffEnabled)}
              style={
                roundOffEnabled
                  ? { backgroundColor: "#10B981", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)" }
                  : undefined
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                roundOffEnabled ? "" : "bg-slate-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  roundOffEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            {/* Dropdown next to switch matching screenshot */}
            <div className="relative w-44">
              <select
                value={roundOffType}
                disabled={!roundOffEnabled}
                onChange={(e) => setRoundOffType(e.target.value)}
                className={`w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all font-medium ${
                  roundOffEnabled ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                }`}
              >
                {ROUND_OFF_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ROW 5: Show Company Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Show Company Details
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Show / Hide Company Details in Invoice
            </p>
          </div>

          <div>
            <button
              type="button"
              role="switch"
              aria-checked={showCompanyDetails}
              onClick={() => setShowCompanyDetails(!showCompanyDetails)}
              style={
                showCompanyDetails
                  ? { backgroundColor: "#10B981", boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)" }
                  : undefined
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showCompanyDetails ? "" : "bg-slate-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  showCompanyDetails ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ROW 6: Invoice Header Terms */}
        <div className="py-2 space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
            Invoice Header Terms
          </label>
          <textarea
            value={headerTerms}
            onChange={(e) => setHeaderTerms(e.target.value)}
            rows={4}
            placeholder="Type your message"
            className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50/70 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all resize-y"
          />
        </div>

        {/* ROW 7: Invoice Footer Terms */}
        <div className="py-2 space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
            Invoice Footer Terms
          </label>
          <textarea
            value={footerTerms}
            onChange={(e) => setFooterTerms(e.target.value)}
            rows={4}
            placeholder="Type your message"
            className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-slate-50/70 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all resize-y"
          />
        </div>

        {/* LIVE INVOICE RECEIPT SIMULATOR (Expandable) */}
        {showLivePreview && (
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/60 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Live Customer Invoice Simulator
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400">
                80mm POS Thermal / A4 Print
              </span>
            </div>

            {/* Simulated Receipt Card */}
            <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 text-xs">
              {/* Receipt Header with Logo & Business info */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-dashed border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  {invoiceLogo ? (
                    <img
                      src={invoiceLogo}
                      alt="Receipt Logo"
                      className="w-10 h-10 object-contain rounded-lg"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-2xs"
                      style={{ backgroundColor: accentColorHex }}
                    >
                      POS
                    </div>
                  )}
                  {showCompanyDetails && (
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {activeBusiness?.name || "SmartPOS Flagship Store"}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {activeBusiness?.email || "billing@smartpos.io"} · +1 (555) 019-2834
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Tax ID: US-992144810-A
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right font-mono">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded font-bold text-[10px]"
                    style={{ backgroundColor: `${accentColorHex}20`, color: accentColorHex }}
                  >
                    TAX INVOICE
                  </span>
                  <p className="font-bold text-slate-900 dark:text-zinc-100 mt-1">
                    {invoicePrefix}00482
                  </p>
                </div>
              </div>

              {/* Header Terms if present */}
              {headerTerms.trim() && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 text-[11px] text-slate-600 dark:text-zinc-300 italic border border-slate-100 dark:border-zinc-700/60">
                  {headerTerms}
                </div>
              )}

              {/* Invoice Meta Dates */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-400">
                <div>
                  <span className="text-slate-400 block text-[10px]">INVOICE DATE</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100">
                    {new Date().toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">PAYMENT DUE</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100">
                    Net {invoiceDue} Days
                  </span>
                </div>
              </div>

              {/* Sample Line Items */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold uppercase">
                  <span>Item</span>
                  <span>Total</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span>Wireless Barcode Scanner (x2)</span>
                  <span className="font-mono font-medium">$120.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-zinc-800/50">
                  <span>Thermal Receipt Rolls 80mm (x5)</span>
                  <span className="font-mono font-medium">$29.65</span>
                </div>
              </div>

              {/* Totals & Round Off */}
              <div className="pt-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">$149.65</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (8%)</span>
                  <span className="font-mono">$11.97</span>
                </div>
                {roundOffEnabled && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Round Off ({roundOffType})</span>
                    <span className="font-mono">
                      {roundOffType === "Round Off Up"
                        ? "+$0.38"
                        : roundOffType === "Round Off Down"
                        ? "-$0.62"
                        : "+$0.00"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-zinc-100 pt-1 border-t border-slate-200 dark:border-zinc-800">
                  <span>Grand Total</span>
                  <span className="font-mono" style={{ color: accentColorHex }}>
                    {roundOffEnabled
                      ? roundOffType === "Round Off Up"
                        ? "$162.00"
                        : roundOffType === "Round Off Down"
                        ? "$161.00"
                        : "$161.62"
                      : "$161.62"}
                  </span>
                </div>
              </div>

              {/* Footer Terms if present */}
              {footerTerms.trim() && (
                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800 text-[10.5px] text-center text-slate-500 dark:text-zinc-400">
                  {footerTerms}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons (Aligned to Right matching DreamsPOS screenshot) */}
        <div className="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#0B1E34] hover:bg-[#152e4d] dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            style={{ backgroundColor: accentColorHex }}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:brightness-95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
