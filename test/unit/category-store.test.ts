import { describe, it, expect, beforeEach } from "vitest";
import { useCategoryStore } from "@/stores/useCategoryStore";

describe("Category Zustand Store", () => {
  beforeEach(() => {
    useCategoryStore.setState({
      categories: [],
      treeData: [],
      selectedCategory: null,
      activeBusinessUuid: "",
      isLoading: false,
      isSaving: false,
      error: null,
      viewMode: "table",
      searchQuery: "",
      statusFilter: "all",
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      isDetailModalOpen: false,
    });
  });

  it("manages view mode state between table and tree", () => {
    expect(useCategoryStore.getState().viewMode).toBe("table");
    useCategoryStore.getState().setViewMode("tree");
    expect(useCategoryStore.getState().viewMode).toBe("tree");
  });

  it("handles modal open and close cycles", () => {
    const mockCat = {
      id: 1,
      uuid: "cat-001",
      name: "Bakery",
      code: "BAK",
      business_uuid: "biz-1",
      parent_id: null,
      description: null,
      image_path: null,
      sort_order: 0,
      is_active: true,
      created_at: null,
      updated_at: null,
      deleted_at: null,
      image_url: "",
    };

    useCategoryStore.getState().openCreateModal("biz-1");
    expect(useCategoryStore.getState().isCreateModalOpen).toBe(true);
    expect(useCategoryStore.getState().activeBusinessUuid).toBe("biz-1");

    useCategoryStore.getState().closeCreateModal();
    expect(useCategoryStore.getState().isCreateModalOpen).toBe(false);

    useCategoryStore.getState().openEditModal(mockCat);
    expect(useCategoryStore.getState().isEditModalOpen).toBe(true);
    expect(useCategoryStore.getState().selectedCategory?.name).toBe("Bakery");

    useCategoryStore.getState().closeEditModal();
    expect(useCategoryStore.getState().isEditModalOpen).toBe(false);
    expect(useCategoryStore.getState().selectedCategory).toBeNull();
  });

  it("updates search query and status filters", () => {
    useCategoryStore.getState().setSearchQuery("organic");
    useCategoryStore.getState().setStatusFilter("active");

    expect(useCategoryStore.getState().searchQuery).toBe("organic");
    expect(useCategoryStore.getState().statusFilter).toBe("active");
  });

  it("handles trash modal opening, closing, and trashed categories state", () => {
    expect(useCategoryStore.getState().isTrashModalOpen).toBe(false);

    useCategoryStore.getState().openTrashModal();
    expect(useCategoryStore.getState().isTrashModalOpen).toBe(true);

    useCategoryStore.getState().closeTrashModal();
    expect(useCategoryStore.getState().isTrashModalOpen).toBe(false);

    const trashedCat = {
      id: 99,
      uuid: "cat-trash-99",
      name: "Old Produce",
      code: "OPROD",
      business_uuid: "biz-1",
      parent_id: null,
      description: null,
      image_path: null,
      sort_order: 0,
      is_active: false,
      created_at: null,
      updated_at: null,
      deleted_at: "2026-03-01T12:00:00Z",
      image_url: "",
    };

    useCategoryStore.getState().setTrashedCategories([trashedCat], {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 1,
    });

    expect(useCategoryStore.getState().trashedCategories).toHaveLength(1);
    expect(useCategoryStore.getState().trashedCategories[0].name).toBe("Old Produce");
    expect(useCategoryStore.getState().trashedMeta.total).toBe(1);
  });
});
