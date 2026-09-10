"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Shield,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Key,
  Edit3,
  Trash2,
  Layers,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useBusiness } from "@/context/business-context";
import type { Role, LengthAwarePaginator, ApiListResponse } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  SearchInput,
} from "@/components/ui";
import {
  CreateRoleModal,
  EditRoleModal,
  DeleteRoleModal,
  ProvisionRoleModal,
  PermissionMatrixModal,
} from "@/components/admin/roles";
import { UserRoleAssignments } from "@/components/admin/users";

const DEFAULT_SYSTEM_ROLES: Role[] = [
  {
    id: 1,
    uuid: "sys-role-owner",
    business_uuid: null,
    code: "owner",
    name: "Business Owner",
    is_system: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    uuid: "sys-role-admin",
    business_uuid: null,
    code: "admin",
    name: "System Administrator",
    is_system: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 3,
    uuid: "sys-role-manager",
    business_uuid: null,
    code: "manager",
    name: "Store Branch Manager",
    is_system: true,
    created_at: null,
    updated_at: null,
  },
  {
    id: 4,
    uuid: "sys-role-cashier",
    business_uuid: null,
    code: "cashier",
    name: "POS Terminal Cashier",
    is_system: true,
    created_at: null,
    updated_at: null,
  },
];

export default function AdminRolesPage() {
  const { activeBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [roles, setRoles] = useState<Role[]>(DEFAULT_SYSTEM_ROLES);
  const [paginator, setPaginator] = useState<LengthAwarePaginator<Role> | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleForMatrix, setRoleForMatrix] = useState<Role | null>(null);

  const fetchRoles = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<LengthAwarePaginator<Role> | ApiListResponse<Role>>("/roles", {
        params: {
          page,
          business_uuid: activeBusiness?.uuid,
        },
      });

      if (res && "data" in res && Array.isArray(res.data) && res.data.length > 0) {
        setRoles(res.data);
        if ("current_page" in res) {
          setPaginator(res as LengthAwarePaginator<Role>);
        }
      }
    } catch {
      // Keep existing / default roles on network error
    } finally {
      setIsLoading(false);
    }
  }, [activeBusiness]);

  useEffect(() => {
    void fetchRoles(currentPage);
  }, [fetchRoles, currentPage]);

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/admin" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">Roles & RBAC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            Access Control & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage system roles, custom permissions matrices, and employee authorization assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/permissions">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Key className="h-4 w-4" />}
            >
              Permissions Directory
            </Button>
          </Link>
          {activeTab === "roles" && (
            <>
              <Button
                variant="ghost"
                size="md"
                onClick={() => void fetchRoles(currentPage)}
                isLoading={isLoading}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reload
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsProvisionModalOpen(true)}
                leftIcon={<Sparkles className="h-4 w-4 text-purple-500" />}
              >
                Auto-Provision Roles
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create Role
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Shield className="h-4 w-4" />
          Roles & Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Layers className="h-4 w-4" />
          User Role Assignments
        </button>
      </div>

      {activeTab === "users" ? (
        <UserRoleAssignments />
      ) : (
        <>
          {/* Filter / Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchInput
                placeholder="Search roles by name or code (e.g., owner, cashier)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <div className="text-xs text-zinc-500 font-medium ml-auto hidden sm:block">
              Showing <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredRoles.length}</span>{" "}
              roles
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRoles.map((role) => {
              const isSystem = Boolean(role.is_system);

              return (
                <Card key={role.uuid} hoverEffect>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                            role.code === "owner"
                              ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600"
                              : role.code === "admin"
                              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600"
                              : role.code === "manager"
                              ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            {role.name}
                            {isSystem ? (
                              <Badge variant="neutral" size="sm">
                                System Role
                              </Badge>
                            ) : (
                              <Badge variant="primary" size="sm">
                                Custom Role
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            code: <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{role.code}</span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={
                          role.code === "owner"
                            ? "primary"
                            : role.code === "admin"
                            ? "info"
                            : isSystem
                            ? "neutral"
                            : "success"
                        }
                        size="sm"
                      >
                        {role.code === "owner" || role.code === "admin"
                          ? "High Privilege"
                          : isSystem
                          ? "System Template"
                          : "Tenant Custom"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <div className="text-xs text-zinc-500 line-clamp-2">
                      {role.code === "owner"
                        ? "Full root authority across tenant creation, fiscal audits, staff revocation, and bank deposits."
                        : role.code === "admin"
                        ? "System administrative governance with RBAC provisioning, register hardware binding, and branch settings."
                        : role.code === "manager"
                        ? "Outlet branch management including shift supervision, cash drawer counts, and price adjustments."
                        : role.code === "cashier"
                        ? "Daily sales cashiering, receipt generation, barcode scanner handling, and payment processing."
                        : "Custom business role tailored for specialized staff and operational assignments."}
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRoleForMatrix(role)}
                        leftIcon={<Key className="h-3.5 w-3.5 text-blue-600" />}
                        className="text-xs font-semibold hover:border-blue-300"
                      >
                        Permission Matrix ({role.permissions?.length ?? 0})
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRoleToEdit(role)}
                          leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                          className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 px-2"
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRoleToDelete(role)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          className={`text-xs px-2 ${
                            isSystem
                              ? "text-zinc-400 hover:text-zinc-600"
                              : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                          }`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {paginator && paginator.last_page > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500">
                Page {paginator.current_page} of {paginator.last_page} ({paginator.total} total roles)
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
        </>
      )}

      {/* Modals */}
      <CreateRoleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchRoles(currentPage)}
      />

      <EditRoleModal
        isOpen={Boolean(roleToEdit)}
        onClose={() => setRoleToEdit(null)}
        role={roleToEdit}
        onSuccess={() => fetchRoles(currentPage)}
      />

      <DeleteRoleModal
        isOpen={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        role={roleToDelete}
        onSuccess={() => fetchRoles(currentPage)}
      />

      <ProvisionRoleModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onSuccess={() => fetchRoles(currentPage)}
      />

      <PermissionMatrixModal
        isOpen={Boolean(roleForMatrix)}
        onClose={() => setRoleForMatrix(null)}
        role={roleForMatrix}
        onSuccess={async () => {
          await fetchRoles(currentPage);
        }}
      />
    </div>
  );
}
