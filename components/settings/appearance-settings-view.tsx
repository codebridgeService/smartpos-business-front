"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronDown,
  Sparkles,
  Layout,
  Type,
  Maximize2,
  Minimize2,
  Paintbrush,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTheme, type Theme, type ThemeColor } from "@/context/theme-context";

export interface AccentColorPreset {
  id: string;
  name: string;
  hex: string;
  themeColorId: ThemeColor;
  ringClass: string;
}

export const ACCENT_COLOR_PRESETS: AccentColorPreset[] = [
  { id: "orange", name: "DreamsPOS Orange", hex: "#FE9F43", themeColorId: "orange", ringClass: "ring-[#FE9F43]" },
  { id: "purple", name: "Royal Purple", hex: "#7059FF", themeColorId: "purple", ringClass: "ring-[#7059FF]" },
  { id: "blue", name: "Ocean Blue", hex: "#2E7DFF", themeColorId: "blue", ringClass: "ring-[#2E7DFF]" },
  { id: "bronze", name: "Deep Bronze", hex: "#C85A17", themeColorId: "amber", ringClass: "ring-[#C85A17]" },
];

export const SIDEBAR_SIZE_OPTIONS = [
  { id: "default", label: "Default - 240px", width: 240 },
  { id: "small", label: "Small - 85px", width: 85 },
  { id: "medium", label: "Medium - 200px", width: 200 },
  { id: "large", label: "Large - 260px", width: 260 },
];

export const FONT_FAMILY_OPTIONS = [
  { id: "Default", label: "Default", fontClass: "font-sans", category: "Original System Font (Geist)" },
  { id: "Nunito", label: "Nunito", fontClass: "font-sans", category: "Rounded Sans (DreamsPOS)" },
  { id: "Poppins", label: "Poppins", fontClass: "font-sans", category: "Geometric Display" },
  { id: "Inter", label: "Inter", fontClass: "font-sans", category: "Neutral UI Standard" },
  { id: "Roboto", label: "Roboto", fontClass: "font-sans", category: "Crisp Material Sans" },
  { id: "Outfit", label: "Outfit", fontClass: "font-sans", category: "Contemporary Clean" },
  { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans", fontClass: "font-sans", category: "Modern Tech Sans" },
  { id: "Playfair Display", label: "Playfair Display", fontClass: "font-serif", category: "Classic Editorial Serif" },
  { id: "Space Grotesk", label: "Space Grotesk", fontClass: "font-sans", category: "Distinct High-Tech Grotesque" },
  { id: "DM Sans", label: "DM Sans", fontClass: "font-sans", category: "Minimalist Modern" },
];

const LOCAL_STORAGE_KEY = "smartpos_appearance_settings";

const SIDEBAR_SIZE_MAP: Record<string, string> = {
  "Default - 240px": "240px",
  "Small - 85px": "85px",
  "Medium - 200px": "200px",
  "Large - 260px": "260px",
};

const GOOGLE_FONT_URLS: Record<string, string> = {
  Nunito: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap",
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
  Poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  Outfit: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap",
  "Plus Jakarta Sans": "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
  "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap",
  "Space Grotesk": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
  "DM Sans": "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
};

// Helper to dynamically load font from Google Fonts with valid weights
function loadGoogleFont(fontName: string) {
  if (typeof document === "undefined") return;
  const linkId = `google-font-${fontName.toLowerCase().replace(/\s+/g, "-")}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = GOOGLE_FONT_URLS[fontName] || `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }
}

