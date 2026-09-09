"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, type Theme } from "@/context/theme-context";

export interface ThemeToggleProps {
  variant?: "dropdown" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "dropdown", className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            theme === "light"
              ? "bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            theme === "dark"
              ? "bg-white dark:bg-zinc-700 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            theme === "system"
              ? "bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-xs font-semibold"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
          }`}
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // Dropdown Mode (Ideal for top navigation bar)
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
        title={`Theme: ${theme === "system" ? `System (${resolvedTheme})` : theme}`}
        aria-label="Toggle theme"
      >
        {theme === "light" && <Sun className="h-4.5 w-4.5 text-amber-500 transition-transform" />}
        {theme === "dark" && <Moon className="h-4.5 w-4.5 text-sky-400 transition-transform" />}
        {theme === "system" && (
          <div className="relative">
            <Monitor className="h-4.5 w-4.5 text-slate-600 dark:text-zinc-400 transition-transform" />
            <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 text-xs select-none">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Appearance
          </div>

          {/* Light Theme */}
          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
              theme === "light"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Dark Theme */}
          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
              theme === "dark"
                ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-sky-500 dark:text-sky-400" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />}
          </button>

          {/* System (Auto) Theme */}
          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
              theme === "system"
                ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-semibold"
                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Monitor className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              <div className="flex flex-col">
                <span>System</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Auto ({resolvedTheme})
                </span>
              </div>
            </div>
            {theme === "system" && <Check className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />}
          </button>
        </div>
      )}
    </div>
  );
}
