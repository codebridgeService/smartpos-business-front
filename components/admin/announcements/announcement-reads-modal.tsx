"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, User as UserIcon, Clock, Users } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import type { Announcement, AnnouncementRead } from "@/types/features-announcements";

interface AnnouncementReadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export function AnnouncementReadsModal({
  isOpen,
  onClose,
  announcement,
}: AnnouncementReadsModalProps) {
  const [reads, setReads] = useState<AnnouncementRead[]>([]);

  useEffect(() => {
    if (announcement) {
      const list = FeaturesAnnouncementsStore.getReadsForAnnouncement(announcement.id);
      setReads(list);
    } else {
      setReads([]);
    }
  }, [announcement]);

  if (!announcement) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Announcement Read Receipts"
      description={`Audit log of users and staff members who have acknowledged this notice.`}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-zinc-500">
            Total Acknowledgments: <strong className="text-zinc-800 dark:text-zinc-200">{reads.length}</strong>
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Notice Info Card */}
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800">
          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {announcement.title}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
            {announcement.content}
          </div>
        </div>

        {/* Read List */}
        {reads.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Users className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              No Read Receipts Yet
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Users have not marked or dismissed this notice in their dashboard.
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {reads.map((read, idx) => {
              const formattedDate = new Date(read.read_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={read.user_uuid + idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      {read.user_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {read.user_name}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {read.user_role || "Staff Member"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
