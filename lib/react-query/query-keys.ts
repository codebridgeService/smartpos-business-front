/**
 * Centralized, type-safe Query Key factory for TanStack Query in SmartPOS.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  businesses: {
    all: ["businesses"] as const,
    lists: () => [...queryKeys.businesses.all, "list"] as const,
    list: (params?: { search?: string; status?: string }) =>
      params ? ([...queryKeys.businesses.lists(), params] as const) : queryKeys.businesses.lists(),
    details: () => [...queryKeys.businesses.all, "detail"] as const,
    detail: (uuid: string) => [...queryKeys.businesses.details(), uuid] as const,
    settings: (uuid: string) => [...queryKeys.businesses.detail(uuid), "settings"] as const,
  },
  outlets: {
    all: ["outlets"] as const,
    lists: () => [...queryKeys.outlets.all, "list"] as const,
    list: (businessUuid?: string) =>
      businessUuid ? ([...queryKeys.outlets.lists(), businessUuid] as const) : queryKeys.outlets.lists(),
    details: () => [...queryKeys.outlets.all, "detail"] as const,
    detail: (uuid: string) => [...queryKeys.outlets.details(), uuid] as const,
  },
  registers: {
    all: ["registers"] as const,
    lists: () => [...queryKeys.registers.all, "list"] as const,
    list: (outletUuid?: string) =>
      outletUuid ? ([...queryKeys.registers.lists(), outletUuid] as const) : queryKeys.registers.lists(),
    details: () => [...queryKeys.registers.all, "detail"] as const,
    detail: (uuid: string) => [...queryKeys.registers.details(), uuid] as const,
  },
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.products.lists(), params] as const) : queryKeys.products.lists(),
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (uuid: string) => [...queryKeys.products.details(), uuid] as const,
    categories: (businessId?: string | number) =>
      businessId ? ([...queryKeys.products.all, "categories", businessId] as const) : ([...queryKeys.products.all, "categories"] as const),
    brands: (businessId?: string | number) =>
      businessId ? ([...queryKeys.products.all, "brands", businessId] as const) : ([...queryKeys.products.all, "brands"] as const),
    units: (businessId?: string | number) =>
      businessId ? ([...queryKeys.products.all, "units", businessId] as const) : ([...queryKeys.products.all, "units"] as const),
  },
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.users.lists(), params] as const) : queryKeys.users.lists(),
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (uuid: string) => [...queryKeys.users.details(), uuid] as const,
  },
  businessUsers: {
    all: ["business-users"] as const,
    lists: () => [...queryKeys.businessUsers.all, "list"] as const,
    list: (businessUuid: string, params?: { role?: string; is_owner?: boolean; user_uuid?: string }) =>
      params
        ? ([...queryKeys.businessUsers.lists(), businessUuid, params] as const)
        : ([...queryKeys.businessUsers.lists(), businessUuid] as const),
    details: () => [...queryKeys.businessUsers.all, "detail"] as const,
    detail: (businessUuid: string, businessUserUuid: string) =>
      [...queryKeys.businessUsers.details(), businessUuid, businessUserUuid] as const,
    owner: (businessUuid: string) => [...queryKeys.businessUsers.all, "owner", businessUuid] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (params?: { business_uuid?: string | null; is_system?: boolean; page?: number; per_page?: number }) =>
      params ? ([...queryKeys.roles.lists(), params] as const) : queryKeys.roles.lists(),
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (uuid: string) => [...queryKeys.roles.details(), uuid] as const,
    users: (roleUuidOrCode: string) => [...queryKeys.roles.detail(roleUuidOrCode), "users"] as const,
  },
  permissions: {
    all: ["permissions"] as const,
    lists: () => [...queryKeys.permissions.all, "list"] as const,
    list: (params?: { per_page?: number; page?: number }) =>
      params ? ([...queryKeys.permissions.lists(), params] as const) : queryKeys.permissions.lists(),
    allList: () => [...queryKeys.permissions.all, "all"] as const,
  },
  shifts: {
    all: ["shifts"] as const,
    lists: () => [...queryKeys.shifts.all, "list"] as const,
    list: (outletUuid: string, registerUuid: string) =>
      [...queryKeys.shifts.lists(), outletUuid, registerUuid] as const,
    current: (outletUuid?: string, registerUuid?: string) =>
      outletUuid && registerUuid
        ? ([...queryKeys.shifts.all, "current", outletUuid, registerUuid] as const)
        : ([...queryKeys.shifts.all, "current"] as const),
  },
  drawers: {
    all: ["drawers"] as const,
    detail: (drawerUuid: string) => [...queryKeys.drawers.all, "detail", drawerUuid] as const,
    movements: (drawerUuid: string) => [...queryKeys.drawers.all, "movements", drawerUuid] as const,
  },
  security: {
    all: ["security"] as const,
    events: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.security.all, "events", params] as const) : ([...queryKeys.security.all, "events"] as const),
    event: (uuid: string) => [...queryKeys.security.all, "event", uuid] as const,
  },
} as const;
