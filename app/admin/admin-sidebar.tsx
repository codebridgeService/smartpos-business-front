"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Building2,
  CreditCard,
  Package,
  Globe,
  Receipt,
  UserCheck,
  PackagePlus,
  ClockAlert,
  TrendingDown,
  FolderTree,
  GitFork,
  Award,
  Scale,
  SlidersHorizontal,
  BadgeCheck,
  Barcode,
  QrCode,
  Layers,
  TrendingUp,
  ArrowLeftRight,
  Calculator,
  Tablet,
  History,
  Settings,
  ShieldAlert,
  ChevronRight,
  Store,
  Key,
  Boxes,
  Users,
  Megaphone,
  Smartphone,
  Monitor,
  CircleDollarSign,
  Nut,
  LogOut,
  GitCommit,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useOutlet } from "@/context/outlet-context";
import { useTheme } from "@/context/theme-context";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "success" | "neutral" | "danger" | "orange";
  ownerOnly?: boolean;
  children?: AdminNavItem[];
  isExpandedDefault?: boolean;
  isAction?: boolean;
  onClick?: () => void;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
  showDivider?: boolean;
}

export interface AdminSidebarProps {
  onItemClick?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  onItemClick,
  className = "",
  isCollapsed = false,
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { outlets } = useOutlet();

  // Active item tracking (by href) - set on click and synced with pathname
  const [activeKey, setActiveKey] = useState<string>(() => pathname);

