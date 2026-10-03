"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe2,
  Clock,
  Coins,
  CreditCard,
  Save,
  RotateCcw,
  CheckCircle2,
  ListFilter,
  Check,
  ChevronDown,
  Sparkles,
  Receipt,
  Eye,
  Calendar,
  CalendarDays,
  Languages,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useBusiness } from "@/context/business-context";

// Supported Currencies
export const CURRENCY_OPTIONS = [
  { id: "USA", code: "USD", symbol: "$", name: "USA (USD - $)", country: "United States" },
  { id: "Cambodia", code: "KHR", symbol: "៛", name: "Cambodia (KHR - ៛)", country: "Cambodia" },
  { id: "Euro", code: "EUR", symbol: "€", name: "European Union (EUR - €)", country: "Eurozone" },
  { id: "United Kingdom", code: "GBP", symbol: "£", name: "United Kingdom (GBP - £)", country: "United Kingdom" },
  { id: "Thailand", code: "THB", symbol: "฿", name: "Thailand (THB - ฿)", country: "Thailand" },
  { id: "Vietnam", code: "VND", symbol: "₫", name: "Vietnam (VND - ₫)", country: "Vietnam" },
  { id: "Japan", code: "JPY", symbol: "¥", name: "Japan (JPY - ¥)", country: "Japan" },
  { id: "Singapore", code: "SGD", symbol: "S$", name: "Singapore (SGD - S$)", country: "Singapore" },
  { id: "Australia", code: "AUD", symbol: "A$", name: "Australia (AUD - A$)", country: "Australia" },
  { id: "Canada", code: "CAD", symbol: "CA$", name: "Canada (CAD - CA$)", country: "Canada" },
];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", native: "English (US)" },
  { code: "km", label: "Khmer", native: "ភាសាខ្មែរ" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "zh", label: "Chinese", native: "简体中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

export const TIMEZONE_OPTIONS = [
  { value: "UTC 5:30", label: "UTC 5:30 (Asia/Kolkata - IST)" },
  { value: "UTC+07:00", label: "UTC+07:00 (Asia/Phnom_Penh, Bangkok, Jakarta)" },
  { value: "UTC+00:00", label: "UTC+00:00 (Europe/London, GMT/UTC)" },
  { value: "UTC-05:00", label: "UTC-05:00 (America/New_York, EST)" },
  { value: "UTC-08:00", label: "UTC-08:00 (America/Los_Angeles, PST)" },
  { value: "UTC-06:00", label: "UTC-06:00 (America/Chicago, CST)" },
  { value: "UTC+01:00", label: "UTC+01:00 (Europe/Paris, Berlin, CET)" },
  { value: "UTC+08:00", label: "UTC+08:00 (Asia/Singapore, Hong Kong, Beijing)" },
  { value: "UTC+09:00", label: "UTC+09:00 (Asia/Tokyo, Seoul, JST)" },
  { value: "UTC+10:00", label: "UTC+10:00 (Australia/Sydney, AEST)" },
  { value: "UTC+04:00", label: "UTC+04:00 (Asia/Dubai, GST)" },
];

export const DATE_FORMAT_OPTIONS = [
  { value: "01 Jan 2026", label: "01 Jan 2026", pattern: "DD MMM YYYY" },
  { value: "2026-01-01", label: "2026-01-01", pattern: "YYYY-MM-DD" },
  { value: "01/01/2026", label: "01/01/2026", pattern: "DD/MM/YYYY" },
  { value: "01-01-2026", label: "01-01-2026", pattern: "DD-MM-YYYY" },
  { value: "Jan 01, 2026", label: "Jan 01, 2026", pattern: "MMM DD, YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", pattern: "MM/DD/YYYY" },
];

export const TIME_FORMAT_OPTIONS = [
  { value: "12 Hours", label: "12 Hours" },
  { value: "24 Hours", label: "24 Hours" },
];

export const FINANCIAL_YEAR_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
];

export const STARTING_MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CURRENCY_POSITION_OPTIONS = [
  { value: "left", label: "$100", example: "$100 (Symbol Left / Before)" },
  { value: "right", label: "100$", example: "100$ (Symbol Right / After)" },
  { value: "left_space", label: "$ 100", example: "$ 100 (Left with Space)" },
  { value: "right_space", label: "100 $", example: "100 $ (Right with Space)" },
];

export const DECIMAL_SEPARATOR_OPTIONS = [
  { value: ".", label: "Dot (.)", example: "100.50" },
  { value: ",", label: "Comma (,)", example: "100,50" },
];

export const THOUSAND_SEPARATOR_OPTIONS = [
  { value: ",", label: "Comma (,)", example: "1,000" },
  { value: ".", label: "Dot (.)", example: "1.000" },
  { value: " ", label: "Space ( )", example: "1 000" },
  { value: "", label: "None", example: "1000" },
];

