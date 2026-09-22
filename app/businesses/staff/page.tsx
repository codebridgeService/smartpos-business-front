"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Phone,
  Shield,
  ShieldCheck,
  Building2,
  AlertCircle,
  RefreshCw,
  Search,
  Crown,
  Calculator,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  Store,
} from "lucide-react";
import { useBusiness } from "@/context/business-context";
import {
  businessUsersApi,
  StoreBusinessUserData,
  UpdateBusinessUserData,
} from "@/lib/api/business-users";
import { outletsApi } from "@/lib/api/outlets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessUser, BusinessUserOutlet, Outlet } from "@/types";

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner (Full Business Control)" },
  { value: "admin", label: "Admin (Administrative Access)" },
  { value: "manager", label: "Manager (Store & Staff Supervision)" },
  { value: "cashier", label: "Cashier (POS & Sales Register)" },
  { value: "staff", label: "Staff (General Store Operations)" },
];

export default function BusinessStaffPage() {
  const { activeBusiness, businesses } = useBusiness();
  const businessUuid = activeBusiness?.uuid || (businesses.length > 0 ? businesses[0].uuid : "");
  const toast = useToast();

  // Data states
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filter states
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addForm, setAddForm] = useState<StoreBusinessUserData>({
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

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<BusinessUser | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState<UpdateBusinessUserData>({
    role: "staff",
    job_title: "",
    employee_code: "",
    phone: "",
    notes: "",
    pin_code: "",
    is_owner: false,
    status: "active",
  });

  // Suspend Toggle State
  const [suspendingUserUuid, setSuspendingUserUuid] = useState<string | null>(null);

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<BusinessUser | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Outlet Assignment Modal State
  const [outletAssignmentUser, setOutletAssignmentUser] = useState<BusinessUser | null>(null);
  const [userOutlets, setUserOutlets] = useState<BusinessUserOutlet[]>([]);
  const [isLoadingUserOutlets, setIsLoadingUserOutlets] = useState(false);
  const [selectedOutletUuid, setSelectedOutletUuid] = useState<string>("");
  const [isPrimaryAssignment, setIsPrimaryAssignment] = useState(false);
  const [isAssignmentActive, setIsAssignmentActive] = useState(true);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [revokingOutletUuid, setRevokingOutletUuid] = useState<string | null>(null);

  // Fetch staff list and outlets
  const fetchData = useCallback(async () => {
    if (!businessUuid) return;
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, outletsData] = await Promise.all([
        businessUsersApi.getBusinessUsers(businessUuid),
        outletsApi.getOutlets(businessUuid).catch(() => [] as Outlet[]),
      ]);
      setUsers(usersData);
      setOutlets(outletsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load staff members";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [businessUuid, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        u.user_uuid.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.employee_code && u.employee_code.toLowerCase().includes(q)) ||
        (u.job_title && u.job_title.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.notes && u.notes.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all" || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());

      const isActive = u.status === "active" || (u.is_active && u.status !== "suspended");
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? isActive : !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active" || (u.is_active && u.status !== "suspended")).length;
    const suspended = total - active;
    const ownersManagers = users.filter((u) => u.is_owner || u.role === "owner" || u.role === "manager" || u.role === "admin").length;
    const cashiers = users.filter((u) => u.role === "cashier").length;
    return { total, active, suspended, ownersManagers, cashiers };
  }, [users]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.user_uuid || !addForm.user_uuid.trim()) {
      toast.error("User UUID is required");
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await businessUsersApi.addBusinessUser(businessUuid, {
        ...addForm,
        user_uuid: addForm.user_uuid.trim(),
        role: addForm.role || "staff",
        job_title: addForm.job_title?.trim() || null,
        employee_code: addForm.employee_code?.trim() || null,
        phone: addForm.phone?.trim() || null,
        notes: addForm.notes?.trim() || null,
        pin_code: addForm.pin_code?.trim() || null,
      });

      toast.success("Staff member added to business successfully!");
      setIsAddModalOpen(false);
      setAddForm({
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
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add staff member";
      toast.error(msg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: BusinessUser) => {
    setEditingUser(user);
    setEditForm({
      role: (user.role as string) || "staff",
      job_title: user.job_title || "",
      employee_code: user.employee_code || "",
      phone: user.phone || "",
      notes: user.notes || "",
      pin_code: "",
      is_owner: Boolean(user.is_owner),
      status: user.status || (user.is_active ? "active" : "suspended"),
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmittingEdit(true);
    try {
      const payload: UpdateBusinessUserData = {
        role: editForm.role,
        job_title: editForm.job_title?.trim() || null,
        employee_code: editForm.employee_code?.trim() || null,
        phone: editForm.phone?.trim() || null,
        notes: editForm.notes?.trim() || null,
        is_owner: editForm.is_owner,
        status: editForm.status,
      };

      if (editForm.pin_code && editForm.pin_code.trim()) {
        payload.pin_code = editForm.pin_code.trim();
      }

      await businessUsersApi.updateBusinessUser(
        businessUuid,
        editingUser.uuid || String(editingUser.id),
        payload
      );

      toast.success("Staff membership details updated successfully!");
      setEditingUser(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update staff membership";
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Toggle Suspend
  const handleToggleSuspend = async (user: BusinessUser) => {
    const userIdentifier = user.uuid || String(user.id);
    setSuspendingUserUuid(userIdentifier);
    try {
      const isCurrentlyActive = user.status === "active" || (user.is_active && user.status !== "suspended");

      if (isCurrentlyActive) {
        await businessUsersApi.suspendBusinessUser(businessUuid, userIdentifier);
        toast.success(`Staff member suspended.`);
      } else {
        await businessUsersApi.updateBusinessUser(businessUuid, userIdentifier, {
          status: "active",
        });
        toast.success(`Staff member reactivated.`);
      }
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update suspension status";
      toast.error(msg);
    } finally {
      setSuspendingUserUuid(null);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;
    setIsSubmittingDelete(true);
    try {
      await businessUsersApi.deleteBusinessUser(
        businessUuid,
        deletingUser.uuid || String(deletingUser.id)
      );
      toast.success("Staff member removed from business tenant.");
      setDeletingUser(null);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove staff member";
      toast.error(msg);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Fetch User Outlets
  const fetchUserOutlets = useCallback(async (user: BusinessUser) => {
    const userIdentifier = user.uuid || String(user.id);
    setIsLoadingUserOutlets(true);
    try {
      const assigned = await businessUsersApi.getUserOutlets(businessUuid, userIdentifier);
      setUserOutlets(assigned);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load assigned outlets";
      toast.error(msg);
    } finally {
      setIsLoadingUserOutlets(false);
    }
  }, [businessUuid, toast]);

  // Open Outlet Assignment Modal
  const handleOpenOutletAssignments = (user: BusinessUser) => {
    setOutletAssignmentUser(user);
    setSelectedOutletUuid("");
    setIsPrimaryAssignment(false);
    setIsAssignmentActive(true);
    void fetchUserOutlets(user);
  };

  // Handle Assign Outlet
  const handleAssignOutletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletAssignmentUser || !selectedOutletUuid) {
      toast.error("Please select an outlet to assign");
      return;
    }

    setIsSubmittingAssignment(true);
    try {
      await businessUsersApi.assignUserOutlet(
        businessUuid,
        outletAssignmentUser.uuid || String(outletAssignmentUser.id),
        {
          outlet_uuid: selectedOutletUuid,
          is_primary: isPrimaryAssignment,
          is_active: isAssignmentActive,
        }
      );
      toast.success("Outlet assigned to staff member!");
      setSelectedOutletUuid("");
      setIsPrimaryAssignment(false);
      setIsAssignmentActive(true);
      await fetchUserOutlets(outletAssignmentUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign outlet";
      toast.error(msg);
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  // Handle Revoke Outlet
  const handleRevokeOutlet = async (outletUuid: string) => {
    if (!outletAssignmentUser) return;
    setRevokingOutletUuid(outletUuid);
    try {
      await businessUsersApi.revokeUserOutlet(
        businessUuid,
        outletAssignmentUser.uuid || String(outletAssignmentUser.id),
        outletUuid
      );
      toast.success("Outlet assignment revoked.");
      await fetchUserOutlets(outletAssignmentUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke outlet assignment";
      toast.error(msg);
    } finally {
      setRevokingOutletUuid(null);
    }
  };

  // Role Badge Helper
  const renderRoleBadge = (role: string | null | undefined, isOwner?: boolean) => {
    const r = (role || "staff").toLowerCase();
    if (isOwner || r === "owner") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
          Owner
        </span>
      );
    }
    if (r === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
          <ShieldCheck className="w-3 h-3 text-indigo-500 shrink-0" />
          Admin
        </span>
      );
    }
    if (r === "manager") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
          <Shield className="w-3 h-3 text-purple-500 shrink-0" />
          Manager
        </span>
      );
    }
    if (r === "cashier") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
          <Calculator className="w-3 h-3 text-sky-500 shrink-0" />
          Cashier
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-400/30">
        <User className="w-3 h-3 text-zinc-500 shrink-0" />
        Staff
      </span>
    );
  };

  // Status Badge Helper
  const renderStatusBadge = (user: BusinessUser) => {
    const isActive = user.status === "active" || (user.is_active && user.status !== "suspended");
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isActive
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
          }`}
        />
        {isActive ? "Active" : "Suspended"}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Personnel & Access Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Staff Memberships & Access
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage roles, permissions, cashier POS PINs, and outlet branch assignments for{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {activeBusiness?.name || "this business"}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-500" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </Button>
          <Link href="/businesses/staff/create">
            <Button
              variant="outline"
              className="border-emerald-600/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New User</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <Card className="smooth-card border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs rounded-2xl p-4 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Staff</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.total}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Enrolled team members</p>
          </div>
        </Card>

        <Card className="smooth-card border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs rounded-2xl p-4 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Authorized for POS & Portal</p>
          </div>
        </Card>

        <Card className="smooth-card border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs rounded-2xl p-4 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Suspended</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
              {stats.suspended}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Access temporarily revoked</p>
          </div>
        </Card>

        <Card className="smooth-card border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs rounded-2xl p-4 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Outlets</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {outlets.length}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Store locations available</p>
          </div>
        </Card>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by UUID, role, employee code, title, phone..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          {(["all", "active", "suspended"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Error Banner */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 flex items-center justify-between text-sm text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Try Again
          </Button>
        </div>
      )}

      {/* 5. Main Content: Table or Grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-600 mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            No staff members found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1 mb-4">
            {searchQuery || roleFilter !== "all" || statusFilter !== "all"
              ? "No team members matched your filter criteria. Try resetting filters."
              : "Enrolled staff members will appear here. Add cashiers, managers, and admins to your store."}
          </p>
          <Link href="/businesses/staff/create">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 py-2"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add First Staff Member
            </Button>
          </Link>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card className="border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-2xs rounded-2xl bg-white dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Staff Identifier</th>
                  <th className="px-5 py-3.5">Role & Title</th>
                  <th className="px-5 py-3.5">Employee Code</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Outlets</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredUsers.map((member) => {
                  const isActive = member.status === "active" || (member.is_active && member.status !== "suspended");
                  const userKey = member.uuid || String(member.id);
                  const isSuspending = suspendingUserUuid === userKey;

                  return (
                    <tr
                      key={userKey}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Staff Identifier */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-emerald-500/20">
                            {member.role ? member.role.slice(0, 2) : "ST"}
                          </div>
                          <div>
                            <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span className="truncate max-w-[180px]" title={member.user_uuid}>
                                {member.user_uuid}
                              </span>
                            </div>
                            {member.phone && (
                              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-zinc-400" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Title */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1">
                          {renderRoleBadge(member.role, member.is_owner)}
                          {member.job_title && (
                            <span
                              className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]"
                              title={member.job_title}
                            >
                              {member.job_title}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Employee Code */}
                      <td className="px-5 py-4">
                        {member.employee_code ? (
                          <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            {member.employee_code}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">{renderStatusBadge(member)}</td>

                      {/* Outlets Access */}
                      <td className="px-5 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenOutletAssignments(member)}
                          className="text-xs h-7 px-2.5 rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-600 flex items-center gap-1.5"
                          title="Manage Outlets"
                          aria-label="Manage Outlets"
                        >
                          <Store className="w-3 h-3 text-emerald-500" />
                          <span>Outlets</span>
                        </Button>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Suspend */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSuspending}
                            onClick={() => handleToggleSuspend(member)}
                            className={`text-xs h-7 px-2.5 rounded-lg font-medium ${
                              isActive
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                            title={isActive ? "Suspend staff member" : "Reactivate staff member"}
                          >
                            {isSuspending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isActive ? (
                              "Suspend"
                            ) : (
                              "Activate"
                            )}
                          </Button>

                          {/* Edit Details */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(member)}
                            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 h-7 w-7 p-0 rounded-lg"
                            title="Edit Membership"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Remove */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingUser(member)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-7 w-7 p-0 rounded-lg"
                            title="Remove from Business"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((member) => {
            const isActive = member.status === "active" || (member.is_active && member.status !== "suspended");
            const userKey = member.uuid || String(member.id);
            const isSuspending = suspendingUserUuid === userKey;

            return (
              <Card
                key={userKey}
                className="smooth-card border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs p-5 bg-white dark:bg-zinc-900 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm uppercase shrink-0 border border-emerald-500/20">
                        {member.role ? member.role.slice(0, 2) : "ST"}
                      </div>
                      <div>
                        {renderRoleBadge(member.role, member.is_owner)}
                        {member.job_title && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[150px]">
                            {member.job_title}
                          </p>
                        )}
                      </div>
                    </div>
                    {renderStatusBadge(member)}
                  </div>

                  {/* UUID & Info */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase font-semibold">User UUID</span>
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 break-all">
                        {member.user_uuid}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Employee Code:</span>
                      <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {member.employee_code || "—"}
                      </span>
                    </div>

                    {member.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Phone:</span>
                        <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          {member.phone}
                        </span>
                      </div>
                    )}

                    {member.notes && (
                      <div className="mt-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Notes: </span>
                        {member.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenOutletAssignments(member)}
                    className="text-xs rounded-xl flex items-center gap-1.5 h-8"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Manage Outlets</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSuspending}
                      onClick={() => handleToggleSuspend(member)}
                      className={`text-xs h-8 px-2.5 rounded-xl font-medium ${
                        isActive
                          ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      }`}
                    >
                      {isActive ? "Suspend" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(member)}
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 h-8 w-8 p-0 rounded-xl"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingUser(member)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0 rounded-xl"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODALS                                                                 */}
      {/* ========================================================================= */}

      {/* MODAL A: Add Staff Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member"
        description={`Assign an existing registered user to ${activeBusiness?.name || "this business"}.`}
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <TextInput
              label="User UUID"
              value={addForm.user_uuid}
              onChange={(e) => setAddForm({ ...addForm, user_uuid: e.target.value })}
              placeholder="e.g. 6818c7f6-9109-4365-99f2-eb32551b6a08"
              required
            />
            <p className="text-[11px] text-zinc-400">
              The UUID of the registered identity user account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Role"
              value={addForm.role || "staff"}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              options={ROLE_OPTIONS}
              required
            />
            <TextInput
              label="Job Title"
              value={addForm.job_title || ""}
              onChange={(e) => setAddForm({ ...addForm, job_title: e.target.value })}
              placeholder="e.g. Shift Lead / Supervisor"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Employee Code"
              value={addForm.employee_code || ""}
              onChange={(e) => setAddForm({ ...addForm, employee_code: e.target.value.toUpperCase() })}
              placeholder="e.g. EMP-001"
            />
            <TextInput
              label="Phone Number"
              value={addForm.phone || ""}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              placeholder="e.g. +855 12 345 678"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="POS 4-8 Digit PIN Code (Optional)"
              type="password"
              maxLength={8}
              value={addForm.pin_code || ""}
              onChange={(e) => setAddForm({ ...addForm, pin_code: e.target.value })}
              placeholder="e.g. 1234"
              helperText="Enables cashier quick unlock on POS terminal."
            />
            <Select
              label="Membership Status"
              value={addForm.status || "active"}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
              options={[
                { value: "active", label: "Active (Immediate Access)" },
                { value: "suspended", label: "Suspended (Inactive)" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Administrative Notes
            </label>
            <textarea
              value={addForm.notes || ""}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="Add onboarding comments, work schedule, or internal remarks..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
            <Checkbox
              id="add_is_owner"
              label="Grant Owner Privileges"
              description="Grants supreme ownership permissions over business configuration, outlets, and financial reports."
              checked={Boolean(addForm.is_owner)}
              onChange={(e) => setAddForm({ ...addForm, is_owner: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSubmittingAdd}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
            >
              {isSubmittingAdd ? "Adding Staff..." : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL B: Edit Staff Member */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Update Staff Membership"
        description={`Modify role and details for ${editingUser?.user_uuid || "user"}.`}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Role"
              value={editForm.role || "staff"}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              options={ROLE_OPTIONS}
              required
            />
            <TextInput
              label="Job Title"
              value={editForm.job_title || ""}
              onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
              placeholder="e.g. Head Cashier"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Employee Code"
              value={editForm.employee_code || ""}
              onChange={(e) => setEditForm({ ...editForm, employee_code: e.target.value.toUpperCase() })}
              placeholder="e.g. EMP-001"
            />
            <TextInput
              label="Phone Number"
              value={editForm.phone || ""}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="e.g. +855 12 345 678"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Update POS PIN (Leave blank to keep current)"
              type="password"
              maxLength={8}
              value={editForm.pin_code || ""}
              onChange={(e) => setEditForm({ ...editForm, pin_code: e.target.value })}
              placeholder="New 4-8 digit PIN"
            />
            <Select
              label="Status"
              value={editForm.status || "active"}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              options={[
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Notes
            </label>
            <textarea
              value={editForm.notes || ""}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="Internal remarks..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
            <Checkbox
              id="edit_is_owner"
              label="Owner Privileges"
              description="Grants owner access across all business features."
              checked={Boolean(editForm.is_owner)}
              onChange={(e) => setEditForm({ ...editForm, is_owner: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={isSubmittingEdit}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingEdit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
            >
              {isSubmittingEdit ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL C: Delete / Remove Staff Member Confirmation */}
      <Modal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Remove Staff Member"
        description="Are you sure you want to remove this staff member from this business tenant?"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 dark:text-red-300">
              <p className="font-semibold">Destructive Action</p>
              <p className="mt-1">
                Removing this staff member will revoke all store outlet access, POS permissions,
                and active shifts. Their base identity account will not be deleted.
              </p>
            </div>
          </div>

          {deletingUser && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs space-y-1.5 font-mono text-zinc-700 dark:text-zinc-300">
              <p>
                <span className="text-zinc-400 font-sans">User UUID: </span>
                {deletingUser.user_uuid}
              </p>
              <p>
                <span className="text-zinc-400 font-sans">Role: </span>
                <span className="capitalize font-sans font-semibold">{deletingUser.role}</span>
              </p>
              {deletingUser.employee_code && (
                <p>
                  <span className="text-zinc-400 font-sans">Code: </span>
                  {deletingUser.employee_code}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={isSubmittingDelete}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={isSubmittingDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center gap-1.5"
            >
              {isSubmittingDelete ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Member</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL D: Outlet Assignment Sub-view Modal */}
      <Modal
        isOpen={Boolean(outletAssignmentUser)}
        onClose={() => setOutletAssignmentUser(null)}
        title="Outlet Branch Assignments"
        description={`Manage assigned store locations for staff member.`}
        size="lg"
      >
        <div className="space-y-6 pt-2">
          {/* Staff Summary */}
          {outletAssignmentUser && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  {outletAssignmentUser.role?.slice(0, 2).toUpperCase() || "ST"}
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {outletAssignmentUser.user_uuid}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {renderRoleBadge(outletAssignmentUser.role, outletAssignmentUser.is_owner)}
                    {outletAssignmentUser.employee_code && (
                      <span className="text-[11px] font-mono text-zinc-500">
                        {outletAssignmentUser.employee_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Assigned Outlets List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-500" />
                <span>Assigned Outlets ({userOutlets.length})</span>
              </h4>
            </div>

            {isLoadingUserOutlets ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : userOutlets.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                <Store className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-50" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  No outlet assignments yet
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Assign this staff member to one or more store locations below.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {userOutlets.map((assignment) => {
                  const outletInfo = assignment.outlet;
                  const outletUuid = outletInfo?.uuid || String(assignment.outlet_id);
                  const isRevoking = revokingOutletUuid === outletUuid;

                  return (
                    <div
                      key={assignment.uuid || assignment.id}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {outletInfo?.name || `Outlet #${assignment.outlet_id}`}
                            </span>
                            {outletInfo?.code && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                {outletInfo.code}
                              </span>
                            )}
                            {assignment.is_primary && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                Primary Branch
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Assigned:{" "}
                            {assignment.assigned_at
                              ? new Date(assignment.assigned_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Recently"}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isRevoking}
                        onClick={() => handleRevokeOutlet(outletUuid)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-2.5 rounded-lg text-xs"
                      >
                        {isRevoking ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Revoke</span>
                          </span>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assign New Outlet Form */}
          <form
            onSubmit={handleAssignOutletSubmit}
            className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4"
          >
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>Assign Store Outlet</span>
            </h4>

            <div className="space-y-3">
              <Select
                label="Select Store Outlet"
                value={selectedOutletUuid}
                onChange={(e) => setSelectedOutletUuid(e.target.value)}
                required
              >
                <option value="">-- Choose an outlet branch --</option>
                {outlets.map((o) => (
                  <option key={o.uuid} value={o.uuid}>
                    {o.name} ({o.code || o.uuid.slice(0, 8)}) {o.city ? `• ${o.city}` : ""}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Checkbox
                  id="assign_is_primary"
                  label="Primary Branch"
                  description="Designates this as user's primary operating store."
                  checked={isPrimaryAssignment}
                  onChange={(e) => setIsPrimaryAssignment(e.target.checked)}
                />
                <Checkbox
                  id="assign_is_active"
                  label="Active Assignment"
                  description="Grant immediate shift start access."
                  checked={isAssignmentActive}
                  onChange={(e) => setIsAssignmentActive(e.target.checked)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmittingAssignment || !selectedOutletUuid}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-4 py-2"
                >
                  {isSubmittingAssignment ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      <span>Assign Outlet</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOutletAssignmentUser(null)}
              className="rounded-xl"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
