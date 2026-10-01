"use client";

import React from "react";
import { Sliders } from "lucide-react";
import { MAX_CACHE_SIZE_OPTIONS } from "@/lib/storage/storage-policy";

interface CacheSizeSelectorProps {
  currentBytes: number | null;
  onChange: (bytes: number | null) => void;
  className?: string;
}

export function CacheSizeSelector({
  currentBytes,
  onChange,
  className = "",
}: CacheSizeSelectorProps) {
  const selectedIndex = MAX_CACHE_SIZE_OPTIONS.findIndex(
    (opt) => opt.bytes === currentBytes
  );
  const activeIndex = selectedIndex !== -1 ? selectedIndex : 2; // Default 500 MB (index 2)

  const handleStepClick = (index: number) => {
    const selectedOption = MAX_CACHE_SIZE_OPTIONS[index];
    onChange(selectedOption.bytes);
  };

  const percentage = (activeIndex / (MAX_CACHE_SIZE_OPTIONS.length - 1)) * 100;

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-5 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Maximum Cache Limit
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Automatic LRU eviction when threshold is reached
            </p>
          </div>
        </div>

        {/* Current Active Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 border border-primary/20 text-primary shadow-xs">
          {MAX_CACHE_SIZE_OPTIONS[activeIndex]?.label}
        </span>
      </div>

      {/* Stepped Pill Nodes */}
      <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
        {MAX_CACHE_SIZE_OPTIONS.map((opt, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleStepClick(i)}
              className={`py-2 px-1 text-center text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/50 dark:hover:bg-zinc-800/50"
              }`}
            >
              {opt.label.replace(" ", "")}
            </button>
          );
        })}
      </div>

      {/* Stepped Slider Track with Thumb */}
      <div className="relative flex items-center py-2 px-2">
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full relative cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60">
          {/* Active Filled Track */}
          <div
            className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300 shadow-xs"
            style={{ width: `${percentage}%` }}
          />

          {/* Stepped dots */}
          {MAX_CACHE_SIZE_OPTIONS.map((opt, i) => {
            const stepPercent = (i / (MAX_CACHE_SIZE_OPTIONS.length - 1)) * 100;
            const isPassed = i <= activeIndex;

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleStepClick(i)}
                aria-label={`Set limit to ${opt.label}`}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer focus:outline-hidden"
                style={{ left: `${stepPercent}%` }}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isPassed ? "bg-white ring-2 ring-primary" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                />
              </button>
            );
          })}

          {/* Clean Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border-2 border-primary shadow-sm transition-all duration-300 pointer-events-none flex items-center justify-center"
            style={{ left: `${percentage}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
