"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Key,
  Check,
  Search,
  Filter,
  Save,
  CheckSquare,
  Square,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Role, Permission, LengthAwarePaginator, ApiListResponse } from "@/types";

interface PermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => Promise<void>;
}

export function PermissionMatrixModal({
  isOpen,
  onClose,
  role,
  onSuccess,
}: PermissionMatrixModalProps) {
  const toast = useToast();

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [initialUuids, setInitialUuids] = useState<Set<string>>(new Set());
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAttachingAll, setIsAttachingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  // Load all permissions and role's currently assigned permissions
  useEffect(() => {
    if (!isOpen || !role) return;

    // Initialize assigned UUIDs from role.permissions
    const current = new Set<string>();
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach((p) => {
        if (p.uuid) current.add(p.uuid);
      });
    }
    setSelectedUuids(current);
    setInitialUuids(new Set(current));
    setSearchQuery("");
    setSelectedModule("all");

    // Fetch full permissions catalog
    void (async () => {
      setIsLoadingPermissions(true);
      try {
        const res = await apiClient.get<LengthAwarePaginator<Permission> | ApiListResponse<Permission> | Permission[]>(
          "/permissions?per_page=150"
        );
        let list: Permission[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && "data" in res && Array.isArray(res.data)) {
          list = res.data;
        }
        setAllPermissions(list);
      } catch {
        toast.error("Failed to load permissions catalog.");
      } finally {
        setIsLoadingPermissions(false);
      }
    })();
  }, [isOpen, role, toast]);

  // Extract unique modules
  const modules = useMemo(() => {
    const set = new Set<string>();
    allPermissions.forEach((p) => {
      if (p.module) set.add(p.module.toLowerCase());
    });
    return Array.from(set).sort();
  }, [allPermissions]);

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPermissions.filter((p) => {
      if (selectedModule !== "all" && p.module?.toLowerCase() !== selectedModule) {
        return false;
      }
      if (q) {
        return (
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allPermissions, selectedModule, searchQuery]);

  const hasUnsavedChanges = useMemo(() => {
    if (selectedUuids.size !== initialUuids.size) return true;
    for (const id of selectedUuids) {
      if (!initialUuids.has(id)) return true;
    }
    return false;
  }, [selectedUuids, initialUuids]);

  if (!role) return null;

  const handleToggle = (uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  };

  const handleSelectFiltered = () => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      filteredPermissions.forEach((p) => next.add(p.uuid));
      return next;
    });
  };

  const handleDeselectFiltered = () => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      filteredPermissions.forEach((p) => next.delete(p.uuid));
      return next;
    });
  };

  const handleAttachAllPermissions = async () => {
    setIsAttachingAll(true);
    try {
      await apiClient.post(`/roles/${role.uuid}/permissions/all`);
      toast.success(`Attached all permissions to "${role.name}" successfully!`);

      // Update local selection to reflect all
      const allUuids = new Set(allPermissions.map((p) => p.uuid));
      setSelectedUuids(allUuids);
      setInitialUuids(allUuids);

      await onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to attach all permissions.");
    } finally {
      setIsAttachingAll(false);
    }
  };

  const handleSaveSync = async () => {
    setIsSaving(true);
    try {
      await apiClient.post(`/roles/${role.uuid}/permissions`, {
        permission_uuids: Array.from(selectedUuids),
      });

      toast.success(`Permission matrix for "${role.name}" updated successfully!`);
      setInitialUuids(new Set(selectedUuids));
      await onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to synchronize permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSaving && !isAttachingAll && onClose()}
      title={
        <div className="flex items-center gap-2">
          <span>Permission Matrix: {role.name}</span>
          <Badge variant={role.is_system ? "neutral" : "primary"} size="sm">
            {role.is_system ? "System" : "Custom"}
          </Badge>
        </div>
      }
      description={
        <span>
          Toggle capabilities granted to users holding the <code className="font-mono text-xs">{role.code}</code> role.
        </span>
      }
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {selectedUuids.size} of {allPermissions.length}
            </span>{" "}
            permissions enabled
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttachAllPermissions}
              disabled={isAttachingAll || isSaving}
              isLoading={isAttachingAll}
              leftIcon={<Sparkles className="h-4 w-4 text-purple-500" />}
            >
              Attach All Permissions
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving || isAttachingAll}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveSync}
              disabled={!hasUnsavedChanges || isSaving || isAttachingAll}
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Matrix
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50/75 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1 max-w-sm">
            <SearchInput
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Modules ({modules.length})</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m.toUpperCase()}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectFiltered}
              className="text-xs h-9"
            >
              Select All Visible
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectFiltered}
              className="text-xs h-9 text-zinc-500 hover:text-zinc-800"
            >
              Deselect Visible
            </Button>
          </div>
        </div>

        {/* Permissions List Grid */}
        {isLoadingPermissions ? (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No permissions matching search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[52vh] overflow-y-auto pr-1">
            {filteredPermissions.map((perm) => {
              const isChecked = selectedUuids.has(perm.uuid);

              return (
                <div
                  key={perm.uuid}
                  onClick={() => handleToggle(perm.uuid)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                    isChecked
                      ? "border-blue-300 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {perm.name}
                      </p>
                      {perm.module && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                          {perm.module}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      {perm.code}
                    </p>
                    {perm.description && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                        {perm.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
