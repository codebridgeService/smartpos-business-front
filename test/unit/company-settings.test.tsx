import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompanySettingsView } from "@/components/settings/company-settings-view";
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/components/ui/toast", () => ({
  useToast: () => mockToast,
}));

const mockActiveBusiness = {
  id: 1,
  uuid: "biz-1",
  name: "SmartPOS Retail Group Ltd.",
  email: "contact@smartpos.com",
  phone: "+1 (555) 839-2041",
  website: "https://smartpos.io",
  tax_number: "TAX-9982410-B",
  registration_number: "REG-2024-88910",
  address: "742 Evergreen Terrace, Suite 400",
  city: "San Francisco",
};

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: mockActiveBusiness,
    updateSettings: vi.fn().mockResolvedValue({}),
  }),
}));

describe("CompanySettingsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders company information fields accurately", () => {
    render(<CompanySettingsView />);

    // Title & Section
    expect(screen.getByText("Company Settings")).toBeDefined();
    expect(screen.getByText("Company Information")).toBeDefined();

    // Inputs
    expect(screen.getByPlaceholderText("Enter Company Name")).toBeDefined();
    expect(screen.getByPlaceholderText("company@domain.com")).toBeDefined();
    expect(screen.getByPlaceholderText("+1 (555) 000-0000")).toBeDefined();
    expect(screen.getByPlaceholderText("+1 (555) 000-0001")).toBeDefined();
    expect(screen.getByPlaceholderText("https://yourstore.com")).toBeDefined();
  });

  it("renders brand color token checker and contrast ratios", () => {
    render(<CompanySettingsView />);

    expect(screen.getByText("Brand Theme & Color Token Checker")).toBeDefined();
    expect(screen.getByText("Primary Brand Color")).toBeDefined();
    expect(screen.getByText("Contrast Ratios (WCAG 2.1)")).toBeDefined();
    expect(screen.getByText("Live Component Preview")).toBeDefined();
  });

  it("renders all four branding image uploaders", () => {
    render(<CompanySettingsView />);

    expect(screen.getByText("Company Images & Branding")).toBeDefined();
    expect(screen.getByText("Company Icon")).toBeDefined();
    expect(screen.getByText("Favicon")).toBeDefined();
    expect(screen.getByText("Company Logo")).toBeDefined();
    expect(screen.getByText("Company Dark Logo")).toBeDefined();

    // 4 Upload buttons
    const uploadButtons = screen.getAllByText("Upload Image");
    expect(uploadButtons.length).toBe(4);
  });

  it("allows typing into form fields and changing brand color preset", () => {
    render(<CompanySettingsView />);

    const nameInput = screen.getByPlaceholderText("Enter Company Name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Apex Enterprises Inc." } });
    expect(nameInput.value).toBe("Apex Enterprises Inc.");

    // Click on Emerald Pro preset
    const emeraldPreset = screen.getByTitle("Emerald Pro");
    fireEvent.click(emeraldPreset);
    expect(screen.getAllByDisplayValue("#059669").length).toBeGreaterThanOrEqual(1);
  });
});
