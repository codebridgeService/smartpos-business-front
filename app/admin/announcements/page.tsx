"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Megaphone,
  Sliders,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import type {
  Announcement,
  FeatureControl,
  FeatureStatus,
} from "@/types/features-announcements";
import {
  CreateAnnouncementModal,
  AnnouncementReadsModal,
  EditFeatureControlModal,
} from "@/components/admin/announcements";

export default function AdminAnnouncementsPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"announcements" | "features">("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [features, setFeatures] = useState<FeatureControl[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnnouncementForReads, setSelectedAnnouncementForReads] =
    useState<Announcement | null>(null);
  const [selectedFeatureForEdit, setSelectedFeatureForEdit] = useState<FeatureControl | null>(
    null
  );

  const loadData = () => {
    setAnnouncements(FeaturesAnnouncementsStore.getAnnouncements());
    setFeatures(FeaturesAnnouncementsStore.getFeatures());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("smartpos_features_updated", handleUpdate);
    window.addEventListener("smartpos_announcements_updated", handleUpdate);
    window.addEventListener("smartpos_reads_updated", handleUpdate);

    return () => {
      window.removeEventListener("smartpos_features_updated", handleUpdate);
      window.removeEventListener("smartpos_announcements_updated", handleUpdate);
      window.removeEventListener("smartpos_reads_updated", handleUpdate);
    };
  }, []);

  const handleToggleActive = (id: string) => {
    const updated = FeaturesAnnouncementsStore.toggleAnnouncementActive(id);
    setAnnouncements(updated);
    toast.success("Announcement status updated.");
  };

  const handleDeleteAnnouncement = (id: string) => {
    const updated = FeaturesAnnouncementsStore.deleteAnnouncement(id);
    setAnnouncements(updated);
    toast.success("Announcement removed.");
  };

  const handleToggleFeature = (slug: string, currentStatus: FeatureStatus) => {
    const nextStatus: FeatureStatus = currentStatus === "active" ? "coming_soon" : "active";
    const updated = FeaturesAnnouncementsStore.updateFeatureStatus(slug, nextStatus);
    setFeatures(updated);
    toast.success(
      nextStatus === "active"
        ? `Feature "${slug}" is now Open & Live.`
        : `Feature "${slug}" is now Closed / Coming Soon.`
    );
  };

  // Filtered Announcements
  const filteredAnnouncements = announcements.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
  });

  // Filtered Features
  const filteredFeatures = features.filter((f) => {
    const matchesModule = moduleFilter === "all" || f.module === moduleFilter;
    if (!searchQuery.trim()) return matchesModule;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      f.name.toLowerCase().includes(q) ||
      f.slug.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q);
    return matchesModule && matchesQuery;
  });

  // KPI Metrics
  const activeAnnouncementsCount = announcements.filter((a) => a.is_active).length;
  const urgentCount = announcements.filter((a) => a.priority === "urgent" && a.is_active).length;
  const totalReads = announcements.reduce((acc, a) => acc + (a.reads_count || 0), 0);
  const openFeaturesCount = features.filter((f) => f.status === "active").length;
  const closedFeaturesCount = features.filter((f) => f.status !== "active").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">System Controls</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-orange-500" />
            Announcements & Feature Controls
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Broadcast operational alerts, publish release notes, and toggle page access (open vs. coming soon).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === "announcements" ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Announcement
            </Button>
          ) : (
            <Link href="/coming-soon?feature=products" target="_blank">
              <Button
                variant="outline"
                size="md"
                leftIcon={<ExternalLink className="h-4 w-4 text-orange-500" />}
              >
                Preview Roadmap Page
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Active Broadcasts</span>
            <div className="h-7 w-7 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Megaphone className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {activeAnnouncementsCount}
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Live on user dashboards</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Urgent Alerts</span>
            <div className="h-7 w-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {urgentCount}
          </div>
          <div className="text-[11px] text-rose-500 mt-0.5">Maintenance & outages</div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Total Read Receipts</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {totalReads}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
            User acknowledgments
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium">Feature Controls</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2 flex items-baseline gap-1.5">
            <span>{openFeaturesCount}</span>
            <span className="text-xs font-medium text-zinc-400">/ {features.length} open</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {closedFeaturesCount} closed / roadmap
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("announcements")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "announcements"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
        >
          <Megaphone className="h-4 w-4" />
          System Announcements & Reads
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "features"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
        >
          <Sliders className="h-4 w-4" />
          Feature Controls & Closed Pages
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder={
              activeTab === "announcements"
                ? "Search announcements by title or content..."
                : "Search features by name or slug (e.g. products, create-product)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </div>

        {activeTab === "features" && (
          <div className="flex items-center gap-2 overflow-x-auto">
            {["all", "Inventory", "POS & Registers", "Operations & Store", "System & Governance"].map(
              (mod) => (
                <button
                  key={mod}
                  onClick={() => setModuleFilter(mod)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${moduleFilter === mod
                      ? "bg-orange-500 text-white shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                >
                  {mod === "all" ? "All Modules" : mod}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* TAB 1: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-3">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <Megaphone className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                No Announcements Found
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No announcements matched the query "${searchQuery}".`
                  : "Click 'Create Announcement' above to broadcast your first message."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3.5">Announcement Details</th>
                      <th className="px-5 py-3.5">Type & Priority</th>
                      <th className="px-5 py-3.5">Audience</th>
                      <th className="px-5 py-3.5">Read Receipts</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredAnnouncements.map((ann) => {
                      const formattedDate = new Date(ann.published_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      return (
                        <tr
                          key={ann.id}
                          className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Title & Body */}
                          <td className="px-5 py-4 max-w-md">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">
                              {ann.title}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                              {ann.content}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Published: {formattedDate}</span>
                            </div>
                          </td>

                          {/* Type & Priority */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <Badge
                                variant={
                                  ann.type === "maintenance"
                                    ? "warning"
                                    : ann.type === "feature"
                                      ? "primary"
                                      : ann.type === "alert"
                                        ? "danger"
                                        : "success"
                                }
                                size="sm"
                              >
                                {ann.type}
                              </Badge>
                              {ann.priority === "urgent" && (
                                <div className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Urgent</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Audience */}
                          <td className="px-5 py-4 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            {ann.target_audience === "all" ? "All Users & Staff" : "Managers & Admins"}
                          </td>

                          {/* Read Receipts */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedAnnouncementForReads(ann)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                              title="View user read receipts"
                            >
                              <Eye className="h-3.5 w-3.5 text-blue-500" />
                              <span>{ann.reads_count || 0} reads</span>
                            </button>
                          </td>

                          {/* Active Toggle */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(ann.id)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${ann.is_active
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                }`}
                            >
                              {ann.is_active ? "Active" : "Archived"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FEATURE CONTROLS & CLOSED PAGES */}
      {activeTab === "features" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-orange-800 dark:text-orange-300">
            <div className="flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-orange-600 shrink-0" />
              <div>
                <span className="font-bold">Feature Gate Governance:</span> Toggle pages between Open (live production) and Closed (coming soon announcement roadmap).
              </div>
            </div>
            <Link href="/coming-soon?feature=products" target="_blank" className="font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0">
              <span>View User Experience</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Feature & Page Key</th>
                    <th className="px-5 py-3.5">Module Scope</th>
                    <th className="px-5 py-3.5">Current Status</th>
                    <th className="px-5 py-3.5">Linked Announcement</th>
                    <th className="px-5 py-3.5 text-center">Quick Toggle</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredFeatures.map((feat) => {
                    const isOpen = feat.status === "active";
                    const linkedAnn = announcements.find((a) => a.id === feat.announcement_id);

                    return (
                      <tr
                        key={feat.slug}
                        className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* Name & Slug */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            {feat.name}
                          </div>
                          <div className="text-xs text-zinc-400 font-mono mt-0.5">
                            slug: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{feat.slug}</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 line-clamp-1 mt-1">
                            {feat.description}
                          </div>
                        </td>

                        {/* Module */}
                        <td className="px-5 py-4">
                          <Badge variant="neutral" size="sm">
                            {feat.module}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <Badge
                            variant={
                              feat.status === "active"
                                ? "success"
                                : feat.status === "coming_soon"
                                  ? "warning"
                                  : feat.status === "maintenance"
                                    ? "danger"
                                    : "neutral"
                            }
                            size="sm"
                          >
                            {feat.status === "active"
                              ? "Open / Live"
                              : feat.status === "coming_soon"
                                ? "Closed / Roadmap"
                                : feat.status === "maintenance"
                                  ? "Maintenance"
                                  : "Disabled"}
                          </Badge>
                        </td>

                        {/* Linked Announcement */}
                        <td className="px-5 py-4 text-xs">
                          {linkedAnn ? (
                            <span className="text-zinc-700 dark:text-zinc-300 line-clamp-1 font-medium">
                              {linkedAnn.title}
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic">None</span>
                          )}
                        </td>

                        {/* Quick Toggle */}
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeature(feat.slug, feat.status)}
                            className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium focus:outline-none"
                            title={isOpen ? "Click to close page (Coming Soon)" : "Click to open page (Live)"}
                          >
                            {isOpen ? (
                              <ToggleRight className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-7 w-7 text-zinc-400 dark:text-zinc-600" />
                            )}
                            <span className={isOpen ? "text-emerald-600 font-bold" : "text-zinc-400"}>
                              {isOpen ? "Open" : "Closed"}
                            </span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right space-x-1">
                          <Link href={`/coming-soon?feature=${feat.slug}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2"
                              title="Preview announcement page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFeatureForEdit(feat)}
                            className="text-xs"
                          >
                            Configure
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />

      <AnnouncementReadsModal
        isOpen={Boolean(selectedAnnouncementForReads)}
        onClose={() => setSelectedAnnouncementForReads(null)}
        announcement={selectedAnnouncementForReads}
      />

      <EditFeatureControlModal
        isOpen={Boolean(selectedFeatureForEdit)}
        onClose={() => setSelectedFeatureForEdit(null)}
        feature={selectedFeatureForEdit}
        onSuccess={loadData}
      />
    </div>
  );
}
