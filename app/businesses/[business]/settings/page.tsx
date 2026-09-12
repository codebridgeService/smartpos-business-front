"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  Receipt,
  Percent,
  Sliders,
  ArrowLeft,
  Save,
  RotateCcw,
  Check,
  Building2,
  Store,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Boxes,
  MinusCircle,
  HelpCircle,
  Printer,
} from "lucide-react";
import { businessesApi } from "@/lib/api/businesses";
import { useBusiness } from "@/context/business-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Business, BusinessSetting, UpdateBusinessSettingRequest } from "@/types";

interface PageProps {
  params: Promise<{ business: string }>;
}

export default function BusinessSettingsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const businessUuid = resolvedParams.business;

  const { activeBusiness, selectBusiness, refreshSettings: refreshContextSettings } = useBusiness();

  // State
  const [business, setBusiness] = useState<Business | null>(null);
  const [settings, setSettings] = useState<BusinessSetting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [receiptPrefix, setReceiptPrefix] = useState("REC");
  const [receiptHeader, setReceiptHeader] = useState("Welcome to SmartPOS");
  const [receiptFooter, setReceiptFooter] = useState("Thank you for shopping with us! Please come again.");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [defaultTaxPercent, setDefaultTaxPercent] = useState<number>(10);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [allowDiscount, setAllowDiscount] = useState(true);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<number>(20);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);

  const [activeTab, setActiveTab] = useState<"receipt" | "tax" | "operations">("receipt");

  // Load business & settings
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [bizData, settingData] = await Promise.all([
        businessesApi.getBusiness(businessUuid),
        businessesApi.getBusinessSettings(businessUuid),
      ]);

      setBusiness(bizData);
      setSettings(settingData);

      // Populate form
      setReceiptPrefix(settingData.receipt_prefix || "REC");
      setReceiptHeader(bizData.receipt_header || "Welcome to SmartPOS");
      setReceiptFooter(
        settingData.receipt_footer ||
          bizData.receipt_footer ||
          "Thank you for shopping with us! Please come again."
      );
      setCurrencyCode(settingData.currency_code || bizData.currency_code || "USD");
      setTimezone(settingData.timezone || bizData.timezone || "Asia/Phnom_Penh");
      setTaxEnabled(settingData.tax_enabled ?? true);
      setDefaultTaxPercent(
        settingData.default_tax_percent !== undefined
          ? parseFloat(String(settingData.default_tax_percent))
          : bizData.tax_rate
          ? parseFloat(bizData.tax_rate)
          : 10
      );
      setIsTaxInclusive(bizData.is_tax_inclusive ?? false);
      setAllowNegativeStock(settingData.allow_negative_stock ?? false);
      setAllowDiscount(settingData.allow_discount ?? true);
      setMaxDiscountPercent(
        settingData.max_discount_percent !== null && settingData.max_discount_percent !== undefined
          ? parseFloat(String(settingData.max_discount_percent))
          : 20
      );
      setAutoLockMinutes(settingData.auto_lock_minutes ?? 15);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load settings.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [businessUuid]);

  // Dirty state checking
  const isDirty = useMemo(() => {
    if (!settings || !business) return false;
    const initialPrefix = settings.receipt_prefix || "REC";
    const initialFooter =
      settings.receipt_footer ||
      business.receipt_footer ||
      "Thank you for shopping with us! Please come again.";
    const initialHeader = business.receipt_header || "Welcome to SmartPOS";
    const initialTaxEnabled = settings.tax_enabled ?? true;
    const initialTaxPercent = settings.default_tax_percent !== undefined
      ? parseFloat(String(settings.default_tax_percent))
      : 10;
    const initialInclusive = business.is_tax_inclusive ?? false;
    const initialNegStock = settings.allow_negative_stock ?? false;
    const initialDiscount = settings.allow_discount ?? true;
    const initialMaxDisc =
      settings.max_discount_percent !== null && settings.max_discount_percent !== undefined
        ? parseFloat(String(settings.max_discount_percent))
        : 20;
    const initialLock = settings.auto_lock_minutes ?? 15;

    return (
      receiptPrefix !== initialPrefix ||
      receiptFooter !== initialFooter ||
      receiptHeader !== initialHeader ||
      taxEnabled !== initialTaxEnabled ||
      defaultTaxPercent !== initialTaxPercent ||
      isTaxInclusive !== initialInclusive ||
      allowNegativeStock !== initialNegStock ||
      allowDiscount !== initialDiscount ||
      maxDiscountPercent !== initialMaxDisc ||
      autoLockMinutes !== initialLock
    );
  }, [
    settings,
    business,
    receiptPrefix,
    receiptFooter,
    receiptHeader,
    taxEnabled,
    defaultTaxPercent,
    isTaxInclusive,
    allowNegativeStock,
    allowDiscount,
    maxDiscountPercent,
    autoLockMinutes,
  ]);

  const handleReset = () => {
    if (!settings || !business) return;
    setReceiptPrefix(settings.receipt_prefix || "REC");
    setReceiptHeader(business.receipt_header || "Welcome to SmartPOS");
    setReceiptFooter(
      settings.receipt_footer ||
        business.receipt_footer ||
        "Thank you for shopping with us! Please come again."
    );
    setTaxEnabled(settings.tax_enabled ?? true);
    setDefaultTaxPercent(
      settings.default_tax_percent !== undefined
        ? parseFloat(String(settings.default_tax_percent))
        : 10
    );
    setIsTaxInclusive(business.is_tax_inclusive ?? false);
    setAllowNegativeStock(settings.allow_negative_stock ?? false);
    setAllowDiscount(settings.allow_discount ?? true);
    setMaxDiscountPercent(
      settings.max_discount_percent !== null && settings.max_discount_percent !== undefined
        ? parseFloat(String(settings.max_discount_percent))
        : 20
    );
    setAutoLockMinutes(settings.auto_lock_minutes ?? 15);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    try {
      const payload: UpdateBusinessSettingRequest = {
        receipt_prefix: receiptPrefix.trim(),
        receipt_footer: receiptFooter.trim(),
        currency_code: currencyCode,
        timezone: timezone,
        tax_enabled: taxEnabled,
        default_tax_percent: Number(defaultTaxPercent),
        allow_negative_stock: allowNegativeStock,
        allow_discount: allowDiscount,
        max_discount_percent: allowDiscount ? Number(maxDiscountPercent) : null,
        auto_lock_minutes: Number(autoLockMinutes),
      };

      // Also update business level receipt_header, tax_rate, and is_tax_inclusive
      await Promise.all([
        businessesApi.updateBusinessSettings(businessUuid, payload),
        businessesApi.updateBusiness(businessUuid, {
          receipt_header: receiptHeader.trim(),
          receipt_footer: receiptFooter.trim(),
          tax_rate: Number(defaultTaxPercent),
          is_tax_inclusive: isTaxInclusive,
        }),
      ]);

      await refreshContextSettings();
      setSaveSuccessMessage("POS global settings and receipt configurations saved successfully!");
      setTimeout(() => setSaveSuccessMessage(null), 4000);

      // Reload fresh state
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const isCurrentActive = activeBusiness?.uuid === businessUuid;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
        <Link
          href="/businesses"
          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Business Master</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 dark:text-zinc-200">
          {business?.name || "Business"}
        </span>
        <span>/</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">POS Global Settings</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            {business?.name?.charAt(0).toUpperCase() || <Building2 className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100">
                {business?.name || "Loading..."} Settings
              </h1>
              {isCurrentActive ? (
                <Badge variant="success" className="text-xs">
                  Active Tenant
                </Badge>
              ) : (
                <button
                  type="button"
                  onClick={() => selectBusiness(businessUuid)}
                  className="text-xs text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Make Active Tenant
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Configure receipt templates, tax inclusive/exclusive rules, and cashier operational constraints
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="text-xs text-slate-600 dark:text-zinc-400"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Discard
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("receipt")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === "receipt"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Receipt Customization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tax")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === "tax"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Tax Configuration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("operations")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-xs transition-colors cursor-pointer ${
            activeTab === "operations"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Operational Policies</span>
        </button>
      </div>

      {/* Tab 1: Receipt Customization & Live Mockup */}
      {activeTab === "receipt" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Settings Left Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                Receipt Identity & Prefixes
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Receipt Number Prefix
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={receiptPrefix}
                    onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                    placeholder="REC"
                    maxLength={15}
                    className="w-40 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                    Preview: #{receiptPrefix || "REC"}-001048
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Prepended to all sequential POS thermal checkout receipts (e.g. REC, INV, POS)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Receipt Header Note / Greeting
                </label>
                <textarea
                  rows={3}
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  placeholder="Welcome to our store!"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Appears below the store name at the very top of printed slips
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Receipt Footer Policy / Closing Note
                </label>
                <textarea
                  rows={3}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Thank you for shopping with us! Return policy applies within 7 days."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Appears at the very bottom: return terms, WiFi password, or social channels
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Thermal Receipt Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Printer className="h-3.5 w-3.5 text-blue-500" />
                  Live Thermal Preview (80mm)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
              </div>

              {/* Thermal Paper Container */}
              <div className="relative mx-auto w-full max-w-[320px] rounded-t-xl bg-white text-slate-900 p-5 shadow-2xl border-t-8 border-slate-700 font-mono text-[11px] leading-relaxed select-none">
                {/* Store Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
                  <h4 className="font-bold text-sm tracking-wide uppercase">
                    {business?.name || "SmartPOS Store"}
                  </h4>
                  <p className="text-[10px] text-slate-600">{business?.address || "123 Market Street"}</p>
                  <p className="text-[10px] text-slate-600">
                    VAT Reg: {business?.tax_number || "K001-900213"}
                  </p>
                  {receiptHeader && (
                    <p className="text-[10px] text-slate-700 italic pt-1 whitespace-pre-wrap">
                      {receiptHeader}
                    </p>
                  )}
                </div>

                {/* Receipt Meta */}
                <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-0.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <span className="font-bold text-slate-900">
                      #{receiptPrefix || "REC"}-00042
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>Alex Johnson</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Register:</span>
                    <span>Register #1 (POS-01)</span>
                  </div>
                </div>

                {/* Items Mock */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5 text-[10px]">
                  <div className="flex justify-between font-bold">
                    <span>Item</span>
                    <span>Total</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Organic Espresso</span>
                    <span>$3.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2x Almond Croissant</span>
                    <span>$6.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Sparkling Water</span>
                    <span>$2.00</span>
                  </div>
                </div>

                {/* Subtotals & Tax Breakdown */}
                <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>$11.50</span>
                  </div>
                  {taxEnabled && (
                    <div className="flex justify-between text-slate-600">
                      <span>
                        Tax ({defaultTaxPercent}% {isTaxInclusive ? "Incl." : "Add"}):
                      </span>
                      <span>
                        ${(11.5 * (defaultTaxPercent / 100)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200 text-slate-900">
                    <span>TOTAL:</span>
                    <span>
                      ${(11.5 + (taxEnabled && !isTaxInclusive ? 11.5 * (defaultTaxPercent / 100) : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-3 text-center text-[10px] text-slate-600 whitespace-pre-wrap leading-tight">
                  {receiptFooter}
                  <div className="mt-2 text-[9px] text-slate-400">
                    * * * Powered by SmartPOS Cloud * * *
                  </div>
                </div>

                {/* Realistic Jagged Perforation Edge */}
                <div
                  className="absolute left-0 -bottom-3 w-full h-3 bg-white"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tax Configuration */}
      {activeTab === "tax" && (
        <div className="max-w-2xl space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                POS Tax Calculation Rules
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Configure whether tax is levied during transactions and how it is applied to item prices
              </p>
            </div>

            {/* Enable Tax Toggle */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Enable Sales Tax / VAT
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  When enabled, tax percentages are computed and printed on all register receipts
                </p>
              </div>
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Default Percentage */}
            {taxEnabled && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Default Tax Rate (%)
                  </label>
                  <div className="relative w-48">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={defaultTaxPercent}
                      onChange={(e) => setDefaultTaxPercent(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Standard sales VAT applied to standard product categories
                  </p>
                </div>

                {/* Tax Inclusive Toggle */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Tax-Inclusive Product Pricing
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      When checked, prices displayed in the catalog and shelf tags already include
                      tax. When unchecked, tax is added on top of the subtotal.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isTaxInclusive}
                    onChange={(e) => setIsTaxInclusive(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Operational Policies */}
      {activeTab === "operations" && (
        <div className="max-w-2xl space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                POS Checkout & Inventory Policies
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Set strict guardrails for register cashiers and warehouse synchronization
              </p>
            </div>

            {/* Negative Inventory Stock */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Allow Negative Inventory Stock
                  </p>
                  <Badge variant="neutral" className="text-[10px]">
                    Inventory
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Allows cashiers to ring up and finalize sales even if warehouse stock is zero or
                  below. Stock levels will track into negative values until restocked.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowNegativeStock}
                onChange={(e) => setAllowNegativeStock(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
            </div>

            {/* Cashier Discounts */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Allow Cashier Discounts
                    </p>
                    <Badge variant="neutral" className="text-[10px]">
                      Sales
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Permits cashiers to apply discretionary item or cart discounts at the counter
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowDiscount}
                  onChange={(e) => setAllowDiscount(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
              </div>

              {allowDiscount && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Maximum Discount Percentage Limit (%)
                  </label>
                  <div className="relative w-48">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={maxDiscountPercent}
                      onChange={(e) => setMaxDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Cashiers cannot apply a discount exceeding this threshold without manager PIN
                    approval
                  </p>
                </div>
              )}
            </div>

            {/* Terminal Auto-Lock */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Terminal Auto-Lock Inactivity Timeout
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Number of idle minutes before the POS device locks and prompts for the cashier's
                PIN code
              </p>
              <div className="pt-1 flex items-center gap-3">
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(parseInt(e.target.value, 10))}
                  className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value={2}>2 Minutes (High Security)</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes (Default)</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes (1 Hour)</option>
                </select>
                <span className="text-xs font-medium text-slate-500">
                  {autoLockMinutes} minutes idle
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