export function AppearanceSettingsView() {
  const { theme, setTheme, themeColor, setThemeColor } = useTheme();
  const toast = useToast();

  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "automatic">(() => {
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return "automatic";
  });

  const [selectedAccent, setSelectedAccent] = useState<string>("orange");
  const [expandSidebar, setExpandSidebar] = useState<boolean>(true);
  const [sidebarSize, setSidebarSize] = useState<string>("Default - 240px");
  const [fontFamily, setFontFamily] = useState<string>("Default");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Apply visual styles to document DOM immediately
  const applyDOMStyles = useCallback((options: {
    accentId?: string;
    sizeLabel?: string;
    font?: string;
    expand?: boolean;
  }) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // 1. Accent Color
    if (options.accentId) {
      const preset = ACCENT_COLOR_PRESETS.find((c) => c.id === options.accentId);
      if (preset) {
        document.documentElement.style.setProperty("--primary-accent", preset.hex);
        document.documentElement.style.setProperty("--primary", preset.hex);
        document.documentElement.style.setProperty("--primary-500", preset.hex);
        document.documentElement.style.setProperty("--primary-600", preset.hex);
        document.documentElement.setAttribute("data-theme-color", preset.themeColorId);
      }
    }

    // 2. Sidebar Width
    if (options.sizeLabel) {
      const widthPx = SIDEBAR_SIZE_MAP[options.sizeLabel] || "240px";
      document.documentElement.style.setProperty("--sidebar-width", widthPx);
    }

    // 3. Font Family
    if (!options.font || options.font === "Default" || options.font === "Geist" || options.font === "System") {
      document.documentElement.style.removeProperty("--app-font");
      document.documentElement.removeAttribute("data-font-family");
      if (document.body) {
        document.body.style.removeProperty("font-family");
      }
      const existingStyle = document.getElementById("smartpos-dynamic-font");
      if (existingStyle) {
        existingStyle.remove();
      }
    } else {
      loadGoogleFont(options.font);
      document.documentElement.style.setProperty("--app-font", `"${options.font}", sans-serif`);
      if (document.body) {
        document.body.style.setProperty("font-family", `"${options.font}", sans-serif`, "important");
      }
      document.documentElement.setAttribute("data-font-family", options.font);

      // Bulletproof dynamic style injection ensuring all elements render with active font
      let styleEl = document.getElementById("smartpos-dynamic-font") as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "smartpos-dynamic-font";
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        :root, html, body, button, input, select, textarea, h1, h2, h3, h4, h5, h6, p, span, a, label, div, table, td, th {
          font-family: "${options.font}", sans-serif !important;
        }
        code, kbd, samp, pre, .font-mono {
          font-family: var(--font-mono, monospace) !important;
        }
      `;
    }

    // 4. Dispatch Event for shells (business-shell, dashboard-shell)
    window.dispatchEvent(
      new CustomEvent("smartpos:appearance-updated", {
        detail: {
          selectedAccent: options.accentId,
          sidebarSize: options.sizeLabel,
          fontFamily: options.font,
          expandSidebar: options.expand,
        },
      })
    );
  }, []);

  // Initialize from localStorage or theme context
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
        if (parsed.selectedAccent) {
          setSelectedAccent(parsed.selectedAccent);
          const p = ACCENT_COLOR_PRESETS.find((c) => c.id === parsed.selectedAccent);
          if (p) setThemeColor(p.themeColorId);
        }
        if (typeof parsed.expandSidebar === "boolean") setExpandSidebar(parsed.expandSidebar);
        if (parsed.sidebarSize) setSidebarSize(parsed.sidebarSize);

        // If font was Nunito (from earlier automatic save) or Default or empty, restore to Default
        const activeFont = (parsed.fontFamily && parsed.fontFamily !== "Nunito") ? parsed.fontFamily : "Default";
        setFontFamily(activeFont);

        applyDOMStyles({
          accentId: parsed.selectedAccent || "orange",
          sizeLabel: parsed.sidebarSize || "Default - 240px",
          font: activeFont,
          expand: typeof parsed.expandSidebar === "boolean" ? parsed.expandSidebar : true,
        });
        return;
      }
    } catch {
      // Fallback
    }

    // Default live initial styles
    applyDOMStyles({
      accentId: "orange",
      sizeLabel: "Default - 240px",
      font: "Default",
      expand: true,
    });
  }, [applyDOMStyles, setThemeColor]);

  // Handle Theme Selection Card Click
  const handleSelectThemeMode = (mode: "light" | "dark" | "automatic") => {
    setSelectedTheme(mode);
    if (mode === "automatic") {
      setTheme("system");
    } else {
      setTheme(mode);
    }
  };

  // Handle Accent Color Click (Live preview)
  const handleSelectAccent = (colorId: string) => {
    setSelectedAccent(colorId);
    const preset = ACCENT_COLOR_PRESETS.find((c) => c.id === colorId);
    if (preset) {
      setThemeColor(preset.themeColorId);
    }
    applyDOMStyles({ accentId: colorId });
  };

  // Handle Expand Sidebar Toggle (Live preview)
  const handleToggleExpandSidebar = () => {
    const nextVal = !expandSidebar;
    setExpandSidebar(nextVal);
    applyDOMStyles({ expand: nextVal });
  };

  // Handle Sidebar Size Change (Live preview)
  const handleChangeSidebarSize = (newSize: string) => {
    setSidebarSize(newSize);
    applyDOMStyles({ sizeLabel: newSize });
  };

  // Handle Font Family Change (Live preview)
  const handleChangeFontFamily = (newFont: string) => {
    setFontFamily(newFont);
    applyDOMStyles({ font: newFont });
  };

  // Save changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const appearanceData = {
        selectedTheme,
        selectedAccent,
        expandSidebar,
        sidebarSize,
        fontFamily,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appearanceData));

      // Re-apply live styles to ensure consistency
      applyDOMStyles({
        accentId: selectedAccent,
        sizeLabel: sidebarSize,
        font: fontFamily,
        expand: expandSidebar,
      });

      await new Promise((res) => setTimeout(res, 250));
      toast.success("Appearance settings saved successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save appearance settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel / Revert Changes
  const handleCancel = () => {
    let target = {
      selectedTheme: "light" as "light" | "dark" | "automatic",
      selectedAccent: "orange",
      expandSidebar: true,
      sidebarSize: "Default - 240px",
      fontFamily: "Default",
    };

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        target = { ...target, ...JSON.parse(saved) };
        if (target.fontFamily === "Nunito") target.fontFamily = "Default";
      }
    } catch {}

    // Restore state
    setSelectedTheme(target.selectedTheme);
    setTheme(target.selectedTheme === "automatic" ? "system" : target.selectedTheme);
    setSelectedAccent(target.selectedAccent);
    const p = ACCENT_COLOR_PRESETS.find((c) => c.id === target.selectedAccent);
    if (p) setThemeColor(p.themeColorId);
    setExpandSidebar(target.expandSidebar);
    setSidebarSize(target.sidebarSize);
    setFontFamily(target.fontFamily);

    // Re-apply saved styles
    applyDOMStyles({
      accentId: target.selectedAccent,
      sizeLabel: target.sidebarSize,
      font: target.fontFamily,
      expand: target.expandSidebar,
    });

    toast.info("Appearance changes discarded.");
  };

  const activeAccentPreset = ACCENT_COLOR_PRESETS.find((c) => c.id === selectedAccent) || ACCENT_COLOR_PRESETS[0];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800">
        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
          Appearance
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* ROW 1: Select Theme */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="lg:w-1/3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Select Theme
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Choose accent colour of website
            </p>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Light Theme */}
            <button
              type="button"
              onClick={() => handleSelectThemeMode("light")}
              style={
                selectedTheme === "light"
                  ? { borderColor: activeAccentPreset.hex, boxShadow: `0 0 0 2px ${activeAccentPreset.hex}33` }
                  : undefined
              }
              className={`group text-left rounded-2xl p-2.5 border transition-all duration-200 cursor-pointer ${
                selectedTheme === "light"
                  ? "shadow-md bg-amber-50/20 dark:bg-zinc-800"
                  : "border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Light Mockup Preview */}
              <div className="w-full aspect-[16/11] rounded-xl overflow-hidden border border-slate-200/70 dark:border-zinc-700/60 bg-white shadow-xs">
                <svg viewBox="0 0 160 110" className="w-full h-full" fill="none">
                  {/* Top Bar */}
                  <rect width="160" height="16" fill="#f8fafc" />
                  <circle cx="10" cy="8" r="3" fill={activeAccentPreset.hex} />
                  <rect x="20" y="5.5" width="30" height="5" rx="2" fill="#e2e8f0" />
                  <circle cx="140" cy="8" r="2.5" fill="#cbd5e1" />
                  <circle cx="150" cy="8" r="3.5" fill="#94a3b8" />

                  {/* Sidebar */}
                  <rect y="16" width="28" height="94" fill="#ffffff" />
                  <rect x="4" y="22" width="20" height="4" rx="2" fill="#cbd5e1" />
                  <rect x="4" y="29" width="20" height="6" rx="2" fill={activeAccentPreset.hex} fillOpacity="0.2" />
                  <rect x="7" y="31" width="14" height="2" rx="1" fill={activeAccentPreset.hex} />
                  <rect x="4" y="38" width="16" height="3" rx="1.5" fill="#e2e8f0" />
                  <rect x="4" y="44" width="18" height="3" rx="1.5" fill="#e2e8f0" />
                  <rect x="4" y="50" width="14" height="3" rx="1.5" fill="#e2e8f0" />

                  {/* Content Area */}
                  <rect x="28" y="16" width="132" height="94" fill="#f8fafc" />

                  {/* 4 Cards */}
                  <rect x="34" y="22" width="26" height="14" rx="3" fill={activeAccentPreset.hex} />
                  <rect x="63" y="22" width="26" height="14" rx="3" fill="#00cfde" />
                  <rect x="92" y="22" width="26" height="14" rx="3" fill="#1b2850" />
                  <rect x="121" y="22" width="26" height="14" rx="3" fill="#28c76f" />

                  {/* Chart area with bars */}
                  <rect x="34" y="40" width="113" height="34" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                  <line x1="42" y1="68" x2="42" y2="52" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="52" y1="68" x2="52" y2="48" stroke="#ff4c51" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="62" y1="68" x2="62" y2="56" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="72" y1="68" x2="72" y2="46" stroke="#ff4c51" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="82" y1="68" x2="82" y2="54" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="92" y1="68" x2="92" y2="50" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="102" y1="68" x2="102" y2="45" stroke="#ff4c51" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="112" y1="68" x2="112" y2="58" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="122" y1="68" x2="122" y2="51" stroke="#ff4c51" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="132" y1="68" x2="132" y2="47" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Table area */}
                  <rect x="34" y="78" width="113" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                  <line x1="40" y1="84" x2="140" y2="84" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="91" x2="140" y2="91" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="98" x2="140" y2="98" stroke="#f1f5f9" strokeWidth="1" />
                </svg>
              </div>
              <div className="mt-2.5 text-center">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Light
                </span>
              </div>
            </button>

            {/* Card 2: Dark Theme */}
            <button
              type="button"
              onClick={() => handleSelectThemeMode("dark")}
              style={
                selectedTheme === "dark"
                  ? { borderColor: activeAccentPreset.hex, boxShadow: `0 0 0 2px ${activeAccentPreset.hex}33` }
                  : undefined
              }
              className={`group text-left rounded-2xl p-2.5 border transition-all duration-200 cursor-pointer ${
                selectedTheme === "dark"
                  ? "shadow-md bg-amber-50/20 dark:bg-zinc-800"
                  : "border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Dark Mockup Preview */}
              <div className="w-full aspect-[16/11] rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 shadow-xs">
                <svg viewBox="0 0 160 110" className="w-full h-full" fill="none">
                  {/* Top Bar */}
                  <rect width="160" height="16" fill="#18181b" />
                  <circle cx="10" cy="8" r="3" fill={activeAccentPreset.hex} />
                  <rect x="20" y="5.5" width="30" height="5" rx="2" fill="#3f3f46" />
                  <circle cx="140" cy="8" r="2.5" fill="#52525b" />
                  <circle cx="150" cy="8" r="3.5" fill="#71717a" />

                  {/* Sidebar */}
                  <rect y="16" width="28" height="94" fill="#18181b" />
                  <rect x="4" y="22" width="20" height="4" rx="2" fill="#3f3f46" />
                  <rect x="4" y="29" width="20" height="6" rx="2" fill={activeAccentPreset.hex} fillOpacity="0.25" />
                  <rect x="7" y="31" width="14" height="2" rx="1" fill={activeAccentPreset.hex} />
                  <rect x="4" y="38" width="16" height="3" rx="1.5" fill="#27272a" />
                  <rect x="4" y="44" width="18" height="3" rx="1.5" fill="#27272a" />
                  <rect x="4" y="50" width="14" height="3" rx="1.5" fill="#27272a" />

                  {/* Content Area */}
                  <rect x="28" y="16" width="132" height="94" fill="#09090b" />

                  {/* 4 Cards (Dark Tone) */}
                  <rect x="34" y="22" width="26" height="14" rx="3" fill="#27272a" />
                  <rect x="63" y="22" width="26" height="14" rx="3" fill="#27272a" />
                  <rect x="92" y="22" width="26" height="14" rx="3" fill="#27272a" />
                  <rect x="121" y="22" width="26" height="14" rx="3" fill="#27272a" />

                  {/* Chart area with white/gray bars */}
                  <rect x="34" y="40" width="113" height="34" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
                  <line x1="42" y1="68" x2="42" y2="54" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="52" y1="68" x2="52" y2="50" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="62" y1="68" x2="62" y2="58" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="72" y1="68" x2="72" y2="48" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="82" y1="68" x2="82" y2="56" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="92" y1="68" x2="92" y2="52" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="102" y1="68" x2="102" y2="46" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="112" y1="68" x2="112" y2="60" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="122" y1="68" x2="122" y2="53" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="132" y1="68" x2="132" y2="49" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Table area */}
                  <rect x="34" y="78" width="113" height="24" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
                  <line x1="40" y1="84" x2="140" y2="84" stroke="#27272a" strokeWidth="1" />
                  <line x1="40" y1="91" x2="140" y2="91" stroke="#27272a" strokeWidth="1" />
                  <line x1="40" y1="98" x2="140" y2="98" stroke="#27272a" strokeWidth="1" />
                </svg>
              </div>
              <div className="mt-2.5 text-center">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Dark
                </span>
              </div>
            </button>

            {/* Card 3: Automatic Theme (Split Light/Dark) */}
            <button
              type="button"
              onClick={() => handleSelectThemeMode("automatic")}
              style={
                selectedTheme === "automatic"
                  ? { borderColor: activeAccentPreset.hex, boxShadow: `0 0 0 2px ${activeAccentPreset.hex}33` }
                  : undefined
              }
              className={`group text-left rounded-2xl p-2.5 border transition-all duration-200 cursor-pointer ${
                selectedTheme === "automatic"
                  ? "shadow-md bg-amber-50/20 dark:bg-zinc-800"
                  : "border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Automatic Split Mockup Preview */}
              <div className="w-full aspect-[16/11] rounded-xl overflow-hidden border border-slate-200/80 dark:border-zinc-700 bg-white shadow-xs relative">
                <svg viewBox="0 0 160 110" className="w-full h-full" fill="none">
                  {/* LEFT HALF: LIGHT */}
                  <g>
                    <rect width="80" height="110" fill="#f8fafc" />
                    {/* Top Bar Light */}
                    <rect width="80" height="16" fill="#f1f5f9" />
                    <circle cx="10" cy="8" r="3" fill={activeAccentPreset.hex} />
                    <rect x="20" y="5.5" width="24" height="5" rx="2" fill="#e2e8f0" />

                    {/* Sidebar Light */}
                    <rect y="16" width="28" height="94" fill="#ffffff" />
                    <rect x="4" y="22" width="20" height="4" rx="2" fill="#cbd5e1" />
                    <rect x="4" y="29" width="20" height="6" rx="2" fill={activeAccentPreset.hex} fillOpacity="0.2" />
                    <rect x="7" y="31" width="14" height="2" rx="1" fill={activeAccentPreset.hex} />
                    <rect x="4" y="38" width="16" height="3" rx="1.5" fill="#e2e8f0" />
                    <rect x="4" y="44" width="18" height="3" rx="1.5" fill="#e2e8f0" />

                    {/* Content Light */}
                    <rect x="34" y="22" width="18" height="14" rx="3" fill={activeAccentPreset.hex} />
                    <rect x="56" y="22" width="18" height="14" rx="3" fill="#00cfde" />

                    {/* Chart Light */}
                    <rect x="34" y="40" width="46" height="34" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="42" y1="68" x2="42" y2="52" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="52" y1="68" x2="52" y2="48" stroke="#ff4c51" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="62" y1="68" x2="62" y2="56" stroke="#28c76f" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="72" y1="68" x2="72" y2="46" stroke="#ff4c51" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Table Light */}
                    <rect x="34" y="78" width="46" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="38" y1="84" x2="76" y2="84" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="38" y1="91" x2="76" y2="91" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="38" y1="98" x2="76" y2="98" stroke="#f1f5f9" strokeWidth="1" />
                  </g>

                  {/* RIGHT HALF: DARK */}
                  <g>
                    <rect x="80" width="80" height="110" fill="#09090b" />
                    {/* Top Bar Dark */}
                    <rect x="80" width="80" height="16" fill="#18181b" />
                    <circle cx="140" cy="8" r="2.5" fill="#52525b" />
                    <circle cx="150" cy="8" r="3.5" fill="#71717a" />

                    {/* Content Dark */}
                    <rect x="86" y="22" width="26" height="14" rx="3" fill="#27272a" />
                    <rect x="115" y="22" width="26" height="14" rx="3" fill="#27272a" />

                    {/* Chart Dark */}
                    <rect x="86" y="40" width="61" height="34" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
                    <line x1="92" y1="68" x2="92" y2="52" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="102" y1="68" x2="102" y2="46" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="112" y1="68" x2="112" y2="60" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="122" y1="68" x2="122" y2="53" stroke="#71717a" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="132" y1="68" x2="132" y2="49" stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Table Dark */}
                    <rect x="86" y="78" width="61" height="24" rx="3" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
                    <line x1="92" y1="84" x2="140" y2="84" stroke="#27272a" strokeWidth="1" />
                    <line x1="92" y1="91" x2="140" y2="91" stroke="#27272a" strokeWidth="1" />
                    <line x1="92" y1="98" x2="140" y2="98" stroke="#27272a" strokeWidth="1" />
                  </g>

                  {/* Vertical Dividing Line */}
                  <line x1="80" y1="0" x2="80" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>
              <div className="mt-2.5 text-center">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Automatic
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* ROW 2: Accent Color */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Accent Color
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Choose accent colour of website
            </p>
          </div>

          <div className="flex items-center gap-3">
            {ACCENT_COLOR_PRESETS.map((color) => {
              const isSelected = selectedAccent === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => handleSelectAccent(color.id)}
                  title={color.name}
                  aria-label={color.name}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer shadow-sm ${
                    isSelected
                      ? `ring-4 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ${color.ringClass} scale-110`
                      : "hover:scale-105 opacity-90 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Check className="h-4 w-4 text-white stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ROW 3: Expand Sidebar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Expand Sidebar
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Choose whether sidebar is expanded by default
            </p>
          </div>

          <div>
            <button
              type="button"
              role="switch"
              aria-checked={expandSidebar}
              onClick={handleToggleExpandSidebar}
              style={expandSidebar ? { backgroundColor: activeAccentPreset.hex, boxShadow: `0 2px 6px ${activeAccentPreset.hex}40` } : undefined}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                expandSidebar
                  ? ""
                  : "bg-slate-200 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  expandSidebar ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ROW 4: Sidebar Size */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
              Sidebar Size
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Select size of the sidebar to display
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <select
              value={sidebarSize}
              onChange={(e) => handleChangeSidebarSize(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all cursor-pointer"
            >
              {SIDEBAR_SIZE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ROW 5: Font Family */}
        <div className="py-3 border-b border-slate-100 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                Font Family
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Select font family of website
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <select
                value={fontFamily}
                onChange={(e) => handleChangeFontFamily(e.target.value)}
                style={{ fontFamily: fontFamily === "Default" ? "var(--font-geist-sans), sans-serif" : `"${fontFamily}", sans-serif` }}
                className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all cursor-pointer font-medium"
              >
                {FONT_FAMILY_OPTIONS.map((f) => (
                  <option
                    key={f.id}
                    value={f.label}
                    style={{ fontFamily: f.label === "Default" ? "var(--font-geist-sans), sans-serif" : `"${f.label}", sans-serif` }}
                  >
                    {f.label} — {f.category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Font Selector Pills */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Type className="h-3 w-3 text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                Quick Select & Test Typography:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FONT_FAMILY_OPTIONS.map((f) => {
                const isSelected = fontFamily === f.label;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleChangeFontFamily(f.label)}
                    style={{
                      fontFamily: f.label === "Default" ? "var(--font-geist-sans), sans-serif" : `"${f.label}", sans-serif`,
                      borderColor: isSelected ? activeAccentPreset.hex : undefined,
                      backgroundColor: isSelected ? `${activeAccentPreset.hex}15` : undefined,
                      color: isSelected ? activeAccentPreset.hex : undefined,
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "shadow-2xs font-bold"
                        : "border-slate-200/80 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 6: Live Typography & Specimen Inspection Card */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-gradient-to-br from-slate-50/90 via-white to-slate-50/50 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 space-y-4 shadow-2xs">
          {/* Top Row: Font Identity & Live Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm transition-colors duration-200 shrink-0"
                style={{ backgroundColor: activeAccentPreset.hex }}
              >
                Aa
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Live System Typography Specimen
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white transition-colors duration-200"
                    style={{ backgroundColor: activeAccentPreset.hex }}
                  >
                    {fontFamily}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {FONT_FAMILY_OPTIONS.find((f) => f.label === fontFamily)?.category || "Selected Typography"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors duration-200"
                style={{ backgroundColor: activeAccentPreset.hex }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {activeAccentPreset.name}
              </span>
            </div>
          </div>

          {/* Typography Specimen Samples in Currently Selected Font */}
          <div
            className="space-y-3 p-4 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 shadow-inner-sm transition-all"
            style={{ fontFamily: `"${fontFamily}", sans-serif` }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                Display Headline & Weights
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug">
                DreamsPOS — Intelligent Retail & Multi-Tenant Management
              </h3>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                Body & Interface Text
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                Streamline counter sales with barcode scanning, automated shift reconciliation, split payments, and real-time inventory synchronisation across all business branches.
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                Numerics, Currency & Symbols
              </span>
              <div className="flex flex-wrap items-baseline gap-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                <span className="text-base sm:text-lg font-bold" style={{ color: activeAccentPreset.hex }}>
                  $24,850.00 USD
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-xs">
                  +18.4% growth
                </span>
                <span>Qty: 3,420 units</span>
                <span>SKU: #POS-8821-X</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                Character Glyph Anatomy
              </span>
              <p className="text-xs text-slate-500 dark:text-zinc-400 tracking-wider font-medium">
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz · 0 1 2 3 4 5 6 7 8 9 · & % @ # ! ? / ( )
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison Specimen Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Compare Different Typefaces Side-by-Side:
              </span>
              <span className="text-[10px] text-slate-400">Click card to apply instantly</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                { name: "Default", tag: "Original System", sample: "Geist clean interface font" },
                { name: "Nunito", tag: "Rounded Sans", sample: "Clean & rounded curves" },
                { name: "Poppins", tag: "Geometric", sample: "Bold modern geometry" },
                { name: "Inter", tag: "Neutral UI", sample: "Technical crisp clarity" },
              ].map((comp) => {
                const isCurrent = fontFamily === comp.name;
                return (
                  <button
                    key={comp.name}
                    type="button"
                    onClick={() => handleChangeFontFamily(comp.name)}
                    style={{
                      borderColor: isCurrent ? activeAccentPreset.hex : undefined,
                      boxShadow: isCurrent ? `0 0 0 1.5px ${activeAccentPreset.hex}40` : undefined,
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-amber-50/30 dark:bg-zinc-800"
                        : "border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold text-slate-900 dark:text-zinc-100"
                        style={{ fontFamily: `"${comp.name}", sans-serif` }}
                      >
                        {comp.name}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                        {comp.tag}
                      </span>
                    </div>
                    <p
                      className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 line-clamp-1"
                      style={{ fontFamily: `"${comp.name}", sans-serif` }}
                    >
                      {comp.sample}
                    </p>
                    <div className="mt-2 text-[10px] font-semibold flex items-center justify-between text-slate-400">
                      <span style={{ fontFamily: `"${comp.name}", sans-serif` }}>$1,234.50</span>
                      {isCurrent ? (
                        <span className="text-xs font-bold" style={{ color: activeAccentPreset.hex }}>
                          ✓ Active
                        </span>
                      ) : (
                        <span className="group-hover:text-slate-600">Apply →</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

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
            style={{ backgroundColor: activeAccentPreset.hex }}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:brightness-95 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
