import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditBrandModal } from "@/components/brands/edit-brand-modal";
import * as toastContext from "@/components/ui/toast";
import * as useBrandsHook from "@/lib/react-query/hooks/use-brands";
import type { Brand } from "@/lib/api/brands";

vi.mock("@/components/ui/toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-brands", () => ({
  useUpdateBrandMutation: vi.fn(),
}));

describe("EditBrandModal Component", () => {
  const mockBrand: Brand = {
    id: 42,
    uuid: "bnd-edit-42",
    business_uuid: "biz-hq-001",
    name: "Logitech",
    code: "LOGI",
    description: "Hardware & peripherals",
    logo_path: "brands/logi.png",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    deleted_at: null,
    logo_url: "https://example.com/logi.png",
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
    (useBrandsHook.useUpdateBrandMutation as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/dummy-edit-preview");
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }
  });

  it("renders with prefilled brand values when open", () => {
    render(
      <EditBrandModal
        brand={mockBrand}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Edit Brand")).toBeDefined();
    const nameInput = screen.getByPlaceholderText("e.g. Apple, Nike, Sony") as HTMLInputElement;
    expect(nameInput.value).toBe("Logitech");

    const codeInput = screen.getByPlaceholderText("e.g. APPL, NIKE, SONY") as HTMLInputElement;
    expect(codeInput.value).toBe("LOGI");

    const descInput = screen.getByPlaceholderText("Brief description or categories associated with this brand...") as HTMLTextAreaElement;
    expect(descInput.value).toBe("Hardware & peripherals");

    expect(screen.getByText("ID #42")).toBeDefined();
  });

  it("does not render when isOpen is false or brand is null", () => {
    const { container: closedContainer } = render(
      <EditBrandModal
        brand={mockBrand}
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(closedContainer.firstChild).toBeNull();

    const { container: nullContainer } = render(
      <EditBrandModal
        brand={null}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
    expect(nullContainer.firstChild).toBeNull();
  });

  it("rejects replacement logo exceeding 5MB (5120 KB)", async () => {
    render(
      <EditBrandModal
        brand={mockBrand}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], "heavy-logo.png", {
      type: "image/png",
    });

    const fileInput = document.querySelector("#edit-brand-logo-file-input") as HTMLInputElement;
    expect(fileInput).toBeDefined();

    Object.defineProperty(fileInput, "files", {
      value: [largeFile],
    });

    fireEvent.change(fileInput);

    expect(
      await screen.findByText("File exceeds the maximum allowed size of 5MB (5120 KB).")
    ).toBeDefined();
  });

  it("submits updated brand data with replaced image logo", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      id: 42,
      uuid: "bnd-edit-42",
      name: "Logitech G Pro",
      code: "LOGIPRO",
      is_active: true,
    });

    render(
      <EditBrandModal
        brand={mockBrand}
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Modify fields
    const nameInput = screen.getByPlaceholderText("e.g. Apple, Nike, Sony");
    fireEvent.change(nameInput, { target: { value: "Logitech G Pro" } });

    const codeInput = screen.getByPlaceholderText("e.g. APPL, NIKE, SONY");
    fireEvent.change(codeInput, { target: { value: "LOGIPRO" } });

    // Select new replacement logo
    const newFile = new File(["new logo content"], "new-logi.png", { type: "image/png" });
    const fileInput = document.querySelector("#edit-brand-logo-file-input") as HTMLInputElement;

    Object.defineProperty(fileInput, "files", {
      value: [newFile],
    });
    fireEvent.change(fileInput);

    expect(await screen.findByText("Replacing current logo")).toBeDefined();

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Update Brand" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          idOrUuid: 42,
          data: expect.objectContaining({
            name: "Logitech G Pro",
            code: "LOGIPRO",
            logo: newFile,
            business_uuid: "biz-hq-001",
          }),
        })
      );
      expect(mockToast.success).toHaveBeenCalledWith("Brand updated successfully.");
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
