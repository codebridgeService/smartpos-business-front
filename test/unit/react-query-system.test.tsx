import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryProvider } from "@/lib/react-query/query-provider";
import { getQueryClient } from "@/lib/react-query/query-client";
import { queryKeys } from "@/lib/react-query/query-keys";
import {
  useUsersQuery,
  useBusinessUsersQuery,
  useRolesQuery,
  useAllPermissionsQuery,
  useRegistersQuery,
  useProductsQuery,
  useProductCategoriesQuery,
  useCurrentShiftQuery,
  useSecurityEventsQuery,
} from "@/lib/react-query";
import { usersApi } from "@/lib/api/users";
import { businessUsersApi } from "@/lib/api/business-users";
import { rolesApi } from "@/lib/api/roles";
import { permissionsApi } from "@/lib/api/permissions";
import { registersApi } from "@/lib/api/registers";
import { productsApi } from "@/lib/api/products";
import { shiftsApi } from "@/lib/api/shifts";
import { securityEventsApi } from "@/lib/api/security-events";

vi.mock("@/lib/api/users");
vi.mock("@/lib/api/business-users");
vi.mock("@/lib/api/roles");
vi.mock("@/lib/api/permissions");
vi.mock("@/lib/api/registers");
vi.mock("@/lib/api/products");
vi.mock("@/lib/api/shifts");
vi.mock("@/lib/api/security-events");

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryProvider>{children}</QueryProvider>
);

describe("System-wide TanStack Query Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getQueryClient().clear();
  });

  it("useUsersQuery fetches and caches user paginator", async () => {
    const mockPaginator = {
      data: [{ id: 1, uuid: "user-1", name: "Alice", email: "alice@test.com" }],
      current_page: 1,
      total: 1,
    };
    vi.mocked(usersApi.getUsers).mockResolvedValueOnce(mockPaginator as any);

    const { result } = renderHook(() => useUsersQuery({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].name).toBe("Alice");
    expect(usersApi.getUsers).toHaveBeenCalledTimes(1);
  });

  it("useBusinessUsersQuery fetches staff members for a business", async () => {
    const mockStaff = [{ id: 10, uuid: "bu-1", business_id: 1, user_uuid: "u-1", role: "cashier" }];
    vi.mocked(businessUsersApi.getBusinessUsers).mockResolvedValueOnce(mockStaff as any);

    const { result } = renderHook(() => useBusinessUsersQuery("biz-uuid-100"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].role).toBe("cashier");
  });

  it("useRolesQuery fetches roles list", async () => {
    const mockRoles = [{ id: 1, uuid: "role-1", name: "Manager", code: "manager" }];
    vi.mocked(rolesApi.getRoles).mockResolvedValueOnce(mockRoles as any);

    const { result } = renderHook(() => useRolesQuery({ business_uuid: "biz-1" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockRoles);
  });

  it("useAllPermissionsQuery fetches system permissions", async () => {
    const mockPermissions = [{ id: 1, code: "sales.create", name: "Create Sales", module: "sales" }];
    vi.mocked(permissionsApi.getAllPermissions).mockResolvedValueOnce(mockPermissions as any);

    const { result } = renderHook(() => useAllPermissionsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].code).toBe("sales.create");
  });

  it("useRegistersQuery fetches registers for an outlet", async () => {
    const mockRegisters = [{ id: 1, uuid: "reg-1", name: "Front Counter 1", code: "REG-01" }];
    vi.mocked(registersApi.getRegisters).mockResolvedValueOnce(mockRegisters as any);

    const { result } = renderHook(() => useRegistersQuery("outlet-123"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].name).toBe("Front Counter 1");
  });

  it("useProductsQuery and useProductCategoriesQuery fetch product catalog", async () => {
    const mockProductsPaginator = {
      data: [{ id: 1, uuid: "prod-1", name: "Espresso", sku: "ESP-001" }],
      current_page: 1,
      total: 1,
    };
    const mockCategories = [{ id: 1, uuid: "cat-1", name: "Coffee" }];

    vi.mocked(productsApi.getProducts).mockResolvedValueOnce(mockProductsPaginator as any);
    vi.mocked(productsApi.getCategories).mockResolvedValueOnce(mockCategories as any);

    const { result: prodResult } = renderHook(() => useProductsQuery(), { wrapper });
    const { result: catResult } = renderHook(() => useProductCategoriesQuery(), { wrapper });

    await waitFor(() => expect(prodResult.current.isSuccess).toBe(true));
    await waitFor(() => expect(catResult.current.isSuccess).toBe(true));

    expect(prodResult.current.data?.data[0].name).toBe("Espresso");
    expect(catResult.current.data?.[0].name).toBe("Coffee");
  });

  it("useCurrentShiftQuery fetches active register shift", async () => {
    const mockShift = { id: 1, register_id: 5, opening_cash: "100.00", status: "open" };
    vi.mocked(shiftsApi.getCurrentShift).mockResolvedValueOnce(mockShift as any);

    const { result } = renderHook(() => useCurrentShiftQuery("outlet-1", "reg-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.status).toBe("open");
  });

  it("useSecurityEventsQuery fetches forensic security events", async () => {
    const mockEvents = {
      data: [{ id: 1, uuid: "sec-1", event_type: "auth.login_success", severity: "info" }],
      current_page: 1,
      total: 1,
    };
    vi.mocked(securityEventsApi.getSecurityEvents).mockResolvedValueOnce(mockEvents as any);

    const { result } = renderHook(() => useSecurityEventsQuery({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].event_type).toBe("auth.login_success");
  });
});
