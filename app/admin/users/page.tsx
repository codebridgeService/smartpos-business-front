"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Globe,
} from "lucide-react";
import { useUserStore } from "@/stores";
import { UserDetailsModal, CreateUserModal } from "@/components/admin/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import type { Role } from "@/types";

export default function AdminUsersPage() {
  const {
    users,
    paginator,
    selectedUserUuid,
    isLoading,
    error,
    filters,
    isCreateModalOpen,
    isDetailsModalOpen,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    setPage,
    setViewMode,
    resetFilters,
    openCreateModal,
    closeCreateModal,
    openDetailsModal,
    closeDetailsModal,
    fetchUsers,
  } = useUserStore();

  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  // Fetch users when filters change
  useEffect(() => {
    void fetchUsers();
  }, [filters.searchQuery, filters.roleFilter, filters.statusFilter, filters.currentPage, fetchUsers]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const total = paginator?.total ?? users.length;
    const active = users.filter((u) => u.status === "active").length;
    const verified = users.filter((u) => !!u.email_verified_at).length;
    const privileged = users.filter((u) =>
      u.roles?.some((r) => ["admin", "owner", "super_admin", "manager"].includes(r.code.toLowerCase()))
    ).length;

    return { total, active, verified, privileged };
  }, [users, paginator]);

  // Extract unique roles from loaded users for filter options
  const availableRoleCodes = useMemo(() => {
    const codes = new Set<string>();
    users.forEach((u) => {
      u.roles?.forEach((r) => {
        if (r.code) codes.add(r.code);
      });
    });
    return Array.from(codes);
  }, [users]);

  // Helper for role styling
  const getRoleBadgeVariant = (code: string): "primary" | "neutral" | "success" | "warning" | "danger" | "info" => {
    const lower = code.toLowerCase();
    if (lower.includes("owner")) return "warning";
    if (lower.includes("admin")) return "primary";
    if (lower.includes("manager")) return "info";
    if (lower.includes("cashier")) return "success";
    return "neutral";
  };

  const getStatusBadgeVariant = (status: string): "success" | "warning" | "danger" | "neutral" => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "neutral";
      case "blocked":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">Users Management</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Users Management
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage accounts, assign RBAC permissions, and monitor access across all store outlets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchUsers()}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Users
              </span>
              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2 text-zinc-600 dark:text-zinc-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{metrics.total}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Registered</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Active Accounts
              </span>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.active}</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                Operational
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Privileged Roles
              </span>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{metrics.privileged}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Admins & Managers</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Verified Users
              </span>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2 text-blue-600 dark:text-blue-400">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.verified}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Email Verified</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search by name, email, phone, or username..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => setSearchInput("")}
              />
            </div>

            {/* Dropdown Filters & View Mode */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Role filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Role:</span>
                <select
                  value={filters.roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 shadow-xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  {availableRoleCodes
                    .filter((c) => !["owner", "admin", "manager", "cashier"].includes(c.toLowerCase()))
                    .map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 shadow-xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Reset filter button */}
              {(filters.searchQuery || filters.roleFilter !== "all" || filters.statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    resetFilters();
                  }}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Reset
                </Button>
              )}

              {/* View Switcher */}
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    filters.viewMode === "table"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    filters.viewMode === "grid"
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Cards
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => void fetchUsers()} className="border-red-200 hover:bg-red-100">
            Retry
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        /* Empty State */
        <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No users found</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              {filters.searchQuery || filters.roleFilter !== "all" || filters.statusFilter !== "all"
                ? "No users match your active search or filter criteria. Try adjusting your query."
                : "No users have been registered yet. Click 'Add User' to create the first account."}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {(filters.searchQuery || filters.roleFilter !== "all" || filters.statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchInput("");
                    resetFilters();
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button onClick={openCreateModal} className="flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filters.viewMode === "table" ? (
        /* Table View */
        <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">User</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Contact</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Roles & RBAC</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Last Login & IP</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Verification</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                {users.map((user) => (
                  <tr
                    key={user.uuid || user.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                      {/* User Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={user.avatar_url || user.avatar}
                            name={user.name}
                            size="md"
                            shape="circle"
                            status={user.status}
                            lastLoginAt={user.last_login_at}
                            lastLoginIp={user.last_login_ip}
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                              <span className="truncate max-w-[130px]">{user.name}</span>
                              {user.roles?.some((r) => r.is_system) && (
                                <span title="System Account" className="shrink-0">
                                  <Shield className="h-3.5 w-3.5 text-primary" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[130px]">
                              @{user.username || "no-username"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1 text-xs">
                          {user.email ? (
                            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                              <Mail className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                              <span className="truncate max-w-[170px]">{user.email}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 italic">No email</span>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                              <Phone className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                              <span className="truncate max-w-[170px]">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role: Role) => (
                              <Badge
                                key={role.id || role.code}
                                variant={getRoleBadgeVariant(role.code)}
                                size="sm"
                                className="capitalize font-medium shadow-2xs"
                              >
                                {role.name || role.code}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="neutral" size="sm" className="italic">
                              No Role
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              user.status === "active"
                                ? "bg-emerald-500 animate-pulse"
                                : user.status === "blocked"
                                ? "bg-red-500"
                                : "bg-zinc-400"
                            }`}
                          />
                          <Badge
                            variant={getStatusBadgeVariant(user.status)}
                            size="sm"
                            className="capitalize"
                          >
                            {user.status || "active"}
                          </Badge>
                        </div>
                      </td>

                      {/* Last Login & IP */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            <span className="whitespace-nowrap">
                              {user.last_login_at ? (
                                new Date(user.last_login_at).toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              ) : (
                                <span className="text-zinc-400 italic">Never logged in</span>
                              )}
                            </span>
                          </div>
                          {user.last_login_ip ? (
                            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                              <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span>{user.last_login_ip}</span>
                            </div>
                          ) : user.last_login_at ? (
                            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                              <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              <span>IP not logged</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Verification */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {user.email_verified_at ? (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>Verified</span>
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" className="text-zinc-500">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Unverified</span>
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsModal(user.uuid)}
                          className="flex items-center gap-1 text-xs border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-primary/50 hover:text-primary dark:hover:text-primary transition-colors whitespace-nowrap ml-auto"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>Manage Roles</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginator && paginator.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 px-6 py-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.from}</span> to{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.to}</span> of{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.total}</span> users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginator.current_page <= 1}
                  onClick={() => setPage(paginator.current_page - 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Page {paginator.current_page} of {paginator.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginator.current_page >= paginator.last_page}
                  onClick={() => setPage(paginator.current_page + 1)}
                  className="h-8 px-2.5"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        /* Grid / Cards View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
                <Card
                  key={user.uuid || user.id}
                  className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md hover:border-primary/40 transition-all group overflow-hidden"
                >
                  <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-orange-400" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar_url || user.avatar}
                          name={user.name}
                          size="lg"
                          shape="rounded"
                          status={user.status}
                          lastLoginAt={user.last_login_at}
                          lastLoginIp={user.last_login_ip}
                        />
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{user.name}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">@{user.username || "no-username"}</p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(user.status)} size="sm" className="capitalize">
                        {user.status || "active"}
                      </Badge>
                    </div>

                    {/* Contact details */}
                    <div className="mt-4 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span className="truncate">{user.email || <span className="text-zinc-400 dark:text-zinc-500 italic">No email provided</span>}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span>{user.phone || <span className="text-zinc-400 dark:text-zinc-500 italic">No phone provided</span>}</span>
                      </div>
                    </div>

                    {/* Roles Badges */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role: Role) => (
                          <Badge
                            key={role.id || role.code}
                            variant={getRoleBadgeVariant(role.code)}
                            size="sm"
                            className="capitalize text-[11px]"
                          >
                            {role.name || role.code}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="neutral" size="sm" className="italic text-[11px]">
                          No Role
                        </Badge>
                      )}
                    </div>

                    {/* Last Login & IP Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3 text-zinc-400" /> Last Login:
                        </span>
                        <span className="font-medium text-[11px]">
                          {user.last_login_at
                            ? new Date(user.last_login_at).toLocaleString(undefined, {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                        <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                          <Globe className="h-3 w-3 text-zinc-400" /> Login IP:
                        </span>
                        <span className="font-mono text-[11px]">
                          {user.last_login_ip || "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Footer / Manage button */}
                    <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <div>
                        {user.email_verified_at ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">Unverified</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsModal(user.uuid)}
                        className="h-8 text-xs font-medium border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                      >
                        Manage Roles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Grid Pagination */}
          {paginator && paginator.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs text-zinc-500 dark:text-zinc-400">
              <div>
                Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.from}</span> to{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.to}</span> of{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{paginator.total}</span> users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginator.current_page <= 1}
                  onClick={() => setPage(paginator.current_page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  {paginator.current_page} / {paginator.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginator.current_page >= paginator.last_page}
                  onClick={() => setPage(paginator.current_page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSuccess={() => fetchUsers()}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        userUuid={selectedUserUuid}
        onSuccess={() => fetchUsers()}
      />
    </div>
  );
}
