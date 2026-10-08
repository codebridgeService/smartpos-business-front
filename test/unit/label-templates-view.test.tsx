import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LabelTemplatesView, LABEL_PRESETS } from "@/components/settings/label-templates-view";

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/components/ui/toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/context/theme-context", () => ({
  useTheme: () => ({
    themeColor: "purple",
  }),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: {
      uuid: "biz-1",
      name: "SmartPOS Flagship Store",
    },
  }),
}));

const mockTemplates = [
  {
    id: 1,
    uuid: "tmpl-1",
    business_uuid: "biz-1",
    name: "Standard Shelf Label",
    width_mm: 50,
    height_mm: 30,
    show_product_name: true,
    show_variant_name: true,
    show_price: true,
    show_sku: true,
    show_barcode: true,
    show_qrcode: false,
    is_default: true,
    is_active: true,
  },
  {
    id: 2,
    uuid: "tmpl-2",
    business_uuid: "biz-1",
    name: "Square QR Tag",
    width_mm: 40,
    height_mm: 40,
    show_product_name: true,
    show_variant_name: false,
    show_price: true,
    show_sku: false,
    show_barcode: false,
    show_qrcode: true,
    is_default: false,
    is_active: false,
  },
];

const mockMutateAsync = vi.fn();

vi.mock("@/lib/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/react-query")>();
  return {
    ...actual,
    useLabelTemplatesQuery: vi.fn(() => ({
      data: { data: mockTemplates },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })),
    useCreateLabelTemplateMutation: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })),
    useUpdateLabelTemplateMutation: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })),
    useDeleteLabelTemplateMutation: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    })),
  };
});

describe("LabelTemplatesView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, presets, and template cards list", () => {
    render(<LabelTemplatesView />);

    expect(screen.getByText("Barcode & Label Templates")).toBeDefined();
    expect(screen.getByText("Standard Shelf Label")).toBeDefined();
    expect(screen.getByText("Square QR Tag")).toBeDefined();
    expect(screen.getByText("Default")).toBeDefined();
    expect(screen.getByText("50 × 30 mm")).toBeDefined();
    expect(screen.getByText("40 × 40 mm")).toBeDefined();

    // Check quick presets exist
    LABEL_PRESETS.forEach((preset) => {
      expect(screen.getByText(preset.name)).toBeDefined();
    });
  });

  it("filters templates by search text", () => {
    render(<LabelTemplatesView />);

    const searchInput = screen.getByPlaceholderText("Search templates by name or size...");
    fireEvent.change(searchInput, { target: { value: "Square" } });

    expect(screen.queryByText("Square QR Tag")).toBeDefined();
    expect(screen.queryByText("Standard Shelf Label")).toBeNull();
  });

  it("opens create template modal when clicking Create Template", () => {
    render(<LabelTemplatesView />);

    const createBtn = screen.getByRole("button", { name: /Create Template/i });
    fireEvent.click(createBtn);

    expect(screen.getByText("New Barcode & Label Template")).toBeDefined();
    expect(screen.getByLabelText(/Template Name/i)).toBeDefined();
  });

  it("populates preset dimensions when clicking a preset card", () => {
    render(<LabelTemplatesView />);

    const compactPresetBtn = screen.getByRole("button", { name: /Compact Barcode Sticker/i });
    fireEvent.click(compactPresetBtn);

    expect(screen.getByText("New Barcode & Label Template")).toBeDefined();
    const nameInput = screen.getByPlaceholderText("e.g. Standard 50x30mm Shelf Label") as HTMLInputElement;
    expect(nameInput.value).toBe("Compact Barcode Sticker");
  });
});
