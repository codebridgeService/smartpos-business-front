import type { User } from "@/types";

/**
 * Normalizes and extracts role codes from a user object.
 * Returns an array of lowercase role codes (e.g., ['admin', 'owner']).
 */
export function getUserRoleCodes(user: User | any): string[] {
  if (!user) {
    return [];
  }

  const list: string[] = [];

  if (
    user.is_owner === true ||
    user.is_owner === 1 ||
    user.is_owner === "1" ||
    user.is_owner === "true"
  ) {
    list.push("owner");
  }

  const rawRoles = user.roles ?? user.role;
  if (rawRoles) {
    const rolesList = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    for (const role of rolesList) {
      if (!role) continue;
      if (typeof role === "string") {
        list.push(role.toLowerCase().trim());
      } else {
        const code = (role?.code || role?.name || role?.slug || "").toLowerCase().trim();
        if (code) list.push(code);
      }
    }
  }

  return Array.from(new Set(list));
}

/**
 * Checks if the user possesses any of the specified roles.
 *
 * @param user - The authenticated user object
 * @param allowedRoles - A single role code or array of role codes to check against
 * @returns boolean indicating if the user has at least one of the roles
 */
export function hasRole(
  user: User | null,
  allowedRoles: string | string[]
): boolean {
  if (!user) return false;

  const userRoles = getUserRoleCodes(user);
  const targetRoles = (
    Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  ).map((r) => r.toLowerCase().trim());

  return userRoles.some((role) => targetRoles.includes(role));
}

/**
 * Specifically verifies if the user has an 'admin' or 'owner' role.
 * Also accounts for common aliases like 'administrator' or 'super_admin'.
 */
export function isAdminOrOwner(user: User | null): boolean {
  return hasRole(user, ["admin", "owner", "administrator", "super_admin", "superadmin"]);
}

/**
 * Specifically verifies if the user has the 'owner' role or ownership flag.
 */
export function isOwner(user: User | any): boolean {
  if (!user) return false;
  if (
    user.is_owner === true ||
    user.is_owner === 1 ||
    user.is_owner === "1" ||
    user.is_owner === "true"
  ) {
    return true;
  }
  return hasRole(user, ["owner", "business_owner", "store_owner"]);
}

/**
 * Specifically verifies if the user has an 'admin' role.
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ["admin", "administrator", "super_admin", "superadmin"]);
}

/**
 * Specifically verifies if the user has a 'cashier' or dedicated POS operator role.
 * Does NOT include general store staff or inventory staff.
 */
export function isCashier(user: User | any): boolean {
  if (!user) return false;
  return hasRole(user, [
    "cashier",
    "pos",
    "pos_operator",
    "store_cashier",
    "terminal_operator",
    "pos_cashier",
    "teller",
  ]);
}

/**
 * Specifically verifies if the user has a general store staff role.
 */
export function isStaff(user: User | any): boolean {
  if (!user) return false;
  return hasRole(user, ["staff", "store_staff", "employee"]);
}

/**
 * Checks if the user has a specific permission by code.
 */
export function hasPermission(
  user: User | any,
  permissionCode: string
): boolean {
  if (!user || !permissionCode) return false;

  const targetCode = permissionCode.toLowerCase().trim();
  if (!targetCode) return false;

  // 1. Check direct user permissions (both object or string array formats)
  if (user.permissions && Array.isArray(user.permissions)) {
    const directMatch = user.permissions.some((p: any) => {
      if (!p) return false;
      const code = typeof p === "string" ? p : p.code || p.name || "";
      return code.toLowerCase().trim() === targetCode;
    });
    if (directMatch) return true;
  }

  // 2. Check permissions nested inside user roles
  if (user.roles && Array.isArray(user.roles)) {
    for (const role of user.roles) {
      if (!role || typeof role === "string") continue;
      if (role.permissions && Array.isArray(role.permissions)) {
        const roleMatch = role.permissions.some((p: any) => {
          if (!p) return false;
          const code = typeof p === "string" ? p : p.code || p.name || "";
          return code.toLowerCase().trim() === targetCode;
        });
        if (roleMatch) return true;
      }
    }
  }

  return false;
}
