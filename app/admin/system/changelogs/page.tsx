"use client";

import React, { useState, useEffect } from "react";
import {
  GitCommit,
  Layers,
  Server,
  Database,
  ShieldCheck,
  Sparkles,
  Wrench,
  Bug,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  Filter,
  ArrowRight,
  ExternalLink,
  Code2,
  Edit3,
} from "lucide-react";
import { ChangelogApi } from "@/lib/api/changelogs";
import { useToast } from "@/components/ui/toast";
import {
  SystemChangelog,
  ChangelogComponent,
  ChangeType,
  CreateChangelogPayload,
} from "@/types/changelog";

const COMPONENT_TABS: { label: string; value: ChangelogComponent | "ALL" }[] = [
  { label: "All Updates", value: "ALL" },
  { label: "Frontend", value: "FRONTEND" },
  { label: "Backend", value: "BACKEND" },
  { label: "Full Stack", value: "FULL_STACK" },
  { label: "Security", value: "SECURITY" },
  { label: "Database", value: "DATABASE" },
];

export default function SystemChangelogsPage() {
  const [logs, setLogs] = useState<SystemChangelog[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ChangelogComponent | "ALL">("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<SystemChangelog | null>(null);
  const [formVersion, setFormVersion] = useState("v1.2.3");
  const [formTitle, setFormTitle] = useState("");
  const [formComponent, setFormComponent] = useState<ChangelogComponent>("FRONTEND");
  const [formType, setFormType] = useState<ChangeType>("FEATURE");
  const [formSummary, setFormSummary] = useState("");
  const [formBullets, setFormBullets] = useState<string[]>([""]);
  const [formAuthor, setFormAuthor] = useState("SmartPOS Engineering");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await ChangelogApi.fetchChangelogs(selectedComponent);
      setLogs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedComponent]);

  const handleOpenCreate = () => {
    setEditingLog(null);
    setFormVersion("v1.2.3");
    setFormTitle("");
    setFormComponent("FRONTEND");
    setFormType("FEATURE");
    setFormSummary("");
    setFormBullets([""]);
    setFormAuthor("SmartPOS Engineering");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (log: SystemChangelog) => {
    setEditingLog(log);
    setFormVersion(log.version);
    setFormTitle(log.title);
    setFormComponent(log.component);
    setFormType(log.change_type);
    setFormSummary(log.summary);
    setFormBullets(log.changes_list && log.changes_list.length > 0 ? log.changes_list : [""]);
    setFormAuthor(log.author_name);
    setIsModalOpen(true);
  };

  const handleAddBullet = () => {
    setFormBullets((prev) => [...prev, ""]);
  };

  const handleBulletChange = (index: number, value: string) => {
    setFormBullets((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveBullet = (index: number) => {
    setFormBullets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVersion.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateChangelogPayload = {
        version: formVersion.trim(),
        title: formTitle.trim(),
        component: formComponent,
        change_type: formType,
        summary: formSummary.trim(),
        changes_list: formBullets.map((b) => b.trim()).filter(Boolean),
        author_name: formAuthor.trim() || "SmartPOS Team",
        is_published: true,
      };

      if (editingLog) {
        await ChangelogApi.updateChangelog(editingLog.id, payload);
        toast.success(`Change log ${payload.version} updated successfully!`);
      } else {
        await ChangelogApi.createChangelog(payload);
        toast.success(`New change log ${payload.version} recorded successfully!`);
      }

      setIsModalOpen(false);
      setEditingLog(null);
      setFormTitle("");
      setFormSummary("");
      setFormBullets([""]);
      await loadLogs();
    } catch {
      toast.error("Failed to save change log entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this changelog entry?")) return;
    await ChangelogApi.deleteChangelog(id);
    toast.success("Change log entry deleted.");
    await loadLogs();
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery.trim() ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "ALL" || log.change_type === selectedType;

    return matchesSearch && matchesType;
  });

  const renderComponentIcon = (comp: ChangelogComponent) => {
    switch (comp) {
      case "FRONTEND":
        return <Layers className="h-3.5 w-3.5" />;
      case "BACKEND":
        return <Server className="h-3.5 w-3.5" />;
      case "DATABASE":
        return <Database className="h-3.5 w-3.5" />;
      case "SECURITY":
        return <ShieldCheck className="h-3.5 w-3.5" />;
      default:
        return <Code2 className="h-3.5 w-3.5" />;
    }
  };

  const renderComponentBadge = (comp: ChangelogComponent) => {
    const colors: Record<ChangelogComponent, string> = {
      FRONTEND: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
      BACKEND: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
      FULL_STACK: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60",
      SECURITY: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
      DATABASE: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${colors[comp]}`}>
        {renderComponentIcon(comp)}
        <span>{comp.replace("_", " ")}</span>
      </span>
    );
  };

  const renderTypeBadge = (type: ChangeType) => {
    switch (type) {
      case "FEATURE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <Sparkles className="h-3 w-3" />
            Feature
          </span>
        );
      case "IMPROVEMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
            <Wrench className="h-3 w-3" />
            Improvement
          </span>
        );
      case "BUG_FIX":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
            <Bug className="h-3 w-3" />
            Fix
          </span>
        );
      case "SECURITY_UPDATE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
            <ShieldCheck className="h-3 w-3" />
            Security
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            {type.replace("_", " ")}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-[#FFF6EE] dark:bg-orange-950/50 flex items-center justify-center text-[#FF8433]">
              <GitCommit className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                System Change Log
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Official release notes and component updates across SmartPOS frontend & backend
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Record Release Update</span>
        </button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Component Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto">
          {COMPONENT_TABS.map((tab) => {
            const isActive = selectedComponent === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedComponent(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FFF6EE] dark:bg-orange-950/50 text-[#FF8433] dark:text-orange-400 font-semibold shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Type Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search version or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="FEATURE">Features</option>
            <option value="IMPROVEMENT">Improvements</option>
            <option value="BUG_FIX">Bug Fixes</option>
            <option value="SECURITY_UPDATE">Security</option>
          </select>
        </div>
      </div>

      {/* Timeline View */}
      <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        {isLoading ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-center text-xs text-zinc-500">
            Loading system release logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 text-center text-xs text-zinc-500">
            No change log entries found matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline Marker Node */}
              <div className="absolute -left-6 md:-left-8 top-6 -translate-x-1/2 h-5 w-5 rounded-full border-4 border-white dark:border-zinc-950 bg-orange-500 shadow-xs" />

              {/* Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs hover:border-orange-300 dark:hover:border-orange-500/40 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs">
                      {log.version}
                    </span>
                    {renderComponentBadge(log.component)}
                    {renderTypeBadge(log.change_type)}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.published_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {log.author_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(log)}
                      className="p-1 rounded-lg hover:bg-orange-50 hover:text-orange-600 text-zinc-400 dark:hover:bg-orange-950/40 transition-colors cursor-pointer"
                      title="Edit / Update Change Log"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(log.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-zinc-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title and Summary */}
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                    {log.title}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {log.summary}
                  </p>
                </div>

                {/* Detailed Changes List */}
                {log.changes_list && log.changes_list.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/60">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                      Key Updates & Deployments
                    </h3>
                    <ul className="space-y-1.5">
                      {log.changes_list.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Release Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {editingLog ? `Update Change Log (${editingLog.version})` : "Record New Change Log"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Version Tag *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. v1.3.0"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Component *
                  </label>
                  <select
                    value={formComponent}
                    onChange={(e) => setFormComponent(e.target.value as ChangelogComponent)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                  >
                    <option value="FRONTEND">Frontend (UI/Client)</option>
                    <option value="BACKEND">Backend (Microservice)</option>
                    <option value="FULL_STACK">Full Stack (Combined)</option>
                    <option value="DATABASE">Database (Schema/Migration)</option>
                    <option value="SECURITY">Security & RBAC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Change Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ChangeType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                  >
                    <option value="FEATURE">New Feature</option>
                    <option value="IMPROVEMENT">Improvement / UI</option>
                    <option value="BUG_FIX">Bug Fix</option>
                    <option value="SECURITY_UPDATE">Security Patch</option>
                    <option value="BREAKING_CHANGE">Breaking Change</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Release Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Inventory Batch Import & Settings Redesign"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="High-level explanation of what this release addresses..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                />
              </div>

              {/* Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Detailed Changes List (Bullets)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {formBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Change item ${idx + 1}...`}
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none focus:border-orange-500"
                      />
                      {formBullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingLog
                    ? "Update Change Log"
                    : "Publish Change Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
