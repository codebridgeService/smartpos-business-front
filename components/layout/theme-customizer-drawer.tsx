"use client";

import React, { useState } from "react";
import {
  X,
  RotateCcw,
  Check,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  useTheme,
  SOLID_BAR_COLORS,
  GRADIENT_BAR_COLORS,
  THEME_ACCENT_COLORS,
  type LayoutMode,
  type LayoutWidth,
} from "@/context/theme-context";

interface LayoutOption {
  id: LayoutMode;
  label: string;
  description: string;
  // Mini visual SVG mockup of layout structure
  preview: (isActive: boolean) => React.ReactNode;
}

export function ThemeCustomizerDrawer() {
  const {
    theme,
    setTheme,
    themeColor,
    setThemeColor,
    layoutMode,
    setLayoutMode,
    layoutWidth,
    setLayoutWidth,
    topBarColor,
    setTopBarColor,
    sidebarColor,
    setSidebarColor,
    isCustomizerOpen,
    setIsCustomizerOpen,
    resetCustomizer,
  } = useTheme();

  // Accordion open/collapse states
  const [openSections, setOpenSections] = useState({
    layouts: true,
    layoutWidth: true,
    topBarColor: true,
    sidebarColor: true,
    themeMode: true,
    themeColors: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const layoutOptions: LayoutOption[] = [
    {
      id: "default",
      label: "Default",
      description: "Left sidebar with top header bar",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          {/* Header */}
          <rect x="0" y="0" width="120" height="15" fill={isActive ? "#fb923c" : "#94a3b8"} opacity="0.3" />
          <circle cx="8" cy="7.5" r="2.5" fill="#f97316" />
          {/* Sidebar */}
          <rect x="0" y="15" width="28" height="60" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.7" />
          <line x1="6" y1="24" x2="22" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1="6" y1="32" x2="18" y2="32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="6" y1="40" x2="20" y2="40" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {/* Content Area */}
          <rect x="33" y="20" width="82" height="50" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "mini",
      label: "Mini",
      description: "Icon-only rail with hover expansion",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          <rect x="0" y="0" width="120" height="15" fill={isActive ? "#fb923c" : "#94a3b8"} opacity="0.3" />
          {/* Rail Sidebar */}
          <rect x="0" y="15" width="14" height="60" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.7" />
          <circle cx="7" cy="24" r="2" fill="#ffffff" />
          <circle cx="7" cy="32" r="2" fill="#ffffff" opacity="0.7" />
          <circle cx="7" cy="40" r="2" fill="#ffffff" opacity="0.7" />
          {/* Content Area */}
          <rect x="19" y="20" width="96" height="50" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "two-column",
      label: "Two Column",
      description: "Two-tier icon + submenu panel",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          <rect x="0" y="0" width="120" height="15" fill={isActive ? "#fb923c" : "#94a3b8"} opacity="0.3" />
          {/* Column 1 */}
          <rect x="0" y="15" width="12" height="60" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.85" />
          {/* Column 2 */}
          <rect x="12" y="15" width="22" height="60" fill={isActive ? "#fed7aa" : "#cbd5e1"} opacity="0.5" />
          {/* Content Area */}
          <rect x="39" y="20" width="76" height="50" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "horizontal",
      label: "Horizontal",
      description: "Top bar horizontal navigation",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          {/* Top Bar */}
          <rect x="0" y="0" width="120" height="14" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.8" />
          {/* Sub Navigation Bar */}
          <rect x="0" y="14" width="120" height="10" fill={isActive ? "#fed7aa" : "#cbd5e1"} opacity="0.5" />
          <line x1="8" y1="19" x2="22" y2="19" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="19" x2="42" y2="19" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <line x1="48" y1="19" x2="62" y2="19" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          {/* Content Area */}
          <rect x="6" y="29" width="108" height="41" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "detached",
      label: "Detached",
      description: "Floating detached cards layout",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-850">
          {/* Detached Header Card */}
          <rect x="30" y="4" width="86" height="12" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          {/* Detached Sidebar Card */}
          <rect x="4" y="4" width="22" height="67" rx="3" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.8" />
          {/* Detached Content Card */}
          <rect x="30" y="20" width="86" height="51" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "without-header",
      label: "Without Header",
      description: "Sidebar fills full screen height",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          {/* Full Height Sidebar */}
          <rect x="0" y="0" width="28" height="75" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.8" />
          <line x1="6" y1="12" x2="22" y2="12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="6" y1="22" x2="18" y2="22" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="6" y1="30" x2="20" y2="30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          {/* Content Area */}
          <rect x="34" y="6" width="80" height="63" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: "rtl",
      label: "RTL",
      description: "Right-to-left mirrored structure",
      preview: (isActive) => (
        <svg viewBox="0 0 120 75" className="w-full h-auto rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800">
          <rect x="0" y="0" width="120" height="15" fill={isActive ? "#fb923c" : "#94a3b8"} opacity="0.3" />
          {/* Sidebar on Right */}
          <rect x="92" y="15" width="28" height="60" fill={isActive ? "#ea580c" : "#64748b"} opacity="0.7" />
          <line x1="98" y1="24" x2="114" y2="24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          <line x1="102" y1="32" x2="114" y2="32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          {/* Content on Left */}
          <rect x="5" y="20" width="82" height="50" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
      ),
    },
  ];

  if (!isCustomizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCustomizerOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-5 py-4.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-850/50">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                    Customizer & Layouts
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Customize layout, navbar & color palette
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close customizer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body with Accordion Sections */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Section 1: Select Layouts */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/30">
              <button
                type="button"
                onClick={() => toggleSection("layouts")}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Select Layouts
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                    {layoutMode}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    openSections.layouts ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.layouts && (
                <div className="grid grid-cols-3 gap-2.5 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                  {layoutOptions.map((opt) => {
                    const isActive = layoutMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLayoutMode(opt.id)}
                        className={`group relative flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isActive
                            ? "border-orange-500 bg-orange-50/40 dark:bg-orange-950/30 shadow-xs ring-1 ring-orange-500"
                            : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="w-full px-1">{opt.preview(isActive)}</div>
                        <span
                          className={`text-[11.5px] font-medium mt-2 truncate w-full ${
                            isActive
                              ? "text-orange-600 dark:text-orange-400 font-semibold"
                              : "text-slate-700 dark:text-zinc-300"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Layout Width */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/30">
              <button
                type="button"
                onClick={() => toggleSection("layoutWidth")}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Layout Width
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                    {layoutWidth}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    openSections.layoutWidth ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.layoutWidth && (
                <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setLayoutWidth("fluid")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      layoutWidth === "fluid"
                        ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Fluid Layout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutWidth("boxed")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      layoutWidth === "boxed"
                        ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span>Boxed Layout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 3: Top Bar Color */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/30">
              <button
                type="button"
                onClick={() => toggleSection("topBarColor")}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Top Bar Color
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                    {topBarColor}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    openSections.topBarColor ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.topBarColor && (
                <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                      Solid Colors
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {SOLID_BAR_COLORS.map((preset) => {
                        const isActive = topBarColor === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setTopBarColor(preset.id)}
                            title={preset.name}
                            className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                              preset.previewBg
                            } ${
                              isActive
                                ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
                                : "hover:scale-105"
                            }`}
                          >
                            {isActive && (
                              <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                      Gradient Colors
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {GRADIENT_BAR_COLORS.map((preset) => {
                        const isActive = topBarColor === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setTopBarColor(preset.id)}
                            title={preset.name}
                            className={`h-9 rounded-xl border border-transparent flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                              preset.previewBg
                            } ${
                              isActive
                                ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
                                : "hover:scale-105"
                            }`}
                          >
                            {isActive && (
                              <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Sidebar Color */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/30">
              <button
                type="button"
                onClick={() => toggleSection("sidebarColor")}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Sidebar Color
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                    {sidebarColor}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    openSections.sidebarColor ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.sidebarColor && (
                <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                      Solid Colors
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {SOLID_BAR_COLORS.map((preset) => {
                        const isActive = sidebarColor === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSidebarColor(preset.id)}
                            title={preset.name}
                            className={`h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                              preset.previewBg
                            } ${
                              isActive
                                ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
                                : "hover:scale-105"
                            }`}
                          >
                            {isActive && (
                              <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                      Gradient Colors
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {GRADIENT_BAR_COLORS.map((preset) => {
                        const isActive = sidebarColor === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSidebarColor(preset.id)}
                            title={preset.name}
                            className={`h-9 rounded-xl border border-transparent flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                              preset.previewBg
                            } ${
                              isActive
                                ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 scale-105"
                                : "hover:scale-105"
                            }`}
                          >
                            {isActive && (
                              <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Theme Mode */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/30">
              <button
                type="button"
                onClick={() => toggleSection("themeMode")}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Theme Mode
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                    {theme}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    openSections.themeMode ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.themeMode && (
                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === "light"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === "dark"
                        ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5 text-sky-500" />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === "system"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5 text-slate-500" />
                    <span>System</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 6: Theme Colors (Accent Colors) */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-zinc-850/30">
              <button
                type="button"
                onClick={() => toggleSection("themeColors")}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Theme Colors
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 capitalize">
                    {themeColor}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    openSections.themeColors ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openSections.themeColors && (
                <div className="grid grid-cols-7 gap-2.5 mt-3.5 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                  {THEME_ACCENT_COLORS.map((accent) => {
                    const isActive = themeColor === accent.id;
                    return (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => setThemeColor(accent.id)}
                        title={accent.name}
                        className={`h-9 rounded-xl ${accent.bgClass} flex items-center justify-center transition-all cursor-pointer relative shadow-sm ${
                          isActive
                            ? "ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-zinc-900 scale-105"
                            : "hover:scale-105"
                        }`}
                      >
                        {isActive && (
                          <div className="h-4.5 w-4.5 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer matching reference screenshot */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
            <button
              type="button"
              onClick={resetCustomizer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-750 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Apply & Close</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
