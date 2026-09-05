"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useOutlet } from "@/context/outlet-context";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { businesses, activeBusiness, selectBusiness } = useBusiness();
  const { outlets, activeOutlet, selectOutlet } = useOutlet();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBusinessMenuOpen, setIsBusinessMenuOpen] = useState(false);
  const [isOutletMenuOpen, setIsOutletMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "POS Terminal", href: "/pos", icon: <CreditCard className="h-5 w-5" />, badge: "Live" },
    { label: "Shifts & Registers", href: "/pos/shifts", icon: <History className="h-5 w-5" /> },
    { label: "Cash Drawer", href: "/pos/drawer", icon: <CircleDollarSign className="h-5 w-5" /> },
    { label: "Outlets (Branches)", href: "/businesses/outlets", icon: <MapPin className="h-5 w-5" /> },
    { label: "Staff & Members", href: "/businesses/staff", icon: <Users className="h-5 w-5" /> },
    { label: "Warehouses", href: "/warehouses", icon: <Warehouse className="h-5 w-5" /> },
    { label: "Roles & RBAC", href: "/admin/roles", icon: <ShieldCheck className="h-5 w-5" /> },
    { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/25">
              <Store className="h-5 w-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white hidden sm:inline-block">
              Smart<span className="text-blue-600 dark:text-blue-400">POS</span>
            </span>
          </Link>

          {/* Business Switcher Dropdown */}
          <div className="relative ml-2 sm:ml-4">
            <button
              type="button"
              onClick={() => {
                setIsBusinessMenuOpen(!isBusinessMenuOpen);
                setIsOutletMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors max-w-[160px] sm:max-w-xs truncate"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{activeBusiness?.name || "Select Business"}</span>
              <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0 ml-auto" />
            </button>

            {isBusinessMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Businesses
                </div>
                {businesses.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-zinc-500">No businesses found</div>
                ) : (
                  businesses.map((biz) => (
                    <button
                      key={biz.uuid}
                      type="button"
                      onClick={() => {
                        void selectBusiness(biz.uuid);
                        setIsBusinessMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                        activeBusiness?.uuid === biz.uuid
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span className="truncate">{biz.name}</span>
                      {activeBusiness?.uuid === biz.uuid && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Outlet Switcher Dropdown */}
          {activeBusiness && (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setIsOutletMenuOpen(!isOutletMenuOpen);
                  setIsBusinessMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors max-w-[160px] truncate"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{activeOutlet?.name || "Select Outlet"}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0 ml-auto" />
              </button>

              {isOutletMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Store Outlets
                  </div>
                  {outlets.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-zinc-500">No outlets found</div>
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
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="truncate">{out.name}</span>
                        {out.is_main_outlet && (
                          <Badge variant="neutral" size="sm">Main</Badge>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsBusinessMenuOpen(false);
                setIsOutletMenuOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="h-8 w-8 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase overflow-hidden border border-blue-600/20">
                {user?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.[0] || <UserIcon className="h-4 w-4" />
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {user?.name || "My Account"}
                </span>
                <span className="text-[10px] text-zinc-400 leading-tight">
                  {user?.email || user?.username || "Authenticated"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user?.email}</p>
                  <Badge variant="primary" size="sm" className="mt-2">
                    {user?.roles?.[0]?.name || "Staff Member"}
                  </Badge>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                    Profile & Security
                  </Link>
                </div>
                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
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
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
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
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
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
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white dark:bg-zinc-900 h-full p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      pathname === item.href
                        ? "bg-blue-600 text-white font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
