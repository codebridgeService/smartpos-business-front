/**
 * Mapping between Next.js frontend route paths and Feature Keys
 */

export interface RouteFeatureConfig {
  key: string;
  name: string;
  module: string;
  description: string;
}

export const ROUTE_FEATURE_MAP: Record<string, RouteFeatureConfig> = {
  // /admin/dashboard is handled directly by FeatureGuard inside AdminDashboardPage
  "/admin/users": {
    key: "users.management",
    name: "Users Management",
    module: "System & Governance",
    description: "User account directory, status changes, and staff credentials.",
  },
  "/admin/roles": {
    key: "roles.rbac",
    name: "Roles & RBAC",
    module: "System & Governance",
    description: "Role creation, permission matrix binding, and staff access controls.",
  },
  "/admin/permissions": {
    key: "roles.permissions",
    name: "Permissions Directory",
    module: "System & Governance",
    description: "System-wide permissions matrix and capability configuration.",
  },
  "/admin/companies": {
    key: "admin.companies",
    name: "Companies & Tenants",
    module: "Multi-Tenant",
    description: "Company tenant directory, billing states, and owner assignments.",
  },
  "/admin/businesses": {
    key: "admin.businesses",
    name: "Store Outlets & Registers",
    module: "Operations",
    description: "Physical business locations, POS registers, and terminal device bindings.",
  },
  "/admin/warehouses": {
    key: "warehouses.management",
    name: "Warehouse Multi-Hub Management",
    module: "Operations & Store",
    description: "Multi-location bin storage, inter-store transfer orders, and cycle counts.",
  },
  "/admin/purchase-transaction": {
    key: "purchase.transaction",
    name: "Purchase Transactions & Invoices",
    module: "Finance & Accounting",
    description: "Supplier purchasing, PO issuance, and accounts payable vouchers.",
  },
  "/admin/subscriptions": {
    key: "admin.subscriptions",
    name: "Subscriptions & Billing",
    module: "Finance & Billing",
    description: "Tenant tier subscriptions, renewal tracking, and license keys.",
  },
  "/admin/packages": {
    key: "admin.packages",
    name: "SaaS Subscription Packages",
    module: "System & Governance",
    description: "Pricing tiers, feature caps, and storage limits.",
  },
  "/admin/domain": {
    key: "admin.domain",
    name: "Custom Domains & DNS",
    module: "Infrastructure",
    description: "Custom hostname bindings and SSL certificate provisioning.",
  },
  "/admin/pos": {
    key: "pos.terminal",
    name: "Point of Sale (POS) Terminal",
    module: "POS & Registers",
    description: "High-speed barcode scanner checkout, cash drawer kick, and ESC/POS thermal printing.",
  },
  "/businesses": {
    key: "businesses.master",
    name: "Store Operations & Businesses",
    module: "Operations",
    description: "Store branch settings, daily register shifts, and inventory overview.",
  },
  "/pos": {
    key: "pos.terminal",
    name: "Point of Sale (POS) Terminal",
    module: "POS & Registers",
    description: "Cashier checkout terminal, barcode scanner, and customer receipt printing.",
  },
};

/**
 * Resolves a URL pathname to its corresponding feature key configuration.
 * Always allows admin control pages (feature-controls, announcements) to bypass check.
 */
export function getFeatureConfigForPath(pathname: string): RouteFeatureConfig | null {
  // Always allow admin control pages so admins can fix/reopen features
  if (
    pathname.startsWith("/admin/system/feature-controls") ||
    pathname.startsWith("/admin/announcements") ||
    pathname.startsWith("/auth/") ||
    pathname === "/"
  ) {
    return null;
  }

  // Exact match
  if (ROUTE_FEATURE_MAP[pathname]) {
    return ROUTE_FEATURE_MAP[pathname];
  }

  // Prefix match (longest matching prefix first)
  const sortedPrefixes = Object.keys(ROUTE_FEATURE_MAP).sort(
    (a, b) => b.length - a.length
  );

  for (const prefix of sortedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return ROUTE_FEATURE_MAP[prefix];
    }
  }

  return null;
}
