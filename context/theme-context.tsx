"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";
export type ThemeColor = "orange" | "teal" | "rose" | "purple" | "blue" | "emerald" | "amber";
export type LayoutMode = "default" | "mini" | "two-column" | "horizontal" | "detached" | "without-header" | "rtl";
export type LayoutWidth = "fluid" | "boxed";

export interface ColorPreset {
  id: string;
  name: string;
  type: "solid" | "gradient";
  colorClass: string;
  textClass: string;
  borderClass: string;
  previewBg: string;
  isDark: boolean;
}

export const SOLID_BAR_COLORS: ColorPreset[] = [
  {
    id: "white",
    name: "White",
    type: "solid",
    colorClass: "bg-white dark:bg-zinc-900",
    textClass: "text-slate-800 dark:text-zinc-100",
    borderClass: "border-slate-200/80 dark:border-zinc-800",
    previewBg: "bg-white border-slate-300",
    isDark: false,
  },
  {
    id: "light",
    name: "Light Slate",
    type: "solid",
    colorClass: "bg-slate-50 dark:bg-zinc-850",
    textClass: "text-slate-800 dark:text-zinc-100",
    borderClass: "border-slate-200 dark:border-zinc-800",
    previewBg: "bg-slate-100 border-slate-300",
    isDark: false,
  },
  {
    id: "slate",
    name: "Deep Slate",
    type: "solid",
    colorClass: "bg-[#334155]",
    textClass: "text-white",
    borderClass: "border-slate-600/80",
    previewBg: "bg-[#334155]",
    isDark: true,
  },
  {
    id: "dark",
    name: "Obsidian Dark",
    type: "solid",
    colorClass: "bg-[#0f172a]",
    textClass: "text-white",
    borderClass: "border-slate-800",
    previewBg: "bg-[#0f172a]",
    isDark: true,
  },
  {
    id: "blue",
    name: "Royal Blue",
    type: "solid",
    colorClass: "bg-[#1d4ed8]",
    textClass: "text-white",
    borderClass: "border-blue-600",
    previewBg: "bg-[#1d4ed8]",
    isDark: true,
  },
  {
    id: "purple",
    name: "Electric Violet",
    type: "solid",
    colorClass: "bg-[#7e22ce]",
    textClass: "text-white",
    borderClass: "border-purple-600",
    previewBg: "bg-[#7e22ce]",
    isDark: true,
  },
  {
    id: "teal",
    name: "Deep Teal",
    type: "solid",
    colorClass: "bg-[#0f766e]",
    textClass: "text-white",
    borderClass: "border-teal-600",
    previewBg: "bg-[#0f766e]",
    isDark: true,
  },
];

export const GRADIENT_BAR_COLORS: ColorPreset[] = [
  {
    id: "gradient-navy",
    name: "Midnight Navy",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155]",
    textClass: "text-white",
    borderClass: "border-slate-700/60",
    previewBg: "bg-gradient-to-br from-[#0f172a] to-[#334155]",
    isDark: true,
  },
  {
    id: "gradient-cyan",
    name: "Ocean Cyan",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#06b6d4]",
    textClass: "text-white",
    borderClass: "border-cyan-700/60",
    previewBg: "bg-gradient-to-br from-[#0369a1] to-[#06b6d4]",
    isDark: true,
  },
  {
    id: "gradient-blue",
    name: "Sapphire Blue",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#1e40af] via-[#1d4ed8] to-[#3b82f6]",
    textClass: "text-white",
    borderClass: "border-blue-700/60",
    previewBg: "bg-gradient-to-br from-[#1e40af] to-[#3b82f6]",
    isDark: true,
  },
  {
    id: "gradient-purple",
    name: "Royal Amethyst",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#581c87] via-[#7e22ce] to-[#a855f7]",
    textClass: "text-white",
    borderClass: "border-purple-700/60",
    previewBg: "bg-gradient-to-br from-[#581c87] to-[#a855f7]",
    isDark: true,
  },
  {
    id: "gradient-teal",
    name: "Emerald Teal",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#14b8a6]",
    textClass: "text-white",
    borderClass: "border-teal-700/60",
    previewBg: "bg-gradient-to-br from-[#064e3b] to-[#14b8a6]",
    isDark: true,
  },
  {
    id: "gradient-orange",
    name: "Sunset Coral",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316]",
    textClass: "text-white",
    borderClass: "border-orange-700/60",
    previewBg: "bg-gradient-to-br from-[#c2410c] to-[#f97316]",
    isDark: true,
  },
  {
    id: "gradient-wine",
    name: "Burgundy Wine",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#4c0519] via-[#881337] to-[#be123c]",
    textClass: "text-white",
    borderClass: "border-rose-900/60",
    previewBg: "bg-gradient-to-br from-[#4c0519] to-[#be123c]",
    isDark: true,
  },
  {
    id: "gradient-violet",
    name: "Neon Indigo",
    type: "gradient",
    colorClass: "bg-gradient-to-r from-[#312e81] via-[#4338ca] to-[#6366f1]",
    textClass: "text-white",
    borderClass: "border-indigo-700/60",
    previewBg: "bg-gradient-to-br from-[#312e81] to-[#6366f1]",
    isDark: true,
  },
];

