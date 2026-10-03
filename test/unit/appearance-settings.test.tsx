import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppearanceSettingsView } from "@/components/settings/appearance-settings-view";

const mockSetTheme = vi.fn();
const mockSetThemeColor = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/context/theme-context", () => ({
  useTheme: () => ({
    theme: "light",
    resolvedTheme: "light",
    setTheme: mockSetTheme,
    themeColor: "orange",
    setThemeColor: mockSetThemeColor,
  }),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => mockToast,
}));

describe("AppearanceSettingsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders all Appearance sections matching the DreamsPOS screenshot", () => {
    render(<AppearanceSettingsView />);

    expect(screen.getByRole("heading", { name: "Appearance", level: 1 })).toBeDefined();
    expect(screen.getByText("Select Theme")).toBeDefined();
    expect(screen.getByText("Light")).toBeDefined();
    expect(screen.getByText("Dark")).toBeDefined();
    expect(screen.getByText("Automatic")).toBeDefined();
    expect(screen.getByText("Accent Color")).toBeDefined();
    expect(screen.getByText("Expand Sidebar")).toBeDefined();
    expect(screen.getByText("Sidebar Size")).toBeDefined();
    expect(screen.getByText("Font Family")).toBeDefined();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDefined();
  });

  it("defaults Sidebar Size to 'Default - 240px' and Font Family to 'Default'", () => {
    render(<AppearanceSettingsView />);

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const sidebarSizeSelect = selects[0];
    const fontFamilySelect = selects[1];

    expect(sidebarSizeSelect.value).toBe("Default - 240px");
    expect(fontFamilySelect.value).toBe("Default");
  });

  it("changes theme mode to Dark or Automatic when clicked", () => {
    render(<AppearanceSettingsView />);

    const darkButton = screen.getByText("Dark").closest("button");
    expect(darkButton).toBeDefined();
    if (darkButton) {
      fireEvent.click(darkButton);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    }

    const autoButton = screen.getByText("Automatic").closest("button");
    expect(autoButton).toBeDefined();
    if (autoButton) {
      fireEvent.click(autoButton);
      expect(mockSetTheme).toHaveBeenCalledWith("system");
    }
  });

  it("changes accent color and updates theme context and CSS properties", () => {
    render(<AppearanceSettingsView />);

    const purpleButton = screen.getByLabelText("Royal Purple");
    expect(purpleButton).toBeDefined();

    fireEvent.click(purpleButton);
    expect(mockSetThemeColor).toHaveBeenCalledWith("purple");
  });

  it("toggles the Expand Sidebar switch", () => {
    render(<AppearanceSettingsView />);

    const switcher = screen.getByRole("switch");
    expect(switcher.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(switcher);
    expect(switcher.getAttribute("aria-checked")).toBe("false");
  });

  it("changes Sidebar Size and Font Family selections", () => {
    render(<AppearanceSettingsView />);

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const sidebarSizeSelect = selects[0];
    const fontFamilySelect = selects[1];

    fireEvent.change(sidebarSizeSelect, { target: { value: "Small - 85px" } });
    expect(sidebarSizeSelect.value).toBe("Small - 85px");

    fireEvent.change(fontFamilySelect, { target: { value: "Inter" } });
    expect(fontFamilySelect.value).toBe("Inter");
  });

  it("saves appearance settings to localStorage and displays success toast", async () => {
    render(<AppearanceSettingsView />);

    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Appearance settings saved successfully!");
      const stored = localStorage.getItem("smartpos_appearance_settings");
      expect(stored).toBeDefined();
      expect(stored).toContain('"sidebarSize":"Default - 240px"');
      expect(stored).toContain('"fontFamily":"Default"');
    });
  });

  it("reverts appearance settings when Cancel is clicked", () => {
    render(<AppearanceSettingsView />);

    // Toggle switcher off
    const switcher = screen.getByRole("switch");
    fireEvent.click(switcher);
    expect(switcher.getAttribute("aria-checked")).toBe("false");

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);

    // Should revert back to true
    expect(switcher.getAttribute("aria-checked")).toBe("true");
    expect(mockToast.info).toHaveBeenCalledWith("Appearance changes discarded.");
  });
});
