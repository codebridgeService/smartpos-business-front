"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  History,
  Building2,
  Users,
  Warehouse,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  MapPin,
  CircleDollarSign,
  User as UserIcon,
  Crown,
  Search,
  PlusCircle,
  Monitor,
  Maximize,
  Minimize,
  Mail,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ShoppingBag,
  Package,
  Key,
  Check,
  Boxes,
  PlusSquare,
  ShoppingCart,
  FileText,
  FileCheck,
  RotateCcw,
  Shield,
  UserCheck,
  Truck,
  Megaphone,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { useTheme } from "@/context/theme-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeCustomizerDrawer } from "./theme-customizer-drawer";
import { AdminSidebar } from "@/app/admin/admin-sidebar";
import { HorizontalNav } from "./horizontal-nav";
import { isAdmin, isOwner } from "@/lib/utils/roles";
import { FeaturesAnnouncementsStore } from "@/lib/storage/features-announcements-store";
import type { Announcement, AnnouncementRead } from "@/types/features-announcements";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "success" | "neutral" | "orange";
}

interface QuickAddItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const QUICK_ADD_ITEMS: QuickAddItem[] = [
  { label: "Category", href: "/coming-soon?feature=category", icon: <Boxes className="h-5 w-5" /> },
  { label: "Product", href: "/coming-soon?feature=create-product", icon: <PlusSquare className="h-5 w-5" /> },
  { label: "Purchase", href: "/coming-soon?feature=create-purchase", icon: <ShoppingBag className="h-5 w-5" /> },
  { label: "Sale / POS", href: "/pos", icon: <ShoppingCart className="h-5 w-5" /> },
  { label: "Expense", href: "/coming-soon?feature=create-expense", icon: <FileText className="h-5 w-5" /> },
  { label: "Quotation", href: "/coming-soon?feature=create-quotation", icon: <FileCheck className="h-5 w-5" /> },
  { label: "Return", href: "/coming-soon?feature=sales-return", icon: <RotateCcw className="h-5 w-5" /> },
  { label: "User / Staff", href: "/admin/roles", icon: <UserIcon className="h-5 w-5" /> },
  { label: "Customer", href: "/coming-soon?feature=customers", icon: <Users className="h-5 w-5" /> },
  { label: "Biller", href: "/coming-soon?feature=biller", icon: <Shield className="h-5 w-5" /> },
  { label: "Supplier", href: "/coming-soon?feature=suppliers", icon: <UserCheck className="h-5 w-5" /> },
  { label: "Transfer", href: "/coming-soon?feature=stock-transfer", icon: <Truck className="h-5 w-5" /> },
];

export interface DashboardShellProps {
  children: React.ReactNode;
  variant?: "auto" | "admin" | "default";
}

