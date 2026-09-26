"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Store,
  LayoutGrid,
  CreditCard,
  Package,
  Globe,
  Receipt,
  UserCheck,
  FolderTree,
  BadgeCheck,
  Layers,
  TrendingUp,
  ArrowLeftRight,
  Calculator,
  Tablet,
  History,
  Settings,
  ShieldAlert,
  ChevronRight,
  Key,
  Users,
  Megaphone,
  Smartphone,
  CircleDollarSign,
  LogOut,
  Sparkles,
  GitCommit,
  Scale,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { useTheme } from "@/context/theme-context";

export interface BusinessNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "success" | "neutral" | "danger" | "orange";
  children?: BusinessNavItem[];
  isAction?: boolean;
  onClick?: () => void;
}

export interface BusinessNavSection {
  title: string;
  items: BusinessNavItem[];
  showDivider?: boolean;
}

export interface BusinessSidebarProps {
  onItemClick?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function BusinessSidebar({
  onItemClick,
  className = "",
  isCollapsed = false,
}: BusinessSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { activeBusiness, businesses } = useBusiness();
  const { outlets, activeOutlet, selectOutlet } = useOutlet();

  const [activeKey, setActiveKey] = useState<string>(() => pathname);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = Boolean(prev[label]);
      return isCurrentlyOpen ? {} : { [label]: true };
    });
  };

  const businessSettingsHref = "/businesses/settings";

  const sections: BusinessNavSection[] = [
    {
      title: "Main",
      showDivider: true,
      items: [
        {
          label: "Dashboard",
          href: "/businesses/dashboard",
          icon: <LayoutGrid className="h-4.5 w-4.5 shrink-0" />,
          children: [
            {
              label: "Admin Dashboard",
              href: "/businesses/dashboard",
              icon: <LayoutGrid className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Sales Dashboard",
              href: "/businesses/dashboard?view=sales",
              icon: <TrendingUp className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "POS Terminal",
              href: "/pos",
              icon: <Store className="h-3.5 w-3.5 shrink-0" />,
              badge: "LIVE",
              badgeVariant: "success",
            },
          ],
        },
        {
          label: "Outlets",
          href: "/businesses/outlets",
          icon: <Building2 className="h-4.5 w-4.5 shrink-0" />,
          badge: outlets.length > 0 ? `${outlets.length}` : undefined,
          badgeVariant: "neutral",
          children: [
            {
              label: "All Outlets",
              href: "/businesses/outlets",
              icon: <Building2 className="h-3.5 w-3.5 shrink-0" />,
            },
            ...outlets.map((outlet) => ({
              label: outlet.name,
              href: `/businesses/outlets/${outlet.uuid}`,
              icon: <Store className="h-3.5 w-3.5 shrink-0" />,
              badge:
                activeOutlet?.uuid === outlet.uuid
                  ? "Active"
                  : outlet.is_main_outlet
                    ? "Main"
                    : undefined,
              badgeVariant:
                activeOutlet?.uuid === outlet.uuid
                  ? ("success" as const)
                  : ("orange" as const),
              onClick: () => selectOutlet(outlet.uuid),
            })),
          ],
        },
      ],
    },
    {
      title: "Store & Terminals",
      showDivider: true,
      items: [
        {
          label: "Cash Registers",
          href: "/businesses/outlets",
          icon: <Calculator className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "POS Terminal",
          href: "/pos",
          icon: <Store className="h-4.5 w-4.5 shrink-0 text-orange-500" />,
          badge: "Live",
          badgeVariant: "success",
        },
        {
          label: "Cashier Operations",
          href: "/businesses/pos/cashier",
          icon: <UserCheck className="h-4.5 w-4.5 shrink-0 text-sky-500" />,
        },
        {
          label: "Cash Drawer & Shifts",
          href: "/businesses/pos/shifts",
          icon: <History className="h-4.5 w-4.5 shrink-0" />,
          children: [
            {
              label: "Register Shifts",
              href: "/businesses/pos/shifts",
              icon: <History className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Cash Drawer",
              href: "/businesses/pos/drawer",
              icon: <Wallet className="h-3.5 w-3.5 shrink-0" />,
            },
          ],
        },
        {
          label: "POS Devices",
          href: "/admin/businesses/pos-devices",
          icon: <Tablet className="h-4.5 w-4.5 shrink-0" />,
          badge: "Hardware",
          badgeVariant: "neutral",
        },
      ],
    },
    {
      title: "Stock & Inventory",
      showDivider: true,
      items: [
        {
          label: "Manage Stock",
          href: "/businesses/warehouses",
          icon: <Layers className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Products Catalog",
          href: "/coming-soon?feature=products",
          icon: <Package className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Category & Brands",
          href: "/coming-soon?feature=category",
          icon: <FolderTree className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Units & Scaling",
          href: "/coming-soon?feature=units",
          icon: <Scale className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Stock Adjustment",
          href: "/coming-soon?feature=stock-adjustment",
          icon: <TrendingUp className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Stock Transfer",
          href: "/coming-soon?feature=stock-transfer",
          icon: <ArrowLeftRight className="h-4.5 w-4.5 shrink-0" />,
        },
      ],
    },
    {
      title: "Staff & Governance",
      showDivider: true,
      items: [
        {
          label: "Staff & Members",
          href: "/businesses/staff",
          icon: <Users className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Users Management",
          href: "/businesses/staff",
          icon: <UserCheck className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Roles & RBAC",
          href: "/businesses/roles",
          icon: <BadgeCheck className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Permissions Directory",
          href: "/businesses/permissions",
          icon: <Key className="h-4.5 w-4.5 shrink-0" />,
        },
      ],
    },
    {
      title: "Settings & System",
      showDivider: true,
      items: [
        {
          label: "General Settings",
          href: "/businesses/settings?tab=profile",
          icon: <Settings className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "Profile", href: "/businesses/settings?tab=profile", icon: <UserCheck className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Company Profile", href: "/businesses/settings?tab=company-settings", icon: <Building2 className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Security", href: "/businesses/settings?tab=security", icon: <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Notifications", href: "/businesses/announcements", icon: <Megaphone className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "App & Hardware",
          href: "/businesses/settings?tab=pos-pin",
          icon: <Smartphone className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "POS Fast-Access PIN", href: "/businesses/settings?tab=pos-pin", icon: <Key className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Invoice Formats", href: "/businesses/settings?tab=invoice-settings", icon: <Receipt className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Printers & Hardware", href: "/businesses/settings?tab=printers", icon: <Tablet className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "Financial Settings",
          href: "/businesses/settings?tab=payment-gateways",
          icon: <CircleDollarSign className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "Payment Gateways", href: "/businesses/settings?tab=payment-gateways", icon: <CreditCard className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Bank Accounts", href: "/businesses/settings?tab=bank-accounts", icon: <Building2 className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Tax Rates & Surcharges", href: "/businesses/settings?tab=tax-rates", icon: <Receipt className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "Change Log",
          href: "/businesses/system",
          icon: <GitCommit className="h-4.5 w-4.5 shrink-0 text-orange-500" />,
          badge: "v1.2.2",
          badgeVariant: "orange",
        },
        {
          label: "Logout",
          href: "#logout",
          icon: <LogOut className="h-4.5 w-4.5 shrink-0" />,
          isAction: true,
        },
      ],
    },
  ];

  useEffect(() => {
    const fullCurrentPath =
      typeof window !== "undefined" && window.location.search
        ? `${pathname}${window.location.search}`
        : pathname;
    setActiveKey(fullCurrentPath);

    let matchedGroup: string | null = null;
    for (const sec of sections) {
      for (const item of sec.items) {
        if (item.children?.some((child) => child.href === fullCurrentPath || child.href === pathname)) {
          matchedGroup = item.label;
          break;
        }
      }
      if (matchedGroup) break;
    }
    if (matchedGroup) {
      setOpenDropdowns({ [matchedGroup]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleGroupClick = (item: BusinessNavItem) => {
    toggleDropdown(item.label);
    if (item.href && item.href !== "#" && item.href !== "#logout") {
      setActiveKey(item.href);
      router.push(item.href);
    }
  };

  const handleActionClick = async (item: BusinessNavItem) => {
    if (onItemClick) onItemClick();
    if (item.onClick) {
      item.onClick();
    } else if (item.label === "Logout") {
      await logout();
      router.push("/auth/login");
    }
  };

  const { getSidebarPreset, themeColor } = useTheme();
  const sidebarPreset = getSidebarPreset();
  const isDarkSidebar = sidebarPreset.isDark;

  const accentThemeMap: Record<
    string,
    {
      activeLight: string;
      activeDark: string;
      icon: string;
      chevronLight: string;
      chevronDark: string;
    }
  > = {
    orange: {
      activeLight: "bg-[#FFF6EE] dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-medium shadow-xs",
      activeDark: "bg-orange-500 text-white font-medium shadow-md shadow-orange-500/25",
      icon: "text-orange-500 dark:text-orange-400",
      chevronLight: "bg-[#FFEADA] dark:bg-orange-900/50 text-orange-500",
      chevronDark: "bg-white/20 text-white",
    },
    teal: {
      activeLight: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-medium shadow-xs",
      activeDark: "bg-teal-600 text-white font-medium shadow-md shadow-teal-600/25",
      icon: "text-teal-600 dark:text-teal-400",
      chevronLight: "bg-teal-100 dark:bg-teal-900/50 text-teal-600",
      chevronDark: "bg-white/20 text-white",
    },
    rose: {
      activeLight: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium shadow-xs",
      activeDark: "bg-rose-600 text-white font-medium shadow-md shadow-rose-600/25",
      icon: "text-rose-600 dark:text-rose-400",
      chevronLight: "bg-rose-100 dark:bg-rose-900/50 text-rose-600",
      chevronDark: "bg-white/20 text-white",
    },
    purple: {
      activeLight: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium shadow-xs",
      activeDark: "bg-purple-600 text-white font-medium shadow-md shadow-purple-600/25",
      icon: "text-purple-600 dark:text-purple-400",
      chevronLight: "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
      chevronDark: "bg-white/20 text-white",
    },
    blue: {
      activeLight: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium shadow-xs",
      activeDark: "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/25",
      icon: "text-blue-600 dark:text-blue-400",
      chevronLight: "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
      chevronDark: "bg-white/20 text-white",
    },
    emerald: {
      activeLight: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium shadow-xs",
      activeDark: "bg-emerald-600 text-white font-medium shadow-md shadow-emerald-600/25",
      icon: "text-emerald-600 dark:text-emerald-400",
      chevronLight: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600",
      chevronDark: "bg-white/20 text-white",
    },
    amber: {
      activeLight: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium shadow-xs",
      activeDark: "bg-amber-600 text-white font-medium shadow-md shadow-amber-600/25",
      icon: "text-amber-600 dark:text-amber-400",
      chevronLight: "bg-amber-100 dark:bg-amber-900/50 text-amber-600",
      chevronDark: "bg-white/20 text-white",
    },
  };

  const currentAccent = accentThemeMap[themeColor] || accentThemeMap.orange;
  const activeStyle = isDarkSidebar ? currentAccent.activeDark : currentAccent.activeLight;
  const inactiveStyle = isDarkSidebar
    ? "text-white/80 hover:bg-white/10 hover:text-white font-normal"
    : "text-slate-700 dark:text-zinc-300 font-normal hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-100";
  const inactiveIcon = isDarkSidebar
    ? "text-white/70 group-hover:text-white"
    : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200";
  const activeIcon = isDarkSidebar ? "text-white" : currentAccent.icon;
  const chevronActive = isDarkSidebar ? currentAccent.chevronDark : currentAccent.chevronLight;
  const chevronInactive = isDarkSidebar
    ? "bg-white/10 text-white/70 group-hover:text-white"
    : "bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200";

  const renderBadge = (badge: string, variant?: string, isActive?: boolean) => {
    if (isDarkSidebar) {
      return (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/25 text-white" : "bg-white/15 text-white"
            }`}
        >
          {badge}
        </span>
      );
    }
    return (
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${isActive
          ? "bg-orange-500/15 text-orange-600 dark:text-orange-300"
          : variant === "warning"
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
            : variant === "success"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
              : variant === "orange"
                ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
                : variant === "danger"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
      >
        {badge}
      </span>
    );
  };

  const getItemIconTheme = (label: string) => {
    switch (label) {
      case "Dashboard":
        return {
          idle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          open: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs shadow-blue-500/20",
        };
      case "Outlets":
        return {
          idle: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
          open: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-xs shadow-cyan-500/20",
        };
      case "Cash Registers":
        return {
          idle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          open: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20",
        };
      case "POS Terminal":
        return {
          idle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          open: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs shadow-emerald-500/20",
        };
      case "Cashier Operations":
        return {
          idle: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          open: "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40 shadow-xs shadow-sky-500/20",
        };
      case "Cash Drawer & Shifts":
        return {
          idle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          open: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20",
        };
      case "POS Devices":
        return {
          idle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          open: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-xs shadow-purple-500/20",
        };
      case "Manage Stock":
        return {
          idle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          open: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-xs shadow-purple-500/20",
        };
      case "Products Catalog":
        return {
          idle: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          open: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/40 shadow-xs shadow-indigo-500/20",
        };
      case "Category & Brands":
        return {
          idle: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
          open: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 shadow-xs shadow-cyan-500/20",
        };
      case "Units & Scaling":
        return {
          idle: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
          open: "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/40 shadow-xs shadow-teal-500/20",
        };
      case "Stock Adjustment":
        return {
          idle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          open: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20",
        };
      case "Stock Transfer":
        return {
          idle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          open: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs shadow-blue-500/20",
        };
      case "Staff & Members":
        return {
          idle: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          open: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/40 shadow-xs shadow-indigo-500/20",
        };
      case "Users Management":
        return {
          idle: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
          open: "bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40 shadow-xs shadow-sky-500/20",
        };
      case "Roles & RBAC":
        return {
          idle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          open: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs shadow-emerald-500/20",
        };
      case "Permissions Directory":
        return {
          idle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          open: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20",
        };
      case "General Settings":
        return {
          idle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          open: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40 shadow-xs shadow-blue-500/20",
        };
      case "App & Hardware":
        return {
          idle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          open: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/40 shadow-xs shadow-purple-500/20",
        };
      case "Financial Settings":
        return {
          idle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          open: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-xs shadow-amber-500/20",
        };
      case "Change Log":
        return {
          idle: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          open: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 shadow-xs shadow-orange-500/20",
        };
      case "Logout":
        return {
          idle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          open: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-xs shadow-rose-500/20",
        };
      default:
        return {
          idle: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700/60",
          open: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 shadow-xs shadow-orange-500/20",
        };
    }
  };

  const businessInitial = activeBusiness?.name ? activeBusiness.name.charAt(0).toUpperCase() : "B";

  return (
    <div className={`flex flex-col h-full min-h-0 select-none overflow-hidden ${className}`}>
      {/* Top Active Business Tenant Identity Card */}
      <div className="mb-2 shrink-0">
        <Link
          href="/businesses/dashboard"
          onClick={() => onItemClick?.()}
          title={isCollapsed ? activeBusiness?.name || "Business Master" : undefined}
          className={`group flex items-center rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${isDarkSidebar
            ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
            : "bg-white dark:bg-zinc-850/80 hover:bg-orange-50/50 dark:hover:bg-zinc-800 border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 shadow-2xs"
            } ${isCollapsed ? "p-1.5 justify-center" : "p-2.5 justify-between"}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Business Avatar Icon */}
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 shadow-xs ${isDarkSidebar
                ? "bg-orange-500 text-white shadow-orange-500/25"
                : "bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-orange-500/20"
                }`}
            >
              {businessInitial}
            </div>

            {/* Business Info Labels (Hidden when collapsed) */}
            <div
              className={`min-w-0 flex-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap ${isCollapsed
                ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                : "max-w-[150px] opacity-100 translate-x-0"
                }`}
            >
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold truncate leading-tight text-slate-900 dark:text-zinc-100">
                  {activeBusiness?.name || "Business Portal"}
                </p>
              </div>
              <p
                className={`text-[10.5px] truncate mt-0.5 flex items-center gap-1 ${isDarkSidebar ? "text-white/60" : "text-slate-500 dark:text-zinc-400"
                  }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>{activeBusiness?.currency_code || "USD"}</span>
                {activeBusiness?.code && <span>• {activeBusiness.code}</span>}
              </p>
            </div>
          </div>

          {/* Sparkles / Quick Link Pill (Hidden when collapsed) */}
          <div
            className={`transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shrink-0 ${isCollapsed
              ? "max-w-0 opacity-0 pointer-events-none"
              : "max-w-[50px] opacity-100"
              }`}
          >
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isDarkSidebar
                ? "bg-white/10 text-white/70 group-hover:text-white"
                : "bg-orange-100/70 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400"
                }`}
            >
              <Sparkles className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className={`flex-1 min-h-0 sidebar-scrollbar overflow-y-auto py-1 space-y-1 ${isCollapsed ? "" : "pr-0.5"}`}>
        {sections.map((section, sIdx) => {
          return (
            <div key={sIdx} className="space-y-0.5">
              {/* Section Header */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed
                  ? "max-h-0 opacity-0 py-0"
                  : "max-h-8 opacity-100 px-3 pt-3 pb-1.5"
                  }`}
              >
                <div
                  className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${isDarkSidebar ? "text-white/50" : "text-slate-400 dark:text-zinc-500"
                    }`}
                >
                  {section.title}
                </div>
              </div>

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isAnyChildActive = Boolean(
                    hasChildren && item.children?.some((child) => (activeKey || pathname) === child.href)
                  );
                  const isOpen = openDropdowns[item.label] ?? false;

                  const isSettingsGroupActive =
                    (item.label === "General Settings" &&
                      (activeKey.includes("tab=profile") ||
                        activeKey.includes("tab=security") ||
                        activeKey.includes("tab=notifications") ||
                        activeKey.includes("tab=company-settings"))) ||
                    (item.label === "App & Hardware" &&
                      (activeKey.includes("tab=pos-pin") ||
                        activeKey.includes("tab=invoice-settings") ||
                        activeKey.includes("tab=printers"))) ||
                    (item.label === "Financial Settings" &&
                      (activeKey.includes("tab=payment-gateways") ||
                        activeKey.includes("tab=bank-accounts") ||
                        activeKey.includes("tab=tax-rates")));

                  const isTopLevelActive = hasChildren
                    ? (activeKey || pathname) === item.href ||
                    (!isOpen && (isAnyChildActive || isSettingsGroupActive))
                    : (activeKey || pathname) === item.href ||
                    (item.href !== "/businesses" &&
                      item.href !== "/businesses/dashboard" &&
                      item.href !== "#" &&
                      item.href !== "#logout" &&
                      pathname.startsWith(item.href + "/"));

                  const iconTheme = getItemIconTheme(item.label);

                  return (
                    <div key={item.label} className="space-y-0.5 relative group">
                      {item.isAction ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item)}
                          title={isCollapsed ? item.label : undefined}
                          className={`group flex items-center rounded-2xl text-[14px] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] text-left cursor-pointer w-full h-11 focus:outline-none ${isCollapsed ? "justify-center px-0" : "px-3"
                            } ${inactiveStyle}`}
                        >
                          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "w-full min-w-0"}`}>
                            {/* Color-coded Icon Box */}
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-200 shrink-0 ${iconTheme.idle} group-hover:scale-105`}
                            >
                              {item.icon}
                            </div>
                            <div
                              className={`flex items-center justify-between min-w-0 flex-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap ${isCollapsed
                                ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none ml-0"
                                : "max-w-[200px] opacity-100 translate-x-0 ml-3"
                                }`}
                            >
                              <span className="truncate">{item.label}</span>
                            </div>
                          </div>
                        </button>
                      ) : hasChildren ? (
                        <button
                          type="button"
                          onClick={() => handleGroupClick(item)}
                          title={isCollapsed ? item.label : undefined}
                          className={`group flex items-center rounded-2xl text-[14px] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] text-left cursor-pointer w-full h-11 focus:outline-none ${isCollapsed ? "justify-center px-0" : "px-3"
                            } ${isTopLevelActive
                              ? activeStyle
                              : isOpen && !isCollapsed
                                ? isDarkSidebar
                                  ? "bg-white/10 text-white font-medium"
                                  : "text-slate-900 dark:text-zinc-100 font-medium hover:bg-slate-100/60 dark:hover:bg-zinc-800/40"
                                : inactiveStyle
                            }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "w-full min-w-0"}`}>
                            {/* Color-coded Icon Box */}
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-200 shrink-0 ${
                                isTopLevelActive || isOpen
                                  ? iconTheme.open
                                  : `${iconTheme.idle} group-hover:scale-105`
                              }`}
                            >
                              {item.icon}
                            </div>
                            <div
                              className={`flex items-center justify-between min-w-0 flex-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap ${isCollapsed
                                ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none ml-0"
                                : "max-w-[200px] opacity-100 translate-x-0 ml-3"
                                }`}
                            >
                              <span className="truncate">{item.label}</span>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {item.badge && renderBadge(item.badge, item.badgeVariant, isTopLevelActive)}
                                <span
                                  className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isTopLevelActive
                                    ? chevronActive
                                    : isOpen
                                      ? isDarkSidebar
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                                      : chevronInactive
                                    }`}
                                >
                                  <ChevronRight
                                    className={`h-3.5 w-3.5 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-90" : "rotate-0"
                                      }`}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => {
                            setActiveKey(item.href);
                            if (onItemClick) onItemClick();
                          }}
                          title={isCollapsed ? item.label : undefined}
                          className={`group flex items-center rounded-2xl text-[14px] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] w-full h-11 focus:outline-none ${isCollapsed ? "justify-center px-0" : "px-3"
                            } ${isTopLevelActive ? activeStyle : inactiveStyle}`}
                        >
                          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "w-full min-w-0"}`}>
                            {/* Color-coded Icon Box */}
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all duration-200 shrink-0 ${
                                isTopLevelActive
                                  ? iconTheme.open
                                  : `${iconTheme.idle} group-hover:scale-105`
                              }`}
                            >
                              {item.icon}
                            </div>
                            <div
                              className={`flex items-center justify-between min-w-0 flex-1 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap ${isCollapsed
                                ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none ml-0"
                                : "max-w-[200px] opacity-100 translate-x-0 ml-3"
                                }`}
                            >
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <div className="shrink-0 ml-2">
                                  {renderBadge(item.badge, item.badgeVariant, isTopLevelActive)}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Dropdown Submenu */}
                      {hasChildren && (
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen && !isCollapsed
                            ? "max-h-96 opacity-100 pl-8 pr-2 space-y-0.5 py-1"
                            : "max-h-0 opacity-0 pointer-events-none py-0"
                            }`}
                        >
                          {item.children?.map((child) => {
                            const isChildActive = (() => {
                              if (activeKey) {
                                return activeKey === child.href;
                              }
                              const currentHref =
                                typeof window !== "undefined" && window.location.search
                                    ? `${pathname}${window.location.search}`
                                  : pathname;
                              return currentHref === child.href;
                            })();

                            return (
                              <Link
                                key={child.href + child.label}
                                href={child.href}
                                onClick={() => {
                                  setActiveKey(child.href);
                                  if (child.onClick) child.onClick();
                                  if (onItemClick) onItemClick();
                                }}
                                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${isChildActive
                                  ? isDarkSidebar
                                    ? "bg-white/20 text-white font-medium shadow-xs"
                                    : currentAccent.activeLight
                                  : isDarkSidebar
                                    ? "text-white/70 hover:text-white hover:bg-white/10 font-normal"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 font-normal"
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {child.icon ? (
                                    <span
                                      className={`shrink-0 transition-colors ${
                                        isChildActive
                                          ? "text-orange-500 dark:text-orange-400"
                                          : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                                      }`}
                                    >
                                      {child.icon}
                                    </span>
                                  ) : (
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${isChildActive
                                        ? "bg-orange-500 ring-4 ring-orange-200/80 dark:ring-orange-950 scale-110"
                                        : "bg-slate-300 dark:bg-zinc-600"
                                        }`}
                                    />
                                  )}
                                  <span
                                    className={`truncate ${isChildActive ? "font-semibold text-orange-600 dark:text-orange-400" : ""
                                      }`}
                                  >
                                    {child.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  {isChildActive && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-xs" />
                                  )}
                                  {child.badge && renderBadge(child.badge, child.badgeVariant, isChildActive)}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section Divider Line */}
              {section.showDivider && (
                <div className="py-2 transition-all duration-300">
                  <div
                    className={`border-t transition-all duration-300 ${isDarkSidebar ? "border-white/15" : "border-slate-200 dark:border-zinc-800"
                      } ${isCollapsed ? "w-6 mx-auto" : "mx-1"}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Business Tenant Badge */}
      <div
        className={`pt-2.5 pb-1 mt-auto border-t text-[11px] flex items-center overflow-hidden transition-all duration-300 ${isDarkSidebar
          ? "border-white/15 text-white/70"
          : "border-slate-150 dark:border-zinc-800 text-slate-500 dark:text-zinc-400"
          } ${isCollapsed ? "px-1 justify-center" : "justify-between px-2"}`}
      >
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "min-w-0 gap-2"}`}>
          <span className="w-5 h-5 shrink-0 flex items-center justify-center">
            <Building2
              className={`h-4 w-4 shrink-0 ${isDarkSidebar ? "text-white" : "text-orange-500"}`}
            />
          </span>
          <div
            className={`transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap ${isCollapsed
              ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
              : "max-w-[140px] opacity-100 translate-x-0"
              }`}
          >
            <span className="truncate font-medium block">
              {activeBusiness?.name || user?.name || "Business"}
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all duration-300 shrink-0 ${isDarkSidebar
            ? "bg-white/15 text-white"
            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            } ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden pointer-events-none scale-90" : "opacity-100 scale-100"}`}
        >
          Business
        </span>
      </div>
    </div>
  );
}
