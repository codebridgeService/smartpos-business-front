"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Check,
  Search,
  PlusCircle,
  ExternalLink,
  Store,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";


interface BusinessSwitcherProps {
  isDarkTheme?: boolean;
  onOpenCreateModal?: () => void;
}

export function BusinessSwitcher({ isDarkTheme = false, onOpenCreateModal }: BusinessSwitcherProps) {
  const { businesses, activeBusiness, selectBusiness, isLoading } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Filter businesses by name, code or city
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase().trim();
    return businesses.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q)
    );
  }, [businesses, searchQuery]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button - Dreams POS pill style like [ 🟩 Freshmart ⌵ ] */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none shadow-2xs ${
          isDarkTheme
            ? "border-white/20 bg-white/10 hover:bg-white/15 text-white"
            : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200"
        }`}
        aria-label="Switch Business Tenant"
        aria-expanded={isOpen}
      >
        <div className="h-5 w-5 rounded-md bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
          <Store className="h-3 w-3" />
        </div>
        <div className="flex items-center gap-1.5 text-left">
          <span className="truncate max-w-[90px] sm:max-w-[130px] font-bold text-slate-800 dark:text-zinc-100">
            {activeBusiness?.name || (isLoading ? "Loading..." : "Freshmart")}
          </span>
          {activeBusiness?.currency_code && (
            <span className="hidden lg:inline-block px-1.5 py-0.2 text-[9.5px] font-bold uppercase rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700">
              {activeBusiness.currency_code}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDarkTheme ? "text-white/70" : "text-slate-400 dark:text-zinc-400"}`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-84 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Business Tenants ({businesses.length})
              </span>
            </div>
            {activeBusiness && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            )}
          </div>

          {/* Search Input */}
          <div className="relative mb-2 px-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Businesses List */}
          <div className="max-h-60 overflow-y-auto space-y-1 px-1 py-0.5">
            {filteredBusinesses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                No matching businesses found
              </div>
            ) : (
              filteredBusinesses.map((biz) => {
                const isActive = activeBusiness?.uuid === biz.uuid;
                return (
                  <button
                    key={biz.uuid}
                    type="button"
                    onClick={async () => {
                      await selectBusiness(biz.uuid);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-900 dark:text-blue-100 shadow-xs"
                      : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                          }`}
                      >
                        {biz.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate leading-tight">{biz.name}</p>
                          {biz.code && (
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                              {biz.code}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                          {biz.city ? `${biz.city} • ` : ""}
                          {biz.currency_code || "USD"} • {biz.timezone || "Asia/Phnom_Penh"}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 px-1">
            <Link
              href="/businesses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Manage Master</span>
            </Link>

            {onOpenCreateModal ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateModal();
                }}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Business</span>
              </button>
            ) : (
              <Link
                href="/businesses?action=new"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Business</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
