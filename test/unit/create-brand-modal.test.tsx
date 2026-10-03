import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateBrandModal } from "@/components/brands/create-brand-modal";
import * as authContext from "@/context/auth-context";
import * as businessContext from "@/context/business-context";
import * as toastContext from "@/components/ui/toast";
import * as useBrandsHook from "@/lib/react-query/hooks/use-brands";
import * as useBusinessesHook from "@/lib/react-query/hooks/use-businesses";

vi.mock("@/context/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: vi.fn(),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-brands", () => ({
  useCreateBrandMutation: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-businesses", () => ({
  useBusinessesQuery: vi.fn(),
}));

describe("CreateBrandModal Component", () => {
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

    (authContext.useAuth as any).mockReturnValue({
      user: {
        id: "1",
        email: "admin@smartpos.com",
        roles: ["admin"],
      },
    });

    (businessContext.useBusiness as any).mockReturnValue({
      activeBusiness: {
        uuid: "biz-hq-001",
        name: "HQ Business",
      },
    });

    (toastContext.useToast as any).mockReturnValue(mockToast);

    (useBusinessesHook.useBusinessesQuery as any).mockReturnValue({
      data: [
        { uuid: "biz-hq-001", name: "HQ Business" },
        { uuid: "biz-branch-002", name: "Branch Business" },
      ],
    });

    (useBrandsHook.useCreateBrandMutation as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    // Mock URL.createObjectURL and revokeObjectURL
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/dummy-preview");
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }
  });

  it("renders modal header and all form inputs when open", () => {
    render(
      <CreateBrandModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Create New Brand")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. Apple, Nike, Sony")).toBeDefined();
    expect(screen.getByPlaceholderText("e.g. APPL, NIKE, SONY")).toBeDefined();
    expect(screen.getByPlaceholderText("Brief description or categories associated with this brand...")).toBeDefined();
    expect(screen.getByText("Active Status")).toBeDefined();
    expect(screen.getByRole("button", { name: "Create Brand" })).toBeDefined();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <CreateBrandModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("auto-generates uppercase code from brand name", () => {
    render(
      <CreateBrandModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByPlaceholderText("e.g. Apple, Nike, Sony") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "PlayStation" } });

    const autoGenBtn = screen.getByText("Auto-generate");
    fireEvent.click(autoGenBtn);

    const codeInput = screen.getByPlaceholderText("e.g. APPL, NIKE, SONY") as HTMLInputElement;
    expect(codeInput.value).toBe("PLAYSTATIO");
  });

  it("validates required fields on empty submit", async () => {
    render(
      <CreateBrandModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitBtn = screen.getByRole("button", { name: "Create Brand" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Brand name is required.")).toBeDefined();
    expect(await screen.findByText("Brand code is required.")).toBeDefined();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it("rejects file uploads exceeding 5MB (5120 KB)", async () => {
    render(
      <CreateBrandModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Create 6MB file
    const largeFile = new File([new Uint8Array(6 * 1024 * 1024)], "heavy-logo.png", {
      type: "image/png",
    });

    const fileInput = document.querySelector("#brand-logo-file-input") as HTMLInputElement;
    expect(fileInput).toBeDefined();

    Object.defineProperty(fileInput, "files", {
      value: [largeFile],
    });

    fireEvent.change(fileInput);

    expect(
      await screen.findByText("File exceeds the maximum allowed size of 5MB (5120 KB).")
    ).toBeDefined();
  });

  it("submits valid brand with image and triggers success toast", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      id: 99,
      uuid: "bnd-created-99",
      name: "Adidas",
      code: "ADI",
      is_active: true,
    });

    render(
      <CreateBrandModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill form
    const nameInput = screen.getByPlaceholderText("e.g. Apple, Nike, Sony");
    fireEvent.change(nameInput, { target: { value: "Adidas Originals" } });

    const codeInput = screen.getByPlaceholderText("e.g. APPL, NIKE, SONY");
    fireEvent.change(codeInput, { target: { value: "ADIDAS" } });

    const descInput = screen.getByPlaceholderText("Brief description or categories associated with this brand...");
    fireEvent.change(descInput, { target: { value: "Sportswear & lifestyle footwear" } });

    // Attach valid image
    const validFile = new File(["valid image"], "adidas.png", { type: "image/png" });
    const fileInput = document.querySelector("#brand-logo-file-input") as HTMLInputElement;

    Object.defineProperty(fileInput, "files", {
      value: [validFile],
    });
    fireEvent.change(fileInput);

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Create Brand" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Adidas Originals",
          code: "ADIDAS",
          business_uuid: "biz-hq-001",
          description: "Sportswear & lifestyle footwear",
          logo: validFile,
          is_active: true,
        })
      );
      expect(mockToast.success).toHaveBeenCalledWith("Brand created successfully.");
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
