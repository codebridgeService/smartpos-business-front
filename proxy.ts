import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public auth routes that should only be accessible when not logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

// Protected route prefixes that require valid authentication
const PROTECTED_PREFIXES = [
  "/admin",
  "/owner",
  "/pos",
  "/warehouses",
  "/businesses",
  "/settings",
  "/outlets",
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

function extractUserUuidFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.user_uuid || payload.sub || null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect legacy /admin/owner or /owner paths directly to /businesses
  if (
    pathname === "/admin/owner" ||
    pathname.startsWith("/admin/owner/") ||
    pathname === "/owner" ||
    pathname.startsWith("/owner/")
  ) {
    const subpath = pathname.replace(/^\/admin\/owner/, "").replace(/^\/owner/, "");
    const target = subpath ? `/businesses${subpath}` : "/businesses";
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
      } else if (typeof parsed === "string") {
        userRoles = [parsed.toLowerCase().trim()];
      }
    } catch {
      userRoles = decodeURIComponent(rolesCookie)
        .split(",")
        .map((r) => r.toLowerCase().trim())
        .filter(Boolean);
    }
  }
  if (userRoles.length === 0 && accessToken) {
    userRoles = extractRolesFromToken(accessToken);
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // Case A: User is already authenticated and visits login/register or root '/' -> redirect to their role's portal
  if ((isAuthRoute || pathname === "/") && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/auth/")) {
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
    const hasAdminRole = userRoles.some((role) => ADMIN_ROLES.includes(role));
    if (hasAdminRole) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    const hasOwnerRole = userRoles.some((role) => OWNER_ROLES.includes(role));
    if (hasOwnerRole) {
      const ownerUrl = new URL("/businesses", request.url);
      return NextResponse.redirect(ownerUrl);
    }
    const posUrl = new URL("/pos", request.url);
    return NextResponse.redirect(posUrl);
  }

  // Case B: User is unauthenticated and attempts to visit protected route -> redirect to login with return URL
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    const destination = pathname + (request.nextUrl.search || "");
    loginUrl.searchParams.set("redirect", destination);
    return NextResponse.redirect(loginUrl);
  }

  // Case C: Authenticated user accessing Owner Root Portal (/businesses, /businesses/*, or /owner/*)
  // Strict rule: Admins CANNOT access Business Portal (Owners only)
  // For specific tenant routes (/businesses/:id/*), any authenticated user can access (checks auth only).
  const isTenantIdRoute = /^\/businesses\/[0-9a-fA-F-]{36}(\/.*)?$/.test(pathname);
  const isOwnerRootPortal =
    pathname === "/owner" ||
    pathname.startsWith("/owner/") ||
    (pathname.startsWith("/businesses") && !isTenantIdRoute);

  if (isOwnerRootPortal && isAuthenticated) {
    if (userRoles.length > 0) {
      const hasOwnerRole = userRoles.some((role) => OWNER_ROLES.includes(role));
      if (!hasOwnerRole) {
        // If user is admin, strictly redirect back to /admin/dashboard
        const hasAdminRole = userRoles.some((role) => ADMIN_ROLES.includes(role));
        if (hasAdminRole) {
          const deniedUrl = new URL("/admin/dashboard", request.url);
          deniedUrl.searchParams.set("error", "owner_role_required");
          return NextResponse.redirect(deniedUrl);
        }
        // Regular staff/cashier without owner role -> redirect to POS terminal
        const posUrl = new URL("/pos", request.url);
        posUrl.searchParams.set("error", "owner_role_required");
        return NextResponse.redirect(posUrl);
      }
    }
  }

  // Case D: Authenticated user accessing Admin Section (/admin/*)
  // Strict rule: Owners CANNOT access Admin pages (Admins only)
  if (pathname.startsWith("/admin") && isAuthenticated) {
    if (userRoles.length > 0) {
      const hasAdminRole = userRoles.some((role) => ADMIN_ROLES.includes(role));
      if (!hasAdminRole) {
        // If user is owner, strictly redirect directly to /businesses/dashboard
        const hasOwnerRole = userRoles.some((role) => OWNER_ROLES.includes(role));
        if (hasOwnerRole) {
          const ownerUrl = new URL("/businesses/dashboard", request.url);
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

// Aliases for compatibility across Next.js conventions
export { proxy as middleware };
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes including /api/proxy)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset extensions (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
