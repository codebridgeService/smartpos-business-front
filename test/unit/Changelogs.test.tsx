import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { INITIAL_CHANGELOGS, ChangelogApi } from "@/lib/api/changelogs";

describe("Changelog Data & Configuration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("contains initial changelogs for key release versions including v1.2.2", () => {
    expect(INITIAL_CHANGELOGS.length).toBeGreaterThanOrEqual(5);

    const versions = INITIAL_CHANGELOGS.map((l) => l.version);
    expect(versions).toContain("v1.2.2");
    expect(versions).toContain("v1.2.1");
    expect(versions).toContain("v1.2.0");
    expect(versions).toContain("v1.1.0");
    expect(versions).toContain("v1.0.0");
  });

  it("covers FRONTEND, FULL_STACK, and SECURITY components", () => {
    const components = INITIAL_CHANGELOGS.map((l) => l.component);
    expect(components).toContain("FRONTEND");
    expect(components).toContain("FULL_STACK");
    expect(components).toContain("SECURITY");
  });

  it("has valid changelog item structure with bullet points for latest release", () => {
    const latest = INITIAL_CHANGELOGS[0];
    expect(latest.version).toBe("v1.2.2");
    expect(latest.title).toContain("Sidebar");
    expect(latest.summary).toBeDefined();
    expect(latest.changes_list).toBeInstanceOf(Array);
    expect(latest.changes_list?.length).toBeGreaterThan(0);
  });

  it("supports updating an existing changelog entry via ChangelogApi.updateChangelog", async () => {
    const initialLogs = await ChangelogApi.fetchChangelogs();
    expect(initialLogs.length).toBeGreaterThan(0);

    const target = initialLogs[0];
    const updated = await ChangelogApi.updateChangelog(target.id, {
      title: "Updated Title for Release",
      summary: "Updated summary text",
    });

    expect(updated.title).toBe("Updated Title for Release");
    expect(updated.summary).toBe("Updated summary text");

    const reloaded = await ChangelogApi.fetchChangelogs();
    const found = reloaded.find((l) => l.id === target.id);
    expect(found?.title).toBe("Updated Title for Release");
  });
});
