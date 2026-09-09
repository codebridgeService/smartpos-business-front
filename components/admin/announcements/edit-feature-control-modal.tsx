"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import type { FeatureControl, FeatureStatus } from "@/types/features-announcements";

interface EditFeatureControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureControl | null;
  onSuccess: () => void;
}

export function EditFeatureControlModal({
  isOpen,
  onClose,
  feature,
  onSuccess,
}: EditFeatureControlModalProps) {
  const toast = useToast();

  const [status, setStatus] = useState<FeatureStatus>("coming_soon");
  const [description, setDescription] = useState("");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (feature) {
      setStatus(feature.status);
      setDescription(feature.description);
      setSelectedAnnouncementId(feature.announcement_id || "");
    }
  }, [feature]);

  if (!feature) return null;

  const announcements = FeaturesAnnouncementsStore.getAnnouncements();

  const handleSave = () => {
    setIsSubmitting(true);
    try {
      FeaturesAnnouncementsStore.updateFeature({
        ...feature,
        status,
        is_enabled: status === "active",
        description,
        announcement_id: selectedAnnouncementId || null,
        updated_at: new Date().toISOString(),
      });

      toast.success(`Feature "${feature.name}" rule updated.`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to update feature rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Feature: ${feature.name}`}
      description="Control page availability, switch between live and coming soon modes, and link maintenance broadcasts."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSubmitting}>
            Save Rule
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Slug and Module Header */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {feature.name}
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              slug: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{feature.slug}</span>
            </div>
          </div>
          <Badge variant="neutral" size="sm">
            {feature.module}
          </Badge>
        </div>

        {/* Status Selector */}
        <Select
          label="Page Status Mode"
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as FeatureStatus)}
          options={[
            { value: "active", label: "Open & Live (Accessible to all users)" },
            { value: "coming_soon", label: "Closed / Coming Soon (Roadmap announcement)" },
            { value: "maintenance", label: "Under Maintenance (Temporary lockdown)" },
            { value: "disabled", label: "Disabled / Hidden from navigation" },
          ]}
        />

        {/* Linked Announcement */}
        <Select
          label="Link System Announcement (Optional)"
          value={selectedAnnouncementId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAnnouncementId(e.target.value)}
          options={[
            { value: "", label: "None (Standard display)" },
            ...announcements.map((a) => ({
              value: a.id,
              label: `${a.type.toUpperCase()}: ${a.title.slice(0, 42)}...`,
            })),
          ]}
        />

        {/* Feature Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Description & Guidance
          </label>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </Modal>
  );
}