// Calculate ending month based on starting month
export function getFiscalEndingMonth(startingMonth: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const idx = months.indexOf(startingMonth);
  if (idx === -1) return "December";
  const endIdx = (idx + 11) % 12;
  return months[endIdx];
}

// Live date formatter based on active date format pattern
export function formatLiveDate(d: Date, format: string): string {
  const day = String(d.getDate()).padStart(2, "0");
  const monthNum = String(d.getMonth() + 1).padStart(2, "0");
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthShort = monthNamesShort[d.getMonth()];
  const year = d.getFullYear();

  switch (format) {
    case "01 Jan 2026":
    case "DD MMM YYYY":
      return `${day} ${monthShort} ${year}`;
    case "2026-01-01":
    case "YYYY-MM-DD":
      return `${year}-${monthNum}-${day}`;
    case "01/01/2026":
    case "DD/MM/YYYY":
      return `${day}/${monthNum}/${year}`;
    case "01-01-2026":
    case "DD-MM-YYYY":
      return `${day}-${monthNum}-${year}`;
    case "Jan 01, 2026":
    case "MMM DD, YYYY":
      return `${monthShort} ${day}, ${year}`;
    case "MM/DD/YYYY":
      return `${monthNum}/${day}/${year}`;
    default:
      return `${day} ${monthShort} ${year}`;
  }
}

// Live time formatter based on 12h or 24h format
export function formatLiveTime(d: Date, format: string, includeSeconds: boolean = true): string {
  if (format === "24 Hours") {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return includeSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  } else {
    // 12 Hours
    let hours = d.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return includeSeconds ? `${hoursStr}:${minutes}:${seconds} ${ampm}` : `${hoursStr}:${minutes} ${ampm}`;
  }
}

const LOCAL_STORAGE_KEY = "smartpos_localization_settings";