export interface ThemeColorPreset {
  id: ThemeColor;
  name: string;
  hex: string;
  bgClass: string;
  ringClass: string;
}

export const THEME_ACCENT_COLORS: ThemeColorPreset[] = [
  { id: "orange", name: "Warm Orange", hex: "#f97316", bgClass: "bg-orange-500", ringClass: "ring-orange-500" },
  { id: "teal", name: "Modern Teal", hex: "#0d9488", bgClass: "bg-teal-600", ringClass: "ring-teal-500" },
  { id: "rose", name: "Crimson Rose", hex: "#e11d48", bgClass: "bg-rose-600", ringClass: "ring-rose-500" },
  { id: "purple", name: "Electric Purple", hex: "#8b5cf6", bgClass: "bg-purple-600", ringClass: "ring-purple-500" },
  { id: "blue", name: "Sky Blue", hex: "#3b82f6", bgClass: "bg-blue-600", ringClass: "ring-blue-500" },
  { id: "emerald", name: "Jade Emerald", hex: "#10b981", bgClass: "bg-emerald-600", ringClass: "ring-emerald-500" },
  { id: "amber", name: "Golden Amber", hex: "#d97706", bgClass: "bg-amber-600", ringClass: "ring-amber-500" },
];

export interface ThemeContextType {
  // Theme mode
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;

  // Theme Accent
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;

  // Layout Controls
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  layoutWidth: LayoutWidth;
  setLayoutWidth: (width: LayoutWidth) => void;

  // Header & Sidebar Colors
  topBarColor: string;
  setTopBarColor: (colorId: string) => void;
  sidebarColor: string;
  setSidebarColor: (colorId: string) => void;

  // Customizer Drawer State
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;

  // Reset
  resetCustomizer: () => void;

  // Helpers
  getTopBarPreset: () => ColorPreset;
  getSidebarPreset: () => ColorPreset;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME_KEY = "smartpos_theme";
const STORAGE_CUSTOMIZER_KEY = "smartpos_layout_customizer";

interface CustomizerStorageData {
  themeColor: ThemeColor;
  layoutMode: LayoutMode;
  layoutWidth: LayoutWidth;
  topBarColor: string;
  sidebarColor: string;
}

const DEFAULT_CUSTOMIZER: CustomizerStorageData = {
  themeColor: "orange",
  layoutMode: "default",
  layoutWidth: "fluid",
  topBarColor: "white",
  sidebarColor: "white",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const [themeColor, setThemeColorState] = useState<ThemeColor>(DEFAULT_CUSTOMIZER.themeColor);
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(DEFAULT_CUSTOMIZER.layoutMode);
  const [layoutWidth, setLayoutWidthState] = useState<LayoutWidth>(DEFAULT_CUSTOMIZER.layoutWidth);
  const [topBarColor, setTopBarColorState] = useState<string>(DEFAULT_CUSTOMIZER.topBarColor);
  const [sidebarColor, setSidebarColorState] = useState<string>(DEFAULT_CUSTOMIZER.sidebarColor);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Apply theme mode to HTML DOM
  const applyTheme = useCallback((targetTheme: Theme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const isSystemDark =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;
    const effectiveIsDark = targetTheme === "dark" || (targetTheme === "system" && isSystemDark);

    if (effectiveIsDark) {
      root.classList.add("dark");
      setResolvedTheme("dark");
    } else {
      root.classList.remove("dark");
      setResolvedTheme("light");
    }
  }, []);

  // Apply layout attributes to DOM (dir="rtl" for RTL layout, data attributes)
  const applyLayoutAttributes = useCallback((mode: LayoutMode, color: ThemeColor) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (mode === "rtl") {
      root.setAttribute("dir", "rtl");
    } else {
      root.setAttribute("dir", "ltr");
    }
    root.setAttribute("data-theme-color", color);
    root.setAttribute("data-layout-mode", mode);
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) as Theme | null;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        setThemeState("system");
        applyTheme("system");
      }

