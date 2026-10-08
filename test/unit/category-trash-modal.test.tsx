import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CategoryTrashModal } from "@/components/categories/category-trash-modal";

const mockUseTrashedCategoriesQuery = vi.fn();
const mockMutateRestore = vi.fn();
const mockMutateForceDelete = vi.fn();

vi.mock("@/lib/react-query/hooks/use-categories", () => ({
  useTrashedCategoriesQuery: (...args: any[]) => mockUseTrashedCategoriesQuery(...args),
  useRestoreCategoryMutation: () => ({
    mutateAsync: mockMutateRestore,
    isPending: false,
  }),
  useForceDeleteCategoryMutation: () => ({
    mutateAsync: mockMutateForceDelete,
    isPending: false,
  }),
}));

const mockUser = {
  id: 1,
  name: "Owner User",
  roles: ["owner"],
  permissions: ["categories.view", "categories.delete", "categories.update"],
};

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("CategoryTrashModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders soft-deleted categories and action buttons", () => {
    mockUseTrashedCategoriesQuery.mockReturnValue({
      data: {
        success: true,
        data: [
          {
            id: 101,
            uuid: "cat-trash-101",
            name: "Deleted Snacks",
            code: "D-SNK",
            deleted_at: "2026-03-01T10:00:00Z",
            description: "Soft deleted snack category",
            business_uuid: "biz-1",
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(
      <CategoryTrashModal
        isOpen={true}
        onClose={vi.fn()}
        businessUuid="biz-1"
      />
    );

    expect(screen.getByText("Category Trash Bin")).toBeDefined();
    expect(screen.getByText("Deleted Snacks")).toBeDefined();
    expect(screen.getByText("D-SNK")).toBeDefined();
    expect(screen.getByText("Restore")).toBeDefined();
    expect(screen.getByText("Purge")).toBeDefined();
  });

  it("triggers restore mutation when Restore button is clicked", async () => {
    mockUseTrashedCategoriesQuery.mockReturnValue({
      data: {
        success: true,
        data: [
          {
            id: 101,
            uuid: "cat-trash-101",
            name: "Deleted Snacks",
            code: "D-SNK",
            deleted_at: "2026-03-01T10:00:00Z",
            business_uuid: "biz-1",
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    mockMutateRestore.mockResolvedValueOnce({
      success: true,
      message: "Category restored successfully.",
      data: { id: 101, uuid: "cat-trash-101", name: "Deleted Snacks" },
    });

    const onRestoredMock = vi.fn();

    render(
      <CategoryTrashModal
        isOpen={true}
        onClose={vi.fn()}
        businessUuid="biz-1"
        onRestored={onRestoredMock}
      />
    );

    const restoreBtn = screen.getByText("Restore");
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(mockMutateRestore).toHaveBeenCalledWith({
        idOrUuid: "cat-trash-101",
        businessUuid: "biz-1",
      });
      expect(onRestoredMock).toHaveBeenCalled();
    });
  });

  it("shows confirmation dialog before permanently purging", async () => {
    mockUseTrashedCategoriesQuery.mockReturnValue({
      data: {
        success: true,
        data: [
          {
            id: 101,
            uuid: "cat-trash-101",
            name: "Deleted Snacks",
            code: "D-SNK",
            deleted_at: "2026-03-01T10:00:00Z",
            business_uuid: "biz-1",
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    mockMutateForceDelete.mockResolvedValueOnce({
      success: true,
      message: "Category permanently deleted.",
    });

    render(
      <CategoryTrashModal
        isOpen={true}
        onClose={vi.fn()}
        businessUuid="biz-1"
      />
    );

    const purgeBtn = screen.getByText("Purge");
    fireEvent.click(purgeBtn);

    // Verify confirmation modal opened
    expect(screen.getByText("Permanently Purge Category?")).toBeDefined();
    expect(screen.getByText("Permanently Purge")).toBeDefined();

    const confirmPurgeBtn = screen.getByText("Permanently Purge");
    fireEvent.click(confirmPurgeBtn);

    await waitFor(() => {
      expect(mockMutateForceDelete).toHaveBeenCalledWith({
        idOrUuid: "cat-trash-101",
        businessUuid: "biz-1",
      });
    });
  });

  it("displays empty state when trash is empty", () => {
    mockUseTrashedCategoriesQuery.mockReturnValue({
      data: {
        success: true,
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        },
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(
      <CategoryTrashModal
        isOpen={true}
        onClose={vi.fn()}
        businessUuid="biz-1"
      />
    );

    expect(screen.getByText("Trash is Empty")).toBeDefined();
  });
});
