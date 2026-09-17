"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  ShieldAlert,
  Boxes,
  Layers,
  UserCheck,
  Package,
  History,
  Settings,
  ChevronDown,
  TrendingUp,
  Calculator,
  Building2,
  CreditCard,
  Globe,
  Receipt,
  Megaphone,
  ClockAlert,
  TrendingDown,
  FolderTree,
  GitFork,
  Award,
  Users,
  BadgeCheck,
  Key,
  Store,
  Tablet,
  GitCommit,
} from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useOutlet } from "@/context/outlet-context";

interface HorizontalSubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "orange" | "success" | "warning" | "neutral";
}

interface HorizontalNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "orange" | "success" | "warning" | "neutral";
  children?: HorizontalSubItem[];
}

export function HorizontalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { outlets } = useOutlet();
  const { getTopBarPreset, themeColor } = useTheme();
  const topBarPreset = getTopBarPreset();
  const isDark = topBarPreset.isDark;

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // If a menu is already open, switch immediately without delay
    if (openDropdown) {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
      }
      setOpenDropdown(label);
    } else {
      // 50ms gentle delay prevents accidental opening during fast cursor sweeps
      if (!openTimeoutRef.current) {
        openTimeoutRef.current = setTimeout(() => {
          setOpenDropdown(label);
          openTimeoutRef.current = null;
        }, 50);
      }
    }
  };

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      closeTimeoutRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const navItems: HorizontalNavItem[] = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutGrid className="h-4 w-4" />,
      children: [
        { label: "Sales Dashboard", href: "/admin/dashboard?view=sales", icon: <TrendingUp className="h-3.5 w-3.5" /> },
        { label: "POS Terminal", href: "/admin/pos", icon: <Calculator className="h-3.5 w-3.5" />, badge: "Live", badgeVariant: "success" },
      ],
    },
    {
      label: "Super Admin",
      href: "/admin/companies",
      icon: <ShieldAlert className="h-4 w-4" />,
      badge: "SaaS",
      badgeVariant: "orange",
      children: [
        { label: "Dashboard", href: "/admin/dashboard?view=saas", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
        { label: "Companies", href: "/admin/companies", icon: <Building2 className="h-3.5 w-3.5" />, badge: outlets.length > 0 ? String(outlets.length) : undefined, badgeVariant: "neutral" },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: <CreditCard className="h-3.5 w-3.5" />, badge: "Active", badgeVariant: "success" },
        { label: "Packages", href: "/admin/packages", icon: <Package className="h-3.5 w-3.5" />, badge: "3 Plans", badgeVariant: "orange" },
        { label: "Domain", href: "/admin/domain", icon: <Globe className="h-3.5 w-3.5" /> },
        { label: "Purchase Transaction", href: "/admin/purchase-transaction", icon: <Receipt className="h-3.5 w-3.5" /> },
        { label: "Announcements & Controls", href: "/admin/announcements", icon: <Megaphone className="h-3.5 w-3.5 text-orange-500" />, badge: "Live", badgeVariant: "orange" },
      ],
    },
    {
      label: "Application",
      href: "#",
      icon: <Boxes className="h-4 w-4" />,
      children: [
        { label: "Chat", href: "/coming-soon?feature=chat", icon: <Boxes className="h-3.5 w-3.5" /> },
        { label: "Calendar", href: "/coming-soon?feature=calendar", icon: <Boxes className="h-3.5 w-3.5" /> },
        { label: "Email", href: "/coming-soon?feature=email", icon: <Boxes className="h-3.5 w-3.5" /> },
        { label: "To Do", href: "/coming-soon?feature=todo", icon: <Boxes className="h-3.5 w-3.5" /> },
        { label: "File Manager", href: "/coming-soon?feature=file-manager", icon: <Boxes className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Layouts",
      href: "#",
      icon: <Layers className="h-4 w-4" />,
      children: [
        { label: "Default Layout", href: "/coming-soon?feature=layout-default", icon: <Layers className="h-3.5 w-3.5" /> },
        { label: "Mini Sidebar", href: "/coming-soon?feature=layout-mini", icon: <Layers className="h-3.5 w-3.5" /> },
        { label: "Dark Mode", href: "/coming-soon?feature=layout-dark", icon: <Layers className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Roles & Security",
      href: "/admin/roles",
      icon: <UserCheck className="h-4 w-4" />,
      children: [
        { label: "Users Management", href: "/admin/users", icon: <Users className="h-3.5 w-3.5" /> },
        { label: "Roles & RBAC", href: "/admin/roles", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
        { label: "Permissions Directory", href: "/admin/permissions", icon: <Key className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Inventory",
      href: "/coming-soon?feature=products",
      icon: <Package className="h-4 w-4" />,
      children: [
        { label: "Products", href: "/coming-soon?feature=products", icon: <Package className="h-3.5 w-3.5" /> },
        { label: "Create Product", href: "/coming-soon?feature=create-product", icon: <Package className="h-3.5 w-3.5" /> },
        { label: "Expired Products", href: "/coming-soon?feature=expired-products", icon: <ClockAlert className="h-3.5 w-3.5" /> },
        { label: "Low Stocks", href: "/coming-soon?feature=low-stocks", icon: <TrendingDown className="h-3.5 w-3.5" />, badge: "Alert", badgeVariant: "warning" },
        { label: "Category", href: "/coming-soon?feature=category", icon: <FolderTree className="h-3.5 w-3.5" /> },
        { label: "Sub Category", href: "/coming-soon?feature=sub-category", icon: <GitFork className="h-3.5 w-3.5" /> },
        { label: "Brands", href: "/coming-soon?feature=brands", icon: <Award className="h-3.5 w-3.5" /> },
      ],
    },
    {
      label: "Store & Registers",
      href: "/admin/businesses/registers",
      icon: <History className="h-4 w-4" />,
      children: [
        { label: "Cash Registers", href: "/admin/businesses/registers", icon: <Calculator className="h-3.5 w-3.5" /> },
        { label: "POS Devices", href: "/admin/businesses/pos-devices", icon: <Tablet className="h-3.5 w-3.5" />, badge: "Hardware", badgeVariant: "neutral" },
        { label: "Register Shifts", href: "/admin/pos/shifts", icon: <History className="h-3.5 w-3.5" /> },
        { label: "Feature Controls", href: "/admin/system/feature-controls", icon: <ShieldAlert className="h-3.5 w-3.5" />, badge: "Control", badgeVariant: "orange" },
        { label: "Change Log", href: "/admin/system/changelogs", icon: <GitCommit className="h-3.5 w-3.5 text-orange-500" />, badge: "v1.2.1", badgeVariant: "orange" },
      ],
    },
    {
      label: "Settings",
      href: "/admin/settings?tab=profile",
      icon: <Settings className="h-4 w-4" />,
      children: [
        { label: "General Settings", href: "/admin/settings?tab=profile", icon: <Settings className="h-3.5 w-3.5" /> },
        { label: "System Information", href: "/admin/settings?tab=system-info", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
        { label: "Security & 2FA", href: "/admin/settings?tab=security", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
        { label: "Payment Gateways", href: "/admin/settings?tab=payment-gateways", icon: <CreditCard className="h-3.5 w-3.5" /> },
      ],
    },
  ];

  const accentColorClasses: Record<string, { activePill: string; badgeText: string }> = {
    orange: { activePill: "bg-[#FFF6EE] dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold shadow-2xs", badgeText: "text-orange-600" },
    teal: { activePill: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold shadow-2xs", badgeText: "text-teal-600" },
    rose: { activePill: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold shadow-2xs", badgeText: "text-rose-600" },
    purple: { activePill: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold shadow-2xs", badgeText: "text-purple-600" },
    blue: { activePill: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs", badgeText: "text-blue-600" },
    emerald: { activePill: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs", badgeText: "text-emerald-600" },
    amber: { activePill: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold shadow-2xs", badgeText: "text-amber-600" },
  };

  const currentAccent = accentColorClasses[themeColor] || accentColorClasses.orange;

  const renderBadge = (badge: string, variant?: string) => (
    <span
      className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
        variant === "warning"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
          : variant === "success"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
            : variant === "orange"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
              : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {badge}
    </span>
  );

  return (
    <nav
      ref={containerRef}
      className={`sticky top-16 z-30 h-13 border-b flex items-center px-4 sm:px-6 select-none transition-colors duration-300 shadow-2xs overflow-visible ${
        isDark
          ? `${topBarPreset.colorClass} ${topBarPreset.borderClass} ${topBarPreset.textClass}`
          : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-1.5 w-full py-1 overflow-visible">
        {navItems.map((item, idx) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isChildActive = Boolean(
            hasChildren && item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"))
          );
          const isItemActive = pathname === item.href || isChildActive;
          const isOpen = openDropdown === item.label;

          return (
            <div
              key={item.label}
              className="relative shrink-0"
              onMouseEnter={() => hasChildren && handleMouseEnter(item.label)}
              onMouseLeave={() => hasChildren && handleMouseLeave()}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                    isItemActive
                      ? isDark
                        ? "bg-white/20 text-white shadow-2xs font-semibold"
                        : currentAccent.activePill
                      : isDark
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className={isItemActive ? (isDark ? "text-white" : "text-orange-500") : "text-slate-400 dark:text-zinc-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && renderBadge(item.badge, item.badgeVariant)}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    } ${isItemActive ? (isDark ? "text-white" : "text-orange-500") : "text-slate-400"}`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all ${
                    isItemActive
                      ? isDark
                        ? "bg-white/20 text-white shadow-2xs font-semibold"
                        : currentAccent.activePill
                      : isDark
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className={isItemActive ? (isDark ? "text-white" : "text-orange-500") : "text-slate-400 dark:text-zinc-500"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && renderBadge(item.badge, item.badgeVariant)}
                </Link>
              )}

              {/* Flyout Dropdown Menu for Horizontal Navigation with Smooth CSS Transition */}
              {hasChildren && (
                <div
                  className={`absolute ${idx >= navItems.length - 2 ? "right-0" : "left-0"} top-full pt-1.5 w-64 z-50 select-none transition-all duration-200 ease-out origin-top ${
                    isOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
                      : "opacity-0 -translate-y-1.5 scale-95 pointer-events-none invisible"
                  }`}
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-2xl p-1.5 ring-1 ring-black/5 dark:ring-white/10">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="space-y-0.5 max-h-[420px] overflow-y-auto no-scrollbar">
                      {item.children?.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            onClick={() => {
                              if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
                              setOpenDropdown(null);
                            }}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] transition-all duration-150 ease-out hover:translate-x-0.5 ${
                              isSubActive
                                ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold"
                                : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={isSubActive ? "text-orange-500" : "text-slate-400 dark:text-zinc-500"}>
                                {sub.icon}
                              </span>
                              <span className="truncate">{sub.label}</span>
                            </div>
                            {sub.badge && renderBadge(sub.badge, sub.badgeVariant)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
