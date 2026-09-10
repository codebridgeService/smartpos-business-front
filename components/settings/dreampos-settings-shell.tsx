"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Settings as SettingsIcon,
  Globe,
  Smartphone,
  Monitor,
  BadgePercent,
  Sliders,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Bell,
  Layers,
  Building,
  Printer,
  Calculator,
  Mail,
  MessageSquare,
  CreditCard,
  HardDrive,
  Ban,
  RotateCcw,
  CheckCircle2,
  Nut,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { DreamPosProfileView } from "./dreampos-profile-view";
import { SecurityView } from "./security-view";
import { PosPinView } from "./pos-pin-view";

interface SubItem {
  id: string;
  label: string;
  badge?: string;
}

interface SettingsGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  items: SubItem[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: "general",
    title: "General Settings",
    icon: <SettingsIcon className="h-4 w-4 shrink-0" />,
    defaultOpen: true,
    items: [
      { id: "profile", label: "Profile" },
      { id: "security", label: "Security" },
      { id: "notifications", label: "Notifications" },
      { id: "connected-apps", label: "Connected Apps" },
    ],
  },
  {
    id: "website",
    title: "Website Settings",
    icon: <Globe className="h-4 w-4 shrink-0" />,
    items: [
      { id: "system-info", label: "System Information" },
      { id: "company-settings", label: "Company Profile" },
      { id: "localization", label: "Localization & Timezone" },
      { id: "prefixes", label: "Invoice Prefixes" },
      { id: "preferences", label: "Display Preferences" },
    ],
  },
  {
    id: "app",
    title: "App Settings",
    icon: <Smartphone className="h-4 w-4 shrink-0" />,
    items: [
      { id: "pos-pin", label: "POS Fast-Access PIN" },
      { id: "invoice-settings", label: "Invoice Formats" },
      { id: "printers", label: "Printers & Hardware" },
      { id: "pos-settings", label: "POS Terminal Engine" },
      { id: "custom-fields", label: "Custom Attributes" },
    ],
  },
  {
    id: "system",
    title: "System Settings",
    icon: <Monitor className="h-4 w-4 shrink-0" />,
    items: [
      { id: "email-settings", label: "Email SMTP Server" },
      { id: "sms-gateways", label: "SMS Gateways" },
      { id: "otp-settings", label: "OTP & 2FA Governance" },
      { id: "gdpr-compliance", label: "Data Privacy & GDPR" },
    ],
  },
  {
    id: "financial",
    title: "Financial Settings",
    icon: <BadgePercent className="h-4 w-4 shrink-0" />,
    items: [
      { id: "payment-gateways", label: "Payment Gateways" },
      { id: "bank-accounts", label: "Bank Accounts" },
      { id: "tax-rates", label: "Tax Rates & Surcharges" },
      { id: "currencies", label: "Currencies & Rates" },
    ],
  },
  {
    id: "other",
    title: "Other Settings",
    icon: <Nut className="h-4 w-4 shrink-0" />,
    items: [
      { id: "storage-settings", label: "Storage & File System" },
      { id: "ban-ip", label: "Banned IP Addresses" },
      { id: "clear-cache", label: "Clear Cache & Re-index" },
    ],
  },
];

export function DreamPosSettingsShell({
  initialTab = "profile",
}: {
  initialTab?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const tabParam = searchParams.get("tab") || initialTab;
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    general: true,
  });

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab")!);
    }
  }, [searchParams]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleSelectTab = (itemId: string, groupId: string) => {
    setActiveTab(itemId);
    setOpenGroups((prev) => ({ ...prev, [groupId]: true }));
    router.replace(`${pathname}?tab=${itemId}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT SIDEBAR: Settings Menu matching reference screenshot */}
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 pb-3 mb-2 border-b border-zinc-100 dark:border-zinc-800">
          Settings
        </h1>

        <div className="space-y-1">
          {SETTINGS_GROUPS.map((group) => {
            const isOpen = Boolean(openGroups[group.id]);
            const hasActiveChild = group.items.some((item) => item.id === activeTab);

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
                    hasActiveChild
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 dark:text-zinc-400">{group.icon}</span>
                    <span>{group.title}</span>
                  </div>
                  <span className="text-zinc-400">
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>

                {/* Sub-items */}
                {isOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 animate-in fade-in slide-in-from-top-1">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectTab(item.id, group.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                            isActive
                              ? "bg-[#FFF6EE] dark:bg-orange-950/40 text-[#FF8433] dark:text-orange-400 font-semibold"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          }`}
                        >
                          <span className="truncate">{item.label}</span>

                          {/* Active Orange Indicator Dot matching screenshot */}
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-[#FF8433] shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Logout button matching reference screenshot */}
          <div className="pt-2 mt-2 border-t border-zinc-150 dark:border-zinc-800">
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[14px] text-slate-700 dark:text-zinc-300 font-normal hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-100 transition-all text-left cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT: Active View Panel */}
      <div className="lg:col-span-9 min-w-0">
        {activeTab === "profile" && <DreamPosProfileView />}

        {activeTab === "security" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <SecurityView />
          </div>
        )}

        {activeTab === "pos-pin" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-xs">
            <PosPinView />
          </div>
        )}

        {/* Other Settings Placeholder Views */}
        {activeTab !== "profile" &&
          activeTab !== "security" &&
          activeTab !== "pos-pin" && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-8 shadow-xs text-center">
              <div className="max-w-md mx-auto py-8">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-[#FF8433] flex items-center justify-center mx-auto mb-3">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                  {activeTab.replace(/-/g, " ")}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Configuration parameters and policy governance for {activeTab.replace(/-/g, " ")}. Customize your store behavior and operational settings.
                </p>
                <div className="mt-5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
                  <span>Engine Status: Active</span>
                  <span className="font-semibold text-emerald-600">Operational</span>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
