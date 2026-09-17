"use client";

import React, { useState } from "react";
import { AlertCircle, AlertTriangle, Info, Bell, X } from "lucide-react";
import type { Announcement } from "@/types/features-announcements";

export interface FeatureAnnouncementBannerProps {
  announcement?: Announcement | null;
}

export function FeatureAnnouncementBanner({ announcement }: FeatureAnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!announcement || !announcement.is_active || isDismissed) {
    return null;
  }

  const isUrgent = announcement.priority === "urgent" || announcement.type === "maintenance";

  return (
    <div
      className={`mb-4 p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 ${
        isUrgent
          ? "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200"
          : "bg-blue-500/10 border-blue-500/25 text-blue-950 dark:text-blue-200"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isUrgent ? (
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <div className="font-bold flex items-center gap-2">
            <span>{announcement.title}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                isUrgent
                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
                  : "bg-blue-500/20 text-blue-800 dark:text-blue-300"
              }`}
            >
              {announcement.type}
            </span>
          </div>
          <p className="opacity-90 leading-relaxed">{announcement.content}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        title="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
