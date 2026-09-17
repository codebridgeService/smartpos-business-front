"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Plus,
  Users,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BusinessRolesPage() {
  const { activeBusiness } = useBusiness();

  const roles = [
    {
      name: "Store Manager",
      description: "Full access to branch registers, staff management, inventory, and shift closures.",
      assignedUsers: 2,
      isSystem: false,
    },
    {
      name: "Cashier",
      description: "POS terminal checkout, receipt printing, customer orders, and cash drawer management.",
      assignedUsers: 6,
      isSystem: false,
    },
    {
      name: "Inventory Specialist",
      description: "Stock adjustment, warehouse transfers, supply orders, and vendor returns.",
      assignedUsers: 2,
      isSystem: false,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Business Roles
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Custom operational roles and permissions scoped to {activeBusiness?.name || "this business"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((r, i) => (
          <Card key={i} className="p-5 border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                  <Shield className="w-4 h-4" />
                </div>
                <Badge variant="neutral" className="text-xs">
                  {r.assignedUsers} Staff Assigned
                </Badge>
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2">{r.name}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{r.description}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <Link href="/businesses/permissions">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                  View Permissions <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
              <Button variant="ghost" size="sm" className="text-xs text-zinc-500">
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