  // Automatically track active dropdowns based on current route
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => {
      const isCurrentlyOpen = Boolean(prev[label]);
      // If currently open, close it. Otherwise open ONLY this item and close all other dropdowns
      return isCurrentlyOpen ? {} : { [label]: true };
    });
  };

  // Navigation sections matching Dreams POS Admin Specification:
  // Main:
  // - Dashboard (direct link)
  // - Super Admin (dropdown folder containing: Dashboard, Companies, Subscriptions, Packages, Domain, Purchase Transaction)
  // - Application (dropdown folder)
  // - Layouts (dropdown folder)
  const sections: AdminNavSection[] = [
    {
      title: "Main",
      showDivider: true,
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: <LayoutGrid className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Super Admin",
          href: "#",
          icon: <ShieldAlert className="h-4.5 w-4.5 shrink-0" />,
          badge: "SaaS",
          badgeVariant: "orange",
          children: [
            {
              label: "Companies",
              href: "/admin/companies",
              icon: <Building2 className="h-3.5 w-3.5 shrink-0" />,
              badge: outlets.length > 0 ? String(outlets.length) : undefined,
              badgeVariant: "neutral",
            },
            {
              label: "Subscriptions",
              href: "/admin/subscriptions",
              icon: <CreditCard className="h-3.5 w-3.5 shrink-0" />,
              badge: "Active",
              badgeVariant: "success",
            },
            {
              label: "Packages",
              href: "/admin/packages",
              icon: <Package className="h-3.5 w-3.5 shrink-0" />,
              badge: "3 Plans",
              badgeVariant: "orange",
            },
            {
              label: "Domain",
              href: "/admin/domain",
              icon: <Globe className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Purchase Transaction",
              href: "/admin/purchase-transaction",
              icon: <Receipt className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Announcements & Controls",
              href: "/admin/announcements",
              icon: <Megaphone className="h-3.5 w-3.5 shrink-0 text-orange-500" />,
              badge: "Live",
              badgeVariant: "orange",
            },
          ],
        },
        {
          label: "Application",
          href: "#",
          icon: <Boxes className="h-4.5 w-4.5 shrink-0" />,
          children: [
            {
              label: "Chat",
              href: "/coming-soon?feature=chat",
              icon: <Boxes className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Calendar",
              href: "/coming-soon?feature=calendar",
              icon: <Boxes className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Email",
              href: "/coming-soon?feature=email",
              icon: <Boxes className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "To Do",
              href: "/coming-soon?feature=todo",
              icon: <Boxes className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "File Manager",
              href: "/coming-soon?feature=file-manager",
              icon: <Boxes className="h-3.5 w-3.5 shrink-0" />,
            },
          ],
        },
        {
          label: "Layouts",
          href: "#",
          icon: <Layers className="h-4.5 w-4.5 shrink-0" />,
          children: [
            {
              label: "Default",
              href: "/coming-soon?feature=layout-default",
              icon: <Layers className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Mini Sidebar",
              href: "/coming-soon?feature=layout-mini",
              icon: <Layers className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Dark Mode",
              href: "/coming-soon?feature=layout-dark",
              icon: <Layers className="h-3.5 w-3.5 shrink-0" />,
            },
          ],
        },
      ],
    },
    {
      title: "Access & Security",
      showDivider: true,
      items: [
        {
          label: "Roles & Security",
          href: "#",
          icon: <UserCheck className="h-4.5 w-4.5 shrink-0" />,
          children: [
            {
              label: "Users Management",
              href: "/admin/users",
              icon: <Users className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Roles & RBAC",
              href: "/admin/roles",
              icon: <BadgeCheck className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Permissions Directory",
              href: "/admin/permissions",
              icon: <Key className="h-3.5 w-3.5 shrink-0" />,
            },
          ],
        },
      ],
    },
    {
      title: "Inventory",
      showDivider: true,
      items: [
        {
          label: "Products",
          href: "/coming-soon?feature=products",
          icon: <Package className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Create Product",
          href: "/coming-soon?feature=create-product",
          icon: <PackagePlus className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Expired Products",
          href: "/coming-soon?feature=expired-products",
          icon: <ClockAlert className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Low Stocks",
          href: "/coming-soon?feature=low-stocks",
          icon: <TrendingDown className="h-4.5 w-4.5 shrink-0" />,
          badge: "Alert",
          badgeVariant: "warning",
        },
        {
          label: "Category",
          href: "/coming-soon?feature=category",
          icon: <FolderTree className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Sub Category",
          href: "/coming-soon?feature=sub-category",
          icon: <GitFork className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Brands",
          href: "/coming-soon?feature=brands",
          icon: <Award className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Units",
          href: "/coming-soon?feature=units",
          icon: <Scale className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Variant Attributes",
          href: "/coming-soon?feature=variant-attributes",
          icon: <SlidersHorizontal className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Warranties",
          href: "/coming-soon?feature=warranties",
          icon: <BadgeCheck className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Print Barcode",
          href: "/coming-soon?feature=print-barcode",
          icon: <Barcode className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Print QR Code",
          href: "/coming-soon?feature=print-qr-code",
          icon: <QrCode className="h-4.5 w-4.5 shrink-0" />,
        },
      ],
    },
    {
      title: "Stock",
      showDivider: true,
      items: [
        {
          label: "Manage Stock",
          href: "/admin/warehouses",
          icon: <Layers className="h-4.5 w-4.5 shrink-0" />,
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
      title: "Store & Operations",
      showDivider: true,
      items: [
        {
          label: "Business Master",
          href: "/businesses",
          icon: <Building2 className="h-4.5 w-4.5 shrink-0" />,
          badge: "Multi-Tenant",
          badgeVariant: "orange",
        },
        {
          label: "Cash Registers",
          href: "/admin/businesses/registers",
          icon: <Calculator className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "POS Devices",
          href: "/admin/businesses/pos-devices",
          icon: <Tablet className="h-4.5 w-4.5 shrink-0" />,
          badge: "Hardware",
          badgeVariant: "neutral",
        },
        {
          label: "Cash Drawer & Shifts",
          href: "/admin/pos/shifts",
          icon: <History className="h-4.5 w-4.5 shrink-0" />,
          children: [
            {
              label: "Register Shifts",
              href: "/admin/pos/shifts",
              icon: <History className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Cash Drawer",
              href: "/admin/pos/drawer",
              icon: <Calculator className="h-3.5 w-3.5 shrink-0" />,
            },
          ],
        },
        {
          label: "Feature Controls",
          href: "/admin/system/feature-controls",
          icon: <ShieldAlert className="h-4.5 w-4.5 shrink-0" />,
          badge: "Control",
          badgeVariant: "orange",
        },
        {
          label: "Announcements",
          href: "/admin/announcements",
          icon: <Megaphone className="h-4.5 w-4.5 shrink-0" />,
        },
        {
          label: "Change Log",
          href: "/admin/system/changelogs",
          icon: <GitCommit className="h-4.5 w-4.5 shrink-0 text-orange-500" />,
          badge: "v1.2.1",
          badgeVariant: "orange",
        },
      ],
    },
    {
      title: "Settings",
      showDivider: true,
      items: [
        {
          label: "General Settings",
          href: "/admin/settings?tab=profile",
          icon: <Settings className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "Profile", href: "/admin/settings?tab=profile", icon: <UserCheck className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Security", href: "/admin/settings?tab=security", icon: <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Notifications", href: "/admin/settings?tab=notifications", icon: <Megaphone className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Connected Apps", href: "/admin/settings?tab=connected-apps", icon: <Boxes className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "Website Settings",
          href: "/admin/settings?tab=system-info",
          icon: <Globe className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "System Information", href: "/admin/settings?tab=system-info", icon: <LayoutGrid className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Company Profile", href: "/admin/settings?tab=company-settings", icon: <Building2 className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Localization & Timezone", href: "/admin/settings?tab=localization", icon: <Globe className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Invoice Prefixes", href: "/admin/settings?tab=prefixes", icon: <Receipt className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Display Preferences", href: "/admin/settings?tab=preferences", icon: <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "App Settings",
          href: "/admin/settings?tab=pos-pin",
          icon: <Smartphone className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "POS Fast-Access PIN", href: "/admin/settings?tab=pos-pin", icon: <Key className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Invoice Formats", href: "/admin/settings?tab=invoice-settings", icon: <Receipt className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Printers & Hardware", href: "/admin/settings?tab=printers", icon: <Tablet className="h-3.5 w-3.5 shrink-0" /> },
            { label: "POS Terminal Engine", href: "/admin/settings?tab=pos-settings", icon: <Calculator className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Custom Attributes", href: "/admin/settings?tab=custom-fields", icon: <Layers className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "System Settings",
          href: "/admin/settings?tab=email-settings",
          icon: <Monitor className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "Email SMTP Server", href: "/admin/settings?tab=email-settings", icon: <Boxes className="h-3.5 w-3.5 shrink-0" /> },
            { label: "SMS Gateways", href: "/admin/settings?tab=sms-gateways", icon: <Smartphone className="h-3.5 w-3.5 shrink-0" /> },
            { label: "OTP & 2FA Governance", href: "/admin/settings?tab=otp-settings", icon: <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Data Privacy & GDPR", href: "/admin/settings?tab=gdpr-compliance", icon: <BadgeCheck className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "Financial Settings",
          href: "/admin/settings?tab=payment-gateways",
          icon: <CircleDollarSign className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "Payment Gateways", href: "/admin/settings?tab=payment-gateways", icon: <CreditCard className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Bank Accounts", href: "/admin/settings?tab=bank-accounts", icon: <Building2 className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Tax Rates & Surcharges", href: "/admin/settings?tab=tax-rates", icon: <Receipt className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Currencies & Rates", href: "/admin/settings?tab=currencies", icon: <CircleDollarSign className="h-3.5 w-3.5 shrink-0" /> },
          ],
        },
        {
          label: "Other Settings",
          href: "/admin/settings?tab=storage-settings",
          icon: <Nut className="h-4.5 w-4.5 shrink-0" />,
          children: [
            { label: "Storage & File System", href: "/admin/settings?tab=storage-settings", icon: <Layers className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Banned IP Addresses", href: "/admin/settings?tab=ban-ip", icon: <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> },
            { label: "Clear Cache & Re-index", href: "/admin/settings?tab=clear-cache", icon: <History className="h-3.5 w-3.5 shrink-0" /> },
          ],
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleGroupClick = (item: AdminNavItem) => {
    toggleDropdown(item.label);
    if (item.href && item.href !== "#" && item.href !== "#logout") {
      setActiveKey(item.href);
      router.push(item.href);
    }
  };

  const handleActionClick = async (item: AdminNavItem) => {
    if (onItemClick) onItemClick();
    if (item.onClick) {
      item.onClick();
    } else if (item.label === "Logout") {
      await logout();
    }
  };

  const { getSidebarPreset, themeColor } = useTheme();
  const sidebarPreset = getSidebarPreset();
  const isDarkSidebar = sidebarPreset.isDark;

  const accentThemeMap: Record<string, {
    activeLight: string;
    activeDark: string;
    icon: string;
    chevronLight: string;
    chevronDark: string;
  }> = {
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
  const inactiveIcon = isDarkSidebar ? "text-white/70 group-hover:text-white" : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200";
  const activeIcon = isDarkSidebar ? "text-white" : currentAccent.icon;
  const chevronActive = isDarkSidebar ? currentAccent.chevronDark : currentAccent.chevronLight;
  const chevronInactive = isDarkSidebar ? "bg-white/10 text-white/70 group-hover:text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200";

  // Helper for badge styling
  const renderBadge = (badge: string, variant?: string, isActive?: boolean) => {
    if (isDarkSidebar) {
      return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/25 text-white" : "bg-white/15 text-white"
          }`}>
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

  return (
    <div className={`flex flex-col h-full select-none overflow-hidden ${className}`}>
      {/* Navigation Sections starting directly at top matching Dreams POS design */}
      <div className={`flex-1 min-h-0 sidebar-scrollbar py-1 pb-10 space-y-1 ${isCollapsed ? "" : "pr-0.5"}`}>
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
                <div className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${isDarkSidebar ? "text-white/50" : "text-slate-400 dark:text-zinc-500"
                  }`}>
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
                    (item.label === "General Settings" && (activeKey.includes("tab=profile") || activeKey.includes("tab=security") || activeKey.includes("tab=notifications") || activeKey.includes("tab=connected-apps"))) ||
                    (item.label === "Website Settings" && (activeKey.includes("tab=system-info") || activeKey.includes("tab=company-settings") || activeKey.includes("tab=localization") || activeKey.includes("tab=prefixes") || activeKey.includes("tab=preferences"))) ||
                    (item.label === "App Settings" && (activeKey.includes("tab=pos-pin") || activeKey.includes("tab=invoice-settings") || activeKey.includes("tab=printers") || activeKey.includes("tab=pos-settings") || activeKey.includes("tab=custom-fields"))) ||
                    (item.label === "System Settings" && (activeKey.includes("tab=email-settings") || activeKey.includes("tab=sms-gateways") || activeKey.includes("tab=otp-settings") || activeKey.includes("tab=gdpr-compliance"))) ||
                    (item.label === "Financial Settings" && (activeKey.includes("tab=payment-gateways") || activeKey.includes("tab=bank-accounts") || activeKey.includes("tab=tax-rates") || activeKey.includes("tab=currencies"))) ||
                    (item.label === "Other Settings" && (activeKey.includes("tab=storage-settings") || activeKey.includes("tab=ban-ip") || activeKey.includes("tab=clear-cache") || activeKey.includes("tab=other")));

                  const isTopLevelActive = hasChildren
                    ? ((activeKey || pathname) === item.href || (!isOpen && (isAnyChildActive || isSettingsGroupActive)))
                    : (activeKey || pathname) === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      item.href !== "/admin/pos" &&
                      item.href !== "#" &&
                      item.href !== "#logout" &&
                      pathname.startsWith(item.href + "/"));

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
                            <span className={`shrink-0 flex items-center justify-center w-5 h-5 transition-colors ${inactiveIcon
                              }`}>
                              {item.icon}
                            </span>
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
                                ? isDarkSidebar ? "bg-white/10 text-white font-medium" : "text-slate-900 dark:text-zinc-100 font-medium hover:bg-slate-100/60 dark:hover:bg-zinc-800/40"
                                : inactiveStyle
                            }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "w-full min-w-0"}`}>
                            <span
                              className={`transition-colors shrink-0 flex items-center justify-center w-5 h-5 ${isTopLevelActive || isAnyChildActive
                                ? activeIcon
                                : inactiveIcon
                                }`}
                            >
                              {item.icon}
                            </span>
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
                                      ? isDarkSidebar ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
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
                            } ${isTopLevelActive
                              ? activeStyle
                              : inactiveStyle
                            }`}
                        >
                          <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "w-full min-w-0"}`}>
                            <span
                              className={`transition-colors shrink-0 flex items-center justify-center w-5 h-5 ${isTopLevelActive
                                ? activeIcon
                                : inactiveIcon
                                }`}
                            >
                              {item.icon}
                            </span>
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

                      {/* Dropdown / Submenu matching exact typography of reference */}
                      {hasChildren && (
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen && !isCollapsed
                            ? "max-h-96 opacity-100 pl-9 pr-2 space-y-0.5 py-1"
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
                                  if (onItemClick) onItemClick();
                                }}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] transition-all duration-150 ease-out hover:translate-x-1 ${isChildActive
                                  ? isDarkSidebar
                                    ? "bg-white/20 text-white font-medium"
                                    : currentAccent.activeLight
                                  : isDarkSidebar
                                    ? "text-white/70 hover:text-white hover:bg-white/10 font-normal"
                                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 font-normal"
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${isChildActive
                                      ? "bg-orange-500 ring-4 ring-orange-200/80 dark:ring-orange-950 scale-110"
                                      : "bg-slate-300 dark:bg-zinc-600"
                                      }`}
                                  />
                                  <span className={`truncate ${isChildActive ? "font-semibold text-orange-600 dark:text-orange-400" : ""}`}>{child.label}</span>
                                </div>
                                {child.badge && renderBadge(child.badge, child.badgeVariant, isChildActive)}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section Divider Line matching Reference Image */}
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

      {/* Footer Security Badge */}
      <div className={`pt-2.5 pb-1 mt-auto border-t text-[11px] flex items-center overflow-hidden transition-all duration-300 ${isDarkSidebar
        ? "border-white/15 text-white/70"
        : "border-slate-150 dark:border-zinc-800 text-slate-500 dark:text-zinc-400"
        } ${isCollapsed ? "px-1 justify-center" : "justify-between px-2"
        }`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "min-w-0 gap-2"}`}>
          <span className="w-5 h-5 shrink-0 flex items-center justify-center">
            <ShieldAlert className={`h-4 w-4 shrink-0 ${isDarkSidebar ? "text-white" : "text-orange-500"}`} />
          </span>
          <div
            className={`transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden whitespace-nowrap ${isCollapsed
              ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
              : "max-w-[140px] opacity-100 translate-x-0"
              }`}
          >
            <span className="truncate font-medium block">{user?.roles?.[0]?.name || "Administrator"}</span>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all duration-300 shrink-0 ${isDarkSidebar
            ? "bg-white/15 text-white"
            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
            } ${isCollapsed ? "opacity-0 max-w-0 overflow-hidden pointer-events-none scale-90" : "opacity-100 scale-100"
            }`}
        >
          Admin
        </span>
      </div>
    </div>
  );
}
