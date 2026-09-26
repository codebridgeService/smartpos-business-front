"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowLeft,
  Shield,
  Building2,
  Key,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { useRoleStore } from "@/stores/useRoleStore";
import { useToast } from "@/components/ui/toast";

export default function CreateRolePage() {
  const router = useRouter();
  const toast = useToast();
  const { businesses, activeBusiness } = useBusiness();
  const { createRole, fetchRoles } = useRoleStore();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [businessUuid, setBusinessUuid] = useState(activeBusiness?.uuid || "");
  const [description, setDescription] = useState("");
  const [isSystem, setIsSystem] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!code || code === name.toLowerCase().replace(/[^a-z0-9]/g, "_")) {
      setCode(val.toLowerCase().trim().replace(/[^a-z0-9]/g, "_"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Role display name is required.");
      return;
    }

    if (!code.trim()) {
      setError("Role code identifier is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createRole({
        name: name.trim(),
        code: code.trim().toLowerCase(),
        business_uuid: businessUuid || null,
        is_system: isSystem,
      });

      toast.success(`Role "${name}" created successfully!`);
      await fetchRoles(businessUuid || null, 1);
      router.push("/admin/roles");
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to create role. Please verify role code uniqueness.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 px-3 sm:px-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      {/* 🚀 Top Navigation & Back Header */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link
          href="/admin/roles"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="h-8 w-8 rounded-xl bg-card border border-border flex items-center justify-center group-hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Roles Directory</span>
        </Link>

        {/* Scope Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>RBAC Provisioning</span>
        </div>
      </div>

      {/* 🛡️ Header Banner Card (Blue Style) */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white shadow-xl shadow-blue-600/20">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shrink-0">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold uppercase tracking-wider text-blue-100 mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Role Configurator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Create New Role
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 max-w-xl leading-relaxed">
              Define operational credentials and security privileges for system administrators, branch supervisors, or custom staff profiles.
            </p>
          </div>
        </div>
      </div>

      {/* 📝 Create Form Card (Rendered Directly Under Header) */}
      <div className="rounded-[2rem] bg-card border border-border shadow-xl p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Role Display Name */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  Role Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shift Supervisor"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Human-readable title displayed across dashboards and user management.
                </p>
              </div>

              {/* Role Code (Identifier) */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  Role Code (Identifier) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. shift_supervisor"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                    className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Unique lowercase slug for programmatic middleware & API authorization.
                </p>
              </div>
            </div>

            {/* Store / Business Scope */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                Store / Business Scope
              </label>
              <div className="relative">
                <select
                  value={businessUuid}
                  onChange={(e) => setBusinessUuid(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="">Global Role Template (All Businesses / Platform Wide)</option>
                  {businesses.map((b) => (
                    <option key={b.uuid} value={b.uuid}>
                      {b.name} ({b.code || "Tenant"})
                    </option>
                  ))}
                </select>
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Leave unassigned for universal platform templates, or select a tenant to bind exclusively.
              </p>
            </div>

            {/* Description / Scope Notes */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                Role Description & Scope (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe operational responsibilities, shift oversight, or point-of-sale privileges..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
              />
            </div>

            {/* System Template Flag */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/80">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Lock as Immutable System Template</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Prevents accidental deletion by tenant administrators.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSystem}
                  onChange={(e) => setIsSystem(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Link href="/admin/roles">
              <button
                type="button"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? "Creating Role..." : "Create Role"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
