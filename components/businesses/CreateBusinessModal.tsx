"use client";

import React, { useState } from "react";
import {
  Building2,
  Sparkles,
  Info,
  DollarSign,
  Clock,
  Receipt,
  FileText,
  MapPin,
  Mail,
  Phone,
  Hash,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoreBusinessRequest } from "@/types";

interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreBusinessRequest) => Promise<void>;
  isLoading?: boolean;
}

const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar (USD)" },
  { code: "KHR", symbol: "៛", name: "Khmer Riel (KHR)" },
  { code: "THB", symbol: "฿", name: "Thai Baht (THB)" },
  { code: "EUR", symbol: "€", name: "Euro (EUR)" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar (SGD)" },
];

const COMMON_TIMEZONES = [
  { value: "Asia/Phnom_Penh", label: "Asia/Phnom_Penh (GMT+7)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
];

export function CreateBusinessModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateBusinessModalProps) {
  const [formData, setFormData] = useState<StoreBusinessRequest>({
    name: "",
    code: "",
    legal_name: "",
    tax_number: "",
    registration_number: "",
    phone: "",
    email: "",
    address: "",
    city: "Phnom Penh",
    country_code: "KH",
    currency_code: "USD",
    currency_symbol: "$",
    default_currency: "USD",
    timezone: "Asia/Phnom_Penh",
    tax_rate: 10,
    is_tax_inclusive: false,
    receipt_header: "Welcome to SmartPOS",
    receipt_footer: "Thank you for your business! Please come again.",
  });

  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "tax_currency" | "contact">("general");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => {
      const updated: StoreBusinessRequest = { ...prev, name: newName };
      if (!codeManuallyEdited) {
        updated.code = newName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 30);
      }
      return updated;
    });
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const selected = COMMON_CURRENCIES.find((c) => c.code === currencyCode);
    setFormData((prev) => ({
      ...prev,
      currency_code: currencyCode,
      default_currency: currencyCode,
      currency_symbol: selected?.symbol || "$",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name?.trim()) {
      setErrorMessage("Business name is required.");
      setActiveTab("general");
      return;
    }

    if (!formData.code?.trim()) {
      setErrorMessage("Unique business code is required.");
      setActiveTab("general");
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        code: "",
        legal_name: "",
        tax_number: "",
        registration_number: "",
        phone: "",
        email: "",
        address: "",
        city: "Phnom Penh",
        country_code: "KH",
        currency_code: "USD",
        currency_symbol: "$",
        default_currency: "USD",
        timezone: "Asia/Phnom_Penh",
        tax_rate: 10,
        is_tax_inclusive: false,
        receipt_header: "Welcome to SmartPOS",
        receipt_footer: "Thank you for your business! Please come again.",
      });
      setCodeManuallyEdited(false);
      setActiveTab("general");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create business.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Create New Business Tenant
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              Auto-provisions initial default outlet, cash register, and terminal credentials
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 pb-1 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "general"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            General Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tax_currency")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "tax_currency"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            Tax & Currency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "contact"
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            Address & Contact
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: General Details */}
        {activeTab === "general" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FreshMart Organics"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Business Code / Slug <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. freshmart-organics"
                    value={formData.code}
                    onChange={(e) => {
                      setCodeManuallyEdited(true);
                      setFormData((prev) => ({ ...prev, code: e.target.value.toLowerCase() }));
                    }}
                    className="w-full font-mono px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  Unique identifier used in system URLs and receipts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Legal Registered Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. FreshMart Co., Ltd."
                  value={formData.legal_name || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, legal_name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 00012345-KH"
                  value={formData.registration_number || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, registration_number: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Instant Multi-Tenancy Provisioning</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                  Creating this business automatically spins up your default Main Outlet, Register
                  #1, and registers hardware machine authentication credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tax & Currency */}
        {activeTab === "tax_currency" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Default Operating Currency
                </label>
                <select
                  value={formData.currency_code || "USD"}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  {COMMON_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Operating Timezone
                </label>
                <select
                  value={formData.timezone || "Asia/Phnom_Penh"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Tax Identification Number (VAT/TIN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. K001-90212345"
                  value={formData.tax_number || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tax_number: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="10"
                  value={formData.tax_rate ?? 10}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tax Inclusive Toggle */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Tax-Inclusive Product Pricing
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  When enabled, retail shelf prices already include tax. When off, tax is added at
                  checkout.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!formData.is_tax_inclusive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_tax_inclusive: e.target.checked }))
                }
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Contact & Address */}
        {activeTab === "contact" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  placeholder="contact@freshmart.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+855 12 345 678"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Headquarters Address
              </label>
              <textarea
                rows={2}
                placeholder="Building #123, Russian Blvd, Phnom Penh"
                value={formData.address || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Phnom Penh"
                  value={formData.city || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Country Code
                </label>
                <input
                  type="text"
                  placeholder="KH"
                  value={formData.country_code || "KH"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country_code: e.target.value.toUpperCase() }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="12000"
                  value={formData.postal_code || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, postal_code: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            {activeTab !== "general" && (
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "contact" ? "tax_currency" : "general")
                }
                className="underline hover:text-slate-800 dark:hover:text-zinc-200"
              >
                Previous Step
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isLoading ? "Provisioning..." : "Create Business"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
