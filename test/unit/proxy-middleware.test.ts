import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "../../proxy";

function createMockRequest(url: string, cookies: Record<string, string> = {}) {
  const req = new NextRequest(url);
  for (const [key, value] of Object.entries(cookies)) {
    req.cookies.set(key, value);
  }
  return req;
}

describe("Next.js Proxy / Middleware", () => {
  it("has matcher configured with api, static files, and image exclusions", () => {
    expect(config.matcher).toBeDefined();
    expect(config.matcher[0]).toContain("api");
    expect(config.matcher[0]).toContain("_next/static");
    expect(config.matcher[0]).toContain("_next/image");
    expect(config.matcher[0]).toContain("favicon.ico");
  });

  it("redirects unauthenticated users from /admin to /auth/login with redirect query param", () => {
    const req = createMockRequest("http://localhost:3000/admin/dashboard");
    const res = proxy(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toBe("http://localhost:3000/auth/login?redirect=%2Fadmin%2Fdashboard");
  });

  it("redirects legacy /admin/owner paths directly to /businesses", () => {
    const req = createMockRequest("http://localhost:3000/admin/owner/settings");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/businesses/settings");
  });

  it("redirects authenticated admin visiting /auth/login to /admin/dashboard", () => {
    const req = createMockRequest("http://localhost:3000/auth/login", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["admin"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/admin/dashboard");
  });

  it("redirects authenticated owner visiting /auth/login to /businesses", () => {
    const req = createMockRequest("http://localhost:3000/auth/login", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["owner"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/businesses");
  });

  it("prevents non-admin user (e.g. owner) from accessing /admin and redirects to /businesses", () => {
    const req = createMockRequest("http://localhost:3000/admin/dashboard", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["owner"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/businesses?error=admin_role_required");
  });

  it("allows valid admin access to /admin with security headers", () => {
    const req = createMockRequest("http://localhost:3000/admin/dashboard", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["super_admin"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("strictly prevents admin user from accessing /businesses portal and redirects to /admin/dashboard", () => {
    const req = createMockRequest("http://localhost:3000/businesses", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["admin"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/admin/dashboard?error=owner_role_required");
  });

  it("allows valid owner access to /businesses portal with security headers", () => {
    const req = createMockRequest("http://localhost:3000/businesses", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["owner"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("redirects cashier without owner role from /businesses to /pos", () => {
    const req = createMockRequest("http://localhost:3000/businesses", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["cashier"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/pos?error=owner_role_required");
  });

  it("allows authenticated admin to access /businesses/:id/outlets checking auth only", () => {
    const req = createMockRequest("http://localhost:3000/businesses/b1e95b06-5a48-43d9-9529-61b6f00cf02c/outlets", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["admin"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("allows authenticated cashier to access /businesses/:id/pos checking auth only", () => {
    const req = createMockRequest("http://localhost:3000/businesses/b1e95b06-5a48-43d9-9529-61b6f00cf02c/pos", {
      smartpos_access_token: "mock-token",
      smartpos_user_roles: JSON.stringify(["cashier"]),
    });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });

  it("redirects unauthenticated user from /businesses/:id/outlets to /auth/login with redirect query param", () => {
    const req = createMockRequest("http://localhost:3000/businesses/b1e95b06-5a48-43d9-9529-61b6f00cf02c/outlets");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/auth/login?redirect=%2Fbusinesses%2Fb1e95b06-5a48-43d9-9529-61b6f00cf02c%2Foutlets"
    );
  });
});
