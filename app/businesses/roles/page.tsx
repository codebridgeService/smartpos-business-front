"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Plus,
  RefreshCw,
  Key,
  Edit3,
  Trash2,
  Lock,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Package,
  ShoppingCart,
  Users2,
  BadgePercent,
  Layers,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { useRoleStore } from "@/stores/useRoleStore";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PermissionMatrixModal,
  CreateRoleModal,
  EditRoleModal,
  DeleteRoleModal,
  ProvisionRoleModal,
} from "@/components/businesses/roles";

export default function BusinessRolesPage() {
  const { activeBusiness } = useBusiness();
  const businessUuid = activeBusiness?.uuid || null;

  const {
    roles,
    isLoading,
    isCreateModalOpen,
    isProvisionModalOpen,
    roleToEdit,
    roleToDelete,
    roleForMatrix,
    setIsCreateModalOpen,
    setIsProvisionModalOpen,
    setRoleToEdit,
    setRoleToDelete,
    setRoleForMatrix,
    fetchRoles,
  } = useRoleStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "custom" | "system">("all");

  // Fetch roles scoped to active business
  useEffect(() => {
    if (businessUuid) {
      void fetchRoles(businessUuid, 1);
    }
  }, [businessUuid, fetchRoles]);

  const handleRefresh = async () => {
    if (businessUuid) {
      await fetchRoles(businessUuid, 1);
    }
  };

  // Filtered roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        !searchQuery ||
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === "all" ||
        (filterType === "system" && role.is_system) ||
        (filterType === "custom" && !role.is_system);

      return matchesSearch && matchesFilter;
    });
  }, [roles, searchQuery, filterType]);

  const systemCount = roles.filter((r) => r.is_system).length;
  const customCount = roles.filter((r) => !r.is_system).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Business Roles & Permissions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Custom operational roles and granular permission matrix scoped to{" "}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {activeBusiness?.name || "this business"}
            </strong>.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProvisionModalOpen(true)}
            className="flex items-center gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Provision Standard Roles
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-2 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Roles</span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{roles.length}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Layers className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Custom Business Roles</span>
            <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">{customCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">System Templates</span>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{systemCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Lock className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search roles by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Filter:</span>
          <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-800">
            {(["all", "custom", "system"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterType === type
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Roles Grid */}
      {isLoading && roles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <Shield className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Roles Found</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? "No roles match your search query."
              : "No roles have been configured for this business yet. Provision standard roles or create a custom role to get started."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              size="sm"
              onClick={() => setIsProvisionModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Auto-Provision Standard Roles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Custom Role
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoles.map((role) => {
            const permissionsCount = role.permissions?.length ?? 0;
            const isSystem = Boolean(role.is_system);

            return (
              <Card
                key={role.uuid}
                className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col justify-between hover:shadow-lg hover:border-purple-500/30 transition-all shadow-2xs"
              >
                <div>
                  {/* Top Bar: Icon & Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Shield className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      {isSystem ? (
                        <Badge variant="neutral" className="text-[10px] uppercase font-bold tracking-wider">
                          System Role
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30 text-[10px] uppercase font-bold tracking-wider">
                          Custom Business
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Role Name & Code */}
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{role.name}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">{role.code}</p>

                  {/* Permissions count */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Granted Privileges:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      {permissionsCount} Permissions
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  {/* Permission Matrix Action */}
                  <Button
                    size="sm"
                    onClick={() => setRoleForMatrix(role)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 rounded-xl shadow-xs"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Permission Matrix
                  </Button>

                  {/* Edit & Delete */}
                  {!isSystem && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToEdit(role)}
                        className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="Edit Role Name/Code"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToDelete(role)}
                        className="p-2 text-zinc-400 hover:text-rose-600"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Modals */}
      {/* Permission Matrix Modal */}
      <PermissionMatrixModal
        isOpen={!!roleForMatrix}
        onClose={() => setRoleForMatrix(null)}
        role={roleForMatrix}
        onSuccess={async () => {
          if (businessUuid) {
            await fetchRoles(businessUuid, 1);
          }
        }}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          if (businessUuid) {
            await fetchRoles(businessUuid, 1);
          }
        }}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={!!roleToEdit}
        onClose={() => setRoleToEdit(null)}
        role={roleToEdit}
        onSuccess={async () => {
          if (businessUuid) {
            await fetchRoles(businessUuid, 1);
          }
        }}
      />

      {/* Delete Role Modal */}
      <DeleteRoleModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        role={roleToDelete}
        onSuccess={async () => {
          if (businessUuid) {
            await fetchRoles(businessUuid, 1);
          }
        }}
      />

      {/* Provision Role Modal */}
      <ProvisionRoleModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onSuccess={async () => {
          if (businessUuid) {
            await fetchRoles(businessUuid, 1);
          }
        }}
      />
    </div>
  );
}