export function LocalizationSettingsView() {
  const { activeBusiness, updateSettings } = useBusiness();
  const toast = useToast();

  const [formData, setFormData] = useState({
    language: "English",
    languageSwitcher: true,
    timezone: "UTC 5:30",
    dateFormat: "01 Jan 2026",
    timeFormat: "12 Hours",
    financialYear: "2026",
    startingMonth: "January",
    currency: "USA",
    currencySymbol: "$",
    currencyPosition: "left",
    decimalSeparator: ".",
    thousandSeparator: ",",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [mounted, setMounted] = useState(false);

  // Ticking live clock for real-time live date & time preview
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize from localStorage or active business settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
        return;
      }
    } catch {
      // Fallback
    }

    if (activeBusiness) {
      const matchingCurrency = CURRENCY_OPTIONS.find(
        (c) => c.code === activeBusiness.currency_code || c.symbol === activeBusiness.currency_symbol
      );

      setFormData((prev) => ({
        ...prev,
        currency: matchingCurrency ? matchingCurrency.id : prev.currency,
        currencySymbol: activeBusiness.currency_symbol || (matchingCurrency ? matchingCurrency.symbol : "$"),
        timezone: activeBusiness.timezone
          ? (TIMEZONE_OPTIONS.find((t) => t.value.includes(activeBusiness.timezone) || t.label.includes(activeBusiness.timezone))?.value || prev.timezone)
          : prev.timezone,
      }));
    }
  }, [activeBusiness?.uuid]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-update currency symbol when currency changes
      if (field === "currency") {
        const cur = CURRENCY_OPTIONS.find((c) => c.id === value);
        if (cur) {
          updated.currencySymbol = cur.symbol;
        }
      }

      return updated;
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      // Save locally
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));

      // Synchronize with backend if business context is active
      if (activeBusiness) {
        const cur = CURRENCY_OPTIONS.find((c) => c.id === formData.currency);
        await updateSettings({
          currency_code: cur ? cur.code : activeBusiness.currency_code,
          timezone: formData.timezone,
        });
      } else {
        await new Promise((res) => setTimeout(res, 400));
      }

      // Notify other tabs / components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("smartpos:localization-updated", { detail: formData }));
      }

      toast.success("Localization settings saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update localization settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaults = {
      language: "English",
      languageSwitcher: true,
      timezone: "UTC 5:30",
      dateFormat: "01 Jan 2026",
      timeFormat: "12 Hours",
      financialYear: "2026",
      startingMonth: "January",
      currency: "USA",
      currencySymbol: "$",
      currencyPosition: "left",
      decimalSeparator: ".",
      thousandSeparator: ",",
    };
    setFormData(defaults);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info("Localization reset to default parameters.");
  };

  // Live Price Formatter for Simulation Box
  const previewFormattedAmount = useMemo(() => {
    const rawNumber = 1250.75;
    const parts = rawNumber.toFixed(2).split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    if (formData.thousandSeparator) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, formData.thousandSeparator);
    }

    const numberStr = `${integerPart}${formData.decimalSeparator}${decimalPart}`;

    switch (formData.currencyPosition) {
      case "right":
        return `${numberStr}${formData.currencySymbol}`;
      case "left_space":
        return `${formData.currencySymbol} ${numberStr}`;
      case "right_space":
        return `${numberStr} ${formData.currencySymbol}`;
      case "left":
      default:
        return `${formData.currencySymbol}${numberStr}`;
    }
  }, [formData.currencySymbol, formData.currencyPosition, formData.decimalSeparator, formData.thousandSeparator]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Title Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none rounded-tr-2xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                Localization
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                Regional Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Configure system language, currency rules, financial calendar, and timestamp representations.
            </p>
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
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Basic Information (Matching DreamsPOS Screenshot) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <ListFilter className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Basic Information
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Website language, time zone calibration, and calendar formatting
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {/* Row 1: Language */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Language
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select Language of the Website
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.label}>
                    {lang.label} ({lang.native})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Language Switcher */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Language Switcher
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                To display in all the pages
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={formData.languageSwitcher}
                onClick={() => handleChange("languageSwitcher", !formData.languageSwitcher)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.languageSwitcher
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                    : "bg-slate-200 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.languageSwitcher ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Row 3: Timezone */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Timezone
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select Time zone in website
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.value}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 4: Date format */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Date format
                </h3>
                {mounted && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live: {formatLiveDate(currentDate, formData.dateFormat)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select date format to display in website
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.dateFormat}
                onChange={(e) => handleChange("dateFormat", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {DATE_FORMAT_OPTIONS.map((df) => (
                  <option key={df.value} value={df.value}>
                    {df.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 5: Time Format */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Time Format
                </h3>
                {mounted && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Live: {formatLiveTime(currentDate, formData.timeFormat)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select time format to display in website
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.timeFormat}
                onChange={(e) => handleChange("timeFormat", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {TIME_FORMAT_OPTIONS.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 6: Financial Year */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Financial Year
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                  FY {formData.financialYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select year for finance
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.financialYear}
                onChange={(e) => handleChange("financialYear", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {FINANCIAL_YEAR_OPTIONS.map((fy) => (
                  <option key={fy.value} value={fy.value}>
                    {fy.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 7: Starting Month */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Starting Month
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {formData.startingMonth} – {getFiscalEndingMonth(formData.startingMonth)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select starting month to display
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.startingMonth}
                onChange={(e) => handleChange("startingMonth", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {STARTING_MONTH_OPTIONS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Currency Settings (Matching DreamsPOS Screenshot) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Currency Settings
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Primary ledger currency, symbols, display placements, and numeric delimiters
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {/* Row 1: Currency */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Currency
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select Time zone in website
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Currency Symbol */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Currency Symbol
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select date format to display in website
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.currencySymbol}
                onChange={(e) => handleChange("currencySymbol", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {Array.from(new Set(CURRENCY_OPTIONS.map((c) => c.symbol))).map((sym) => (
                  <option key={sym} value={sym}>
                    {sym}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: Currency Position */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Currency Position
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Select currency placement relative to amount
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.currencyPosition}
                onChange={(e) => handleChange("currencyPosition", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {CURRENCY_POSITION_OPTIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 4: Decimal Separator */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Decimal Separator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Fractional cents separator (e.g. 100.50)
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.decimalSeparator}
                onChange={(e) => handleChange("decimalSeparator", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {DECIMAL_SEPARATOR_OPTIONS.map((ds) => (
                  <option key={ds.value} value={ds.value}>
                    {ds.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 5: Thousand Separator */}
          <div className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Thousand Separator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Large value grouping separator (e.g. 1,000)
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={formData.thousandSeparator}
                onChange={(e) => handleChange("thousandSeparator", e.target.value)}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {THOUSAND_SEPARATOR_OPTIONS.map((ts) => (
                  <option key={ts.value} value={ts.value}>
                    {ts.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Live POS Terminal Receipt & Formatter Preview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-200">
              Live POS Receipt & Invoice Formatter
            </h3>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Live Simulator
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Sample Formatted Amount
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono tracking-tight">
              {previewFormattedAmount}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Calculated using active symbols & separators
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-indigo-400" />
              Live Date & Time
            </span>
            <div className="text-sm sm:text-base font-bold text-white mt-1 flex items-center gap-2">
              <span>{formatLiveDate(currentDate, formData.dateFormat)}</span>
              <span className="text-indigo-400">•</span>
              <span className="font-mono text-emerald-400">{formatLiveTime(currentDate, formData.timeFormat)}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Zone: {formData.timezone} (Real-time Clock)
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3 text-amber-400" />
              Financial Context
            </span>
            <div className="text-sm sm:text-base font-bold text-amber-400 mt-1">
              FY {formData.financialYear} ({formData.startingMonth} – {getFiscalEndingMonth(formData.startingMonth)})
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              UI: {formData.language} {formData.languageSwitcher ? "(Switcher Active)" : "(Locked)"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Regional format applies globally across all POS registers and store receipts.</span>
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
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
