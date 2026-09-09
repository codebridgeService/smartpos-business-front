"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, KeyRound } from "lucide-react";

interface SettingsTab {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    label: "Profile & Account",
    href: "/settings/profile",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Sessions & Devices",
    href: "/settings/security",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    label: "POS Fast-Access PIN",
    href: "/settings/pos-pin",
    icon: <KeyRound className="h-4 w-4" />,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-4 sm:px-6 no-scrollbar">
        {SETTINGS_TABS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === "/settings/profile" &&
              pathname === "/admin/settings/profile");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 dark:bg-blue-500 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && !isActive && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
