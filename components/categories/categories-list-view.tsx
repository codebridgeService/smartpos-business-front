"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  RefreshCw,
  Building2,
  FolderTree,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Calendar,
  Code2,
  Trash2,
  Plus,
  Edit,
  ArrowUpDown,
  ChevronDown,
  LayoutGrid,
  ListTree,
  FolderOpen,
  Folder,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useBusiness } from "@/context/business-context";
import { useToast } from "@/components/ui/toast";
import { useBusinessesQuery } from "@/lib/react-query/hooks/use-businesses";
import {
  useCategoriesQuery,
  useCategoryTreeQuery,
  useToggleCategoryStatusMutation,
} from "@/lib/react-query/hooks/use-categories";
import type { Category } from "@/lib/api/categories";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { getUserRoleCodes } from "@/lib/utils/roles";

const CreateCategoryModal = dynamic(
  () => import("./create-category-modal").then((mod) => mod.CreateCategoryModal),
  { ssr: false }
);
const EditCategoryModal = dynamic(
  () => import("./edit-category-modal").then((mod) => mod.EditCategoryModal),
  { ssr: false }
);
const DeleteCategoryModal = dynamic(
  () => import("./delete-category-modal").then((mod) => mod.DeleteCategoryModal),
  { ssr: false }
);
const CategoryDetailModal = dynamic(
  () => import("./category-detail-modal").then((mod) => mod.CategoryDetailModal),
  { ssr: false }
);

