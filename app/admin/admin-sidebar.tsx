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
  ChevronDown,
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useOutlet } from "@/context/outlet-context";
import { isAdmin } from "@/lib/utils/roles";

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
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? false),
    }));
  };

  const isUserAdmin = isAdmin(user);

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
          children: [
            {
              label: "Sales Dashboard",
              href: "/admin/dashboard?view=sales",
              icon: <TrendingUp className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "POS Terminal",
              href: "/admin/pos",
              icon: <Calculator className="h-3.5 w-3.5 shrink-0" />,
              badge: "Live",
              badgeVariant: "success",
            },
          ],
        },
        {
          label: "Super Admin",
          href: "#",
          icon: <ShieldAlert className="h-4.5 w-4.5 shrink-0" />,
          badge: "SaaS",
          badgeVariant: "orange",
          children: [
            {
              label: "Dashboard",
              href: "/admin/dashboard?view=saas",
              icon: <LayoutGrid className="h-3.5 w-3.5 shrink-0" />,
            },
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
              label: "Roles & RBAC",
              href: "/admin/roles",
              icon: <BadgeCheck className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Permissions Directory",
              href: "/admin/permissions",
              icon: <Key className="h-3.5 w-3.5 shrink-0" />,
            },
            {
              label: "Owner Portal",
              href: "/admin/owner",
              icon: <Store className="h-3.5 w-3.5 shrink-0" />,
              badge: "Owner",
              badgeVariant: "orange",
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
    setActiveKey(fullCurrentPath);

    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.children?.some((child) => child.href === fullCurrentPath || child.href === pathname)) {
          setOpenDropdowns((prev) => ({ ...prev, [item.label]: true }));
        }
      });
    });
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

  // Helper for badge styling
  const renderBadge = (badge: string, variant?: string, isActive?: boolean) => (
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

  return (
    <div className={`flex flex-col h-full select-none ${className}`}>
      {/* Navigation Sections starting directly at top matching Dreams POS design */}
      <div className="flex-1 overflow-y-auto pr-0.5 py-1 space-y-1">
        {sections.map((section, sIdx) => {
          return (
            <div key={sIdx} className="space-y-0.5">
              {/* Section Header */}
              {!isCollapsed ? (
                <div className="px-3 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {section.title}
                </div>
              ) : null}

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

                  // Top-level item is active if:
                  // 1) It has no children, and matches activeKey/pathname
                  // 2) OR it has children, matches pathname/item.href, or dropdown is closed and child/group is active
                  const isTopLevelActive = hasChildren
                    ? ((activeKey || pathname) === item.href || (!isOpen && (isAnyChildActive || isSettingsGroupActive)))
                    : (activeKey || pathname) === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      item.href !== "/admin/pos" &&
                      item.href !== "#" &&
                      item.href !== "#logout" &&
                      pathname.startsWith(item.href + "/"));

                  if (isCollapsed) {
                    // Collapsed View (Icon Only with Hover Tooltip)
                    return (
                      <div key={item.label} className="relative group flex justify-center py-1">
                        {item.isAction ? (
                          <button
                            type="button"
                            onClick={() => handleActionClick(item)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                          >
                            {item.icon}
                          </button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (!hasChildren) {
                                setActiveKey(item.href);
                              }
                              if (onItemClick) onItemClick();
                            }}
                            className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${isTopLevelActive || isAnyChildActive
                              ? "bg-orange-50/80 dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 border border-orange-300/50 dark:border-orange-500/20 font-medium"
                              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/70 dark:hover:bg-zinc-800/60"
                              }`}
                          >
                            {item.icon}
                          </Link>
                        )}

                        {/* Floating Tooltip */}
                        <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-normal rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.badge && renderBadge(item.badge, item.badgeVariant, false)}
                        </div>
                      </div>
                    );
                  }

                  // Expanded View
                  return (
                    <div key={item.label} className="space-y-0.5">
                      {item.isAction ? (
                        <button
                          type="button"
                          onClick={() => handleActionClick(item)}
                          className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] text-slate-700 dark:text-zinc-300 font-normal hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-100 transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 transition-colors">
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                        </button>
                      ) : hasChildren ? (
                        <button
                          type="button"
                          onClick={() => handleGroupClick(item)}
                          className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] transition-all text-left cursor-pointer ${isTopLevelActive
                            ? "bg-[#FFF6EE] dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 font-medium shadow-xs"
                            : isOpen
                              ? "text-slate-900 dark:text-zinc-100 font-medium hover:bg-slate-100/60 dark:hover:bg-zinc-800/40"
                              : "text-slate-700 dark:text-zinc-300 font-normal hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-100"
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className={`transition-colors ${isTopLevelActive || isAnyChildActive
                                ? "text-orange-500 dark:text-orange-400"
                                : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                                }`}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.badge && renderBadge(item.badge, item.badgeVariant, isTopLevelActive)}

                            <span
                              className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${isTopLevelActive
                                ? "bg-[#FFEADA] dark:bg-orange-900/50 text-orange-500 dark:text-orange-400"
                                : isOpen
                                  ? "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                                  : "bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200"
                                }`}
                            >
                              {isOpen ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => {
                            setActiveKey(item.href);
                            if (onItemClick) onItemClick();
                          }}
                          className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[14px] transition-all ${isTopLevelActive
                            ? "bg-[#FFF6EE] dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 font-medium shadow-xs"
                            : "text-slate-700 dark:text-zinc-300 font-normal hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-100"
                            }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className={`transition-colors ${isTopLevelActive
                                ? "text-orange-500 dark:text-orange-400"
                                : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200"
                                }`}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <div className="shrink-0">
                              {renderBadge(item.badge, item.badgeVariant, isTopLevelActive)}
                            </div>
                          )}
                        </Link>
                      )}

                      {/* Dropdown / Submenu matching exact typography of reference */}
                      {hasChildren && isOpen && (
                        <div className="pl-9 pr-2 space-y-0.5 py-1">
                          {item.children?.map((child, cIdx) => {
                            const isChildActive =
                              activeKey === child.href ||
                              (!activeKey && pathname === child.href) ||
                              pathname === child.href;

                            return (
                              <Link
                                key={child.href + child.label}
                                href={child.href}
                                onClick={() => {
                                  setActiveKey(child.href);
                                  if (onItemClick) onItemClick();
                                }}
                                style={{ animationDelay: `${cIdx * 25}ms` }}
                                className={`animate-push-up flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] transition-colors ${isChildActive
                                  ? "bg-[#FFF6EE] dark:bg-orange-950/40 text-orange-500 dark:text-orange-400 font-medium"
                                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 font-normal"
                                  }`}
                              >
                                <span className="truncate">{child.label}</span>
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
                <div className="py-2">
                  {!isCollapsed ? (
                    <div className="border-t border-slate-150 dark:border-zinc-800/80 mx-1" />
                  ) : (
                    <div className="border-t border-slate-200 dark:border-zinc-800 w-6 mx-auto" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Security Badge */}
      <div className="pt-2.5 pb-1 mt-1 border-t border-slate-150 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between px-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-1.5 truncate">
              <ShieldAlert className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="truncate font-medium">{user?.roles?.[0]?.name || "Administrator"}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              Admin
            </span>
          </>
        ) : (
          <div className="w-full flex justify-center py-1">
            <span title={user?.roles?.[0]?.name || "Admin"}>
              <ShieldAlert className="h-4 w-4 text-orange-500" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
