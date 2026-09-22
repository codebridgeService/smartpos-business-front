"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ShoppingBag, Sliders } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { ThemeCustomizerDrawer } from "./theme-customizer-drawer";
import { BusinessNavbar } from "./business-navbar";
import { BusinessSidebar } from "./business-sidebar";
import { HorizontalNav } from "./horizontal-nav";
import { TwoColumnSidebar } from "./two-column-sidebar";
import { PageFeatureGuard } from "@/components/feature-handler";
import { isCashier, isOwner, isAdmin } from "@/lib/utils/roles";

export interface BusinessShellProps {
  children: React.ReactNode;
}

export function BusinessShell({ children }: BusinessShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if user is not authenticated on a dashboard route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Automatically open POS Terminal page for users with Cashier role
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isOwnerUser = isOwner(user);
      const isAdminUser = isAdmin(user);
      const isCashierUser = isCashier(user);

      // If user has a cashier role and is NOT an admin or business owner:
      if (isCashierUser && !isOwnerUser && !isAdminUser) {
        if (
          pathname === "/businesses" ||
          pathname === "/businesses/" ||
          pathname === "/businesses/dashboard" ||
          pathname === "/businesses/dashboard/" ||
          pathname.startsWith("/businesses/settings") ||
          pathname.startsWith("/businesses/roles") ||
          pathname.startsWith("/businesses/permissions")
        ) {
          router.replace("/pos");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Sidebar Layout States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme & Layout Context
  const {
    layoutMode,
    layoutWidth,
    getSidebarPreset,
    setIsCustomizerOpen,
  } = useTheme();

  const sidebarPreset = getSidebarPreset();

  const isMini = layoutMode === "mini" || isSidebarCollapsed;
  const isEffectiveCollapsed = isMini && !isSidebarHovered;

  const sidebarOpenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSidebarMouseEnter = () => {
    if (sidebarCloseTimeoutRef.current) {
      clearTimeout(sidebarCloseTimeoutRef.current);
      sidebarCloseTimeoutRef.current = null;
    }
    if (isMini && !isSidebarHovered) {
      sidebarOpenTimeoutRef.current = setTimeout(() => {
        setIsSidebarHovered(true);
        sidebarOpenTimeoutRef.current = null;
      }, 50);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarOpenTimeoutRef.current) {
      clearTimeout(sidebarOpenTimeoutRef.current);
      sidebarOpenTimeoutRef.current = null;
    }
    if (isMini) {
      sidebarCloseTimeoutRef.current = setTimeout(() => {
        setIsSidebarHovered(false);
        sidebarCloseTimeoutRef.current = null;
      }, 150);
    }
  };

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
      {/* Dedicated Business Navigation Bar */}
      {layoutMode !== "without-header" && (
        <BusinessNavbar
          isCollapsed={isEffectiveCollapsed}
          onToggleCollapse={() => {
            setIsSidebarCollapsed(!isSidebarCollapsed);
            setIsSidebarHovered(false);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSidebarMouseEnter={handleSidebarMouseEnter}
          onSidebarMouseLeave={handleSidebarMouseLeave}
        />
      )}

      {/* Horizontal Navigation Menu Bar for horizontal layout */}
      {layoutMode === "horizontal" && <HorizontalNav />}

      {/* Main Container with Sidebar & Content */}
      <div
        className={`flex-1 flex relative ${
          layoutWidth === "boxed"
            ? "max-w-[1536px] mx-auto w-full shadow-lg my-2 rounded-2xl overflow-hidden"
            : "w-full"
        }`}
      >
        {/* Desktop Sidebar */}
        {layoutMode !== "horizontal" && (
          <div
            className={`hidden lg:block relative shrink-0 sticky ${
              layoutMode === "without-header" ? "top-0 h-screen" : "top-16 h-[calc(100vh-4rem)]"
            } transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[width] ${
              layoutMode === "two-column"
                ? "w-74"
                : isEffectiveCollapsed
                ? "w-20"
                : "w-64"
            }`}
          >
            {layoutMode === "two-column" ? (
              <aside className={`hidden lg:flex w-full h-full overflow-hidden border-r ${sidebarPreset.borderClass}`}>
                <TwoColumnSidebar />
              </aside>
            ) : (
              <aside
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
                className={`hidden lg:flex flex-col w-full h-full overflow-hidden ${
                  isEffectiveCollapsed ? "px-2 py-3" : "p-3"
                } border-r transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${sidebarPreset.colorClass} ${sidebarPreset.borderClass} ${sidebarPreset.textClass} ${
                  layoutMode === "detached" ? "m-3 rounded-3xl shadow-xl border" : ""
                }`}
              >
                <BusinessSidebar
                  isCollapsed={isEffectiveCollapsed}
                  onToggleCollapse={() => {
                    setIsSidebarCollapsed(!isSidebarCollapsed);
                    setIsSidebarHovered(false);
                  }}
                />
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
                Business Portal
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <BusinessSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-7 w-full min-w-0 ${
            layoutWidth === "boxed" ? "max-w-7xl mx-auto" : ""
          }`}
        >
          <div className="w-full flex-1 flex flex-col min-w-0 animate-fade-in">
            <PageFeatureGuard>{children}</PageFeatureGuard>
          </div>
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

      {/* Theme Customizer Drawer */}
      <ThemeCustomizerDrawer />
    </div>
  );
}