export function DashboardShell({ children, variant = "auto" }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { businesses, activeBusiness, selectBusiness } = useBusiness();
  const { outlets, activeOutlet, selectOutlet } = useOutlet();

  // Redirect to login if user is not authenticated on a dashboard route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  const isUserAdmin = isAdmin(user);
  const isUserOwner = isOwner(user);
  const showAdminSidebar =
    variant === "admin" || (variant === "auto" && pathname.startsWith("/admin"));

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [isOutletMenuOpen, setIsOutletMenuOpen] = useState(false);
  const [isAddNewMenuOpen, setIsAddNewMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminSidebarCollapsed, setIsAdminSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const sidebarOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    layoutMode,
    layoutWidth,
    getTopBarPreset,
    getSidebarPreset,
    setIsCustomizerOpen,
  } = useTheme();

  const topBarPreset = getTopBarPreset();
  const sidebarPreset = getSidebarPreset();

  const isMini = layoutMode === "mini" || isAdminSidebarCollapsed;
  // When in mini/collapsed mode, hovering over the sidebar expands it smoothly
  const isEffectiveCollapsed = isMini && !isSidebarHovered;

  const handleSidebarMouseEnter = () => {
    if (sidebarCloseTimeoutRef.current) {
      clearTimeout(sidebarCloseTimeoutRef.current);
      sidebarCloseTimeoutRef.current = null;
    }
    if (isMini && !isSidebarHovered) {
      if (!sidebarOpenTimeoutRef.current) {
        sidebarOpenTimeoutRef.current = setTimeout(() => {
          setIsSidebarHovered(true);
          sidebarOpenTimeoutRef.current = null;
        }, 130); // 130ms intentional delay prevents accidental expansion on cursor pass-by
      }
    }
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarOpenTimeoutRef.current) {
      clearTimeout(sidebarOpenTimeoutRef.current);
      sidebarOpenTimeoutRef.current = null;
    }
    if (isMini) {
      if (!sidebarCloseTimeoutRef.current) {
        sidebarCloseTimeoutRef.current = setTimeout(() => {
          setIsSidebarHovered(false);
          sidebarCloseTimeoutRef.current = null;
        }, 300); // 300ms exit delay prevents premature collapsing when moving cursor
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sidebarOpenTimeoutRef.current) clearTimeout(sidebarOpenTimeoutRef.current);
      if (sidebarCloseTimeoutRef.current) clearTimeout(sidebarCloseTimeoutRef.current);
    };
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // System Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [reads, setReads] = useState<AnnouncementRead[]>([]);

  useEffect(() => {
    const loadAnnouncements = () => {
      setAnnouncements(FeaturesAnnouncementsStore.getAnnouncements().filter((a) => a.is_active));
      setReads(FeaturesAnnouncementsStore.getReads());
    };
    loadAnnouncements();
    window.addEventListener("smartpos_announcements_updated", loadAnnouncements);
    window.addEventListener("smartpos_reads_updated", loadAnnouncements);
    return () => {
      window.removeEventListener("smartpos_announcements_updated", loadAnnouncements);
      window.removeEventListener("smartpos_reads_updated", loadAnnouncements);
    };
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
        setIsOutletMenuOpen(false);
        setIsAddNewMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen().catch(() => {});
      }
    }
  };

  const rawNavItems: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "POS Terminal", href: "/pos", icon: <CreditCard className="h-5 w-5" />, badge: "Live" },
    { label: "Shifts & Registers", href: "/pos/shifts", icon: <History className="h-5 w-5" /> },
    { label: "Cash Drawer", href: "/pos/drawer", icon: <CircleDollarSign className="h-5 w-5" /> },
    { label: "Outlets (Branches)", href: "/businesses/outlets", icon: <MapPin className="h-5 w-5" /> },
    { label: "Staff & Members", href: "/businesses/staff", icon: <Users className="h-5 w-5" /> },
    { label: "Warehouses", href: "/warehouses", icon: <Warehouse className="h-5 w-5" /> },
    { label: "Owner Portal", href: "/owner", icon: <Crown className="h-5 w-5" />, badge: "Owner" },
    { label: "Roles & RBAC", href: "/admin/roles", icon: <ShieldCheck className="h-5 w-5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Strictly filter: Admin routes visible ONLY to admin, Owner portal visible ONLY to owner
  const navItems = rawNavItems.filter((item) => {
    if (item.href === "/admin/dashboard" || item.href === "/admin/roles") {
      return isUserAdmin;
    }
    if (item.href === "/admin/owner" || item.href === "/owner") {
      return isUserOwner;
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Quick navigation items for Search / Spotlight Modal
  const quickActions = [
    { label: "Admin Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4 text-orange-500" /> },
    { label: "Point of Sale (POS)", href: "/admin/pos", icon: <CreditCard className="h-4 w-4 text-sky-500" /> },
    { label: "Permissions Directory", href: "/admin/permissions", icon: <Key className="h-4 w-4 text-amber-500" /> },
    { label: "Roles & RBAC Management", href: "/admin/roles", icon: <ShieldCheck className="h-4 w-4 text-blue-500" /> },
    { label: "Products Catalog", href: "/coming-soon?feature=products", icon: <Package className="h-4 w-4 text-emerald-500" /> },
    { label: "Outlets & Branches", href: "/admin/businesses/outlets", icon: <Building2 className="h-4 w-4 text-indigo-500" /> },
    { label: "Cash Registers", href: "/admin/businesses/registers", icon: <Store className="h-4 w-4 text-teal-500" /> },
    { label: "System Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4 text-slate-500" /> },
  ];

  const filteredQuickActions = quickActions.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center shadow-xs">
            <ShoppingBag className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center shadow-xs">
            <ShoppingBag className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Redirecting to login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans">
      {/* Top Navigation Bar Matching Design Specification */}
      {layoutMode !== "without-header" && (
        <header
          className={`sticky top-0 z-50 h-16 border-b flex items-center justify-between select-none transition-colors duration-300 ${topBarPreset.colorClass} ${topBarPreset.borderClass} ${topBarPreset.textClass}`}
        >
          {/* Left Section: Brand Logo Box matching sidebar width with dividing line toggle */}
          <div
            onMouseEnter={handleSidebarMouseEnter}
            onMouseLeave={handleSidebarMouseLeave}
            className={`${
              showAdminSidebar && isEffectiveCollapsed ? "w-20 px-2 justify-center" : "w-64 px-3.5 justify-between"
            } h-full border-r ${topBarPreset.borderClass} flex items-center relative shrink-0 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]`}
          >
            {/* Brand Logo with Orange Bag & Modern Typography */}
            <Link href="/" className={`flex items-center min-w-0 group transition-all duration-300 ${
              showAdminSidebar && isEffectiveCollapsed ? "justify-center gap-0" : "gap-2.5"
            }`}>
              <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div
                className={`flex items-baseline gap-0.5 truncate transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  showAdminSidebar && isEffectiveCollapsed
                    ? "max-w-0 w-0 opacity-0 -translate-x-2 pointer-events-none"
                    : "max-w-[120px] opacity-100 translate-x-0"
                }`}
              >
                <span className={`font-extrabold text-lg tracking-tight ${topBarPreset.isDark ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  Dreams
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500 font-mono ml-0.5">
                  POS
                </span>
              </div>
            </Link>

            {/* Sidebar Collapse Toggle Button (Circular Orange << / >> centered on dividing line) - hidden in horizontal mode */}
            {showAdminSidebar && layoutMode !== "horizontal" && (
              <button
                type="button"
                onClick={() => {
                  setIsAdminSidebarCollapsed(!isAdminSidebarCollapsed);
                  setIsSidebarHovered(false);
                }}
                className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white items-center justify-center shadow-xs shadow-orange-500/30 transition-transform z-30 active:scale-90 cursor-pointer"
                title={isAdminSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isAdminSidebarCollapsed || layoutMode === "mini" ? (
                  <ChevronsRight className="h-3.5 w-3.5 stroke-[2.5]" />
                ) : (
                  <ChevronsLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                )}
              </button>
            )}

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-1.5 rounded-xl transition-colors cursor-pointer ${
                topBarPreset.isDark ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Right Section: Global Search Bar, Store Selector, Quick Action Buttons & Status Badges */}
          <div className="flex-1 flex items-center justify-between px-4 sm:px-6 h-full min-w-0">
            {/* Global Search Bar with ⌘ K Shortcut */}
            <div className="flex items-center">
              <div
                onClick={() => setIsSearchOpen(true)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer w-48 sm:w-60 md:w-72 shadow-2xs ${
                  topBarPreset.isDark
                    ? "border-white/20 bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-400 hover:text-slate-600"
                }`}
              >
                <Search className={`h-4 w-4 shrink-0 ${topBarPreset.isDark ? "text-white/70" : "text-slate-400"}`} />
                <span className={`text-xs font-normal flex-1 ${topBarPreset.isDark ? "text-white/70" : "text-slate-400"}`}>Search</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                  topBarPreset.isDark
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-slate-200/70 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 border-slate-300/60 dark:border-zinc-600"
                }`}>
                  ⌘ K
                </span>
              </div>
            </div>

          {/* Right Section: Store Selector, Quick Action Buttons & Status Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Outlet / Store Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsOutletMenuOpen(!isOutletMenuOpen);
                  setIsAddNewMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-2xs ${
                  topBarPreset.isDark
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                }`}
              >
                <div className="h-5 w-5 rounded-md bg-slate-900 text-white dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                  <Store className="h-3 w-3 text-orange-400" />
                </div>
                <span className="truncate max-w-[90px] sm:max-w-[130px]">
                  {activeOutlet?.name || activeBusiness?.name || "Freshmart"}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 ml-auto ${topBarPreset.isDark ? "text-white/70" : "text-slate-400"}`} />
              </button>

            {isOutletMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Store Outlets
                </div>
                {outlets.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">No outlets registered</div>
                ) : (
                  outlets.map((out) => (
                    <button
                      key={out.uuid}
                      type="button"
                      onClick={() => {
                        selectOutlet(out.uuid);
                        setIsOutletMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                        activeOutlet?.uuid === out.uuid
                          ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-semibold"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="truncate">{out.name}</span>
                      {activeOutlet?.uuid === out.uuid && (
                        <Check className="h-3.5 w-3.5 text-orange-500" />
                      )}
                    </button>
                  ))
                )}

                {businesses.length > 1 && (
                  <>
                    <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Business Tenants
                    </div>
                    {businesses.map((biz) => (
                      <button
                        key={biz.uuid}
                        type="button"
                        onClick={() => {
                          void selectBusiness(biz.uuid);
                          setIsOutletMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                          activeBusiness?.uuid === biz.uuid
                            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="truncate">{biz.name}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Add New Button (Vibrant Orange Pill with Plus Circle Icon matching reference) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsAddNewMenuOpen(!isAddNewMenuOpen);
                setIsOutletMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 shrink-0 text-white" />
              <span>Add New</span>
            </button>

            {isAddNewMenuOpen && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40 bg-black/15 dark:bg-black/40 backdrop-blur-xs"
                  onClick={() => setIsAddNewMenuOpen(false)}
                />

                {/* Quick Add 12-Item Popover Modal with down-to-up slide animation */}
                <div className="absolute right-0 top-full mt-3 z-50 w-[640px] max-w-[94vw] rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-4 animate-slide-up">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {QUICK_ADD_ITEMS.map((item, index) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsAddNewMenuOpen(false)}
                        style={{ animationDelay: `${index * 25}ms` }}
                        className="animate-push-up group flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-orange-500/80 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 transition-all text-center"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-slate-100/90 dark:bg-zinc-800/90 flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-2xs">
                          {item.icon}
                        </div>
                        <span className="text-[12.5px] font-medium text-slate-700 dark:text-zinc-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 mt-2 transition-colors">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* POS Quick Button (Dark Navy Pill with Monitor Icon) */}
          <Link
            href="/admin/pos"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0e2238] hover:bg-[#163556] dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Monitor className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="hidden sm:inline">POS</span>
          </Link>

          {/* Subtle Vertical Divider */}
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-0.5 hidden sm:block" />

          {/* Language Selector (US Flag) */}
          <button
            type="button"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors hidden sm:flex items-center justify-center text-sm"
            title="Language: English (US)"
          >
            <span className="text-base leading-none">🇺🇸</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors hidden sm:flex"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-4.5 w-4.5" />
            ) : (
              <Maximize className="h-4.5 w-4.5" />
            )}
          </button>

          {/* Theme Toggle (Light / Dark / Auto System) */}
          <ThemeToggle />

          {/* Theme & Layout Customizer Settings Button */}
          <button
            type="button"
            onClick={() => setIsCustomizerOpen(true)}
            className={`p-2 rounded-xl transition-colors flex items-center justify-center cursor-pointer group ${
              topBarPreset.isDark
                ? "text-white/80 hover:text-white hover:bg-white/10"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-orange-500"
            }`}
            title="Customizer: Select Layouts & Colors"
          >
            <Sliders className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Messages Button with Red Notification Badge 01 */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors hidden md:flex"
            title="Messages"
          >
            <Mail className="h-4.5 w-4.5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              1
            </span>
          </button>

          {/* Notifications Bell with Announcements Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false);
                setIsOutletMenuOpen(false);
                setIsAddNewMenuOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Notifications & Announcements"
            >
              <Bell className="h-4.5 w-4.5" />
              {announcements.some((a) => !reads.some((r) => r.announcement_id === a.id && r.user_uuid === (user?.uuid || "guest"))) && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-zinc-900 animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-2xs"
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-150 dark:border-zinc-800 px-1">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-orange-500" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        System Announcements
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                      {announcements.length} Live
                    </span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                    {announcements.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        No active announcements
                      </div>
                    ) : (
                      announcements.map((ann) => {
                        const userUuid = user?.uuid || "guest";
                        const isRead = reads.some(
                          (r) => r.announcement_id === ann.id && r.user_uuid === userUuid
                        );
                        return (
                          <div
                            key={ann.id}
                            className={`p-2.5 rounded-xl border text-xs transition-colors ${
                              isRead
                                ? "bg-slate-50/60 dark:bg-zinc-850/40 border-slate-200/60 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                                : "bg-[#FFF9F3] dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/30 text-slate-900 dark:text-zinc-100 shadow-2xs"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold line-clamp-1">{ann.title}</div>
                              {!isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                              {ann.content}
                            </div>
                            <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-100 dark:border-zinc-800 text-[10px]">
                              <span className="text-slate-400">
                                {new Date(ann.published_at).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              {!isRead ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    FeaturesAnnouncementsStore.markAsRead(
                                      ann.id,
                                      userUuid,
                                      user?.name || "User",
                                      user?.roles?.[0]?.name || "Staff"
                                    );
                                  }}
                                  className="text-orange-600 dark:text-orange-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Mark as read</span>
                                </button>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                  <Check className="h-3 w-3" />
                                  <span>Read</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-slate-150 dark:border-zinc-800 text-center">
                    <Link
                      href="/admin/announcements"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      Manage Announcements & Controls &rarr;
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings Button */}
          <Link
            href="/admin/settings"
            className="p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors hidden sm:flex"
            title="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </Link>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative ml-0.5">
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsOutletMenuOpen(false);
                setIsAddNewMenuOpen(false);
              }}
              className="flex items-center gap-2 p-0.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="h-8.5 w-8.5 rounded-xl bg-slate-900 text-white dark:bg-zinc-700 overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-xs flex items-center justify-center">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-bold text-xs">
                    {user?.name?.[0] || "A"}
                  </span>
                )}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-slate-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {user?.name || "System Admin"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user?.email || "admin@smartpos.local"}
                  </p>
                  <Badge variant="primary" size="sm" className="mt-2">
                    {user?.roles?.[0]?.name || "Administrator"}
                  </Badge>
                </div>

                {/* Quick Portal Switcher (Admin <-> Owner) */}
                {isUserOwner && isUserAdmin && (
                  <div className="py-1 px-1 border-b border-slate-100 dark:border-zinc-800">
                    <Link
                      href={pathname.startsWith("/owner") ? "/admin/dashboard" : "/owner"}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {pathname.startsWith("/owner") ? (
                          <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span>{pathname.startsWith("/owner") ? "Switch to Admin" : "Switch to Owner"}</span>
                      </span>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">&rarr;</span>
                    </Link>
                  </div>
                )}
                <div className="py-1">
                  <Link
                    href="/settings/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    Profile & Security
                  </Link>
                  <Link
                    href="/admin/permissions"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-medium"
                  >
                    <Key className="h-4 w-4 text-slate-400" />
                    Permissions Matrix
                  </Link>
                </div>
                <div className="px-2 py-1.5 border-t border-slate-100 dark:border-zinc-800">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                    Theme Mode
                  </div>
                  <ThemeToggle variant="segmented" className="w-full justify-between" />
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>
      )}

      {/* Horizontal Navigation Menu Bar for horizontal layout */}
      {layoutMode === "horizontal" && <HorizontalNav />}

      {/* Quick Search Spotlight Modal (Triggered by ⌘ K or Search Input) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-60 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95">
            <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3">
              <Search className="h-4.5 w-4.5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search modules, pages, or permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
              />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-400">
                ESC to close
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              {filteredQuickActions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No matching destinations found.
                </div>
              ) : (
                filteredQuickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container with Sidebar */}
      <div className={`flex-1 flex relative ${layoutWidth === "boxed" ? "max-w-[1536px] mx-auto w-full shadow-lg my-2 rounded-2xl overflow-hidden" : "w-full"}`}>
        {/* Sidebar for Desktop */}
        {layoutMode !== "horizontal" && (
          <div
            className={`hidden lg:block relative shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              showAdminSidebar && isMini ? "w-20" : "w-64"
            }`}
          >
            <aside
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
              className={`hidden lg:flex flex-col ${
                showAdminSidebar && isEffectiveCollapsed
                  ? "w-20 px-2 py-3 z-20"
                  : isMini
                  ? "w-64 p-3 absolute top-0 left-0 h-full shadow-2xl ring-1 ring-black/10 dark:ring-white/10 z-40"
                  : "w-64 p-3 z-20 relative h-full"
              } border-r transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${sidebarPreset.colorClass} ${sidebarPreset.borderClass} ${sidebarPreset.textClass} ${
                layoutMode === "detached" ? "m-3 rounded-3xl shadow-xl border" : ""
              }`}
            >
              {showAdminSidebar ? (
                <AdminSidebar
                  isCollapsed={isEffectiveCollapsed}
                  onToggleCollapse={() => {
                    setIsAdminSidebarCollapsed(!isAdminSidebarCollapsed);
                    setIsSidebarHovered(false);
                  }}
                />
              ) : (
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-60 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white dark:bg-zinc-900 h-full p-4 flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  {showAdminSidebar ? "Admin Console" : "Navigation"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {showAdminSidebar ? (
                  <AdminSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
                ) : (
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                          pathname === item.href
                            ? "bg-blue-600 text-white font-semibold"
                            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-7 w-full min-w-0 ${
            layoutWidth === "boxed" ? "max-w-7xl mx-auto" : ""
          }`}
        >
          {children}
        </main>
      </div>

      {/* Floating Theme Customizer Trigger Button */}
      <button
        type="button"
        onClick={() => setIsCustomizerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-orange-500 hover:bg-orange-600 text-white pl-3 pr-2.5 py-3 rounded-l-2xl shadow-xl hover:shadow-orange-500/25 flex items-center gap-2 transition-all active:scale-95 group cursor-pointer"
        title="Open Theme & Layout Customizer"
      >
        <Sliders className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Theme & Layout Customizer Drawer */}
      <ThemeCustomizerDrawer />
    </div>
  );
}
