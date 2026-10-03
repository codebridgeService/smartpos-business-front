import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteBrandModal } from "@/components/brands/delete-brand-modal";
import * as toastContext from "@/components/ui/toast";
import * as useBrandsHook from "@/lib/react-query/hooks/use-brands";
import type { Brand } from "@/lib/api/brands";

vi.mock("@/components/ui/toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-brands", () => ({
  useDeleteBrandMutation: vi.fn(),
}));

describe("DeleteBrandModal Component", () => {
  const mockBrand: Brand = {
    id: 55,
    uuid: "bnd-del-55",
    business_uuid: "biz-hq-001",
    name: "Puma Shoes",
    code: "PUMA",
    description: "Sportswear",
    logo_path: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    logo_url: "",
  };

  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const mockMutateAsync = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (toastContext.useToast as any).mockReturnValue(mockToast);
    (useBrandsHook.useDeleteBrandMutation as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renders with brand name, code, and warning text when open", () => {
    render(
      <DeleteBrandModal
        brand={mockBrand}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Delete Brand")).toBeDefined();
    expect(screen.getByText(/"Puma Shoes"/)).toBeDefined();
    expect(screen.getByText("PUMA")).toBeDefined();
    expect(
      screen.getByText(
        /permanently remove the brand and its associated image from cloud storage/
      )
    ).toBeDefined();
  });

  it("does not render when isOpen is false or brand is null", () => {
    const { container: closedContainer } = render(
      <DeleteBrandModal
        brand={mockBrand}
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(closedContainer.firstChild).toBeNull();

    const { container: nullContainer } = render(
      <DeleteBrandModal
        brand={null}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(nullContainer.firstChild).toBeNull();
  });

  it("triggers deletion mutation and success toast on confirmation", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      success: true,
      message: "Brand deleted successfully.",
    });

    render(
      <DeleteBrandModal
        brand={mockBrand}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: "Confirm Delete" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        idOrUuid: 55,
        business_uuid: "biz-hq-001",
      });
      expect(mockToast.success).toHaveBeenCalledWith("Brand deleted successfully.");
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("handles cancel button click", () => {
    render(
      <DeleteBrandModal
        brand={mockBrand}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
