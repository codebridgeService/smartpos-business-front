"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Store,
  Calculator,
  Tablet,
  Key,
  ShieldAlert,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/context/business-context";
import type { StoreBusinessResponse } from "@/types";

interface BusinessProvisionedModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StoreBusinessResponse | null;
}

export function BusinessProvisionedModal({
  isOpen,
  onClose,
  data,
}: BusinessProvisionedModalProps) {
  const router = useRouter();
  const { selectBusiness } = useBusiness();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!data) return null;

  const { business, outlet, register, pos_device, credentials } = {
    business: data.data,
    outlet: data.provisioned?.outlet,
    register: data.provisioned?.register,
    pos_device: data.provisioned?.pos_device,
    credentials: data.provisioned?.credentials,
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
    }
  };

  const copyAllCredentials = async () => {
    const text = [
      `Business: ${business.name} (${business.code})`,
      `Outlet: ${outlet?.name || "Main Outlet"} (${outlet?.code || "OUT-01"})`,
      `Register: ${register?.name || "Register #1"} (${register?.code || "REG-01"})`,
      `POS Device Code: ${credentials?.device_code || pos_device?.device_code || ""}`,
      `Machine Password: ${credentials?.machine_password || ""}`,
    ].join("\n");

    await copyToClipboard(text, "all");
  };

  const handleGoToSettings = async () => {
    await selectBusiness(business.uuid);
    onClose();
    router.push("/businesses/settings");
  };

  const handleSwitchTenant = async () => {
    await selectBusiness(business.uuid);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Business Successfully Provisioned!
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              {business.name} ({business.code}) is now ready for operations
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Security Warning Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold">Important Hardware Credentials</p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Copy and record your machine credentials now. The generated machine password is
              encrypted and will not be displayed again.
            </p>
          </div>
        </div>

        {/* Machine Credentials Card */}
        <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-950 dark:text-blue-200">
              <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                POS Machine Credentials
              </span>
            </div>
            <button
              type="button"
              onClick={copyAllCredentials}
              className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white font-semibold py-1 px-2.5 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 hover:bg-blue-200/70 transition-colors"
            >
              {copiedField === "all" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Device Code */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Device Code
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                  {credentials?.device_code || pos_device?.device_code || "POS-001"}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      credentials?.device_code || pos_device?.device_code || "",
                      "device_code"
                    )
                  }
                  className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Copy Device Code"
                >
                  {copiedField === "device_code" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Machine Password */}
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Machine Password
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100">
                  {showPassword
                    ? credentials?.machine_password || "••••••••••••"
                    : "••••••••••••••••"}
                </code>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(credentials?.machine_password || "", "machine_password")
                    }
                    className="text-slate-400 hover:text-blue-600 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Copy Machine Password"
                  >
                    {copiedField === "machine_password" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Provisioned Defaults Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Default Outlet */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                Default Outlet
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                {outlet?.name || "Main Outlet"}
              </p>
              <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                {outlet?.code || "OUT-01"}
              </p>
            </div>
          </div>

          {/* Default Register */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-850 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">
                Default Cash Register
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                {register?.name || "Register #1"}
              </p>
              <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                {register?.code || "REG-01"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Done
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSwitchTenant}
              className="text-xs border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              Switch To Tenant
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleGoToSettings}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Configure POS Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
