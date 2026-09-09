import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { INITIAL_CHANGELOGS } from "@/lib/api/changelogs";

describe("Changelog Data & Configuration", () => {
  it("contains initial changelogs for key release versions", () => {
    expect(INITIAL_CHANGELOGS.length).toBeGreaterThanOrEqual(4);

    const versions = INITIAL_CHANGELOGS.map((l) => l.version);
    expect(versions).toContain("v1.2.1");
    expect(versions).toContain("v1.2.0");
    expect(versions).toContain("v1.1.0");
    expect(versions).toContain("v1.0.0");
  });

  it("covers both FRONTEND and FULL_STACK components", () => {
    const components = INITIAL_CHANGELOGS.map((l) => l.component);
    expect(components).toContain("FRONTEND");
    expect(components).toContain("FULL_STACK");
    expect(components).toContain("SECURITY");
  });

  it("has valid changelog item structure with bullet points", () => {
    const latest = INITIAL_CHANGELOGS[0];
    expect(latest.title).toBeDefined();
    expect(latest.summary).toBeDefined();
    expect(latest.changes_list).toBeInstanceOf(Array);
    expect(latest.changes_list?.length).toBeGreaterThan(0);
  });
});
