"use client";

import React from "react";
import Link from "next/link";
import { Users, ChevronRight, ShieldCheck, Key, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRoleAssignments } from "@/components/admin/users";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/businesses" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Business
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">Staff & Roles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Staff & Team Members
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage business staff profiles, assign RBAC access roles, and inspect POS authorization credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/roles">
            <Button
              variant="outline"
              size="md"
              leftIcon={<ShieldCheck className="h-4 w-4 text-purple-500" />}
            >
              Configure Roles & Matrix
            </Button>
          </Link>
        </div>
      </div>

      {/* Embedded User Role Assignments Directory */}
      <UserRoleAssignments embedded />
    </div>
  );
}