      const savedCustomizerStr = localStorage.getItem(STORAGE_CUSTOMIZER_KEY);
      if (savedCustomizerStr) {
        const parsed = JSON.parse(savedCustomizerStr) as Partial<CustomizerStorageData>;
        if (parsed.themeColor) setThemeColorState(parsed.themeColor);
        if (parsed.layoutMode) setLayoutModeState(parsed.layoutMode);
        if (parsed.layoutWidth) setLayoutWidthState(parsed.layoutWidth);
        if (parsed.topBarColor) setTopBarColorState(parsed.topBarColor);
        if (parsed.sidebarColor) setSidebarColorState(parsed.sidebarColor);
        applyLayoutAttributes(parsed.layoutMode || "default", parsed.themeColor || "orange");
      } else {
        applyLayoutAttributes("default", "orange");
      }
    } catch {
      applyTheme("system");
    }
  }, [applyTheme, applyLayoutAttributes]);

  // Persist helper
  const persistCustomizer = (partial: Partial<CustomizerStorageData>) => {
    try {
      const current: CustomizerStorageData = {
        themeColor,
        layoutMode,
        layoutWidth,
        topBarColor,
        sidebarColor,
        ...partial,
      };
      localStorage.setItem(STORAGE_CUSTOMIZER_KEY, JSON.stringify(current));
    } catch {
      // LocalStorage restricted
    }
  };

  // Listen to OS system preference changes when in "system" mode
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const currentStored = (localStorage.getItem(STORAGE_THEME_KEY) as Theme) || "system";
      if (currentStored === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, newTheme);
    } catch {}
    applyTheme(newTheme);
  };

  const setThemeColor = (newColor: ThemeColor) => {
    setThemeColorState(newColor);
    persistCustomizer({ themeColor: newColor });
    applyLayoutAttributes(layoutMode, newColor);
  };

  const setLayoutMode = (newMode: LayoutMode) => {
    setLayoutModeState(newMode);
    persistCustomizer({ layoutMode: newMode });
    applyLayoutAttributes(newMode, themeColor);
  };

  const setLayoutWidth = (newWidth: LayoutWidth) => {
    setLayoutWidthState(newWidth);
    persistCustomizer({ layoutWidth: newWidth });
  };

  const setTopBarColor = (newColorId: string) => {
    setTopBarColorState(newColorId);
    persistCustomizer({ topBarColor: newColorId });
  };

  const setSidebarColor = (newColorId: string) => {
    setSidebarColorState(newColorId);
    persistCustomizer({ sidebarColor: newColorId });
  };

  const resetCustomizer = () => {
    setThemeState("system");
    applyTheme("system");
    try {
      localStorage.removeItem(STORAGE_THEME_KEY);
      localStorage.removeItem(STORAGE_CUSTOMIZER_KEY);
    } catch {}
    setThemeColorState(DEFAULT_CUSTOMIZER.themeColor);
    setLayoutModeState(DEFAULT_CUSTOMIZER.layoutMode);
    setLayoutWidthState(DEFAULT_CUSTOMIZER.layoutWidth);
    setTopBarColorState(DEFAULT_CUSTOMIZER.topBarColor);
    setSidebarColorState(DEFAULT_CUSTOMIZER.sidebarColor);
    applyLayoutAttributes("default", "orange");
  };

  const getTopBarPreset = (): ColorPreset => {
    const allPresets = [...SOLID_BAR_COLORS, ...GRADIENT_BAR_COLORS];
    return allPresets.find((p) => p.id === topBarColor) || SOLID_BAR_COLORS[0];
  };

  const getSidebarPreset = (): ColorPreset => {
    const allPresets = [...SOLID_BAR_COLORS, ...GRADIENT_BAR_COLORS];
    return allPresets.find((p) => p.id === sidebarColor) || SOLID_BAR_COLORS[0];
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
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
        getTopBarPreset,
        getSidebarPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
