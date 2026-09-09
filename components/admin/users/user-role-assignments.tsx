"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  User as UserIcon,
  Shield,
  Key,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserPlus,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import type { User, LengthAwarePaginator, ApiListResponse } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetailsModal } from "./user-details-modal";
import { CreateUserModal } from "./create-user-modal";

interface UserRoleAssignmentsProps {
  embedded?: boolean;
}

export function UserRoleAssignments({ embedded = false }: UserRoleAssignmentsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [paginator, setPaginator] = useState<LengthAwarePaginator<User> | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState<boolean>(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<LengthAwarePaginator<User> | ApiListResponse<User>>("/users", {
        params: {
          page,
          per_page: 10,
          search: searchQuery.trim() || undefined,
        },
      });

      if (res && "data" in res && Array.isArray(res.data)) {
        setUsers(res.data);
        if ("current_page" in res) {
          setPaginator(res as LengthAwarePaginator<User>);
        }
      }
    } catch (err) {
      console.warn("Could not fetch user list directly, attempting /auth/me fallback:", err);
      // If /users list is unavailable, fallback to /auth/me to at least show current user
      try {
        const me = await apiClient.get<User>("/auth/me");
        if (me && me.uuid) {
          setUsers([me]);
        }
      } catch (meErr) {
        console.error("Failed to load user info:", meErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleOpenUserRoles = (userUuid: string) => {
    setSelectedUserUuid(userUuid);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (u.name || "").toLowerCase().includes(q);
    const emailMatch = (u.email || "").toLowerCase().includes(q);
    const userMatch = (u.username || "").toLowerCase().includes(q);
    return nameMatch || emailMatch || userMatch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => {
              setSearchQuery("");
              fetchUsers(1);
            }}
          />
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(currentPage)}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table / Grid */}
      {isLoading && users.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <Users className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            No Staff or Users Found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? `No users matched the keyword "${searchQuery}". Try a different search term.`
              : "No users have been registered under this business yet."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                fetchUsers(1);
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Contact Info</th>
                  <th className="px-5 py-3.5">Assigned Roles</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredUsers.map((u) => {
                  const initials = u.name
                    ? u.name
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                    : (u.username?.[0] || "U").toUpperCase();
                  const fullName = u.name || u.username || "User";
                  const avatarSrc = u.avatar || (u as unknown as { avatar_url?: string }).avatar_url;
                  const userRoles = u.roles || [];

                  return (
                    <tr
                      key={u.uuid}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={fullName}
                              className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              {fullName}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono">
                              @{u.username || "user"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                            <Mail className="h-3 w-3 text-zinc-400" />
                            <span className="truncate max-w-[180px]">{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <Phone className="h-3 w-3 text-zinc-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Assigned Roles */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {userRoles.length === 0 ? (
                            <span className="text-xs text-zinc-400 italic">No roles assigned</span>
                          ) : (
                            userRoles.map((role) => {
                              const roleCode = typeof role === "string" ? role : role.code || role.name;
                              const roleName = typeof role === "string" ? role : role.name;
                              const roleKey = typeof role === "string" ? role : (role.uuid || role.code || role.id);

                              return (
                                <Badge
                                  key={roleKey}
                                  variant={
                                    roleCode === "owner"
                                      ? "primary"
                                      : roleCode === "admin"
                                        ? "info"
                                        : "neutral"
                                  }
                                  size="sm"
                                  className="font-medium"
                                >
                                  <Shield className="h-3 w-3 mr-1 text-blue-500" />
                                  {roleName}
                                </Badge>
                              );
                            })
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge
                          variant={u.status === "active" ? "success" : "neutral"}
                          size="sm"
                        >
                          {u.status || "active"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenUserRoles(u.uuid)}
                          leftIcon={<Key className="h-3.5 w-3.5 text-blue-500" />}
                          className="text-xs hover:border-blue-300 dark:hover:border-blue-800"
                        >
                          Manage Roles
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {paginator && paginator.last_page > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
              <span className="text-zinc-500">
                Page {paginator.current_page} of {paginator.last_page} ({paginator.total} total staff)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= paginator.last_page}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Details & Role Assignment Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserUuid(null);
        }}
        userUuid={selectedUserUuid}
        onSuccess={async () => {
          await fetchUsers(currentPage);
        }}
      />
    </div>
  );
}
