import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/context/theme-context";
import { ThemeCustomizerDrawer } from "@/components/layout/theme-customizer-drawer";

// Test component exposing useTheme values
function CustomizerInspector() {
  const {
    theme,
    setTheme,
    themeColor,
    setThemeColor,
    layoutMode,
    setLayoutMode,
    layoutWidth,
    setLayoutWidth,
    topBarColor,
    setTopBarColor,
    sidebarColor,
    setSidebarColor,
    isCustomizerOpen,
    setIsCustomizerOpen,
    resetCustomizer,
    getTopBarPreset,
    getSidebarPreset,
  } = useTheme();

  return (
    <div>
      <span data-testid="theme-mode">{theme}</span>
      <span data-testid="theme-color">{themeColor}</span>
      <span data-testid="layout-mode">{layoutMode}</span>
      <span data-testid="layout-width">{layoutWidth}</span>
      <span data-testid="topbar-color">{topBarColor}</span>
      <span data-testid="sidebar-color">{sidebarColor}</span>
      <span data-testid="topbar-dark">{getTopBarPreset().isDark ? "true" : "false"}</span>
      <span data-testid="sidebar-dark">{getSidebarPreset().isDark ? "true" : "false"}</span>
      <span data-testid="customizer-open">{isCustomizerOpen ? "open" : "closed"}</span>

      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setThemeColor("teal")}>Set Teal</button>
      <button onClick={() => setLayoutMode("mini")}>Set Mini</button>
      <button onClick={() => setLayoutMode("rtl")}>Set RTL</button>
      <button onClick={() => setLayoutWidth("boxed")}>Set Boxed</button>
      <button onClick={() => setTopBarColor("gradient-navy")}>Set Navy TopBar</button>
      <button onClick={() => setSidebarColor("blue")}>Set Blue Sidebar</button>
      <button onClick={() => setIsCustomizerOpen(true)}>Open Customizer</button>
      <button onClick={() => resetCustomizer()}>Reset</button>

      <ThemeCustomizerDrawer />
    </div>
  );
}

describe("Theme & Layout Customizer System", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("data-theme-color");
    document.documentElement.removeAttribute("data-layout-mode");
  });

  it("initializes with default layout and colors", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-color").textContent).toBe("orange");
    expect(screen.getByTestId("layout-mode").textContent).toBe("default");
    expect(screen.getByTestId("layout-width").textContent).toBe("fluid");
    expect(screen.getByTestId("topbar-color").textContent).toBe("white");
    expect(screen.getByTestId("sidebar-color").textContent).toBe("white");
    expect(screen.getByTestId("topbar-dark").textContent).toBe("false");
    expect(screen.getByTestId("sidebar-dark").textContent).toBe("false");
  });

  it("updates theme accent color and reflects on DOM", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set Teal"));
    });

    expect(screen.getByTestId("theme-color").textContent).toBe("teal");
    expect(document.documentElement.getAttribute("data-theme-color")).toBe("teal");
  });

  it("updates layout mode to mini and rtl, setting dir attribute", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set RTL"));
    });

    expect(screen.getByTestId("layout-mode").textContent).toBe("rtl");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");

    act(() => {
      fireEvent.click(screen.getByText("Set Mini"));
    });

    expect(screen.getByTestId("layout-mode").textContent).toBe("mini");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
  });

  it("updates layout width between fluid and boxed", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set Boxed"));
    });

    expect(screen.getByTestId("layout-width").textContent).toBe("boxed");
  });

  it("updates topbar and sidebar color presets and recognizes dark presets", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set Navy TopBar"));
      fireEvent.click(screen.getByText("Set Blue Sidebar"));
    });

    expect(screen.getByTestId("topbar-color").textContent).toBe("gradient-navy");
    expect(screen.getByTestId("sidebar-color").textContent).toBe("blue");
    expect(screen.getByTestId("topbar-dark").textContent).toBe("true");
    expect(screen.getByTestId("sidebar-dark").textContent).toBe("true");
  });

  it("opens drawer and renders customizer sections", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    expect(screen.queryByText("Customizer & Layouts")).toBeNull();

    act(() => {
      fireEvent.click(screen.getByText("Open Customizer"));
    });

    expect(screen.getByText("Customizer & Layouts")).toBeDefined();
    expect(screen.getByText("Select Layouts")).toBeDefined();
    expect(screen.getByText("Layout Width")).toBeDefined();
    expect(screen.getByText("Top Bar Color")).toBeDefined();
    expect(screen.getByText("Sidebar Color")).toBeDefined();
    expect(screen.getByText("Theme Mode")).toBeDefined();
    expect(screen.getByText("Theme Colors")).toBeDefined();
  });

  it("resets all customizations back to default values", () => {
    render(
      <ThemeProvider>
        <CustomizerInspector />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByText("Set Teal"));
      fireEvent.click(screen.getByText("Set Boxed"));
      fireEvent.click(screen.getByText("Set Navy TopBar"));
      fireEvent.click(screen.getByText("Set Blue Sidebar"));
    });

    expect(screen.getByTestId("theme-color").textContent).toBe("teal");
    expect(screen.getByTestId("layout-width").textContent).toBe("boxed");

    act(() => {
      fireEvent.click(screen.getByText("Reset"));
    });

    expect(screen.getByTestId("theme-color").textContent).toBe("orange");
    expect(screen.getByTestId("layout-mode").textContent).toBe("default");
    expect(screen.getByTestId("layout-width").textContent).toBe("fluid");
    expect(screen.getByTestId("topbar-color").textContent).toBe("white");
    expect(screen.getByTestId("sidebar-color").textContent).toBe("white");
  });
});
