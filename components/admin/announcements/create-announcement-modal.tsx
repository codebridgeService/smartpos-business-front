"use client";

import React, { useState } from "react";
import { Megaphone, AlertCircle, Calendar, Sparkles, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import type {
  AnnouncementType,
  AnnouncementPriority,
  TargetAudience,
} from "@/types/features-announcements";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnouncementType>("update");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and announcement content.");
      return;
    }

    setIsSubmitting(true);
    try {
      FeaturesAnnouncementsStore.addAnnouncement({
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        target_audience: targetAudience,
        published_at: new Date().toISOString(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        is_active: true,
      });

      toast.success("Announcement broadcasted successfully.");
      setTitle("");
      setContent("");
      setType("update");
      setPriority("normal");
      setTargetAudience("all");
      setExpiresAt("");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to publish announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast System Announcement"
      description="Send operational notices, feature release alerts, or maintenance windows to staff and managers."
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Send className="h-3.5 w-3.5" />}
          >
            Publish Announcement
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <TextInput
          label="Announcement Headline"
          placeholder="e.g. SmartPOS maintenance tonight at 11:00 PM."
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
        />

        {/* Type & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Notice Type"
            value={type}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as AnnouncementType)}
            options={[
              { value: "maintenance", label: "Maintenance Window" },
              { value: "update", label: "System Update / Completed" },
              { value: "feature", label: "New Feature Release" },
              { value: "alert", label: "Security / Urgent Alert" },
              { value: "info", label: "General Information" },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as AnnouncementPriority)}
            options={[
              { value: "urgent", label: "Urgent (High Banner)" },
              { value: "normal", label: "Normal" },
              { value: "low", label: "Low Priority" },
            ]}
          />
        </div>

        {/* Target Audience & Expiration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Target Audience"
            value={targetAudience}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetAudience(e.target.value as TargetAudience)}
            options={[
              { value: "all", label: "All Users & Staff" },
              { value: "role", label: "Managers & Admins Only" },
            ]}
          />

          <TextInput
            label="Expiration Date (Optional)"
            type="datetime-local"
            value={expiresAt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
          />
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Detailed Message / Release Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter details, scheduled downtime instructions, or feature instructions..."
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
            required
          />
        </div>
      </form>
    </Modal>
  );
}
