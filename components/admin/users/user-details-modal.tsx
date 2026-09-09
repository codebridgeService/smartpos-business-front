"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User as UserIcon,
  Shield,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  Clock,
  Globe,
  Copy,
  Check,
  Plus,
  Trash2,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { User, Role, ApiListResponse } from "@/types";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUuid: string | null;
  onSuccess?: () => Promise<void>;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  userUuid,
  onSuccess,
}: UserDetailsModalProps) {
  const toast = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleUuid, setSelectedRoleUuid] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "roles">("roles");
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [revokingRoleId, setRevokingRoleId] = useState<number | string | null>(null);
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Fetch full user details and roles catalog
  const loadUserDetails = useCallback(async (uuid: string) => {
    setIsLoading(true);
    try {
      const [userRes, rolesRes] = await Promise.all([
        apiClient.get<User>(`/users/${uuid}`),
        apiClient.get<ApiListResponse<Role> | any>("/roles"),
      ]);

      setUser(userRes);

      const rList = Array.isArray(rolesRes)
        ? rolesRes
        : rolesRes?.data || [];
      setAvailableRoles(rList);
      if (rList.length > 0) {
        setSelectedRoleUuid(rList[0].uuid);
      }
    } catch {
      toast.error("Failed to load user profile details.");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen && userUuid) {
      void loadUserDetails(userUuid);
      setActiveTab("roles");
    } else {
      setUser(null);
    }
  }, [isOpen, userUuid, loadUserDetails]);

  if (!isOpen || !userUuid) return null;

  const handleCopyUuid = () => {
    if (!user?.uuid) return;
    navigator.clipboard.writeText(user.uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRoleUuid) return;

    // Check if user already holds this role
    const alreadyHasRole = user.roles?.some(
      (r) => (typeof r === "string" ? r === selectedRoleUuid : r.uuid === selectedRoleUuid)
    );
    if (alreadyHasRole) {
      toast.warning("User is already assigned to this role.");
      return;
    }

    setIsAssigning(true);
    try {
      await apiClient.post(`/users/${user.uuid}/roles`, {
        role_uuid: selectedRoleUuid,
      });

      toast.success("Role assigned to user successfully.");
      await loadUserDetails(user.uuid);
      if (onSuccess) await onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to assign role.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRevokeRole = async (roleUuid: string, roleName: string) => {
    if (!user) return;

    setRevokingRoleId(roleUuid);
    try {
      await apiClient.delete(`/users/${user.uuid}/roles/${roleUuid}`);
      toast.success(`Role "${roleName}" revoked from user.`);
      await loadUserDetails(user.uuid);
      if (onSuccess) await onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to revoke role.");
    } finally {
      setRevokingRoleId(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const roleOptions = availableRoles.map((r) => ({
    value: r.uuid,
    label: `${r.name} (${r.code})${r.is_system ? " - System" : ""}`,
  }));

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>User Details & Role Management</span>
          {user && (
            <Badge
              variant={user.status === "active" ? "success" : "warning"}
              size="sm"
              className="capitalize"
            >
              {user.status}
            </Badge>
          )}
        </div>
      }
      description={user ? `${user.name} (${user.email || user.username || "No Email"})` : "Loading user details..."}
      size="lg"
      footer={
        <div className="flex items-center justify-end w-full">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      {isLoading && !user ? (
        <div className="space-y-4 py-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : user ? (
        <div className="space-y-5">
          {/* Tabs header */}
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "roles"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Role Management ({user.roles?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              Account Information
            </button>
          </div>

          {/* TAB 1: Role Management */}
          {activeTab === "roles" && (
            <div className="space-y-5">
              {/* Assign Role Section */}
              <form
                onSubmit={handleAssignRole}
                className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-blue-500" />
                    Assign New Role
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Syncs immediately via <code className="font-mono text-[10px]">POST /users/{'{user}'}/roles</code>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <Select
                      label="Select Role to Grant"
                      value={selectedRoleUuid}
                      onChange={(e) => setSelectedRoleUuid(e.target.value)}
                      options={roleOptions}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!selectedRoleUuid || isAssigning}
                    isLoading={isAssigning}
                    leftIcon={<Shield className="h-4 w-4" />}
                    className="h-10 text-xs"
                  >
                    Assign Role
                  </Button>
                </div>
              </form>

              {/* Active Roles List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Currently Assigned Roles ({user.roles?.length || 0})
                </h4>

                {!user.roles || user.roles.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    No roles currently assigned to this user.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    {user.roles.map((role: any, idx: number) => {
                      const roleName = typeof role === "string" ? role : role?.name || role?.code || `Role ${idx + 1}`;
                      const roleCode = typeof role === "string" ? role : role?.code || "—";
                      const roleUuid = typeof role === "string" ? role : role?.uuid;
                      const isSystem = typeof role === "object" && role?.is_system;
                      const isRevoking = revokingRoleId === roleUuid;

                      return (
                        <div
                          key={roleUuid || idx}
                          className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                              <Shield className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {roleName}
                                </span>
                                {isSystem ? (
                                  <Badge variant="neutral" size="sm">
                                    System Role
                                  </Badge>
                                ) : (
                                  <Badge variant="primary" size="sm">
                                    Custom Role
                                  </Badge>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-zinc-400">
                                code: {roleCode}
                              </span>
                            </div>
                          </div>

                          {roleUuid && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isRevoking}
                              isLoading={isRevoking}
                              onClick={() => void handleRevokeRole(roleUuid, roleName)}
                              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Account Information */}
          {activeTab === "profile" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user.name}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">{user.email || "No Email Provided"}</p>
                  {user.phone && <p className="text-zinc-500 dark:text-zinc-400">{user.phone}</p>}
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-zinc-400 block mb-1">User UUID</span>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="truncate mr-2">{user.uuid}</span>
                    <button
                      type="button"
                      onClick={handleCopyUuid}
                      className="text-zinc-400 hover:text-zinc-600 p-0.5"
                    >
                      {copiedUuid ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-zinc-400 block mb-1">Email Verification</span>
                  <Badge variant={user.email_verified_at ? "success" : "warning"} size="sm">
                    {user.email_verified_at ? "Verified Account" : "Unverified"}
                  </Badge>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-zinc-400 block mb-1">Member Since</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(user.created_at)}</span>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <span className="text-zinc-400 block mb-1">Last Login</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(user.last_login_at)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
