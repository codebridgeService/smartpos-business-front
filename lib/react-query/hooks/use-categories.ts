"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Category,
  type GetCategoriesParams,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryDeleteResponse,
  type GetTrashedCategoriesParams,
  type TrashedCategoryRestoreResponse,
  type TrashedCategoryForceDeleteResponse,
  type CategoryListResponse,
  categoriesApi,
} from "@/lib/api/categories";
import {
  fetchCategoriesWithIndexedDbCache,
  saveCategoriesToIndexedDb,
  removeCategoryFromIndexedDb,
  type CachedCategoriesResult,
} from "@/lib/storage/category-cache";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { queryKeys } from "../query-keys";

/**
 * Hook to fetch paginated categories with offline-first IndexedDB cache
 */
export function useCategoriesQuery(params?: GetCategoriesParams, enabled = true) {
  return useQuery<CachedCategoriesResult>({
    queryKey: queryKeys.categories.list(params as Record<string, unknown>),
    queryFn: async () => {
      const result = await fetchCategoriesWithIndexedDbCache(params);
      if (result?.data) {
        useCategoryStore.getState().setCategories(result.data);
      }
      return result;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch category hierarchical tree
 */
export function useCategoryTreeQuery(businessUuid?: string, enabled = true) {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories.tree(businessUuid),
    queryFn: async () => {
      const tree = await categoriesApi.getCategoryTree(businessUuid);
      useCategoryStore.getState().setTreeData(tree);
      return tree;
    },
    enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to fetch single category detail
 */
export function useCategoryQuery(idOrUuid?: string | number, enabled = true) {
  return useQuery<Category>({
    queryKey: queryKeys.categories.detail(String(idOrUuid || "")),
    queryFn: () => categoriesApi.getCategory(idOrUuid!),
    enabled: Boolean(idOrUuid && enabled),
  });
}

/**
 * Hook to create a category
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput | FormData>({
    mutationFn: async (data) => {
      const res = await categoriesApi.createCategory(data);
      return res.data;
    },
    onSuccess: (newCat) => {
      saveCategoriesToIndexedDb([newCat]).catch(() => {});
      const current = useCategoryStore.getState().categories;
      useCategoryStore.getState().setCategories([newCat, ...current.filter((c) => c.uuid !== newCat.uuid)]);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    Category,
    Error,
    { idOrUuid: string | number; data: UpdateCategoryInput | Partial<Category> | FormData }
  >({
    mutationFn: async ({ idOrUuid, data }) => {
      const res = await categoriesApi.updateCategory(idOrUuid, data);
      return res.data;
    },
    onSuccess: (updated) => {
      saveCategoriesToIndexedDb([updated]).catch(() => {});
      const current = useCategoryStore.getState().categories;
      useCategoryStore.getState().setCategories(
        current.map((c) => (c.uuid === updated.uuid || c.id === updated.id ? updated : c))
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(updated.uuid) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<CategoryDeleteResponse, Error, { idOrUuid: string | number; businessUuid?: string }>({
    mutationFn: async ({ idOrUuid, businessUuid }) => {
      return await categoriesApi.deleteCategory(idOrUuid, businessUuid);
    },
    onSuccess: (_, variables) => {
      removeCategoryFromIndexedDb(variables.idOrUuid).catch(() => {});
      const current = useCategoryStore.getState().categories;
      useCategoryStore.getState().setCategories(
        current.filter((c) => c.uuid !== variables.idOrUuid && c.id !== variables.idOrUuid)
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.trash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Hook to toggle category active status
 */
export function useToggleCategoryStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, Category>({
    mutationFn: async (category: Category) => {
      const res = await categoriesApi.updateCategory(category.uuid || category.id, {
        is_active: !category.is_active,
        business_uuid: category.business_uuid,
      });
      return res.data;
    },
    onSuccess: (updated) => {
      saveCategoriesToIndexedDb([updated]).catch(() => {});
      const current = useCategoryStore.getState().categories;
      useCategoryStore.getState().setCategories(
        current.map((c) => (c.uuid === updated.uuid || c.id === updated.id ? updated : c))
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Hook to fetch paginated soft-deleted categories from trash bin
 */
export function useTrashedCategoriesQuery(params?: GetTrashedCategoriesParams, enabled = true) {
  return useQuery<CategoryListResponse>({
    queryKey: queryKeys.categories.trash(params as Record<string, unknown>),
    queryFn: async () => {
      const res = await categoriesApi.getTrashedCategories(params);
      if (res?.data) {
        useCategoryStore.getState().setTrashedCategories(res.data, res.meta);
      }
      return res;
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to restore a soft-deleted category
 */
export function useRestoreCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    TrashedCategoryRestoreResponse,
    Error,
    { idOrUuid: string | number; businessUuid?: string }
  >({
    mutationFn: async ({ idOrUuid, businessUuid }) => {
      return await categoriesApi.restoreCategory(idOrUuid, businessUuid);
    },
    onSuccess: (res, variables) => {
      const restored = res.data;
      if (restored) {
        saveCategoriesToIndexedDb([restored]).catch(() => {});
        const currentActive = useCategoryStore.getState().categories;
        useCategoryStore.getState().setCategories([
          restored,
          ...currentActive.filter((c) => c.uuid !== restored.uuid && c.id !== restored.id),
        ]);
      }
      const currentTrashed = useCategoryStore.getState().trashedCategories;
      useCategoryStore.getState().setTrashedCategories(
        currentTrashed.filter((c) => c.uuid !== variables.idOrUuid && c.id !== variables.idOrUuid)
      );

      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.trash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

/**
 * Hook to permanently purge a soft-deleted category from database and storage
 */
export function useForceDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    TrashedCategoryForceDeleteResponse,
    Error,
    { idOrUuid: string | number; businessUuid?: string }
  >({
    mutationFn: async ({ idOrUuid, businessUuid }) => {
      return await categoriesApi.forceDeleteCategory(idOrUuid, businessUuid);
    },
    onSuccess: (_, variables) => {
      const currentTrashed = useCategoryStore.getState().trashedCategories;
      useCategoryStore.getState().setTrashedCategories(
        currentTrashed.filter((c) => c.uuid !== variables.idOrUuid && c.id !== variables.idOrUuid)
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.trash() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
