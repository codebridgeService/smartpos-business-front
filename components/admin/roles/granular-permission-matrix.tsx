"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Check,
  Minus,
  Search,
  Save,
  Key,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import type { Role, Permission } from "@/types";

export type MatrixAction = "view" | "create" | "modify" | "cancel" | "delete";

export interface ResourceItem {
  id: string;
  name: string;
  code: string;
  sortOrder?: number;
  description?: string;
  permissions: {
    view?: Permission;
    create?: Permission;
    modify?: Permission;
    cancel?: Permission;
    delete?: Permission;
  };
}

export interface GroupItem {
  id: string;
  name: string;
  code: string;
  priority?: number;
  resources: ResourceItem[];
}

export interface GranularPermissionMatrixProps {
  roles?: Role[];
  selectedRole: Role;
  onSelectRole?: (role: Role) => void;
  allPermissions: Permission[];
  selectedUuids: Set<string>;
  onToggleUuid: (uuid: string) => void;
  onToggleBatch: (uuids: string[], shouldSelect: boolean) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  compact?: boolean;
  hideHeader?: boolean;
  hideSaveButton?: boolean;
  hideRoleSelector?: boolean;
}

export function GranularPermissionMatrix({
  roles = [],
  selectedRole,
  onSelectRole,
  allPermissions,
  selectedUuids,
  onToggleUuid,
  onToggleBatch,
  onSave,
  isSaving = false,
  hasUnsavedChanges = false,
  compact = false,
  hideHeader = false,
  hideSaveButton = false,
  hideRoleSelector = false,
}: GranularPermissionMatrixProps) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    purchase_orders: true,
    orders: false,
    dispatch: false,
    invoices: false,
    products: false,
    inventory: false,
  });

  // Group raw permissions into Granular Groups & Resources
  const groupedData: GroupItem[] = useMemo(() => {
    // 1. Predefined ordering matching user's reference mockup
    const groupPriority: Record<string, number> = {
      orders: 10,
      dispatch: 20,
      purchase_orders: 30,
      invoices: 40,
      products: 50,
      inventory: 60,
      pos_terminal: 70,
      finance: 80,
      security: 90,
      users: 100,
      roles: 110,
    };

    const resourceOrder: Record<string, number> = {
      // Purchase Orders
      po_details: 10,
      po_notes: 20,
      po_documents: 30,
      po_delivery: 40,
      po_authorise: 50,
      po_budget_override: 60,
      po_credit_note: 70,
      // Orders
      orders_general: 10,
      pos_checkout: 20,
      pos_refunds: 30,
      pos_voids: 40,
      pos_discounts: 50,
      // Dispatch
      dispatch_pack: 10,
      dispatch_ship: 20,
      // Invoices
      invoices_general: 10,
      invoices_ar: 20,
      invoices_ap: 30,
      invoices_gl: 40,
    };

    // Initialize group map with baseline structure
    const groupMap: Record<
      string,
      { name: string; priority: number; resources: Record<string, ResourceItem> }
    > = {
      orders: {
        name: "Orders",
        priority: 10,
        resources: {
          orders_general: {
            id: "orders_general",
            name: "Sales Orders",
            code: "orders_general",
            sortOrder: 10,
            permissions: {},
          },
          pos_checkout: {
            id: "pos_checkout",
            name: "POS Checkout & Terminal",
            code: "pos_checkout",
            sortOrder: 20,
            permissions: {},
          },
          pos_refunds: {
            id: "pos_refunds",
            name: "Refunds & Return Slips",
            code: "pos_refunds",
            sortOrder: 30,
            permissions: {},
          },
          pos_voids: {
            id: "pos_voids",
            name: "Void Orders & Items",
            code: "pos_voids",
            sortOrder: 40,
            permissions: {},
          },
        },
      },
      dispatch: {
        name: "Dispatch",
        priority: 20,
        resources: {
          dispatch_pack: {
            id: "dispatch_pack",
            name: "Pick & Pack Orders",
            code: "dispatch_pack",
            sortOrder: 10,
            permissions: {},
          },
          dispatch_ship: {
            id: "dispatch_ship",
            name: "Waybills & Shipments",
            code: "dispatch_ship",
            sortOrder: 20,
            permissions: {},
          },
        },
      },
      purchase_orders: {
        name: "Purchase orders",
        priority: 30,
        resources: {
          po_details: {
            id: "po_details",
            name: "Purchase Order Details",
            code: "po_details",
            sortOrder: 10,
            permissions: {},
          },
          po_notes: {
            id: "po_notes",
            name: "Purchase Order Notes",
            code: "po_notes",
            sortOrder: 20,
            permissions: {},
          },
          po_documents: {
            id: "po_documents",
            name: "Purchase Order Documents",
            code: "po_documents",
            sortOrder: 30,
            permissions: {},
          },
          po_delivery: {
            id: "po_delivery",
            name: "Purchase Order Delivery Summary",
            code: "po_delivery",
            sortOrder: 40,
            permissions: {},
          },
          po_authorise: {
            id: "po_authorise",
            name: "Authorise Purchase Order",
            code: "po_authorise",
            sortOrder: 50,
            permissions: {},
          },
          po_budget_override: {
            id: "po_budget_override",
            name: "Allow Budget Check Override",
            code: "po_budget_override",
            sortOrder: 60,
            permissions: {},
          },
          po_credit_note: {
            id: "po_credit_note",
            name: "Credit Note",
            code: "po_credit_note",
            sortOrder: 70,
            permissions: {},
          },
        },
      },
      invoices: {
        name: "Invoices",
        priority: 40,
        resources: {
          invoices_general: {
            id: "invoices_general",
            name: "Financial Invoices",
            code: "invoices_general",
            sortOrder: 10,
            permissions: {},
          },
          invoices_ar: {
            id: "invoices_ar",
            name: "Accounts Receivable & Invoices",
            code: "invoices_ar",
            sortOrder: 20,
            permissions: {},
          },
          invoices_ap: {
            id: "invoices_ap",
            name: "Vendor Bills & Accounts Payable",
            code: "invoices_ap",
            sortOrder: 30,
            permissions: {},
          },
          invoices_gl: {
            id: "invoices_gl",
            name: "General Ledger & Journals",
            code: "invoices_gl",
            sortOrder: 40,
            permissions: {},
          },
        },
      },
    };

    const getGroupKey = (
      perm: Permission
    ): { groupKey: string; groupName: string; resKey: string; resName: string } => {
      const code = perm.code.toLowerCase();
      const mod = perm.module?.toLowerCase() || "system";
      const parts = code.split(".");

      // 1. Purchase Orders Mapping
      if (code.includes("procurement") || code.includes("purchase_order")) {
        let resName = "Purchase Order Details";
        let resKey = "po_details";
        if (code.includes("receive") || code.includes("delivery")) {
          resName = "Purchase Order Delivery Summary";
          resKey = "po_delivery";
        } else if (code.includes("note")) {
          resName = "Purchase Order Notes";
          resKey = "po_notes";
        } else if (code.includes("document") || code.includes("file")) {
          resName = "Purchase Order Documents";
          resKey = "po_documents";
        } else if (code.includes("authorise") || code.includes("order")) {
          resName = "Authorise Purchase Order";
          resKey = "po_authorise";
        } else if (code.includes("credit_note") || code.includes("credit")) {
          resName = "Credit Note";
          resKey = "po_credit_note";
        } else if (code.includes("override") || code.includes("budget")) {
          resName = "Allow Budget Check Override";
          resKey = "po_budget_override";
        }
        return {
          groupKey: "purchase_orders",
          groupName: "Purchase orders",
          resKey,
          resName,
        };
      }

      // 2. Orders Mapping
      if (mod === "pos" || code.startsWith("pos.")) {
        let resName = "Sales Orders";
        let resKey = "orders_general";
        if (code.includes("checkout") || code.includes("terminal")) {
          resName = "POS Checkout & Terminal";
          resKey = "pos_checkout";
        } else if (code.includes("shift")) {
          resName = "Register Shifts (Z-Reports)";
          resKey = "pos_shifts";
        } else if (code.includes("refund")) {
          resName = "Refunds & Return Slips";
          resKey = "pos_refunds";
        } else if (code.includes("void")) {
          resName = "Void Orders & Items";
          resKey = "pos_voids";
        } else if (code.includes("discount")) {
          resName = "Manual Discounts";
          resKey = "pos_discounts";
        }
        return { groupKey: "orders", groupName: "Orders", resKey, resName };
      }

      // 3. Dispatch Mapping
      if (code.includes("fulfillment") || code.includes("ship") || code.includes("pack")) {
        return {
          groupKey: "dispatch",
          groupName: "Dispatch",
          resKey: code.includes("pack") ? "dispatch_pack" : "dispatch_ship",
          resName: code.includes("pack") ? "Pick & Pack Orders" : "Waybills & Shipments",
        };
      }

      // 4. Invoices Mapping
      if (mod === "finance" || code.startsWith("finance.")) {
        let resName = "Financial Invoices";
        let resKey = "invoices_general";
        if (code.includes("ar")) {
          resName = "Accounts Receivable & Invoices";
          resKey = "invoices_ar";
        } else if (code.includes("ap") || code.includes("bill")) {
          resName = "Vendor Bills & Accounts Payable";
          resKey = "invoices_ap";
        } else if (code.includes("gl")) {
          resName = "General Ledger & Journals";
          resKey = "invoices_gl";
        }
        return { groupKey: "invoices", groupName: "Invoices", resKey, resName };
      }

      // 5. Products Catalog
      if (mod === "products" || mod.startsWith("product")) {
        let resName = "Product Details";
        let resKey = "prod_details";
        if (code.includes("price")) {
          resName = "Product Prices";
          resKey = "prod_prices";
        } else if (code.includes("image")) {
          resName = "Product Images";
          resKey = "prod_images";
        } else if (code.includes("label")) {
          resName = "Product Labels & Barcodes";
          resKey = "prod_labels";
        } else if (code.includes("category")) {
          resName = "Product Categories";
          resKey = "prod_categories";
        } else if (code.includes("brand")) {
          resName = "Product Brands";
          resKey = "prod_brands";
        } else if (code.includes("unit")) {
          resName = "Units of Measure";
          resKey = "prod_units";
        }
        return { groupKey: "products", groupName: "Products", resKey, resName };
      }

      // 6. Inventory & Warehouses
      if (mod === "inventory" || code.startsWith("inventory.")) {
        let resName = "Stock Levels";
        let resKey = "inv_stock";
        if (code.includes("warehouse")) {
          resName = "Warehouse & Zones";
          resKey = "inv_warehouses";
        } else if (code.includes("transfer")) {
          resName = "Stock Transfers";
          resKey = "inv_transfers";
        } else if (code.includes("count")) {
          resName = "Stock Physical Counts";
          resKey = "inv_counts";
        } else if (code.includes("audit")) {
          resName = "Stock Audits & Reconcile";
          resKey = "inv_audits";
        }
        return { groupKey: "inventory", groupName: "Inventory", resKey, resName };
      }

      // Default grouping by module name
      const groupKey = mod.replace(/_/g, " ");
      const formattedGroupName = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
      const resName = perm.resource
        ? perm.resource.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : perm.name.replace(/view|create|update|delete/gi, "").trim() || perm.name;

      return {
        groupKey: mod,
        groupName: formattedGroupName,
        resKey: perm.resource || parts[0],
        resName,
      };
    };

    // Associate permissions with group and resource slots
    allPermissions.forEach((perm) => {
      const { groupKey, groupName, resKey, resName } = getGroupKey(perm);

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          name: groupName,
          priority: groupPriority[groupKey] ?? 999,
          resources: {},
        };
      }

      if (!groupMap[groupKey].resources[resKey]) {
        groupMap[groupKey].resources[resKey] = {
          id: resKey,
          name: resName,
          code: resKey,
          sortOrder: resourceOrder[resKey] ?? 100,
          description: perm.description || undefined,
          permissions: {},
        };
      }

      const res = groupMap[groupKey].resources[resKey];
      const code = perm.code.toLowerCase();
      const action = perm.action?.toLowerCase() || "";

      if (
        action === "view" ||
        action === "index" ||
        code.endsWith(".view") ||
        code.endsWith(".index")
      ) {
        res.permissions.view = perm;
      } else if (
        action === "create" ||
        action === "store" ||
        action === "order" ||
        action === "post" ||
        code.endsWith(".create") ||
        code.endsWith(".store")
      ) {
        res.permissions.create = perm;
      } else if (
        action === "update" ||
        action === "edit" ||
        action === "modify" ||
        action === "adjust" ||
        action === "reconcile" ||
        action === "manage" ||
        code.endsWith(".update") ||
        code.endsWith(".edit") ||
        code.endsWith(".manage")
      ) {
        res.permissions.modify = perm;
      } else if (
        action === "cancel" ||
        action === "revoke" ||
        action === "block" ||
        action === "void" ||
        action === "close" ||
        code.endsWith(".cancel") ||
        code.endsWith(".revoke") ||
        code.endsWith(".block") ||
        code.endsWith(".void")
      ) {
        res.permissions.cancel = perm;
      } else if (
        action === "delete" ||
        action === "destroy" ||
        action === "remove" ||
        code.endsWith(".delete") ||
        code.endsWith(".destroy") ||
        code.endsWith(".remove")
      ) {
        res.permissions.delete = perm;
      } else {
        if (!res.permissions.modify) {
          res.permissions.modify = perm;
        } else if (!res.permissions.view) {
          res.permissions.view = perm;
        }
      }
    });

    // Sort groups and resources according to priority order
    return Object.entries(groupMap)
      .map(([id, grp]) => ({
        id,
        name: grp.name,
        code: id,
        priority: grp.priority,
        resources: Object.values(grp.resources).sort((a, b) => {
          const ordA = a.sortOrder ?? 100;
          const ordB = b.sortOrder ?? 100;
          if (ordA !== ordB) return ordA - ordB;
          return a.name.localeCompare(b.name);
        }),
      }))
      .sort((a, b) => {
        const prioA = a.priority ?? 999;
        const prioB = b.priority ?? 999;
        if (prioA !== prioB) return prioA - prioB;
        return a.name.localeCompare(b.name);
      });
  }, [allPermissions]);

  // Sub-category options
  const subCategoryOptions = useMemo(() => {
    return groupedData.map((g) => ({
      id: g.id,
      name: g.name,
    }));
  }, [groupedData]);

  // Filtered groups based on Sub-category and search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return groupedData
      .filter((grp) => {
        if (selectedSubCategory !== "all" && grp.id !== selectedSubCategory) {
          return false;
        }
        return true;
      })
      .map((grp) => {
        if (!q) return grp;
        const matchingResources = grp.resources.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.code.toLowerCase().includes(q) ||
            Object.values(r.permissions).some(
              (p) =>
                p &&
                (p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
            )
        );
        return {
          ...grp,
          resources: matchingResources,
        };
      })
      .filter((grp) => grp.resources.length > 0);
  }, [groupedData, selectedSubCategory, searchQuery]);

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getGroupActionState = (
    group: GroupItem,
    action: MatrixAction
  ): "checked" | "indeterminate" | "unchecked" => {
    let hasAvailable = false;
    let checkedCount = 0;
    let totalCount = 0;

    group.resources.forEach((r) => {
      const perm = r.permissions[action];
      if (perm) {
        hasAvailable = true;
        totalCount++;
        if (selectedUuids.has(perm.uuid)) {
          checkedCount++;
        }
      }
    });

    if (!hasAvailable || totalCount === 0 || checkedCount === 0) return "unchecked";
    if (checkedCount === totalCount) return "checked";
    return "indeterminate";
  };

  const handleGroupActionToggle = (group: GroupItem, action: MatrixAction) => {
    const currentState = getGroupActionState(group, action);
    const targetUuids: string[] = [];

    group.resources.forEach((r) => {
      const perm = r.permissions[action];
      if (perm) {
        targetUuids.push(perm.uuid);
      }
    });

    if (currentState === "checked") {
      onToggleBatch(targetUuids, false);
    } else {
      onToggleBatch(targetUuids, true);
    }
  };

  const allGroupIds = useMemo(() => groupedData.map((g) => g.id), [groupedData]);
  const areAllExpanded = useMemo(() => {
    return allGroupIds.length > 0 && allGroupIds.every((id) => expandedGroups[id]);
  }, [allGroupIds, expandedGroups]);

  const toggleExpandAll = () => {
    const nextState = !areAllExpanded;
    const nextMap: Record<string, boolean> = {};
    allGroupIds.forEach((id) => {
      nextMap[id] = nextState;
    });
    setExpandedGroups(nextMap);
  };

  return (
    <div className="space-y-3">
      {/* Top Filter & Search Controls: Unified compact bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Selector (if not hidden and multiple roles available) */}
          {!hideRoleSelector && roles.length > 1 && (
            <div className="relative">
              <select
                value={selectedRole.uuid}
                onChange={(e) => {
                  const target = roles.find((r) => r.uuid === e.target.value);
                  if (target && onSelectRole) onSelectRole(target);
                }}
                className="appearance-none h-8 pl-2.5 pr-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-100 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.uuid} value={r.uuid}>
                    {r.name} {r.is_system ? "(System)" : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Sub-category Selector */}
          <div className="relative">
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="appearance-none h-8 pl-2.5 pr-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-200 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[140px] sm:min-w-[170px]"
            >
              <option value="all">All Sub-categories</option>
              {subCategoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          {/* Expand / Collapse All Toggle */}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/60 transition-colors text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title={areAllExpanded ? "Collapse All Groups" : "Expand All Groups"}
          >
            <ChevronsUpDown className="h-3 w-3 text-slate-400" />
            <span>{areAllExpanded ? "Collapse All" : "Expand All"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Compact Search Filter */}
          <div className="w-full sm:w-48 md:w-56">
            <SearchInput
              placeholder="Filter permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
              className="h-8 text-xs"
            />
          </div>

          {!hideSaveButton && onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              disabled={!hasUnsavedChanges || isSaving}
              isLoading={isSaving}
              leftIcon={<Save className="h-3 w-3" />}
              className="h-8 text-xs font-semibold px-3 whitespace-nowrap"
            >
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
        {!hideHeader && (
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Granular Permission Matrix
            </h3>
          </div>
        )}

        {/* Matrix Table with sticky header */}
        <div className="overflow-x-auto max-h-[50vh] sm:max-h-[56vh] overflow-y-auto">
          <table className="w-full border-collapse min-w-[540px]">
            <thead className="sticky top-0 z-10 bg-[#edf2f9] dark:bg-zinc-800/95 backdrop-blur-xs text-slate-700 dark:text-zinc-200 text-xs select-none border-b border-slate-200 dark:border-zinc-700 shadow-2xs">
              <tr>
                <th className="py-2 px-3 text-left font-semibold">Permissions</th>
                <th className="py-2 px-2 text-center w-14 sm:w-16 font-semibold text-[11px] uppercase tracking-wider">View</th>
                <th className="py-2 px-2 text-center w-14 sm:w-16 font-semibold text-[11px] uppercase tracking-wider">Create</th>
                <th className="py-2 px-2 text-center w-14 sm:w-16 font-semibold text-[11px] uppercase tracking-wider">Modify</th>
                <th className="py-2 px-2 text-center w-14 sm:w-16 font-semibold text-[11px] uppercase tracking-wider">Cancel</th>
                <th className="py-2 px-2 text-center w-14 sm:w-16 font-semibold text-[11px] uppercase tracking-wider">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-400">
                    No permissions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  const isExpanded = expandedGroups[group.id] ?? false;

                  return (
                    <React.Fragment key={group.id}>
                      {/* Parent Group Row */}
                      <tr className="border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70 transition-colors">
                        <td
                          onClick={() => toggleGroupExpand(group.id)}
                          className="py-1.5 px-3 flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <button
                            type="button"
                            className="p-0.5 rounded text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 focus:outline-none"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {group.name}
                          </span>
                        </td>

                        {/* Group Action Header Checkboxes */}
                        {(["view", "create", "modify", "cancel", "delete"] as MatrixAction[]).map(
                          (action) => {
                            const state = getGroupActionState(group, action);

                            return (
                              <td key={action} className="py-1.5 px-2 text-center align-middle">
                                <div className="flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleGroupActionToggle(group, action)}
                                    className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all cursor-pointer ${
                                      state === "checked"
                                        ? "bg-[#2563eb] text-white shadow-2xs"
                                        : state === "indeterminate"
                                        ? "bg-[#2563eb] text-white shadow-2xs"
                                        : "border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:border-blue-400"
                                    }`}
                                  >
                                    {state === "checked" && (
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    )}
                                    {state === "indeterminate" && (
                                      <Minus className="h-3 w-3 stroke-[3]" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            );
                          }
                        )}
                      </tr>

                      {/* Child Resource Rows (When Group is Expanded) */}
                      {isExpanded &&
                        group.resources.map((resource) => (
                          <tr
                            key={resource.id}
                            className="border-b border-slate-100/80 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-colors"
                          >
                            <td className="py-1.5 pl-8 sm:pl-9 pr-3 text-xs text-slate-700 dark:text-zinc-300 font-normal">
                              {resource.name}
                            </td>

                            {(["view", "create", "modify", "cancel", "delete"] as MatrixAction[]).map(
                              (action) => {
                                const perm = resource.permissions[action];
                                const isChecked = perm
                                  ? selectedUuids.has(perm.uuid)
                                  : false;

                                return (
                                  <td
                                    key={action}
                                    className="py-1.5 px-2 text-center align-middle"
                                  >
                                    <div className="flex items-center justify-center">
                                      {perm ? (
                                        <button
                                          type="button"
                                          onClick={() => onToggleUuid(perm.uuid)}
                                          title={
                                            perm.description ||
                                            `${perm.name} (${perm.code})`
                                          }
                                          className={`w-4 h-4 rounded-[3px] flex items-center justify-center transition-all cursor-pointer ${
                                            isChecked
                                              ? "bg-[#2563eb] text-white shadow-2xs"
                                              : "border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:border-blue-400"
                                          }`}
                                        >
                                          {isChecked && (
                                            <Check className="h-3 w-3 stroke-[3]" />
                                          )}
                                        </button>
                                      ) : (
                                        <div className="w-4 h-4 rounded-[3px] border border-dashed border-slate-200/80 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/20 cursor-default" />
                                      )}
                                    </div>
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
