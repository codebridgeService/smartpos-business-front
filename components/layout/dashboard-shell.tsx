"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  History,
  Users,
  Warehouse,
  ShieldCheck,
  Settings,
  X,
  MapPin,
  CircleDollarSign,
  Crown,
  ShoppingBag,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ThemeCustomizerDrawer } from "./theme-customizer-drawer";
import { AdminSidebar } from "@/app/admin/admin-sidebar";
import { HorizontalNav } from "./horizontal-nav";
import { TwoColumnSidebar } from "./two-column-sidebar";
import { AdminNavbar } from "./admin-navbar";
import { isAdmin, isOwner } from "@/lib/utils/roles";
import { PageFeatureGuard } from "@/components/feature-handler";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "success" | "neutral" | "orange";
}

export interface DashboardShellProps {
  children: React.ReactNode;
  variant?: "auto" | "admin" | "default";
}

export function DashboardShell({ children, variant = "auto" }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

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
  const [isAdminSidebarCollapsed, setIsAdminSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const sidebarOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    layoutMode,
    layoutWidth,
    getSidebarPreset,
    setIsCustomizerOpen,
  } = useTheme();

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
        }, 50); // fast and snappy 50ms prevents accidental flicker
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
        }, 150); // 150ms gentle exit delay
      }
    }
  };

  useEffect(() => {
    return () => {
      if (sidebarOpenTimeoutRef.current) clearTimeout(sidebarOpenTimeoutRef.current);
      if (sidebarCloseTimeoutRef.current) clearTimeout(sidebarCloseTimeoutRef.current);
    };
  }, []);

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
    <div
      dir={layoutMode === "rtl" ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans"
    >
      {/* Top Navigation Bar Matching Design Specification */}
      {layoutMode !== "without-header" && (
        <AdminNavbar
          isCollapsed={showAdminSidebar && isEffectiveCollapsed}
          onToggleCollapse={() => {
            setIsAdminSidebarCollapsed(!isAdminSidebarCollapsed);
            setIsSidebarHovered(false);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onSidebarMouseEnter={handleSidebarMouseEnter}
          onSidebarMouseLeave={handleSidebarMouseLeave}
        />
      )}

      {/* Horizontal Navigation Menu Bar for horizontal layout */}
      {layoutMode === "horizontal" && <HorizontalNav />}

      {/* Main Container with Sidebar */}
      <div
        className={`flex-1 flex relative ${
          layoutWidth === "boxed"
            ? "max-w-[1536px] mx-auto w-full shadow-lg my-2 rounded-2xl overflow-hidden"
            : "w-full"
        }`}
      >
        {/* Sidebar for Desktop */}
        {layoutMode !== "horizontal" && (
          <div
            className={`hidden lg:block relative shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[width] ${
              layoutMode === "two-column"
                ? "w-74"
                : showAdminSidebar && isEffectiveCollapsed
                ? "w-20"
                : "w-64"
            }`}
          >
            {layoutMode === "two-column" ? (
              <aside className={`hidden lg:flex w-full h-full border-r ${sidebarPreset.borderClass}`}>
                <TwoColumnSidebar />
              </aside>
            ) : (
              <aside
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
                className={`hidden lg:flex flex-col w-full h-full ${
                  showAdminSidebar && isEffectiveCollapsed ? "px-2 py-3" : "p-3"
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
                  {navItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={`${item.label}-${item.href}-${idx}`}
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
            )}
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        <div
          className={`fixed inset-0 z-60 lg:hidden transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={`relative w-72 bg-white dark:bg-zinc-900 h-full p-4 flex flex-col z-50 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-zinc-800">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                {showAdminSidebar ? "Admin Console" : "Navigation"}
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {showAdminSidebar ? (
                <AdminSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
              ) : (
                <div className="space-y-1">
                  {navItems.map((item, idx) => (
                    <Link
                      key={`mobile-${item.label}-${item.href}-${idx}`}
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

        {/* Page Content */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-7 w-full min-w-0 ${
            layoutWidth === "boxed" ? "max-w-7xl mx-auto" : ""
          }`}
        >
          <PageFeatureGuard>{children}</PageFeatureGuard>
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
