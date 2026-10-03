import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  LocalizationSettingsView,
  formatLiveDate,
  formatLiveTime,
  getFiscalEndingMonth,
} from "@/components/settings/localization-settings-view";

const mockUpdateSettings = vi.fn().mockResolvedValue({});
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

vi.mock("@/context/business-context", () => ({
  useBusiness: () => ({
    activeBusiness: {
      uuid: "biz-123",
      name: "SmartPOS Retail Store",
      currency_code: "USD",
      currency_symbol: "$",
      timezone: "UTC 5:30",
    },
    updateSettings: mockUpdateSettings,
  }),
}));

vi.mock("@/components/ui/toast", () => ({
  useToast: () => mockToast,
}));

describe("LocalizationSettingsView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Live Format Utility Functions", () => {
    const fixedDate = new Date("2026-10-03T15:06:10");

    it("formats live dates accurately across patterns", () => {
      expect(formatLiveDate(fixedDate, "01 Jan 2026")).toBe("03 Oct 2026");
      expect(formatLiveDate(fixedDate, "2026-01-01")).toBe("2026-10-03");
      expect(formatLiveDate(fixedDate, "01/01/2026")).toBe("03/10/2026");
      expect(formatLiveDate(fixedDate, "01-01-2026")).toBe("03-10-2026");
      expect(formatLiveDate(fixedDate, "Jan 01, 2026")).toBe("Oct 03, 2026");
      expect(formatLiveDate(fixedDate, "MM/DD/YYYY")).toBe("10/03/2026");
    });

    it("formats live times in 12-hour and 24-hour formats", () => {
      expect(formatLiveTime(fixedDate, "12 Hours", true)).toBe("03:06:10 PM");
      expect(formatLiveTime(fixedDate, "12 Hours", false)).toBe("03:06 PM");
      expect(formatLiveTime(fixedDate, "24 Hours", true)).toBe("15:06:10");
      expect(formatLiveTime(fixedDate, "24 Hours", false)).toBe("15:06");
    });

    it("calculates fiscal year cycle ending month based on starting month", () => {
      expect(getFiscalEndingMonth("January")).toBe("December");
      expect(getFiscalEndingMonth("April")).toBe("March");
      expect(getFiscalEndingMonth("July")).toBe("June");
      expect(getFiscalEndingMonth("October")).toBe("September");
    });
  });

  describe("UI Rendering and Interactions", () => {
    it("renders Localization title and sections from DreamsPOS design", () => {
      render(<LocalizationSettingsView />);

      expect(screen.getByRole("heading", { name: "Localization", level: 1 })).toBeDefined();
      expect(screen.getByText("Basic Information")).toBeDefined();
      expect(screen.getByText("Currency Settings")).toBeDefined();
      expect(screen.getByText("Language")).toBeDefined();
      expect(screen.getByText("Language Switcher")).toBeDefined();
      expect(screen.getByText("Timezone")).toBeDefined();
      expect(screen.getByText("Date format")).toBeDefined();
      expect(screen.getByText("Time Format")).toBeDefined();
      expect(screen.getByText("Financial Year")).toBeDefined();
      expect(screen.getByText("Starting Month")).toBeDefined();
      expect(screen.getByText("Currency")).toBeDefined();
      expect(screen.getByText("Currency Symbol")).toBeDefined();
      expect(screen.getByText("Currency Position")).toBeDefined();
    });

    it("displays initial values for Date format (01 Jan 2026), Time Format (12 Hours), Financial Year (2026), Starting Month (January)", () => {
      render(<LocalizationSettingsView />);

      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      
      const dateFormatSelect = selects.find((s) => s.value === "01 Jan 2026");
      expect(dateFormatSelect).toBeDefined();

      const timeFormatSelect = selects.find((s) => s.value === "12 Hours");
      expect(timeFormatSelect).toBeDefined();

      const financialYearSelect = selects.find((s) => s.value === "2026");
      expect(financialYearSelect).toBeDefined();

      const startingMonthSelect = selects.find((s) => s.value === "January");
      expect(startingMonthSelect).toBeDefined();
    });

    it("toggles the Language Switcher switch", () => {
      render(<LocalizationSettingsView />);

      const switcher = screen.getByRole("switch");
      expect(switcher.getAttribute("aria-checked")).toBe("true");

      fireEvent.click(switcher);
      expect(switcher.getAttribute("aria-checked")).toBe("false");
    });

    it("updates live preview amount when currency formatting is altered", async () => {
      render(<LocalizationSettingsView />);

      // Default amount check
      expect(screen.getByText("$1,250.75")).toBeDefined();

      // Change currency position to right
      const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
      const positionSelect = selects.find((s) =>
        Array.from(s.options).some((o) => o.value === "right")
      );
      expect(positionSelect).toBeDefined();

      if (positionSelect) {
        fireEvent.change(positionSelect, { target: { value: "right" } });
        expect(screen.getByText("1,250.75$")).toBeDefined();
      }
    });

    it("saves localization settings and updates backend", async () => {
      render(<LocalizationSettingsView />);

      const saveButtons = screen.getAllByRole("button", { name: /Save (Changes|Settings)/i });
      fireEvent.click(saveButtons[0]);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            currency_code: "USD",
            timezone: "UTC 5:30",
          })
        );
        expect(mockToast.success).toHaveBeenCalledWith("Localization settings saved successfully!");
      });
    });

    it("resets form when Reset button is clicked", () => {
      render(<LocalizationSettingsView />);

      const switcher = screen.getByRole("switch");
      fireEvent.click(switcher);
      expect(switcher.getAttribute("aria-checked")).toBe("false");

      const resetButton = screen.getByRole("button", { name: /Reset/i });
      fireEvent.click(resetButton);

      expect(switcher.getAttribute("aria-checked")).toBe("true");
      expect(mockToast.info).toHaveBeenCalledWith("Localization reset to default parameters.");
    });
  });
});
