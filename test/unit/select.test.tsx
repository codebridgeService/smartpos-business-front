import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Select } from "@/components/ui/select";

describe("Select Component", () => {
  it("renders correctly with options", () => {
    render(
      <Select
        label="Role"
        options={[
          { value: "admin", label: "Administrator" },
          { value: "manager", label: "Branch Manager" },
        ]}
      />
    );

    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByText("Administrator")).toBeDefined();
    expect(screen.getByText("Branch Manager")).toBeDefined();
  });

  it("handles duplicate option values without React duplicate key warnings", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <Select
        label="Role"
        options={[
          { value: "owner", label: "Business Owner" },
          { value: "owner", label: "Store Owner" },
          { value: "cashier", label: "Cashier" },
        ]}
      />
    );

    expect(screen.getByRole("combobox")).toBeDefined();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    // Ensure React did not log a key collision error
    const keyErrors = errorSpy.mock.calls.filter((call) =>
      call.some((arg) => typeof arg === "string" && arg.includes("same key"))
    );
    expect(keyErrors).toHaveLength(0);

    errorSpy.mockRestore();
  });

  it("renders error message and helper text properly", () => {
    const { rerender } = render(
      <Select label="Role" helperText="Choose an option" />
    );
    expect(screen.getByText("Choose an option")).toBeDefined();

    rerender(<Select label="Role" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeDefined();
  });
});