export function CategoriesListView() {
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const toast = useToast();
  const searchParams = useSearchParams();

  // Admin privileges
  const isAdmin = useMemo(() => {
    const roles = getUserRoleCodes(user);
    return roles.includes("admin") || roles.includes("super_admin") || roles.includes("owner");
  }, [user]);

  const { data: businesses = [] } = useBusinessesQuery(undefined, isAdmin);

  // Filter & Pagination States
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedBusinessUuid, setSelectedBusinessUuid] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // Tree expansion state
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<number>>(new Set());

  // Modal States
  const [activeCategoryModal, setActiveCategoryModal] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [defaultParentIdForCreate, setDefaultParentIdForCreate] = useState<number | null>(null);

  // Sync action=create query param
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  // Determine active business context
  const currentBusinessUuid = useMemo(() => {
    if (isAdmin && selectedBusinessUuid) {
      return selectedBusinessUuid;
    }
    return activeBusiness?.uuid || "";
  }, [isAdmin, selectedBusinessUuid, activeBusiness?.uuid]);

  // Query Params for Table List
  const listQueryParams = useMemo(() => {
    return {
      business_uuid: currentBusinessUuid || undefined,
      search: search.trim() || undefined,
      is_active: statusFilter === "all" ? undefined : statusFilter === "active",
      page,
      per_page: perPage,
    };
  }, [currentBusinessUuid, search, statusFilter, page, perPage]);

  // Query Table Categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
    refetch: refetchCategories,
  } = useCategoriesQuery(listQueryParams, Boolean(currentBusinessUuid || isAdmin));

  // Query Tree Categories (enabled when in tree view or for structure insights)
  const {
    data: treeData = [],
    isLoading: isTreeLoading,
    refetch: refetchTree,
  } = useCategoryTreeQuery(
    currentBusinessUuid || undefined,
    viewMode === "tree" && Boolean(currentBusinessUuid || isAdmin)
  );

  const categories = categoriesData?.data || [];
  const meta = categoriesData?.meta || {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: categories.length,
  };

  // Status Toggle Mutation
  const toggleStatusMutation = useToggleCategoryStatusMutation();

  const handleToggleStatus = async (category: Category) => {
    try {
      await toggleStatusMutation.mutateAsync(category);
      toast.success(
        `Category "${category.name}" set to ${!category.is_active ? "Active" : "Inactive"}.`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to update category status");
    }
  };

  // Tree expansion toggling
  const toggleExpand = (id: number) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (items: Category[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(treeData);
    setExpandedNodeIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodeIds(new Set());
  };

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const total = meta.total || categories.length;
    const active = categories.filter((c) => c.is_active).length;
    const rootCount = categories.filter((c) => !c.parent_id).length;
    const subcategoryCount = categories.filter((c) => Boolean(c.parent_id)).length;

    return { total, active, rootCount, subcategoryCount };
  }, [meta.total, categories]);

  const handleRefresh = () => {
    if (viewMode === "tree") {
      refetchTree();
    }
    refetchCategories();
    toast.success("Categories refreshed");
  };

  const openCreateWithParent = (parentId: number | null) => {
    setDefaultParentIdForCreate(parentId);
    setIsCreateModalOpen(true);
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: Category, level: number = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = expandedNodeIds.has(node.id);

    return (
      <div key={node.id} className="group">
        <div
          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-150 border ${
            level === 0
              ? "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-sm mb-2"
              : "bg-slate-50/70 dark:bg-zinc-850/60 border-slate-100 dark:border-zinc-800/60 my-1"
          } hover:border-[#FE9F43]/40 hover:bg-orange-50/30 dark:hover:bg-orange-950/10`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Node Left: Expand button, Icon, Name, Code */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-750 transition-colors cursor-pointer"
                aria-label={isExpanded ? "Collapse branch" : "Expand branch"}
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-90 text-[#FE9F43]" : ""
                  }`}
                />
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              </div>
            )}

            {/* Thumbnail or Folder Icon */}
            <div className="w-8 h-8 rounded-lg bg-orange-100/70 dark:bg-orange-950/40 text-[#FE9F43] flex items-center justify-center shrink-0 overflow-hidden relative">
              {node.image_url ? (
                <Image
                  src={node.image_url}
                  alt={node.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : isExpanded ? (
                <FolderOpen className="w-4 h-4 text-[#FE9F43]" />
              ) : (
                <Folder className="w-4 h-4 text-[#FE9F43]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                  {node.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {node.code}
                </span>
                {hasChildren && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/50 text-[#FE9F43]">
                    {node.children!.length} subcategories
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-[11px] text-slate-400 truncate max-w-md">
                  {node.description}
                </p>
              )}
            </div>
          </div>

          {/* Node Right: Sort order, Status badge, Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden sm:inline-flex text-[11px] text-slate-400 items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> {node.sort_order ?? 0}
            </span>

            <button
              type="button"
              onClick={() => handleToggleStatus(node)}
              className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                node.is_active
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
              }`}
            >
              {node.is_active ? "Active" : "Inactive"}
            </button>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openCreateWithParent(node.id)}
                className="h-7 px-2 rounded-lg text-slate-500 hover:text-[#FE9F43] hover:bg-orange-50 dark:hover:bg-orange-950/30 text-[11px] gap-1 cursor-pointer"
                title="Add Subcategory"
              >
                <Plus className="w-3 h-3" />
                <span className="hidden md:inline">Add Child</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCategoryModal(node)}
                className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="View details"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingCategory(node)}
                className="h-7 w-7 p-0 rounded-lg text-slate-500 hover:text-[#FE9F43] hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer"
                title="Edit Category"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingCategory(node)}
                className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="space-y-1 relative pl-2 border-l border-slate-200 dark:border-zinc-800 ml-4">
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-1">
            <span>Businesses</span>
            <span>/</span>
            <span className="text-[#FE9F43] font-bold">Categories Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FE9F43]/10 text-[#FE9F43] flex items-center justify-center font-bold shadow-sm">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
                Product Categories
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Organize catalog hierarchies, manage subcategories, and filter catalog items
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-750">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "tree"
                  ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isCategoriesFetching || isTreeLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => openCreateWithParent(null)}
            className="rounded-xl h-9 bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold px-3.5 gap-1.5 shadow-md shadow-[#FE9F43]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FE9F43]/10 text-[#FE9F43] flex items-center justify-center shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Total Categories
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber
                value={kpiStats.total}
                loading={isCategoriesLoading}
              />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Root Categories
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber
                value={kpiStats.rootCount}
                loading={isCategoriesLoading}
              />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Subcategories
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber
                value={kpiStats.subcategoryCount}
                loading={isCategoriesLoading}
              />
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Active in POS
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-50">
              <AnimatedNumber
                value={kpiStats.active}
                loading={isCategoriesLoading}
              />
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category by name, code, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-850/50 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] transition-all"
            />
          </div>

          {/* Filters & Business Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Business Selector (Admin only) */}
            {isAdmin && businesses.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                <select
                  value={selectedBusinessUuid}
                  onChange={(e) => {
                    setSelectedBusinessUuid(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-750 bg-slate-50/50 dark:bg-zinc-850/50 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]/20 focus:border-[#FE9F43] cursor-pointer"
                >
                  <option value="">All Businesses</option>
                  {businesses.map((biz) => (
                    <option key={biz.uuid} value={biz.uuid}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-750 text-xs">
              {(["all", "active", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === status
                      ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Tree View Controls */}
            {viewMode === "tree" && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExpandAll}
                  className="rounded-xl h-8 px-2.5 text-[11px] font-semibold cursor-pointer"
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCollapseAll}
                  className="rounded-xl h-8 px-2.5 text-[11px] font-semibold cursor-pointer"
                >
                  Collapse All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Table View vs. Tree View */}
      {viewMode === "tree" ? (
        /* Tree View Presentation */
        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-2">
          {isTreeLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FE9F43] mx-auto" />
              <p className="text-xs text-slate-500">Building category hierarchy...</p>
            </div>
          ) : treeData.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <FolderTree className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                No categories found in tree
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No hierarchical categories are configured for this context. Create a category to start your catalog tree.
              </p>
              <Button
                size="sm"
                onClick={() => openCreateWithParent(null)}
                className="rounded-xl bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Create Top Category
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {treeData.map((rootNode) => renderTreeNode(rootNode, 0))}
            </div>
          )}
        </div>
      ) : (
        /* Table View Presentation */
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-zinc-850/75 border-b border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-3">Code</th>
                  <th className="py-3.5 px-3">Parent / Level</th>
                  <th className="py-3.5 px-3 text-center">Sort Order</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-3 hidden lg:table-cell">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {isCategoriesLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-zinc-800" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-3 w-32 bg-slate-200 dark:bg-zinc-800 rounded" />
                            <div className="h-2.5 w-20 bg-slate-100 dark:bg-zinc-850 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded" />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="h-3 w-8 bg-slate-200 dark:bg-zinc-800 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="h-4 w-14 bg-slate-200 dark:bg-zinc-800 rounded mx-auto" />
                      </td>
                      <td className="py-3.5 px-3 hidden lg:table-cell">
                        <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-7 w-20 bg-slate-200 dark:bg-zinc-800 rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="space-y-3">
                        <FolderTree className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                          No categories found
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          {search
                            ? `No categories match query "${search}". Try adjusting your filters.`
                            : "No categories have been added yet."}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => openCreateWithParent(null)}
                          className="rounded-xl bg-[#FE9F43] hover:bg-[#ea8c31] text-white text-xs font-bold gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Category
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-zinc-850/50 transition-colors group"
                    >
                      {/* Name & Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-100/70 dark:bg-orange-950/40 text-[#FE9F43] flex items-center justify-center shrink-0 overflow-hidden relative">
                            {cat.image_url ? (
                              <Image
                                src={cat.image_url}
                                alt={cat.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <FolderTree className="w-4 h-4 text-[#FE9F43]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block truncate">
                              {cat.name}
                            </span>
                            {cat.description && (
                              <span className="text-[11px] text-slate-400 truncate block max-w-xs">
                                {cat.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          {cat.code}
                        </span>
                      </td>

                      {/* Parent / Hierarchy */}
                      <td className="py-3 px-3">
                        {cat.parent ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-medium">
                            <Layers className="w-3 h-3 text-[#FE9F43]" />
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Root</span>
                        )}
                      </td>

                      {/* Sort Order */}
                      <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400">
                        {cat.sort_order ?? 0}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer border ${
                            cat.is_active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cat.is_active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {cat.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Created */}
                      <td className="py-3 px-3 hidden lg:table-cell text-slate-500 dark:text-zinc-400 text-[11px]">
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCreateWithParent(cat.id)}
                            className="h-8 px-2 rounded-lg text-slate-500 hover:text-[#FE9F43] hover:bg-orange-50 dark:hover:bg-orange-950/30 text-[11px] gap-1 cursor-pointer"
                            title="Add subcategory under this category"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="hidden sm:inline">Add Sub</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveCategoryModal(cat)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="View category details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(cat)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-[#FE9F43] hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer"
                            title="Edit category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCategory(cat)}
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          {meta.total > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-zinc-850/50">
              <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                <span>
                  Showing{" "}
                  <strong>
                    {Math.min(meta.total, (meta.current_page - 1) * meta.per_page + 1)}
                  </strong>{" "}
                  to{" "}
                  <strong>
                    {Math.min(meta.total, meta.current_page * meta.per_page)}
                  </strong>{" "}
                  of <strong><AnimatedNumber value={meta.total} loading={isCategoriesLoading} className="inline font-bold" /></strong> categories
                </span>

                <span className="text-slate-300 dark:text-zinc-700">|</span>

                <div className="flex items-center gap-1.5">
                  <span>Per page:</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-7 px-2 rounded-lg border border-slate-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 text-xs font-semibold cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Page buttons */}
              <div className="flex items-center gap-1 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="px-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Page {page} of {meta.last_page || 1}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.last_page || 1, p + 1))}
                  disabled={page >= (meta.last_page || 1)}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setDefaultParentIdForCreate(null);
        }}
        defaultParentId={defaultParentIdForCreate}
        onSuccess={() => {
          refetchCategories();
          refetchTree();
        }}
      />

      <EditCategoryModal
        category={editingCategory}
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        onSuccess={() => {
          refetchCategories();
          refetchTree();
        }}
      />

      <DeleteCategoryModal
        category={deletingCategory}
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onSuccess={() => {
          refetchCategories();
          refetchTree();
        }}
      />

      <CategoryDetailModal
        category={activeCategoryModal}
        isOpen={Boolean(activeCategoryModal)}
        onClose={() => setActiveCategoryModal(null)}
        onEdit={(cat) => setEditingCategory(cat)}
      />
    </div>
  );
}
