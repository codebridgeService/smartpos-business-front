import { describe, it, expect, vi, beforeEach } from "vitest";
import { businessesApi } from "@/lib/api/businesses";
import { useBusinessStore } from "@/stores/useBusinessStore";
import { apiClient } from "@/lib/api/client";
import type { Business, BusinessSetting, StoreBusinessResponse } from "@/types";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Businesses Module", () => {
  const mockBusiness: Business = {
    id: 1,
    uuid: "biz-test-uuid-1",
    name: "Freshmart Supermarket",
    code: "freshmart",
    legal_name: "Freshmart Co., Ltd.",
    phone: "+85512345678",
    email: "info@freshmart.com",
    tax_number: "K001-987654",
    registration_number: "REG-1234",
    logo_path: null,
    logo_url: null,
    website: null,
    description: null,
    address: "123 Street, Phnom Penh",
    city: "Phnom Penh",
    province: null,
    postal_code: "12000",
    country_code: "KH",
    currency_code: "USD",
    default_currency: "USD",
    currency_symbol: "$",
    receipt_header: "Welcome to Freshmart",
    receipt_footer: "Thank you for shopping with us",
    tax_rate: "10.00",
    is_tax_inclusive: false,
    timezone: "Asia/Phnom_Penh",
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    outlets_count: 2,
    registers_count: 3,
    pos_devices_count: 3,
  };

  const mockSettings: BusinessSetting = {
    id: 1,
    business_id: 1,
    receipt_prefix: "REC",
    currency_code: "USD",
    timezone: "Asia/Phnom_Penh",
    tax_enabled: true,
    default_tax_percent: "10.00",
    allow_negative_stock: false,
    allow_discount: true,
    max_discount_percent: "20.00",
    auto_lock_minutes: 15,
    receipt_footer: "Thank you for shopping with us",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useBusinessStore.setState({
      businesses: [],
      selectedBusiness: null,
      settings: null,
      isLoading: false,
      isSaving: false,
      error: null,
      searchQuery: "",
      statusFilter: "all",
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      provisionedResult: null,
    });
  });

  describe("businessesApi", () => {
    it("fetches businesses list correctly", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockBusiness] });

      const result = await businessesApi.getBusinesses();
      expect(apiClient.get).toHaveBeenCalledWith("/businesses", { params: undefined });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Freshmart Supermarket");
    });

    it("creates a new business and returns provisioned credentials", async () => {
      const mockResponse: StoreBusinessResponse = {
        message: "Business created successfully",
        data: mockBusiness,
        provisioned: {
          outlet: {
            id: 1,
            uuid: "out-uuid-1",
            business_id: 1,
            code: "OUT-01",
            name: "Main Outlet",
            phone: null,
            email: null,
            address: null,
            city: null,
            province: null,
            postal_code: null,
            country_code: null,
            latitude: null,
            longitude: null,
            is_main_outlet: true,
            receipt_header: null,
            receipt_footer: null,
            tax_rate: null,
            timezone: null,
            is_active: true,
            status: "active",
            created_at: null,
            updated_at: null,
          },
          register: {
            id: 1,
            uuid: "reg-uuid-1",
            business_id: 1,
            outlet_id: 1,
            code: "REG-01",
            name: "Register #1",
            description: null,
            default_cash_amount: "100.00",
            receipt_printer_name: null,
            is_cash_drawer_connected: true,
            is_active: true,
            status: "active",
            created_at: null,
            updated_at: null,
          },
          pos_device: {
            id: 1,
            uuid: "dev-uuid-1",
            business_id: 1,
            outlet_id: 1,
            register_id: 1,
            device_code: "POS-001",
            device_name: "Main Counter Terminal",
            device_type: "pos_terminal",
            platform: "web",
            os_version: null,
            app_version: null,
            ip_address: null,
            mac_address: null,
            status: "active",
            paired_at: null,
            last_sync_at: null,
            created_at: null,
            updated_at: null,
          } as any,
          credentials: {
            device_code: "POS-001",
            machine_password: "GeneratedSecretPassword123!",
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const res = await businessesApi.createBusiness({
        name: "Freshmart Supermarket",
        code: "freshmart",
        currency_code: "USD",
        timezone: "Asia/Phnom_Penh",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/businesses", {
        name: "Freshmart Supermarket",
        code: "freshmart",
        currency_code: "USD",
        timezone: "Asia/Phnom_Penh",
      });
      expect(res.provisioned.credentials.device_code).toBe("POS-001");
      expect(res.provisioned.credentials.machine_password).toBe("GeneratedSecretPassword123!");
    });

    it("fetches and updates POS settings", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSettings });
      const fetched = await businessesApi.getBusinessSettings("biz-test-uuid-1");
      expect(fetched.receipt_prefix).toBe("REC");

      const updatedSettings = { ...mockSettings, receipt_prefix: "INV" };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedSettings });

      const updated = await businessesApi.updateBusinessSettings("biz-test-uuid-1", {
        receipt_prefix: "INV",
      });
      expect(updated.receipt_prefix).toBe("INV");
    });
  });

  describe("useBusinessStore", () => {
    it("filters businesses correctly by search query and status", () => {
      const store = useBusinessStore.getState();
      const inactiveBiz: Business = {
        ...mockBusiness,
        uuid: "biz-2",
        name: "Downtown Cafe",
        code: "downtown-cafe",
        status: "inactive",
      };

      store.setBusinesses([mockBusiness, inactiveBiz]);

      // All businesses
      expect(store.getFilteredBusinesses()).toHaveLength(2);

      // Filter by active status
      store.setStatusFilter("active");
      expect(store.getFilteredBusinesses()).toHaveLength(1);
      expect(store.getFilteredBusinesses()[0].name).toBe("Freshmart Supermarket");

      // Filter by search query
      store.setStatusFilter("all");
      store.setSearchQuery("cafe");
      expect(store.getFilteredBusinesses()).toHaveLength(1);
      expect(store.getFilteredBusinesses()[0].name).toBe("Downtown Cafe");
    });

    it("handles create, update, and delete actions in store", async () => {
      const mockResponse: StoreBusinessResponse = {
        message: "Created",
        data: mockBusiness,
        provisioned: {
          outlet: {} as any,
          register: {} as any,
          pos_device: {} as any,
          credentials: { device_code: "POS-001", machine_password: "secret" },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const store = useBusinessStore.getState();
      await store.createBusiness({
        name: "Freshmart Supermarket",
        code: "freshmart",
      });

      expect(useBusinessStore.getState().businesses).toHaveLength(1);
      expect(useBusinessStore.getState().provisionedResult?.provisioned.credentials.device_code).toBe("POS-001");

      // Update
      const updatedBusiness = { ...mockBusiness, name: "Freshmart Global" };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: updatedBusiness });
      await useBusinessStore.getState().updateBusiness("biz-test-uuid-1", { name: "Freshmart Global" });
      expect(useBusinessStore.getState().businesses[0].name).toBe("Freshmart Global");

      // Delete
      vi.mocked(apiClient.delete).mockResolvedValueOnce({});
      await useBusinessStore.getState().deleteBusiness("biz-test-uuid-1");
      expect(useBusinessStore.getState().businesses).toHaveLength(0);
    });
  });
});
