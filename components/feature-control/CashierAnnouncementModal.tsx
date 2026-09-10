'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncementItem } from '@/types/feature-control';
import {
  getMyAnnouncements,
  markAnnouncementRead,
  acknowledgeAnnouncement,
} from '@/lib/api/feature-controls';

export function CashierAnnouncementModal() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const items = await getMyAnnouncements();
        // Only show unacknowledged announcements
        const pending = items.filter((item) => !item.has_acknowledged);
        if (pending.length > 0) {
          setAnnouncements(pending);
          setIsOpen(true);
        }
      } catch {
        // Silently pass if endpoint is unavailable
      }
    }

    loadAnnouncements();
  }, []);

  const current = announcements[currentIndex];

  // Mark as read on view
  useEffect(() => {
    if (isOpen && current && !current.has_read) {
      markAnnouncementRead(current.uuid).catch(() => {});
    }
  }, [isOpen, current]);

  if (!isOpen || !current) {
    return null;
  }

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await acknowledgeAnnouncement(current.uuid);

      if (currentIndex + 1 < announcements.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to acknowledge announcement:', err);
      // Still close for user experience
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'HIGH':
        return 'bg-amber-500 text-white';
      case 'LOW':
        return 'bg-slate-500 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300';
      case 'MAINTENANCE':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300';
      case 'WARNING':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300';
      case 'UPDATE':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Priority Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${getPriorityStyle(current.priority)}`}>
              {current.priority}
            </span>
            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border ${getTypeStyle(current.type)}`}>
              {current.type}
            </span>
          </div>
          {announcements.length > 1 && (
            <span className="text-xs font-semibold text-slate-400">
              {currentIndex + 1} of {announcements.length}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {current.title}
          </h2>
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {current.message}
          </div>

          {current.ends_at && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Estimated completion: <strong className="font-semibold">{new Date(current.ends_at).toLocaleString()}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleAcknowledge}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Acknowledging...</span>
              </>
            ) : (
              <span>I Understand</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
