import { create } from "zustand";
import {
  type Category,
  type CategoryMeta,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type GetCategoriesParams,
  type GetTrashedCategoriesParams,
  categoriesApi,
} from "@/lib/api/categories";
import {
  saveCategoriesToIndexedDb,
  getCachedCategoriesFromIndexedDb,
  removeCategoryFromIndexedDb,
} from "@/lib/storage/category-cache";

export type CategoryViewMode = "table" | "tree";

export interface CategoryState {
  // Data
  categories: Category[];
  treeData: Category[];
  trashedCategories: Category[];
  trashedMeta: CategoryMeta;
  selectedCategory: Category | null;
  activeBusinessUuid: string;
  isLoading: boolean;
  isSaving: boolean;
  isTrashLoading: boolean;
  isRestoring: boolean;
  isForceDeleting: boolean;
  error: string | null;

  // View & Filter
  viewMode: CategoryViewMode;
  searchQuery: string;
  statusFilter: string; // "all" | "active" | "inactive"

  // Modal Visibility
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isDetailModalOpen: boolean;
  isTrashModalOpen: boolean;

  // State setters
  setCategories: (categories: Category[]) => void;
  setTreeData: (treeData: Category[]) => void;
  setTrashedCategories: (categories: Category[], meta?: CategoryMeta) => void;
  setSelectedCategory: (category: Category | null) => void;
  setActiveBusinessUuid: (businessUuid: string) => void;
  setViewMode: (mode: CategoryViewMode) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Modal controls
  openCreateModal: (defaultBusinessUuid?: string) => void;
  closeCreateModal: () => void;
  openEditModal: (category: Category) => void;
  closeEditModal: () => void;
  openDeleteModal: (category: Category) => void;
  closeDeleteModal: () => void;
  openDetailModal: (category: Category) => void;
  closeDetailModal: () => void;
  openTrashModal: () => void;
  closeTrashModal: () => void;

  // Async Actions
  fetchCategories: (params?: GetCategoriesParams) => Promise<Category[]>;
  fetchTree: (businessUuid?: string) => Promise<Category[]>;
  fetchTrashedCategories: (params?: GetTrashedCategoriesParams) => Promise<Category[]>;
  createCategory: (input: CreateCategoryInput | FormData) => Promise<Category>;
  updateCategory: (
    idOrUuid: string | number,
    data: UpdateCategoryInput | Partial<Category> | FormData
  ) => Promise<Category>;
  deleteCategory: (idOrUuid: string | number) => Promise<void>;
  restoreCategory: (idOrUuid: string | number, businessUuid?: string) => Promise<Category>;
  forceDeleteCategory: (idOrUuid: string | number, businessUuid?: string) => Promise<void>;
  toggleCategoryStatus: (category: Category) => Promise<Category>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  treeData: [],
  trashedCategories: [],
  trashedMeta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
  selectedCategory: null,
  activeBusinessUuid: "",
  isLoading: false,
  isSaving: false,
  isTrashLoading: false,
  isRestoring: false,
  isForceDeleting: false,
  error: null,

  viewMode: "table",
  searchQuery: "",
  statusFilter: "all",

  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  isDetailModalOpen: false,
  isTrashModalOpen: false,

  setCategories: (categories) => set({ categories }),
  setTreeData: (treeData) => set({ treeData }),
  setTrashedCategories: (trashedCategories, meta) =>
    set({
      trashedCategories,
      ...(meta ? { trashedMeta: meta } : {}),
    }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setActiveBusinessUuid: (activeBusinessUuid) => set({ activeBusinessUuid }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  openCreateModal: (defaultBusinessUuid) =>
    set((state) => ({
      isCreateModalOpen: true,
      activeBusinessUuid: defaultBusinessUuid || state.activeBusinessUuid,
    })),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openEditModal: (category) => set({ isEditModalOpen: true, selectedCategory: category }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedCategory: null }),

  openDeleteModal: (category) => set({ isDeleteModalOpen: true, selectedCategory: category }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedCategory: null }),

  openDetailModal: (category) => set({ isDetailModalOpen: true, selectedCategory: category }),
  closeDetailModal: () => set({ isDetailModalOpen: false, selectedCategory: null }),

  openTrashModal: () => set({ isTrashModalOpen: true }),
  closeTrashModal: () => set({ isTrashModalOpen: false }),

  fetchCategories: async (params?: GetCategoriesParams) => {
    const targetBusiness = params?.business_uuid || get().activeBusinessUuid;
    const cached = await getCachedCategoriesFromIndexedDb({
      business_uuid: targetBusiness,
      search: params?.search || get().searchQuery,
      is_active: params?.is_active,
    });

    if (cached && cached.length > 0) {
      set({ categories: cached, isLoading: false });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await categoriesApi.getCategories({
        business_uuid: targetBusiness,
        search: params?.search || get().searchQuery || undefined,
        is_active:
          params?.is_active !== undefined
            ? params.is_active
            : get().statusFilter !== "all"
            ? get().statusFilter === "active"
            : undefined,
        ...params,
      });

      set({ categories: response.data, isLoading: false });
      if (response.data.length > 0) {
        saveCategoriesToIndexedDb(response.data).catch(() => {});
      }
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load categories";
      set({ error: msg, isLoading: false });
      return cached || [];
    }
  },

