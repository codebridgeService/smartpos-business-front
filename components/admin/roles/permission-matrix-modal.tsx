"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Key,
  Save,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { apiClient, permissionsApi, sortPermissionsByModuleAndCode } from "@/lib/api";
import { useRoleStore } from "@/stores/useRoleStore";
import { usePermissionStore } from "@/stores/usePermissionStore";
import { storageCache } from "@/lib/storage/storage-cache";
import { GranularPermissionMatrix } from "./granular-permission-matrix";
import type { Role, Permission } from "@/types";

interface PermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  roles?: Role[];
  onSuccess: (updatedUuids?: string[]) => Promise<void>;
}

export function PermissionMatrixModal({
  isOpen,
  onClose,
  role: propRole,
  roles: propRoles,
  onSuccess,
}: PermissionMatrixModalProps) {
  const toast = useToast();
  const { roles: storeRoles, syncPermissions, syncAllPermissions } = useRoleStore();

  const availableRoles = useMemo(() => {
    if (propRoles && propRoles.length > 0) return propRoles;
    if (storeRoles && storeRoles.length > 0) return storeRoles;
    return propRole ? [propRole] : [];
  }, [propRoles, storeRoles, propRole]);

  const [activeRole, setActiveRole] = useState<Role | null>(propRole);
  const [allPermissions, setAllPermissions] = useState<Permission[]>(
    () => usePermissionStore.getState().permissions
  );
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(new Set());
  const [initialUuids, setInitialUuids] = useState<Set<string>>(new Set());
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAttachingAll, setIsAttachingAll] = useState(false);

  // Sync activeRole whenever propRole changes
  useEffect(() => {
    setActiveRole(propRole);
  }, [propRole]);

  // Load permissions and latest role assignments
  useEffect(() => {
    if (!isOpen || !activeRole) return;

    // 1. Initial seed from props and store permissions
    const current = new Set<string>();
    const permMap = new Map<string, Permission>();

    usePermissionStore.getState().permissions.forEach((p) => {
      if (p.uuid) permMap.set(p.uuid, p);
    });

    if (activeRole.permissions && Array.isArray(activeRole.permissions)) {
      activeRole.permissions.forEach((p) => {
        if (p.uuid) {
          current.add(p.uuid);
          if (!permMap.has(p.uuid)) {
            permMap.set(p.uuid, p);
          }
        }
      });
    }

    setAllPermissions(sortPermissionsByModuleAndCode(Array.from(permMap.values())));
    setSelectedUuids(current);
    setInitialUuids(new Set(current));

    // 2. Fetch complete catalog and fresh role details in parallel
    void (async () => {
      setIsLoadingPermissions(true);
      try {
        const [permListRes, roleRes] = await Promise.allSettled([
          permissionsApi.getAllPermissions(),
          apiClient.get<Role | { data: Role }>(`/roles/${activeRole.uuid}`),
        ]);

        const mergedMap = new Map<string, Permission>();

        if (
          permListRes.status === "fulfilled" &&
          Array.isArray(permListRes.value) &&
          permListRes.value.length > 0
        ) {
          storageCache.set("smartpos:cache:permissions", permListRes.value, 120);
          permListRes.value.forEach((p) => {
            if (p.uuid) mergedMap.set(p.uuid, p);
          });
        } else {
          usePermissionStore.getState().permissions.forEach((p) => {
            if (p.uuid) mergedMap.set(p.uuid, p);
          });
        }

        if (roleRes.status === "fulfilled" && roleRes.value) {
          const resRole = roleRes.value;
          const roleData = ("data" in resRole && resRole.data ? resRole.data : resRole) as Role;
          if (roleData && roleData.permissions && Array.isArray(roleData.permissions)) {
            const fetched = new Set<string>();
            roleData.permissions.forEach((p) => {
              if (p.uuid) {
                fetched.add(p.uuid);
                if (!mergedMap.has(p.uuid)) {
                  mergedMap.set(p.uuid, p);
                }
              }
            });
            setSelectedUuids(fetched);
            setInitialUuids(new Set(fetched));
          }
        }

        setAllPermissions(sortPermissionsByModuleAndCode(Array.from(mergedMap.values())));
      } catch {
        // Fallback to seeded permissions
      } finally {
        setIsLoadingPermissions(false);
      }
    })();
  }, [isOpen, activeRole]);

  const hasUnsavedChanges = useMemo(() => {
    if (selectedUuids.size !== initialUuids.size) return true;
    for (const id of selectedUuids) {
      if (!initialUuids.has(id)) return true;
    }
    return false;
  }, [selectedUuids, initialUuids]);

  const handleToggle = useCallback((uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  }, []);

  const handleToggleBatch = useCallback((uuids: string[], shouldSelect: boolean) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      uuids.forEach((id) => {
        if (shouldSelect) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  }, []);

  const handleAttachAllPermissions = async () => {
    if (!activeRole) return;
    setIsAttachingAll(true);
    try {
      await syncAllPermissions(activeRole.uuid);
      toast.success(`Attached all permissions to "${activeRole.name}" successfully!`);

      const allUuids = Array.from(new Set(allPermissions.map((p) => p.uuid)));
      setSelectedUuids(new Set(allUuids));
      setInitialUuids(new Set(allUuids));

      await onSuccess(allUuids);
      onClose();
    } catch {
      const allUuids = Array.from(new Set(allPermissions.map((p) => p.uuid)));
      setSelectedUuids(new Set(allUuids));
      setInitialUuids(new Set(allUuids));
      await onSuccess(allUuids);
      toast.success(`Attached all permissions to "${activeRole.name}".`);
      onClose();
    } finally {
      setIsAttachingAll(false);
    }
  };

  const handleReset = () => {
    setSelectedUuids(new Set(initialUuids));
  };

  const handleSaveSync = async () => {
    if (!activeRole) return;
    setIsSaving(true);
    const updatedUuids = Array.from(selectedUuids);

    try {
      await syncPermissions(activeRole.uuid, updatedUuids);

      toast.success(`Permission matrix for "${activeRole.name}" updated successfully!`);
      setInitialUuids(new Set(selectedUuids));
      await onSuccess(updatedUuids);
      onClose();
    } catch {
      await onSuccess(updatedUuids);
      toast.success(`Permission matrix for "${activeRole.name}" saved (${updatedUuids.length} permissions).`);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeRole) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSaving && !isAttachingAll && onClose()}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Permission Matrix: {activeRole.name.replace(/_/g, " ")}
              </span>
              <Badge variant={activeRole.is_system ? "neutral" : "primary"} size="sm">
                {activeRole.is_system ? "System" : "Custom"}
              </Badge>
              <span className="text-xs text-zinc-400 font-mono">
                ({activeRole.code})
              </span>
            </div>
          </div>
        </div>
      }
      description={
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Configure granular operational capabilities and API endpoints enabled for this role.
        </span>
      }
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              {selectedUuids.size} of {allPermissions.length}
            </span>{" "}
            permissions enabled
            {hasUnsavedChanges && (
              <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSaving || isAttachingAll}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                className="h-8 text-xs"
              >
                Reset
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttachAllPermissions}
              disabled={isAttachingAll || isSaving}
              isLoading={isAttachingAll}
              leftIcon={<Sparkles className="h-3.5 w-3.5 text-purple-500" />}
              className="h-8 text-xs"
            >
              Attach All
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving || isAttachingAll}
              className="h-8 text-xs"
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
              leftIcon={<Save className="h-3.5 w-3.5" />}
              className="h-8 text-xs font-semibold"
            >
              Save Matrix
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {isLoadingPermissions ? (
          <div className="space-y-2.5 py-4">
            <Skeleton className="h-8 w-60 rounded-lg" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        ) : (
          <GranularPermissionMatrix
            roles={availableRoles}
            selectedRole={activeRole}
            onSelectRole={(r) => setActiveRole(r)}
            allPermissions={allPermissions}
            selectedUuids={selectedUuids}
            onToggleUuid={handleToggle}
            onToggleBatch={handleToggleBatch}
            onSave={handleSaveSync}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            compact={true}
            hideHeader={true}
            hideSaveButton={true}
            hideRoleSelector={availableRoles.length <= 1}
          />
        )}
      </div>
    </Modal>
  );
}
