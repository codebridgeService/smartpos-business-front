"use client";

import React, { use, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Key,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Briefcase,
  Crown,
  Calendar,
  Lock,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import { businessUsersApi, StoreBusinessUserData } from "@/lib/api/business-users";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessUser } from "@/types";

export default function BusinessStaffPage() {
  const { activeBusiness, businesses } = useBusiness();
  const businessUuid = activeBusiness?.uuid || (businesses.length > 0 ? businesses[0].uuid : "");
  const toast = useToast();

  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<StoreBusinessUserData>({
    user_uuid: "",
    role: "staff",
    job_title: "",
    employee_code: "",
    phone: "",
    notes: "",
    pin_code: "",
    is_owner: false,
    status: "active",
  });

  const fetchUsers = useCallback(async () => {
    if (!businessUuid) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await businessUsersApi.getBusinessUsers(businessUuid);
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load staff members";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [businessUuid, toast]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchQuery === "" ||
        u.user_uuid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.employee_code && u.employee_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.job_title && u.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.phone && u.phone.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? u.status === "active" || u.is_active : u.status === "suspended" || !u.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_uuid.trim()) {
      toast.error("User UUID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await businessUsersApi.addBusinessUser(businessUuid, {
        ...form,
        user_uuid: form.user_uuid.trim(),
        role: form.role || "staff",
        job_title: form.job_title?.trim() || null,
        employee_code: form.employee_code?.trim() || null,
        phone: form.phone?.trim() || null,
        notes: form.notes?.trim() || null,
        pin_code: form.pin_code?.trim() || null,
      });

      toast.success("User added to business successfully!");
      setIsAddModalOpen(false);
      setForm({
        user_uuid: "",
        role: "staff",
        job_title: "",
        employee_code: "",
        phone: "",
        notes: "",
        pin_code: "",
        is_owner: false,
        status: "active",
      });
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add user to business";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSuspend = async (user: BusinessUser) => {
    try {
      await businessUsersApi.suspendBusinessUser(businessUuid, user.uuid || String(user.id));
      toast.success(`User status updated.`);
      await fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update user status";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Personnel & Staff</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Team & Staff Members
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Employees, cashiers, and managers working in {activeBusiness?.name || "this business"}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-500" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, code, user UUID, phone..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status:</span>
          <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-800/50">
            {(["all", "active", "suspended"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-between text-sm text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            Try Again
          </Button>
        </div>
      )}

      {/* 4. Table Card */}
      <Card className="border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-2xs rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">User UUID</th>
                <th className="px-5 py-3.5">Role / Position</th>
                <th className="px-5 py-3.5">Employee Code</th>
                <th className="px-5 py-3.5">Ownership</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-40 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-16 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-14 rounded-md" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Skeleton className="h-7 w-16 rounded-md ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500 dark:text-zinc-400">
                    <Users className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-50" />
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">No staff members found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {searchQuery ? "Try clearing your search query." : "Add users to this business to get started."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => {
                  const isActive = member.is_active && member.status === "active";

                  return (
                    <tr
                      key={member.uuid || member.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span className="truncate max-w-[200px]" title={member.user_uuid}>
                            {member.user_uuid}
                          </span>
                        </div>
                        {member.phone && (
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="neutral" className="text-xs capitalize font-medium">
                            {member.role || "staff"}
                          </Badge>
                          {member.job_title && (
                            <span className="text-xs text-zinc-500 truncate max-w-[120px]" title={member.job_title}>
                              {member.job_title}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        {member.employee_code || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {member.is_owner ? (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 w-fit">
                            <Crown className="w-3 h-3 text-amber-500" />
                            Owner
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-400">Staff</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          className={`text-[11px] font-semibold capitalize ${
                            isActive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {member.status || (isActive ? "active" : "suspended")}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSuspend(member)}
                          className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          {isActive ? "Suspend" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        description={`Assign a registered user to ${activeBusiness?.name || "this business"}.`}
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <TextInput
              label="User UUID *"
              value={form.user_uuid}
              onChange={(e) => setForm({ ...form, user_uuid: e.target.value })}
              placeholder="e.g. 6818c7f6-9109-4365-99f2-eb32551b6a08"
              required
            />
            <p className="text-[11px] text-zinc-400">
              The UUID of the registered user to add to this business tenant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Role"
              value={form.role || "staff"}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. staff, cashier, manager"
            />
            <TextInput
              label="Job Title"
              value={form.job_title || ""}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              placeholder="e.g. Store Supervisor"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Employee Code"
              value={form.employee_code || ""}
              onChange={(e) => setForm({ ...form, employee_code: e.target.value.toUpperCase() })}
              placeholder="e.g. EMP-001"
            />
            <TextInput
              label="Phone Number"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 012345678"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="POS 4-Digit PIN (Optional)"
              type="password"
              maxLength={4}
              value={form.pin_code || ""}
              onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
              placeholder="4-digit PIN"
            />
            <div className="pt-6">
              <Checkbox
                id="is_owner"
                label="Grant Owner Privileges"
                description="Allows full administrative access across all business settings and outlets."
                checked={Boolean(form.is_owner)}
                onChange={(e) => setForm({ ...form, is_owner: e.target.checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? "Adding User..." : "Add User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
