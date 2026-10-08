import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddPresetsModal } from "@/components/units/add-presets-modal";
import { CreateUnitModal } from "@/components/units/create-unit-modal";
import { STANDARD_UNIT_PRESETS, POPULAR_PRESET_CODES } from "@/lib/constants/unit-presets";
import * as authContext from "@/context/auth-context";
import * as businessContext from "@/context/business-context";
import * as toastContext from "@/components/ui/toast";
import * as useUnitsHook from "@/lib/react-query/hooks/use-units";
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

vi.mock("@/lib/react-query/hooks/use-units", () => ({
  useCreateUnitMutation: vi.fn(),
}));

vi.mock("@/lib/react-query/hooks/use-businesses", () => ({
  useBusinessesQuery: vi.fn(),
}));

describe("Unit Presets and Quick Seed UI", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };

  const mockCreateMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authContext.useAuth as any).mockReturnValue({
      user: { id: 1, name: "Admin User", roles: [{ code: "admin" }] },
    });
    (businessContext.useBusiness as any).mockReturnValue({
      activeBusiness: { id: 1, uuid: "biz-001", name: "Main Store" },
    });
    (toastContext.useToast as any).mockReturnValue(mockToast);
    (useUnitsHook.useCreateUnitMutation as any).mockReturnValue(mockCreateMutation);
    (useBusinessesHook.useBusinessesQuery as any).mockReturnValue({
      data: [{ id: 1, uuid: "biz-001", name: "Main Store", code: "MS" }],
    });
  });

  describe("STANDARD_UNIT_PRESETS constants", () => {
    it("contains expected core measurement units", () => {
      expect(STANDARD_UNIT_PRESETS.length).toBeGreaterThanOrEqual(10);

      const codes = STANDARD_UNIT_PRESETS.map((p) => p.code);
      expect(codes).toContain("PCS");
      expect(codes).toContain("KG");
      expect(codes).toContain("LTR");
      expect(codes).toContain("BOX");
      expect(codes).toContain("G");
      expect(codes).toContain("MTR");
      expect(codes).toContain("CAN");
    });

    it("has valid precisions and non-empty symbols", () => {
      STANDARD_UNIT_PRESETS.forEach((preset) => {
        expect(preset.name.length).toBeGreaterThan(0);
        expect(preset.code.length).toBeGreaterThan(0);
        expect(preset.symbol.length).toBeGreaterThan(0);
        expect(preset.precision).toBeGreaterThanOrEqual(0);
        expect(preset.precision).toBeLessThanOrEqual(6);
      });
    });
  });

  describe("CreateUnitModal Quick Presets", () => {
    it("autofills unit fields when a quick preset badge is clicked", () => {
      render(<CreateUnitModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText("Quick Presets")).toBeDefined();

      // Find and click the "Kilogram" preset button
      const kgPresetBtn = screen.getByRole("button", { name: /Kilogram/i });
      fireEvent.click(kgPresetBtn);

      // Verify name, code, and symbol inputs received the preset values
      const nameInput = screen.getByPlaceholderText("e.g. Kilogram, Piece, Meter, Liter") as HTMLInputElement;
      const codeInput = screen.getByPlaceholderText("e.g. KG, PCS, MTR, LTR") as HTMLInputElement;
      const symbolInput = screen.getByPlaceholderText("e.g. kg, pc, m, L") as HTMLInputElement;

      expect(nameInput.value).toBe("Kilogram");
      expect(codeInput.value).toBe("KG");
      expect(symbolInput.value).toBe("kg");
    });
  });

  describe("AddPresetsModal Component", () => {
    it("renders available presets and respects existingCodes", () => {
      render(
        <AddPresetsModal
          isOpen={true}
          onClose={vi.fn()}
          existingCodes={["PCS"]}
          defaultBusinessUuid="biz-001"
        />
      );

      expect(screen.getByText("Standard Unit Presets")).toBeDefined();
      expect(screen.getByText("Added")).toBeDefined(); // PCS should show Added
    });

    it("filters presets by category tabs", () => {
      render(
        <AddPresetsModal
          isOpen={true}
          onClose={vi.fn()}
          existingCodes={[]}
          defaultBusinessUuid="biz-001"
        />
      );

      const weightTab = screen.getByRole("button", { name: "Weight" });
      fireEvent.click(weightTab);

      expect(screen.getByText("Kilogram")).toBeDefined();
      expect(screen.getByText("Gram")).toBeDefined();
    });

    it("submits batch unit creation on button click", async () => {
      mockCreateMutation.mutateAsync.mockResolvedValue({
        id: 1,
        name: "Piece",
        code: "PCS",
      });

      const handleSuccess = vi.fn();
      const handleClose = vi.fn();

      render(
        <AddPresetsModal
          isOpen={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
          existingCodes={["KG", "LTR", "BOX", "G", "MTR", "CM", "PK", "DZN", "CAN", "BTL", "SET", "LB", "ML"]}
          defaultBusinessUuid="biz-001"
        />
      );

      // Only PCS should be available to select/add
      const addBtn = screen.getByRole("button", { name: /Add 1 Selected Unit/i });
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
          name: "Piece",
          code: "PCS",
          symbol: "pcs",
          precision: 0,
          is_active: true,
          business_uuid: "biz-001",
        });
        expect(mockToast.success).toHaveBeenCalled();
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });
});
