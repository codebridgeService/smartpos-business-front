import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils/image";

describe("Avatar Component", () => {
  it("renders initials fallback when src is not provided", () => {
    render(<Avatar name="Alice Walker" />);
    expect(screen.getByText("AW")).toBeDefined();
  });

  it("renders single initial when single name is provided", () => {
    render(<Avatar name="Admin" />);
    expect(screen.getByText("A")).toBeDefined();
  });

  it("renders fallback initial 'U' when no name or src is provided", () => {
    render(<Avatar />);
    expect(screen.getByText("U")).toBeDefined();
  });

  it("renders image tag when src is provided", () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="Jane Doe" />);
    const img = screen.getByAltText("Jane Doe") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.src).toBe("https://example.com/avatar.jpg");
  });

  it("falls back to initials if image errors", () => {
    render(<Avatar src="https://example.com/broken.jpg" name="Bob Ross" />);
    const img = screen.getByAltText("Bob Ross");
    fireEvent.error(img);
    expect(screen.getByText("BR")).toBeDefined();
  });

  it("renders emerald status dot when status is active", () => {
    const { container } = render(<Avatar name="Alice" status="active" />);
    const dot = container.querySelector(".bg-emerald-500");
    expect(dot).not.toBeNull();
  });

  it("renders rose status dot when status is blocked", () => {
    const { container } = render(<Avatar name="Alice" status="blocked" />);
    const dot = container.querySelector(".bg-rose-500");
    expect(dot).not.toBeNull();
  });

  it("renders neutral status dot when status is inactive", () => {
    const { container } = render(<Avatar name="Alice" status="inactive" />);
    const dot = container.querySelector(".bg-neutral-400");
    expect(dot).not.toBeNull();
  });

  it("includes Last Login and Last Login IP in avatar title tooltip", () => {
    const loginDate = "2026-09-10T08:00:00.000Z";
    const ip = "192.168.1.50";
    const { container } = render(
      <Avatar name="Alice" status="active" lastLoginAt={loginDate} lastLoginIp={ip} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.title).toContain("Alice");
    expect(wrapper.title).toContain("Status: active");
    expect(wrapper.title).toContain("Last Login:");
    expect(wrapper.title).toContain(`IP: ${ip}`);
  });
});

describe("getAvatarUrl utility", () => {
  it("returns null when no avatar or avatar_url is provided", () => {
    expect(getAvatarUrl(null, null)).toBeNull();
    expect(getAvatarUrl("", "")).toBeNull();
    expect(getAvatarUrl(undefined, undefined)).toBeNull();
  });

  it("returns avatar_url directly when it is a full https URL", () => {
    const url = "https://example.com/avatar.webp";
    expect(getAvatarUrl(url, "avatars/old.webp")).toBe(url);
  });

  it("resolves relative storage path when avatar_url is not provided", () => {
    const resolved = getAvatarUrl(null, "avatars/photo.jpg");
    expect(resolved).toContain("avatars/photo.jpg");
    expect(resolved?.startsWith("http")).toBe(true);
  });

  it("rewrites localhost avatar_url to API host origin if API host is remote", () => {
    const localhostUrl = "http://localhost/storage/avatars/user.webp";
    const resolved = getAvatarUrl(localhostUrl, null);
    expect(resolved).not.toContain("localhost");
    expect(resolved).toContain("storage/avatars/user.webp");
  });
});
