"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Check,
  Scale,
  Search,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useToast } from "@/components/ui/toast";
import { useBusinessesQuery } from "@/lib/react-query/hooks/use-businesses";
import { useCreateUnitMutation } from "@/lib/react-query/hooks/use-units";
import { useUnitStore } from "@/stores/useUnitStore";
import { Button } from "@/components/ui/button";
import { getUserRoleCodes } from "@/lib/utils/roles";
import {
  STANDARD_UNIT_PRESETS,
  type UnitPreset,
} from "@/lib/constants/unit-presets";

export interface AddPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingCodes?: string[];
  defaultBusinessUuid?: string;
}

export function AddPresetsModal({
  isOpen,
  onClose,
  onSuccess,
  existingCodes = [],
  defaultBusinessUuid,
}: AddPresetsModalProps) {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const toast = useToast();
  const storeActiveBizUuid = useUnitStore((state) => state.activeBusinessUuid);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    const roles = getUserRoleCodes(user);
    return roles.includes("admin") || roles.includes("super_admin") || roles.includes("owner");
  }, [user]);

  const { data: businesses = [] } = useBusinessesQuery(undefined, isAdmin);

  const [businessUuid, setBusinessUuid] = useState(
    defaultBusinessUuid || storeActiveBizUuid || activeBusiness?.uuid || ""
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressText, setProgressText] = useState("");

  const createMutation = useCreateUnitMutation();

  const existingUpperCodes = useMemo(() => {
    return new Set(existingCodes.map((c) => c.toUpperCase()));
  }, [existingCodes]);

  // Available presets to choose from
  const availablePresets = useMemo(() => {
    return STANDARD_UNIT_PRESETS.filter(
      (preset) => !existingUpperCodes.has(preset.code.toUpperCase())
    );
  }, [existingUpperCodes]);

  // Initialize selected codes to all available presets when modal opens
  useEffect(() => {
    if (isOpen) {
      setBusinessUuid(defaultBusinessUuid || storeActiveBizUuid || activeBusiness?.uuid || "");
      setSelectedCategory("All");
      setSearchQuery("");
      // By default select all available presets
      const initial = new Set<string>();
      availablePresets.forEach((p) => initial.add(p.code));
      setSelectedCodes(initial);
      setIsSubmitting(false);
      setProgressText("");
    }
  }, [isOpen, defaultBusinessUuid, storeActiveBizUuid, activeBusiness?.uuid, availablePresets]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Filtered presets based on tab and search
  const filteredPresets = useMemo(() => {
    return STANDARD_UNIT_PRESETS.filter((preset) => {
      if (selectedCategory !== "All" && preset.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = preset.name.toLowerCase().includes(query);
        const matchesCode = preset.code.toLowerCase().includes(query);
        const matchesSymbol = preset.symbol.toLowerCase().includes(query);
        const matchesDesc = preset.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesSymbol && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen || !mounted) return null;

  const toggleSelectPreset = (code: string) => {
    if (existingUpperCodes.has(code.toUpperCase())) return;
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      filteredPresets.forEach((p) => {
        if (!existingUpperCodes.has(p.code.toUpperCase())) {
          next.add(p.code);
        }
      });
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      filteredPresets.forEach((p) => {
        next.delete(p.code);
      });
      return next;
    });
  };

  const handleBatchSubmit = async () => {
    const targetBiz = businessUuid || activeBusiness?.uuid;
    if (!targetBiz) {
      toast.error("Please select a target business context.");
      return;
    }

    const presetsToAdd = STANDARD_UNIT_PRESETS.filter((p) =>
      selectedCodes.has(p.code) && !existingUpperCodes.has(p.code.toUpperCase())
    );

    if (presetsToAdd.length === 0) {
      toast.error("Please select at least one unit preset to add.");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < presetsToAdd.length; i++) {
      const preset = presetsToAdd[i];
      setProgressText(`Adding ${i + 1} of ${presetsToAdd.length}: ${preset.name} (${preset.code})...`);

      try {
        await createMutation.mutateAsync({
          name: preset.name,
          code: preset.code,
          symbol: preset.symbol,
          precision: preset.precision,
          is_active: true,
          business_uuid: targetBiz,
        });
        successCount++;
      } catch (err: any) {
        console.error(`Failed to add unit ${preset.code}:`, err);
        failedCount++;
      }
    }

    setIsSubmitting(false);
    setProgressText("");

    if (successCount > 0) {
      toast.success(
        `Successfully added ${successCount} standard measurement unit${successCount > 1 ? "s" : ""}!`
      );
      onClose();
      if (onSuccess) onSuccess();
    } else if (failedCount > 0) {
      toast.error(`Failed to add presets. Please check logs or permissions.`);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="presets-modal-title"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="presets-modal-title"
                className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2"
              >
                Standard Unit Presets
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                  Quick Seed
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Instantly populate your store with standard units like Piece, KG, Liter, Box, and Meter.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 space-y-3 shrink-0">
          {/* Target Business (Admin) */}
          {isAdmin && businesses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Target Business:
              </span>
              <select
                value={businessUuid}
                onChange={(e) => setBusinessUuid(e.target.value)}
                disabled={isSubmitting}
                className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-850 text-slate-800 dark:text-zinc-200 outline-none"
              >
                {businesses.map((biz) => (
                  <option key={biz.uuid} value={biz.uuid}>
                    {biz.name} ({biz.code || "No Code"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Category Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-850 border border-slate-200/70 dark:border-zinc-750 text-xs w-full sm:w-auto">
              {(["All", "Quantity", "Weight", "Volume", "Length"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-white dark:bg-zinc-750 text-slate-900 dark:text-zinc-50 shadow-2xs font-semibold"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={selectAllFiltered}
                disabled={isSubmitting}
                className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-zinc-700">|</span>
              <button
                type="button"
                onClick={deselectAllFiltered}
                disabled={isSubmitting}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:underline cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standard units by name, code, symbol..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Presets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {filteredPresets.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No presets matched your search filter.
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const isAlreadyAdded = existingUpperCodes.has(preset.code.toUpperCase());
              const isSelected = selectedCodes.has(preset.code);

              return (
                <div
                  key={preset.code}
                  onClick={() => {
                    if (!isAlreadyAdded && !isSubmitting) {
                      toggleSelectPreset(preset.code);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isAlreadyAdded
                      ? "bg-slate-50 dark:bg-zinc-850/40 border-slate-200/50 dark:border-zinc-800 opacity-60 cursor-not-allowed"
                      : isSelected
                      ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/60 shadow-xs cursor-pointer"
                      : "bg-white dark:bg-zinc-850/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer"
                  }`}
                >
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isAlreadyAdded
                          ? "bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 text-slate-500"
                          : isSelected
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      }`}
                    >
                      {(isSelected || isAlreadyAdded) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {preset.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {preset.code}
                        </span>
                        <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-orange-100/70 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400">
                          {preset.symbol}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Category, Precision & Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hidden sm:inline-block">
                      {preset.precision === 0 ? "0 dec" : `${preset.precision} dec`}
                    </span>

                    {isAlreadyAdded ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Added
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 font-bold"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-400"
                        }`}
                      >
                        {preset.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            {isSubmitting ? (
              <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {progressText}
              </span>
            ) : (
              <span>
                <strong className="text-slate-900 dark:text-zinc-100 font-bold">
                  {selectedCodes.size}
                </strong>{" "}
                unit{selectedCodes.size === 1 ? "" : "s"} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBatchSubmit}
              disabled={isSubmitting || selectedCodes.size === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm shadow-orange-500/25 cursor-pointer text-xs font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Units...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Add {selectedCodes.size} Selected Unit{selectedCodes.size === 1 ? "" : "s"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
