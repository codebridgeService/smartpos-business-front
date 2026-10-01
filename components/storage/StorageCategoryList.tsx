"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp, Layers, Trash2, RefreshCw } from "lucide-react";
import { type CacheCategory, type CacheCategoryUsage } from "@/lib/storage/storage-types";
import { formatBytes } from "@/lib/storage/storage-policy";
import { usePermissionStore } from "@/stores/usePermissionStore";

interface StorageCategoryListProps {
  categories: CacheCategoryUsage[];
  totalBytes: number;
  onClearSelected: (categories: CacheCategory[], totalSelectedBytes: number) => void;
  onClearCategorySingle?: (category: CacheCategory) => void;
  isClearing?: boolean;
  className?: string;
}

export function StorageCategoryList({
  categories,
  totalBytes,
  onClearSelected,
  onClearCategorySingle,
  isClearing = false,
  className = "",
}: StorageCategoryListProps) {
  // Split into active categories (bytes > 0) and empty categories (bytes === 0)
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.bytes > 0)
      .sort((a, b) => b.bytes - a.bytes);
  }, [categories]);

  const emptyCategories = useMemo(() => {
    return categories.filter((c) => c.bytes === 0);
  }, [categories]);

  // "Show More" toggle state: 0 B categories hidden by default
  const [showMore, setShowMore] = useState(false);

  // Visible categories: if showMore is true, show all; otherwise show only categories with data
  const visibleCategories = useMemo(() => {
    if (showMore || activeCategories.length === 0) {
      return [...activeCategories, ...emptyCategories];
    }
    return activeCategories;
  }, [showMore, activeCategories, emptyCategories]);

  // Selected keys: default to only active categories
  const [selectedKeys, setSelectedKeys] = useState<Set<CacheCategory>>(() => {
    const active = categories.filter((c) => c.bytes > 0);
    return new Set(active.map((c) => c.key));
  });

  const [expandedKey, setExpandedKey] = useState<CacheCategory | null>(null);

  const toggleKey = (key: CacheCategory) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAll = () => {
    const allVisibleSelected =
      visibleCategories.length > 0 &&
      visibleCategories.every((c) => selectedKeys.has(c.key));

    if (allVisibleSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(visibleCategories.map((c) => c.key)));
    }
  };

  const selectedBytes = categories
    .filter((c) => selectedKeys.has(c.key))
    .reduce((sum, c) => sum + c.bytes, 0);

  const isAllSelected =
    visibleCategories.length > 0 &&
    visibleCategories.every((c) => selectedKeys.has(c.key));
  const isNoneSelected = selectedKeys.size === 0;

  const handleClearClick = () => {
    if (isNoneSelected) return;
    onClearSelected(Array.from(selectedKeys), selectedBytes);
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4 select-none ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Storage Breakdown ({selectedKeys.size} of {visibleCategories.length}
          {!showMore && emptyCategories.length > 0 && ` Active`})
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-primary hover:underline font-semibold transition-colors cursor-pointer"
        >
          {isAllSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Category Rows */}
      <div className="space-y-1.5">
        {visibleCategories.map((cat) => {
          const isSelected = selectedKeys.has(cat.key);
          const isExpanded = expandedKey === cat.key;

          return (
            <div
              key={cat.key}
              className="rounded-xl transition-all border border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-300/80 dark:hover:border-zinc-700 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40"
            >
              <div
                className="flex items-center justify-between gap-3 p-2.5 cursor-pointer"
                onClick={() => toggleKey(cat.key)}
              >
                {/* Left: Circular Checkbox + Name + Percentage */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? "shadow-xs text-white"
                        : "border border-zinc-300 dark:border-zinc-600 bg-transparent"
                    }`}
                    style={{
                      backgroundColor: isSelected ? cat.color : "transparent",
                      borderColor: isSelected ? cat.color : undefined,
                    }}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white font-black stroke-[3]" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {cat.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium border border-zinc-200/60 dark:border-zinc-700/60">
                      {cat.percentage > 0 ? `${cat.percentage.toFixed(1)}%` : "0%"}
                    </span>
                  </div>
                </div>

                {/* Right: Byte size & Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {formatBytes(cat.bytes)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedKey(isExpanded ? null : cat.key);
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label={`Toggle details for ${cat.name}`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-1 mb-2 ml-10 mr-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-2">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {cat.description || "Cached storage items for this module."}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {cat.itemCount} items tracked
                    </span>
                    <div className="flex items-center gap-3">
                      {cat.key === "permissions" && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await usePermissionStore.getState().fetchPermissions(true);
                              if (typeof window !== "undefined") {
                                window.location.reload();
                              }
                            } catch {
                              // Non-blocking
                            }
                          }}
                          className="text-primary hover:underline flex items-center gap-1 font-semibold transition-colors cursor-pointer text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Check & Sync Matrix
                        </button>
                      )}
                      {onClearCategorySingle && cat.bytes > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearCategorySingle(cat.key);
                          }}
                          disabled={isClearing}
                          className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear {cat.name}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less Toggle for 0 B empty categories */}
      {emptyCategories.length > 0 && (
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all cursor-pointer"
        >
          {showMore ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-primary" />
              <span>Show Less (Hide {emptyCategories.length} Empty Caches)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-primary" />
              <span>Show More ({emptyCategories.length} Empty Caches • 0 B)</span>
            </>
          )}
        </button>
      )}

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleClearClick}
          disabled={isNoneSelected || isClearing || selectedBytes === 0}
          className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            isNoneSelected || selectedBytes === 0
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200/60 dark:border-zinc-700/60 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-[0.99]"
          }`}
        >
          {isClearing ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Clearing Cache...
            </span>
          ) : isAllSelected && selectedBytes === totalBytes ? (
            `Clear Entire Cache ${formatBytes(totalBytes)}`
          ) : (
            `Clear Selected Cache ${formatBytes(selectedBytes)}`
          )}
        </button>
      </div>
    </div>
  );
}
