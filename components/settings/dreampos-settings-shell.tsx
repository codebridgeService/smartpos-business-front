"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Settings as SettingsIcon,
  SlidersHorizontal,
  Globe2,
  Smartphone,
  Server,
  CircleDollarSign,
  Wrench,
  ChevronDown,
  User,
  ShieldCheck,
  Bell,
  Layers,
  Info,
  Building2,
  Clock,
  FileText,
  Palette,
  KeyRound,
  Receipt,
  Printer,
  Cpu,
  Tags,
  Mail,
  MessageSquare,
  ShieldAlert,
  FileCheck,
  CreditCard,
  Landmark,
  Percent,
  Coins,
  HardDrive,
  Ban,
  RotateCcw,
  LogOut,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ProfileView } from "./profile-view";
import { SecurityView } from "./security-view";
import { PosPinView } from "./pos-pin-view";

interface SubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface GroupColorTheme {
  iconBox: string;
  iconBoxOpen: string;
  headerIdle: string;
  headerOpen: string;
  headerHover: string;
  chevronBgOpen: string;
  badgeOpen: string;
  subItemHover: string;
  subItemActive: string;
  subItemDot: string;
}

interface SettingsGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  theme: GroupColorTheme;
  items: SubItem[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: "general",
    title: "General Settings",
    icon: <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />,
    theme: {
      iconBox: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      iconBoxOpen: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs shadow-blue-500/20",
      headerIdle: "text-slate-700 dark:text-zinc-300 border-transparent",
      headerOpen: "bg-blue-500/10 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-800/50 shadow-xs",
      headerHover: "hover:bg-blue-500/10 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/25",
      chevronBgOpen: "bg-blue-500/15 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
      badgeOpen: "bg-blue-500/15 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border-blue-500/20",
      subItemHover: "hover:bg-blue-500/10 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/25",
      subItemActive: "bg-blue-500/15 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-500/35 dark:border-blue-800/60 shadow-xs",
      subItemDot: "bg-blue-500 shadow-blue-500/50",
    },
    items: [
      { id: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5 shrink-0" /> },
      { id: "security", label: "Security", icon: <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> },
      { id: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5 shrink-0" /> },
      { id: "connected-apps", label: "Connected Apps", icon: <Layers className="h-3.5 w-3.5 shrink-0" /> },
    ],
  },
  {
    id: "website",
    title: "Website & Store",
    icon: <Globe2 className="h-3.5 w-3.5 shrink-0" />,
    theme: {
      iconBox: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      iconBoxOpen: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-xs shadow-cyan-500/20",
      headerIdle: "text-slate-700 dark:text-zinc-300 border-transparent",
      headerOpen: "bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 dark:border-cyan-800/50 shadow-xs",
      headerHover: "hover:bg-cyan-500/10 dark:hover:bg-cyan-950/30 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/25",
      chevronBgOpen: "bg-cyan-500/15 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300",
      badgeOpen: "bg-cyan-500/15 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 border-cyan-500/20",
      subItemHover: "hover:bg-cyan-500/10 dark:hover:bg-cyan-950/30 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/25",
      subItemActive: "bg-cyan-500/15 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-500/35 dark:border-cyan-800/60 shadow-xs",
      subItemDot: "bg-cyan-500 shadow-cyan-500/50",
    },
    items: [
      { id: "system-info", label: "System Information", icon: <Info className="h-3.5 w-3.5 shrink-0" /> },
      { id: "company-settings", label: "Company Profile", icon: <Building2 className="h-3.5 w-3.5 shrink-0" /> },
      { id: "localization", label: "Localization & Timezone", icon: <Clock className="h-3.5 w-3.5 shrink-0" /> },
      { id: "prefixes", label: "Invoice Prefixes", icon: <FileText className="h-3.5 w-3.5 shrink-0" /> },
      { id: "preferences", label: "Display Preferences", icon: <Palette className="h-3.5 w-3.5 shrink-0" /> },
    ],
  },
  {
    id: "app",
    title: "App & Terminal",
    icon: <Smartphone className="h-3.5 w-3.5 shrink-0" />,
    theme: {
      iconBox: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      iconBoxOpen: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-xs shadow-purple-500/20",
      headerIdle: "text-slate-700 dark:text-zinc-300 border-transparent",
      headerOpen: "bg-purple-500/10 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-500/30 dark:border-purple-800/50 shadow-xs",
      headerHover: "hover:bg-purple-500/10 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/25",
      chevronBgOpen: "bg-purple-500/15 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300",
      badgeOpen: "bg-purple-500/15 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border-purple-500/20",
      subItemHover: "hover:bg-purple-500/10 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/25",
      subItemActive: "bg-purple-500/15 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-500/35 dark:border-purple-800/60 shadow-xs",
      subItemDot: "bg-purple-500 shadow-purple-500/50",
    },
    items: [
      { id: "pos-pin", label: "POS Fast-Access PIN", icon: <KeyRound className="h-3.5 w-3.5 shrink-0" /> },
      { id: "invoice-settings", label: "Invoice Formats", icon: <Receipt className="h-3.5 w-3.5 shrink-0" /> },
      { id: "printers", label: "Printers & Hardware", icon: <Printer className="h-3.5 w-3.5 shrink-0" /> },
      { id: "pos-settings", label: "POS Terminal Engine", icon: <Cpu className="h-3.5 w-3.5 shrink-0" /> },
      { id: "custom-fields", label: "Custom Attributes", icon: <Tags className="h-3.5 w-3.5 shrink-0" /> },
    ],
  },
  {
    id: "system",
    title: "System & Governance",
    icon: <Server className="h-3.5 w-3.5 shrink-0" />,
    theme: {
      iconBox: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      iconBoxOpen: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs shadow-emerald-500/20",
      headerIdle: "text-slate-700 dark:text-zinc-300 border-transparent",
      headerOpen: "bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-800/50 shadow-xs",
      headerHover: "hover:bg-emerald-500/10 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/25",
      chevronBgOpen: "bg-emerald-500/15 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300",
      badgeOpen: "bg-emerald-500/15 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
      subItemHover: "hover:bg-emerald-500/10 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/25",
      subItemActive: "bg-emerald-500/15 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/35 dark:border-emerald-800/60 shadow-xs",
      subItemDot: "bg-emerald-500 shadow-emerald-500/50",
    },
    items: [
      { id: "email-settings", label: "Email SMTP Server", icon: <Mail className="h-3.5 w-3.5 shrink-0" /> },
      { id: "sms-gateways", label: "SMS Gateways", icon: <MessageSquare className="h-3.5 w-3.5 shrink-0" /> },
      { id: "otp-settings", label: "OTP & 2FA Governance", icon: <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> },
      { id: "gdpr-compliance", label: "Data Privacy & GDPR", icon: <FileCheck className="h-3.5 w-3.5 shrink-0" /> },
    ],
  },
  {
    id: "financial",
    title: "Financial Settings",
    icon: <CircleDollarSign className="h-3.5 w-3.5 shrink-0" />,
    theme: {
      iconBox: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      iconBoxOpen: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20",
      headerIdle: "text-slate-700 dark:text-zinc-300 border-transparent",
      headerOpen: "bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-800/50 shadow-xs",
      headerHover: "hover:bg-amber-500/10 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/25",
      chevronBgOpen: "bg-amber-500/15 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
      badgeOpen: "bg-amber-500/15 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 border-amber-500/20",
      subItemHover: "hover:bg-amber-500/10 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/25",
      subItemActive: "bg-amber-500/15 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-500/35 dark:border-amber-800/60 shadow-xs",
      subItemDot: "bg-amber-500 shadow-amber-500/50",
    },
    items: [
      { id: "payment-gateways", label: "Payment Gateways", icon: <CreditCard className="h-3.5 w-3.5 shrink-0" /> },
      { id: "bank-accounts", label: "Bank Accounts", icon: <Landmark className="h-3.5 w-3.5 shrink-0" /> },
      { id: "tax-rates", label: "Tax Rates & Surcharges", icon: <Percent className="h-3.5 w-3.5 shrink-0" /> },
      { id: "currencies", label: "Currencies & Rates", icon: <Coins className="h-3.5 w-3.5 shrink-0" /> },
    ],
  },
  {
    id: "other",
    title: "Other Settings",
    icon: <Wrench className="h-3.5 w-3.5 shrink-0" />,
    theme: {
      iconBox: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      iconBoxOpen: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-xs shadow-rose-500/20",
      headerIdle: "text-slate-700 dark:text-zinc-300 border-transparent",
      headerOpen: "bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-800/50 shadow-xs",
      headerHover: "hover:bg-rose-500/10 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/25",
      chevronBgOpen: "bg-rose-500/15 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300",
      badgeOpen: "bg-rose-500/15 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 border-rose-500/20",
      subItemHover: "hover:bg-rose-500/10 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/25",
      subItemActive: "bg-rose-500/15 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-500/35 dark:border-rose-800/60 shadow-xs",
      subItemDot: "bg-rose-500 shadow-rose-500/50",
    },
    items: [
      { id: "storage-settings", label: "Storage & File System", icon: <HardDrive className="h-3.5 w-3.5 shrink-0" /> },
      { id: "ban-ip", label: "Banned IP Addresses", icon: <Ban className="h-3.5 w-3.5 shrink-0" /> },
      { id: "clear-cache", label: "Clear Cache & Re-index", icon: <RotateCcw className="h-3.5 w-3.5 shrink-0" /> },
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
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Single active accordion group state: when one opens, others close!
  const [openGroupId, setOpenGroupId] = useState<string | null>(() => {
    for (const group of SETTINGS_GROUPS) {
      if (group.items.some((item) => item.id === tabParam)) {
        return group.id;
      }
    }
    return "general";
  });

  useEffect(() => {
    const currentTab = searchParams.get("tab") || initialTab;
    setActiveTab(currentTab);
    for (const group of SETTINGS_GROUPS) {
      if (group.items.some((item) => item.id === currentTab)) {
        setOpenGroupId(group.id);
        break;
      }
    }
  }, [searchParams, initialTab]);

  // Toggle group: opening one closes all other groups
  const toggleGroup = (groupId: string) => {
    setOpenGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const handleSelectTab = (itemId: string, groupId: string) => {
    setActiveTab(itemId);
    setOpenGroupId(groupId); // Keep only this group open
    router.replace(`${pathname}?tab=${itemId}`, { scroll: false });
  };

  // Filter groups and items based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_GROUPS;
    const q = searchQuery.toLowerCase().trim();

    return SETTINGS_GROUPS.map((group) => {
      const groupMatches = group.title.toLowerCase().includes(q);
      const filteredItems = group.items.filter((item) =>
        item.label.toLowerCase().includes(q)
      );

      if (groupMatches || filteredItems.length > 0) {
        return {
          ...group,
          items: groupMatches ? group.items : filteredItems,
        };
      }
      return null;
    }).filter(Boolean) as SettingsGroup[];
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT SIDEBAR: Premium Modern Settings Navigation */}
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
        {/* Header with Icon Badge */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                Settings
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight mt-0.5">
                Preferences & Security
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            System
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Group Navigation */}
        <div className="space-y-1">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-6 px-2">
              <Sparkles className="h-6 w-6 text-slate-300 dark:text-zinc-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                No matching settings found
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => {
              // In search mode, open all matching; otherwise only open the single openGroupId
              const isOpen = searchQuery.trim() ? true : openGroupId === group.id;

              return (
                <div key={group.id} className="space-y-0.5">
                  {/* Accordion Group Header with Theme Colors on Open and Hover */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer text-left ${
                      isOpen
                        ? group.theme.headerOpen
                        : `${group.theme.headerIdle} ${group.theme.headerHover}`
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Color-coded Icon Box */}
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 ${
                          isOpen ? group.theme.iconBoxOpen : group.theme.iconBox
                        }`}
                      >
                        {group.icon}
                      </div>
                      <span className="truncate">{group.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors ${
                          isOpen
                            ? group.theme.badgeOpen
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        {group.items.length}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                          isOpen
                            ? group.theme.chevronBgOpen
                            : "text-slate-400 dark:text-zinc-500"
                        }`}
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Sub-items with Theme Hover and Active Colors */}
                  {isOpen && (
                    <div className="pl-3 pr-0.5 py-0.5 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectTab(item.id, group.id)}
                            className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all duration-150 cursor-pointer text-left ${
                              isActive
                                ? `${group.theme.subItemActive} font-semibold`
                                : `border-transparent text-slate-600 dark:text-zinc-400 ${group.theme.subItemHover}`
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`shrink-0 transition-colors ${
                                  isActive
                                    ? "text-current"
                                    : "text-slate-400 dark:text-zinc-500 group-hover:text-current"
                                }`}
                              >
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>

                            {/* Active Glowing Dot / Badge */}
                            {isActive ? (
                              <span
                                className={`h-2 w-2 rounded-full ${group.theme.subItemDot} shadow-sm shrink-0 ml-2`}
                              />
                            ) : (
                              item.badge && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 shrink-0 ml-2">
                                  {item.badge}
                                </span>
                              )
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Logout Button */}
          <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={async () => {
                await logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-all text-left cursor-pointer border border-transparent hover:border-rose-200/50 dark:hover:border-rose-900/40"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-zinc-500 group-hover:text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT: Active View Panel */}
      <div className="lg:col-span-9 min-w-0">
        {activeTab === "profile" && <ProfileView className="space-y-6" />}

        {activeTab === "security" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <SecurityView />
          </div>
        )}

        {activeTab === "pos-pin" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-xs">
            <PosPinView />
          </div>
        )}

        {/* Other Settings Placeholder Views */}
        {activeTab !== "profile" &&
          activeTab !== "security" &&
          activeTab !== "pos-pin" && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-8 shadow-xs text-center">
              <div className="max-w-md mx-auto py-8">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
                  <SettingsIcon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 capitalize">
                  {activeTab.replace(/-/g, " ")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  Configuration parameters and policy governance for{" "}
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    {activeTab.replace(/-/g, " ")}
                  </span>
                  . Customize your store behavior and operational settings.
                </p>
                <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300 flex items-center justify-between">
                  <span>Engine Status: Active</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Operational
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
