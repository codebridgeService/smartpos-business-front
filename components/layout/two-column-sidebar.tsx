"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShieldAlert,
  Building2,
  Package,
  Users,
  Settings,
  Store,
  Calculator,
  TrendingUp,
  CreditCard,
  Globe,
  Layers,
  FolderTree,
  ArrowLeftRight,
  UserCheck,
  BadgeCheck,
  Key,
  History,
  Tablet,
  Receipt,
  Megaphone,
  Smartphone,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { useTheme } from "@/context/theme-context";

interface TwoColumnSubItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "success" | "neutral" | "orange";
}

interface TwoColumnSection {
  id: string;
  title: string;
  shortLabel: string;
  icon: React.ReactNode;
  items: TwoColumnSubItem[];
}

export function TwoColumnSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeBusiness, businesses } = useBusiness();
  const { outlets, activeOutlet } = useOutlet();
  const { getSidebarPreset } = useTheme();
  const sidebarPreset = getSidebarPreset();

  const businessSettingsHref = "/businesses/settings";

  const sections: TwoColumnSection[] = useMemo(() => [
    {
      id: "main",
      title: "Main Menu",
      shortLabel: "Main",
      icon: <LayoutGrid className="h-5 w-5" />,
      items: [
        { label: "Admin Dashboard", href: "/admin/dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
        { label: "Sales Dashboard", href: "/admin/dashboard?view=sales", icon: <TrendingUp className="h-4 w-4" /> },
        { label: "POS Terminal", href: "/admin/pos", icon: <Calculator className="h-4 w-4 text-orange-500" />, badge: "Live", badgeVariant: "success" },
        { label: "Business Settings", href: businessSettingsHref, icon: <Settings className="h-4 w-4 text-blue-500" />, badge: activeBusiness?.code || "Tenant" },
        { label: "Business Master", href: "/businesses", icon: <Building2 className="h-4 w-4 text-emerald-500" /> },
      ],
    },
    {
      id: "super_admin",
      title: "Super Admin",
      shortLabel: "Admin",
      icon: <ShieldAlert className="h-5 w-5" />,
      items: [
        { label: "SaaS Overview", href: "/admin/dashboard?view=saas", icon: <LayoutGrid className="h-4 w-4" /> },
        { label: "Companies", href: "/admin/companies", icon: <Building2 className="h-4 w-4" /> },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: <CreditCard className="h-4 w-4" />, badge: "Active", badgeVariant: "success" },
        { label: "Packages", href: "/admin/packages", icon: <Package className="h-4 w-4" /> },
        { label: "Domain", href: "/admin/domain", icon: <Globe className="h-4 w-4" /> },
        { label: "Transactions", href: "/admin/purchase-transaction", icon: <Receipt className="h-4 w-4" /> },
      ],
    },
    {
      id: "stores",
      title: "Store & Terminals",
      shortLabel: "Stores",
      icon: <Building2 className="h-5 w-5" />,
      items: [
        { label: "Outlets & Branches", href: "/admin/businesses/outlets", icon: <Building2 className="h-4 w-4" />, badge: outlets.length > 0 ? `${outlets.length}` : undefined },
        { label: "Cash Registers", href: "/admin/businesses/registers", icon: <Calculator className="h-4 w-4" /> },
        { label: "POS Devices", href: "/admin/businesses/pos-devices", icon: <Tablet className="h-4 w-4" />, badge: "Hardware", badgeVariant: "neutral" },
        { label: "Register Shifts", href: "/admin/pos/shifts", icon: <History className="h-4 w-4" /> },
        { label: "Cash Drawer", href: "/admin/pos/drawer", icon: <Calculator className="h-4 w-4" /> },
      ],
    },
    {
      id: "inventory",
      title: "Stock & Inventory",
      shortLabel: "Catalog",
      icon: <Package className="h-5 w-5" />,
      items: [
        { label: "Manage Stock", href: "/admin/warehouses", icon: <Layers className="h-4 w-4" /> },
        { label: "Products Catalog", href: "/coming-soon?feature=products", icon: <Package className="h-4 w-4" /> },
        { label: "Category & Brands", href: "/coming-soon?feature=category", icon: <FolderTree className="h-4 w-4" /> },
        { label: "Stock Adjustment", href: "/coming-soon?feature=stock-adjustment", icon: <TrendingUp className="h-4 w-4" /> },
        { label: "Stock Transfer", href: "/coming-soon?feature=stock-transfer", icon: <ArrowLeftRight className="h-4 w-4" /> },
      ],
    },
    {
      id: "governance",
      title: "Staff & Governance",
      shortLabel: "Staff",
      icon: <Users className="h-5 w-5" />,
      items: [
        { label: "Staff & Members", href: "/admin/businesses/staff", icon: <Users className="h-4 w-4" /> },
        { label: "Users Management", href: "/admin/users", icon: <UserCheck className="h-4 w-4" /> },
        { label: "Roles & RBAC", href: "/admin/roles", icon: <BadgeCheck className="h-4 w-4" /> },
        { label: "Permissions", href: "/admin/permissions", icon: <Key className="h-4 w-4" /> },
      ],
    },
    {
      id: "settings",
      title: "Settings & System",
      shortLabel: "Settings",
      icon: <Settings className="h-5 w-5" />,
      items: [
        { label: "Profile", href: "/admin/settings?tab=profile", icon: <UserCheck className="h-4 w-4" /> },
        { label: "Company Settings", href: "/admin/settings?tab=company-settings", icon: <Building2 className="h-4 w-4" /> },
        { label: "POS PIN", href: "/admin/settings?tab=pos-pin", icon: <Key className="h-4 w-4" /> },
        { label: "Printers & Hardware", href: "/admin/settings?tab=printers", icon: <Tablet className="h-4 w-4" /> },
      ],
    },
  ], [outlets.length]);

  // Determine active section based on current path
  const initialSection = useMemo(() => {
    const found = sections.find((s) =>
      s.items.some((item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href)))
    );
    return found?.id || "main";
  }, [pathname, sections]);

  const [activeSectionId, setActiveSectionId] = useState<string>(initialSection);

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="flex h-full border-r border-slate-200 dark:border-zinc-800 select-none">
      {/* First Column: Slim Rail Dock */}
      <div className={`w-18 shrink-0 h-full border-r border-slate-200/80 dark:border-zinc-800 flex flex-col items-center py-3.5 space-y-2 ${sidebarPreset.colorClass} ${sidebarPreset.textClass}`}>
        <div className="space-y-1.5 w-full px-2">
          {sections.map((sec) => {
            const isSelected = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full group flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-102"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                title={sec.title}
              >
                {sec.icon}
                <span className={`text-[10px] font-semibold mt-1 tracking-tight truncate w-full text-center ${isSelected ? "text-white" : ""}`}>
                  {sec.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Second Column: Submenu Panel with User Profile matching Dreams POS Screenshot 2 */}
      <div className="w-56 shrink-0 h-full flex flex-col bg-white dark:bg-zinc-900 sidebar-scrollbar">
        {/* User Card Header matching Dreams POS */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-850/40">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || "Adrian Herman"}
            </h4>
            <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 font-medium truncate">
              {user?.roles?.[0]?.name || user?.roles?.[0]?.code || "System Admin"}
            </p>
          </div>
        </div>

        {/* Section Title */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {currentSection.title}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
            {currentSection.items.length}
          </span>
        </div>

        {/* Submenu List */}
        <div className="p-2 space-y-1 flex-1">
          {currentSection.items.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={`${item.label}-${item.href}-${idx}`}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-orange-500 text-white font-semibold shadow-xs shadow-orange-500/25"
                    : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? "text-white" : "text-slate-400 dark:text-zinc-500"}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeVariant === "success"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