  fetchTree: async (businessUuid?: string) => {
    const targetBusiness = businessUuid || get().activeBusinessUuid;
    try {
      const tree = await categoriesApi.getCategoryTree(targetBusiness);
      set({ treeData: tree });
      return tree;
    } catch (err: any) {
      console.warn("[useCategoryStore] Failed to fetch tree:", err);
      return [];
    }
  },

  createCategory: async (input: CreateCategoryInput | FormData) => {
    set({ isSaving: true, error: null });
    try {
      const res = await categoriesApi.createCategory(input);
      const newCategory = res.data;
      set((state) => ({
        categories: [newCategory, ...state.categories.filter((c) => c.uuid !== newCategory.uuid)],
        isCreateModalOpen: false,
        isSaving: false,
      }));
      saveCategoriesToIndexedDb([newCategory]).catch(() => {});
      return newCategory;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create category";
      set({ error: msg, isSaving: false });
      throw err;
    }
  },

  updateCategory: async (
    idOrUuid: string | number,
    data: UpdateCategoryInput | Partial<Category> | FormData
  ) => {
    set({ isSaving: true, error: null });
    try {
      const res = await categoriesApi.updateCategory(idOrUuid, data);
      const updated = res.data;
      set((state) => ({
        categories: state.categories.map((c) =>
          c.uuid === updated.uuid || c.id === updated.id ? updated : c
        ),
        isEditModalOpen: false,
        selectedCategory: null,
        isSaving: false,
      }));
      saveCategoriesToIndexedDb([updated]).catch(() => {});
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update category";
      set({ error: msg, isSaving: false });
      throw err;
    }
  },

  deleteCategory: async (idOrUuid: string | number) => {
    set({ isSaving: true, error: null });
    try {
      await categoriesApi.deleteCategory(idOrUuid, get().activeBusinessUuid);
      set((state) => ({
        categories: state.categories.filter((c) => c.uuid !== idOrUuid && c.id !== idOrUuid),
        isDeleteModalOpen: false,
        selectedCategory: null,
        isSaving: false,
      }));
      removeCategoryFromIndexedDb(idOrUuid).catch(() => {});
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete category";
      set({ error: msg, isSaving: false });
      throw err;
    }
  },

  fetchTrashedCategories: async (params?: GetTrashedCategoriesParams) => {
    const targetBusiness = params?.business_uuid || get().activeBusinessUuid;
    set({ isTrashLoading: true, error: null });
    try {
      const response = await categoriesApi.getTrashedCategories({
        business_uuid: targetBusiness,
        ...params,
      });
      set({
        trashedCategories: response.data,
        trashedMeta: response.meta,
        isTrashLoading: false,
      });
      return response.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load trashed categories";
      set({ error: msg, isTrashLoading: false });
      return [];
    }
  },

  restoreCategory: async (idOrUuid: string | number, businessUuid?: string) => {
    const targetBusiness = businessUuid || get().activeBusinessUuid;
    set({ isRestoring: true, error: null });
    try {
      const res = await categoriesApi.restoreCategory(idOrUuid, targetBusiness);
      const restored = res.data;
      set((state) => ({
        trashedCategories: state.trashedCategories.filter(
          (c) => c.uuid !== idOrUuid && c.id !== idOrUuid
        ),
        categories: [
          restored,
          ...state.categories.filter((c) => c.uuid !== restored.uuid && c.id !== restored.id),
        ],
        isRestoring: false,
      }));
      if (restored) {
        saveCategoriesToIndexedDb([restored]).catch(() => {});
      }
      return restored;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to restore category";
      set({ error: msg, isRestoring: false });
      throw err;
    }
  },

  forceDeleteCategory: async (idOrUuid: string | number, businessUuid?: string) => {
    const targetBusiness = businessUuid || get().activeBusinessUuid;
    set({ isForceDeleting: true, error: null });
    try {
      await categoriesApi.forceDeleteCategory(idOrUuid, targetBusiness);
      set((state) => ({
        trashedCategories: state.trashedCategories.filter(
          (c) => c.uuid !== idOrUuid && c.id !== idOrUuid
        ),
        isForceDeleting: false,
      }));
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to permanently purge category";
      set({ error: msg, isForceDeleting: false });
      throw err;
    }
  },

  toggleCategoryStatus: async (category: Category) => {
    const newStatus = !category.is_active;
    try {
      const res = await categoriesApi.updateCategory(category.uuid || category.id, {
        is_active: newStatus,
        business_uuid: category.business_uuid || get().activeBusinessUuid,
      });
      const updated = res.data;
      set((state) => ({
        categories: state.categories.map((c) => (c.uuid === updated.uuid ? updated : c)),
      }));
      saveCategoriesToIndexedDb([updated]).catch(() => {});
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update status";
      set({ error: msg });
      throw err;
    }
  },
}));
