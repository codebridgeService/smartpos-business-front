import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public auth routes that should only be accessible when not logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password"];

// Protected route prefixes that require valid authentication
const PROTECTED_PREFIXES = [
  "/admin",
  "/owner",
  "/pos",
  "/warehouses",
  "/businesses",
  "/settings",
];

// Specific roles allowed for owner portal (Store Owner only)
const OWNER_ROLES = ["owner", "business_owner", "store_owner"];

// Specific roles allowed for admin dashboard (System Admin only)
const ADMIN_ROLES = [
  "admin",
  "administrator",
  "super_admin",
  "superadmin",
];

function extractRolesFromToken(token?: string): string[] {
  if (!token) return [];
  try {
    const parts = token.split(".");
    if (parts.length < 2) return [];
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    const raw = payload.roles ?? payload.role ?? payload.user?.roles ?? payload.user?.role;
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list
      .map((r: any) => {
        if (!r) return "";
        if (typeof r === "string") return r.toLowerCase().trim();
        return (r?.code || r?.name || r?.slug || "").toLowerCase().trim();
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect legacy /admin/owner paths directly to /owner
  if (pathname === "/admin/owner" || pathname.startsWith("/admin/owner/")) {
    const target = pathname.replace(/^\/admin\/owner/, "/owner");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Read tokens from cookies (synced via tokenStorage)
  const accessToken = request.cookies.get("smartpos_access_token")?.value;
  const refreshToken = request.cookies.get("smartpos_refresh_token")?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

  // 3. Read synced user roles from cookies with JWT fallback
  const rolesCookie = request.cookies.get("smartpos_user_roles")?.value;
  let userRoles: string[] = [];
  if (rolesCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rolesCookie));
      if (Array.isArray(parsed)) {
        userRoles = parsed.map((r) => String(r).toLowerCase().trim());
      }
    } catch {
      userRoles = [];
    }
  }
  if (userRoles.length === 0 && accessToken) {
    userRoles = extractRolesFromToken(accessToken);
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Case A: User is already authenticated and visits login/register or root '/' -> redirect to their role's portal
  if ((isAuthRoute || pathname === "/") && isAuthenticated) {
    const hasOwnerRole = userRoles.some((role) => OWNER_ROLES.includes(role));
    if (hasOwnerRole) {
      const ownerUrl = new URL("/owner", request.url);
      return NextResponse.redirect(ownerUrl);
    }
    const hasAdminRole = userRoles.some((role) => ADMIN_ROLES.includes(role));
    if (hasAdminRole) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    const posUrl = new URL("/pos", request.url);
    return NextResponse.redirect(posUrl);
  }

  // Case B: User is unauthenticated and attempts to visit protected route -> redirect to login with return URL
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case C: Authenticated user accessing Owner Portal (/owner/*)
  // Strict rule: Admins without Owner role CANNOT access Owner pages
  const isOwnerRoute =
    pathname === "/owner" ||
    pathname.startsWith("/owner/");

  if (isOwnerRoute && isAuthenticated) {
    if (userRoles.length > 0) {
      const hasOwnerRole = userRoles.some((role) => OWNER_ROLES.includes(role));
      if (!hasOwnerRole) {
        // Admin or staff CANNOT access owner page -> redirect to admin dashboard
        const deniedUrl = new URL("/admin/dashboard", request.url);
        deniedUrl.searchParams.set("error", "owner_role_required");
        return NextResponse.redirect(deniedUrl);
      }
    }
  }

  // Case D: Authenticated user accessing Admin Section (/admin/*)
  // Strict rule: Owners CANNOT access Admin pages (Admins only)
  if (pathname.startsWith("/admin") && isAuthenticated) {
    if (userRoles.length > 0) {
      const hasAdminRole = userRoles.some((role) => ADMIN_ROLES.includes(role));
      if (!hasAdminRole) {
        // If user is owner, redirect directly to /owner
        const hasOwnerRole = userRoles.some((role) => OWNER_ROLES.includes(role));
        if (hasOwnerRole) {
          const ownerUrl = new URL("/owner", request.url);
          ownerUrl.searchParams.set("error", "admin_role_required");
          return NextResponse.redirect(ownerUrl);
        }
        const deniedUrl = new URL("/pos", request.url);
        deniedUrl.searchParams.set("error", "admin_role_required");
        return NextResponse.redirect(deniedUrl);
      }
    }
  }

  // Allow the request to proceed with security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset extensions (svg, png, jpg, webp, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
