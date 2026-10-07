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
});
