import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SwipeButton } from "@/components/ui/swipe-button";

describe("SwipeButton Component", () => {
  it("renders with default labels and attributes", () => {
    const onConfirm = vi.fn();
    render(<SwipeButton onConfirm={onConfirm} label="Swipe to Confirm" />);

    expect(screen.getByText("Swipe to Confirm")).toBeDefined();
    const slider = screen.getByRole("slider");
    expect(slider).toBeDefined();
    expect(slider.getAttribute("aria-valuenow")).toBe("0");
  });

  it("triggers confirmation on Enter or Space key press", async () => {
    const onConfirm = vi.fn();
    render(<SwipeButton onConfirm={onConfirm} label="Swipe to Apply" />);

    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "Enter" });

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("does not trigger confirmation when disabled", () => {
    const onConfirm = vi.fn();
    render(<SwipeButton onConfirm={onConfirm} label="Swipe to Apply" disabled />);

    const slider = screen.getByRole("slider");
    fireEvent.keyDown(slider, { key: "Enter" });

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("displays loading label when isLoading is true", () => {
    const onConfirm = vi.fn();
    render(<SwipeButton onConfirm={onConfirm} isLoading loadingLabel="Processing..." />);

    expect(screen.getByText("Processing...")).toBeDefined();
  });

  it("displays success label when isSuccess is true", () => {
    const onConfirm = vi.fn();
    render(<SwipeButton onConfirm={onConfirm} isSuccess successLabel="Completed!" />);

    expect(screen.getByText("Completed!")).toBeDefined();
  });
});
