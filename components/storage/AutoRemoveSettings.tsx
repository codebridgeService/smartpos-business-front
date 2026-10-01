"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  Package,
  Image as ImageIcon,
  Boxes,
  FileBarChart2,
  Receipt,
  Globe,
  Clock,
  Check,
  Timer,
  Users,
  KeyRound,
  SlidersHorizontal,
  ShieldAlert,
} from "lucide-react";
import {
  type CacheCategory,
  type CacheRetention,
  type PosStoragePolicy,
} from "@/lib/storage/storage-types";
import { RETENTION_OPTIONS } from "@/lib/storage/storage-policy";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface AutoRemoveSettingsProps {
  policy: PosStoragePolicy;
  onUpdatePolicy: (newPolicy: PosStoragePolicy) => void;
  className?: string;
}

interface CategoryRowItem {
  key: CacheCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}

const CATEGORY_ITEMS: CategoryRowItem[] = [
  {
    key: "products",
    label: "Products",
    icon: Package,
    iconBg: "bg-blue-500 text-white shadow-xs",
  },
  {
    key: "images",
    label: "Product Images",
    icon: ImageIcon,
    iconBg: "bg-emerald-500 text-white shadow-xs",
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: Boxes,
    iconBg: "bg-amber-500 text-white shadow-xs",
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileBarChart2,
    iconBg: "bg-rose-500 text-white shadow-xs",
  },
  {
    key: "receipts",
    label: "Receipts",
    icon: Receipt,
    iconBg: "bg-purple-600 text-white shadow-xs",
  },
  {
    key: "api",
    label: "API Cache",
    icon: Globe,
    iconBg: "bg-indigo-500 text-white shadow-xs",
  },
  {
    key: "users",
    label: "Users Management",
    icon: Users,
    iconBg: "bg-blue-600 text-white shadow-xs",
  },
  {
    key: "roles",
    label: "Access Control Engine",
    icon: KeyRound,
    iconBg: "bg-purple-700 text-white shadow-xs",
  },
  {
    key: "permissions",
    label: "System Permissions Matrix",
    icon: SlidersHorizontal,
    iconBg: "bg-teal-600 text-white shadow-xs",
  },
  {
    key: "audit",
    label: "Security & Forensic Audit Logs",
    icon: ShieldAlert,
    iconBg: "bg-red-600 text-white shadow-xs",
  },
];


export function AutoRemoveSettings({
  policy,
  onUpdatePolicy,
  className = "",
}: AutoRemoveSettingsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryRowItem | null>(
    null
  );

  const getRetentionLabel = (retention: CacheRetention): string => {
    const opt = RETENTION_OPTIONS.find((o) => o.value === retention);
    return opt ? opt.label : retention;
  };

  const handleSelectRetention = (retention: CacheRetention) => {
    if (!activeCategory) return;

    const updated: PosStoragePolicy = {
      ...policy,
      retention: {
        ...policy.retention,
        [activeCategory.key]: retention,
      },
    };

    onUpdatePolicy(updated);
    setActiveCategory(null);
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-4 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Auto-Remove Retention Policies
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Automatic background pruning of inactive modules
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Category Rows */}
      <div className="space-y-1.5">
        {CATEGORY_ITEMS.map((item) => {
          const retention =
            policy.retention[item.key as keyof typeof policy.retention] ||
            "1_month";
          const currentLabel = getRetentionLabel(retention);
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveCategory(item)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-850/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-800 hover:border-zinc-300/80 dark:hover:border-zinc-700 transition-all text-left cursor-pointer group"
            >
              {/* Left: Colored Square Icon & Title */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors block">
                    {item.label}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    Safe to evict after retention
                  </span>
                </div>
              </div>

              {/* Right: Retention Badge & Chevron */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium capitalize">
                  {currentLabel}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Retention Selection Modal */}
      {activeCategory && (
        <Modal
          isOpen={Boolean(activeCategory)}
          onClose={() => setActiveCategory(null)}
          size="sm"
          title={
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">
                Retention for {activeCategory.label}
              </span>
            </div>
          }
          footer={
            <div className="flex justify-end w-full">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveCategory(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-1.5 py-1">
            {RETENTION_OPTIONS.map((opt) => {
              const isSelected =
                (policy.retention[
                  activeCategory.key as keyof typeof policy.retention
                ] || "1_month") === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectRetention(opt.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold border border-primary/30"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary stroke-[3]" />
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
