"use client";

import React, { useState } from "react";
import { Sliders, Plus, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import type {
  FeatureStatus,
  FeatureModule,
} from "@/types/features-announcements";

interface CreateFeatureControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFeatureControlModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFeatureControlModalProps) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [module, setModule] = useState<FeatureModule>("Inventory");
  const [status, setStatus] = useState<FeatureStatus>("coming_soon");
  const [description, setDescription] = useState("");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Please provide both feature name and slug key.");
      return;
    }

    setIsSubmitting(true);
    try {
      FeaturesAnnouncementsStore.addFeature({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        module,
        status,
        is_enabled: status === "active",
        description: description.trim() || "Configured feature gate rule.",
        announcement_id: selectedAnnouncementId || null,
        allowed_roles: ["admin", "owner"],
      });

      toast.success(`Feature control "${name}" created successfully.`);
      setName("");
      setSlug("");
      setModule("Inventory");
      setStatus("coming_soon");
      setDescription("");
      setSelectedAnnouncementId("");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to create feature control.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const announcements = FeaturesAnnouncementsStore.getAnnouncements();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Feature Control Gate"
      description="Define a new feature flag or page route to govern whether it is Open/Live, Closed/Roadmap, or Under Maintenance."
      size="md"
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
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create Feature Gate
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <TextInput
          label="Feature / Page Name"
          placeholder="e.g. Gift Cards & Vouchers"
          value={name}
          onChange={handleNameChange}
          required
        />

        {/* Slug */}
        <TextInput
          label="Route Slug Key (URL parameter & code)"
          placeholder="e.g. gift-cards"
          value={slug}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
          required
        />

        {/* Module Scope & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Module Scope"
            value={module}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModule(e.target.value as FeatureModule)}
            options={[
              { value: "Inventory", label: "Inventory & Catalog" },
              { value: "POS & Registers", label: "POS & Registers" },
              { value: "Operations & Store", label: "Operations & Store" },
              { value: "System & Governance", label: "System & Governance" },
              { value: "Billing & SaaS", label: "Billing & SaaS" },
            ]}
          />

          <Select
            label="Initial Status"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as FeatureStatus)}
            options={[
              { value: "coming_soon", label: "Closed / Coming Soon (Roadmap)" },
              { value: "active", label: "Open / Live (Production)" },
              { value: "maintenance", label: "Under Maintenance" },
              { value: "disabled", label: "Disabled / Hidden" },
            ]}
          />
        </div>

        {/* Linked Announcement */}
        <Select
          label="Link System Announcement (Optional)"
          value={selectedAnnouncementId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAnnouncementId(e.target.value)}
          options={[
            { value: "", label: "None (Standard display)" },
            ...announcements.map((a) => ({
              value: a.id,
              label: `${a.type.toUpperCase()}: ${a.title.slice(0, 40)}...`,
            })),
          ]}
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Feature Description
          </label>
          <textarea
            placeholder="Describe the operational capabilities and purpose of this feature..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </form>
    </Modal>
  );
}
