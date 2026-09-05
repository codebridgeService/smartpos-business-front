/**
 * Types and DTOs for SmartPOS Business Operations Service
 * OpenAPI Specification: https://smartpos-api.servicefixit.me/docs/business
 */

// ---------------------------------------------------------------------------
// Business / Multi-Tenant Master Types
// ---------------------------------------------------------------------------

export type BusinessStatus = "active" | "inactive" | "suspended";

export interface Business {
  id: number;
  uuid: string;
  name: string;
  code: string;
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
  registration_number: string | null;
  logo_path: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country_code: string;
  currency_code: string;
  default_currency: string;
  currency_symbol: string;
  receipt_header: string | null;
  receipt_footer: string | null;
  tax_rate: string;
  is_tax_inclusive: boolean;
  timezone: string;
  status: BusinessStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface BusinessSetting {
  id: number;
  business_id: number;
  receipt_prefix: string;
  currency_code: string;
  timezone: string;
  tax_enabled: boolean;
  default_tax_percent: string;
  allow_negative_stock: boolean;
  allow_discount: boolean;
  max_discount_percent: string | null;
  auto_lock_minutes: number;
  receipt_footer: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type BusinessRole = "owner" | "manager" | "cashier" | "staff" | "admin";

export interface BusinessUser {
  id: number;
  uuid: string;
  business_id: number;
  outlet_id: number | null;
  user_uuid: string;
  employee_code: string | null;
  job_title: string | null;
  role: BusinessRole | string;
  is_owner: boolean;
  is_active: boolean;
  phone: string | null;
  notes: string | null;
  status: "active" | "suspended" | string;
  joined_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BusinessUserOutlet {
  id: number;
  uuid: string;
  business_user_id: number;
  outlet_id: number;
  is_primary: boolean;
  is_active: boolean;
  assigned_at: string;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Outlet (Branch / Store Location) Types
// ---------------------------------------------------------------------------

export interface Outlet {
  id: number;
  uuid: string;
  business_id: number;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country_code: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  is_main_outlet: boolean;
  receipt_header: string | null;
  receipt_footer: string | null;
  tax_rate: string | null;
  timezone: string | null;
  is_active: boolean;
  status: "active" | "inactive" | string;
  devices_count?: number;
  registers_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Cash Register & Shifts Types
// ---------------------------------------------------------------------------

export interface Register {
  id: number;
  uuid: string;
  business_id: number;
  outlet_id: number;
  code: string;
  name: string;
  description: string | null;
  default_cash_amount: string;
  receipt_printer_name: string | null;
  is_cash_drawer_connected: boolean;
  is_active: boolean;
  status: "active" | "inactive" | string;
  devices_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface RegisterSession {
  id: number;
  uuid: string;
  business_id: number;
  outlet_id: number;
  register_id: number;
  pos_device_id: number | null;
  opened_by_user_uuid: string;
  closed_by_user_uuid: string | null;
  opening_cash: string;
  expected_cash: string | null;
  closing_cash: string | null;
  difference_amount: string | null;
  status: "open" | "closed" | string;
  opened_at: string;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Cash Drawer & Movements Types
// ---------------------------------------------------------------------------

export interface CashDrawerSession {
  id: number;
  uuid: string;
  register_session_id: number;
  business_id: number;
  outlet_id: number;
  register_id: number;
  opening_amount: string;
  expected_amount: string | null;
  counted_amount: string | null;
  difference_amount: string | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type CashMovementType =
  | "cash_in"
  | "cash_out"
  | "payout"
  | "deposit"
  | "adjustment"
  | "cash_sale"
  | "cash_refund";

export interface CashDrawerMovement {
  id: number;
  uuid: string;
  cash_drawer_session_id: number;
  business_id: number;
  outlet_id: number;
  register_id: number;
  user_uuid: string;
  type: CashMovementType | string;
  amount: string;
  reference_type: string | null;
  reference_uuid: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Cashier Profiles & Sessions Types
// ---------------------------------------------------------------------------

export interface CashierProfile {
  id: number;
  uuid: string;
  business_user_id: number;
  display_name: string | null;
  avatar_url: string | null;
  can_sell: boolean;
  can_refund: boolean;
  can_void: boolean;
  can_discount: boolean;
  max_discount_percent: string;
  is_active: boolean;
  last_pos_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type CashierSessionStatus = "active" | "locked" | "ended";

export interface CashierSession {
  id: number;
  uuid: string;
  business_id: number;
  outlet_id: number;
  register_id: number;
  pos_device_id: number;
  business_user_id: number;
  user_uuid: string;
  status: CashierSessionStatus | string;
  started_at: string;
  last_activity_at: string;
  locked_at: string | null;
  ended_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Hardware POS Terminal Devices Types
// ---------------------------------------------------------------------------

export type PosDeviceStatus = "pending" | "active" | "locked" | "revoked";

export interface PosDevice {
  id: number;
  uuid: string;
  business_id: number;
  outlet_id: number | null;
  register_id: number | null;
  machine_id: string;
  device_code: string | null;
  name: string | null;
  device_name: string | null;
  device_type: string | null;
  device_model: string | null;
  platform: string | null;
  os_version: string | null;
  app_version: string | null;
  serial_number: string | null;
  ip_address: string | null;
  mac_address: string | null;
  status: PosDeviceStatus | string;
  registered_at: string | null;
  activated_at: string | null;
  paired_at: string | null;
  last_seen_at: string | null;
  last_sync_at: string | null;
  revoked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DeviceSession {
  id: number;
  uuid: string;
  pos_device_id: number;
  ip_address: string | null;
  user_agent: string | null;
  started_at: string;
  last_activity_at: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Warehouse & Storage Locations Types
// ---------------------------------------------------------------------------

export interface Warehouse {
  id: number;
  uuid: string;
  business_id: number;
  outlet_id: number | null;
  code: string;
  name: string;
  address: string | null;
  status: "active" | "inactive" | string;
  created_at: string | null;
  updated_at: string | null;
}

export interface WarehouseLocation {
  id: number;
  uuid: string;
  warehouse_id: number;
  code: string;
  zone: string | null;
  aisle: string | null;
  rack: string | null;
  shelf: string | null;
  bin: string | null;
  description: string | null;
  status: "active" | "inactive" | string;
  created_at: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface StoreBusinessRequest {
  name: string;
  code: string;
  legal_name?: string | null;
  phone?: string | null;
  email?: string | null;
  tax_number?: string | null;
  registration_number?: string | null;
  logo_path?: string | null;
  website?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  currency_code?: string | null;
  default_currency?: string | null;
  currency_symbol?: string | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  tax_rate?: number | null;
  is_tax_inclusive?: boolean | null;
  timezone?: string | null;
  status?: BusinessStatus | null;
}

export interface StoreBusinessResponse {
  message: string;
  data: Business;
  provisioned: {
    outlet: Outlet;
    register: Register;
    pos_device: PosDevice;
    credentials: {
      device_code: string;
      machine_password: string;
    };
  };
}

export interface UpdateBusinessRequest extends Partial<StoreBusinessRequest> {}

export interface UpdateBusinessSettingRequest {
  receipt_prefix?: string;
  currency_code?: string;
  timezone?: string;
  tax_enabled?: boolean;
  default_tax_percent?: number;
  allow_negative_stock?: boolean;
  allow_discount?: boolean;
  max_discount_percent?: number | null;
  auto_lock_minutes?: number;
  receipt_footer?: string | null;
}

export interface StoreBusinessUserRequest {
  user_uuid: string;
  outlet_id?: number | null;
  role?: BusinessRole | null;
  is_owner?: boolean | null;
  pin_code?: string | null;
  phone?: string | null;
  notes?: string | null;
  status?: "active" | "suspended" | null;
}

export interface UpdateBusinessUserRequest extends Partial<Omit<StoreBusinessUserRequest, "user_uuid">> {}

export interface AssignBusinessUserOutletRequest {
  outlet_uuid: string;
  is_primary?: boolean;
  is_active?: boolean;
}

export interface StoreOutletRequest {
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_main_outlet?: boolean | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  tax_rate?: number | null;
  timezone?: string | null;
  status?: "active" | "inactive" | null;
}

export interface UpdateOutletRequest extends Partial<StoreOutletRequest> {}

export interface StoreRegisterRequest {
  code: string;
  name: string;
  description?: string | null;
  default_cash_amount?: number | null;
  receipt_printer_name?: string | null;
  is_cash_drawer_connected?: boolean | null;
  is_active?: boolean | null;
  status?: "active" | "inactive" | null;
}

export interface UpdateRegisterRequest extends Partial<StoreRegisterRequest> {}

export interface OpenRegisterSessionRequest {
  pos_device_uuid?: string | null;
  opening_cash: number;
  notes?: string | null;
}

export interface CloseRegisterSessionRequest {
  closing_cash: number;
  notes?: string | null;
}

export interface RecordCashMovementRequest {
  type: CashMovementType;
  amount: number;
  reference_type?: string | null;
  reference_uuid?: string | null;
  reason?: string | null;
  notes?: string | null;
}

export interface StartCashierSessionRequest {
  register_uuid: string;
  pos_device_uuid: string;
  user_uuid: string;
}

export interface UnlockCashierSessionRequest {
  pin_code: string;
}

export interface UpdateCashierProfileRequest {
  display_name?: string | null;
  avatar_url?: string | null;
  can_sell?: boolean;
  can_refund?: boolean;
  can_void?: boolean;
  can_discount?: boolean;
  max_discount_percent?: number;
  is_active?: boolean;
}

export interface StorePosDeviceRequest {
  machine_id: string;
  device_name: string;
  device_type?: string | null;
  platform?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  ip_address?: string | null;
  mac_address?: string | null;
  register_uuid?: string | null;
}

export interface StorePosDeviceResponse {
  message: string;
  machine_password: string;
  data: PosDevice;
}

export interface UpdatePosDeviceRequest {
  device_name?: string;
  device_type?: string | null;
  platform?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  ip_address?: string | null;
  mac_address?: string | null;
  outlet_uuid?: string | null;
  register_uuid?: string | null;
  status?: PosDeviceStatus | null;
  paired_at?: string | null;
  last_sync_at?: string | null;
}

export interface AuthenticatePosDeviceRequest {
  machine_id?: string | null;
  device_code?: string | null;
  machine_password?: string | null;
  password?: string | null;
}

export interface AuthenticatePosDeviceResponse {
  message: string;
  session_token: string;
  device_session_uuid: string;
  data: {
    device_uuid: string;
    device_code: string;
    device_name: string | null;
    business_uuid: string;
    outlet_uuid: string | null;
    register_uuid: string | null;
    device_token: string;
  };
  context: {
    pos_device: PosDevice | null;
    business: Business;
    outlet: Outlet | null;
    register: Register | null;
  };
}

export interface StoreWarehouseRequest {
  code: string;
  name: string;
  outlet_id?: number | null;
  outlet_uuid?: string | null;
  address?: string | null;
  status?: "active" | "inactive" | null;
}

export interface UpdateWarehouseRequest extends Partial<StoreWarehouseRequest> {}

export interface StoreWarehouseLocationRequest {
  code: string;
  zone?: string | null;
  aisle?: string | null;
  rack?: string | null;
  shelf?: string | null;
  bin?: string | null;
  description?: string | null;
  status?: "active" | "inactive" | null;
}

export interface UpdateWarehouseLocationRequest extends Partial<StoreWarehouseLocationRequest> {}
