import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InvoiceSettingsView, LOCAL_STORAGE_KEY } from "@/components/settings/invoice-settings-view";

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
    themeColor: "orange",
  }),
}));

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: {
      name: "SmartPOS Flagship Store",
      email: "billing@smartpos.io",
    },
  }),
}));

describe("InvoiceSettingsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders all elements matching the DreamsPOS reference screenshot", () => {
    render(<InvoiceSettingsView />);

    expect(screen.getByRole("heading", { name: "Invoice Settings", level: 1 })).toBeDefined();
    expect(screen.getByText("Invoice Logo")).toBeDefined();
    expect(screen.getByText("Upload Photo")).toBeDefined();
    expect(screen.getByText("For better preview recommended size is 450px x 450px. Max size 5mb.")).toBeDefined();

    expect(screen.getByText("Invoice Prefix")).toBeDefined();
    expect(screen.getByText("Add prefix to your invoice")).toBeDefined();

    expect(screen.getByText("Invoice Due")).toBeDefined();
    expect(screen.getByText("Select due date to display in Invoice")).toBeDefined();
    expect(screen.getByText("Days")).toBeDefined();

    expect(screen.getByText("Invoice Round Off")).toBeDefined();
    expect(screen.getByText("Value Roundoff in Invoice")).toBeDefined();

    expect(screen.getByText("Show Company Details")).toBeDefined();
    expect(screen.getByText("Show / Hide Company Details in Invoice")).toBeDefined();

    expect(screen.getByText("Invoice Header Terms")).toBeDefined();
    expect(screen.getByText("Invoice Footer Terms")).toBeDefined();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDefined();
  });

  it("defaults Invoice Prefix to 'INV - ', Due to '5 Days', and Round Off to 'Round Off Up'", () => {
    render(<InvoiceSettingsView />);

    const prefixInput = screen.getByLabelText("Invoice Prefix") as HTMLInputElement;
    expect(prefixInput.value).toBe("INV - ");

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const dueSelect = selects[0];
    const roundOffSelect = selects[1];

    expect(dueSelect.value).toBe("5");
    expect(roundOffSelect.value).toBe("Round Off Up");
  });

  it("updates Invoice Prefix when edited", () => {
    render(<InvoiceSettingsView />);

    const prefixInput = screen.getByLabelText("Invoice Prefix") as HTMLInputElement;
    fireEvent.change(prefixInput, { target: { value: "BILL - " } });
    expect(prefixInput.value).toBe("BILL - ");
  });

  it("changes Invoice Due days dropdown", () => {
    render(<InvoiceSettingsView />);

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const dueSelect = selects[0];

    fireEvent.change(dueSelect, { target: { value: "14" } });
    expect(dueSelect.value).toBe("14");
  });

  it("toggles Invoice Round Off and updates Round Off type", () => {
    render(<InvoiceSettingsView />);

    const switches = screen.getAllByRole("switch");
    const roundOffSwitch = switches[0];
    expect(roundOffSwitch.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(roundOffSwitch);
    expect(roundOffSwitch.getAttribute("aria-checked")).toBe("false");

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const roundOffSelect = selects[1];
    expect(roundOffSelect.disabled).toBe(true);

    fireEvent.click(roundOffSwitch);
    expect(roundOffSwitch.getAttribute("aria-checked")).toBe("true");
    expect(roundOffSelect.disabled).toBe(false);

    fireEvent.change(roundOffSelect, { target: { value: "Round Off Down" } });
    expect(roundOffSelect.value).toBe("Round Off Down");
  });

  it("toggles Show Company Details switch", () => {
    render(<InvoiceSettingsView />);

    const switches = screen.getAllByRole("switch");
    const showCompanySwitch = switches[1];
    expect(showCompanySwitch.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(showCompanySwitch);
    expect(showCompanySwitch.getAttribute("aria-checked")).toBe("false");
  });

  it("updates Header Terms and Footer Terms textareas", () => {
    render(<InvoiceSettingsView />);

    const textareas = screen.getAllByPlaceholderText("Type your message") as HTMLTextAreaElement[];
    const headerTextarea = textareas[0];
    const footerTextarea = textareas[1];

    fireEvent.change(headerTextarea, { target: { value: "Thank you for shopping with us!" } });
    fireEvent.change(footerTextarea, { target: { value: "Goods once sold cannot be returned." } });

    expect(headerTextarea.value).toBe("Thank you for shopping with us!");
    expect(footerTextarea.value).toBe("Goods once sold cannot be returned.");
  });

  it("saves invoice settings to localStorage and triggers toast", async () => {
    render(<InvoiceSettingsView />);

    const prefixInput = screen.getByLabelText("Invoice Prefix") as HTMLInputElement;
    fireEvent.change(prefixInput, { target: { value: "POS-" } });

    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Invoice settings saved successfully!");
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      expect(stored).toBeDefined();
      expect(stored).toContain('"invoicePrefix":"POS-"');
    });
  });

  it("reverts unsaved changes when Cancel is clicked", () => {
    render(<InvoiceSettingsView />);

    const prefixInput = screen.getByLabelText("Invoice Prefix") as HTMLInputElement;
    fireEvent.change(prefixInput, { target: { value: "TEMP-" } });
    expect(prefixInput.value).toBe("TEMP-");

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    expect(prefixInput.value).toBe("INV - ");
    expect(mockToast.info).toHaveBeenCalledWith("Invoice changes discarded.");
  });

  it("toggles Live Receipt Simulator preview", () => {
    render(<InvoiceSettingsView />);

    expect(screen.queryByText("Live Customer Invoice Simulator")).toBeNull();

    const togglePreviewButton = screen.getByText("Live Receipt Preview");
    fireEvent.click(togglePreviewButton);

    expect(screen.getByText("Live Customer Invoice Simulator")).toBeDefined();
    expect(screen.getByText("Hide Preview")).toBeDefined();
  });
});
