# SmartPOS Frontend Development Tasks Roadmap

This document outlines the complete development roadmap, architectural milestones, and task checklists for the **`smartpos-business-front`** Next.js application, integrating with the SmartPOS microservice backend APIs.

---

## 🌐 Backend Services & Endpoints Reference

* **Base API URL**: `https://smartpos-api.servicefixit.me/api/v1`
* **Microservices**:
  1. **SmartPOS Identity Service**: IAM, JWT Auth, RBAC, Users, POS PIN, Device Security, Sessions.
  2. **SmartPOS Business Service**: Multi-Tenancy, Outlets, Registers, Shifts, Cash Drawer, Cashier Sessions, Hardware Devices, Warehouses.

---

## 📊 Phase Overview

```text
[Phase 1] Core Foundation & API Infrastructure
    ├── HTTP Client & JWT Interceptors
    ├── TypeScript Schemas & Type Generator
    └── Base Design System & Shared UI Components
[Phase 2] Identity, Authentication & Account Security
    ├── Auth Flows (Login, Register, Refresh, Forgot Password OTP)
    ├── User Profile, Avatars & Session Management
    └── POS PIN Security & Audit Logs
[Phase 3] RBAC & Access Control
    ├── Permissions & Custom Roles Management
    ├── Role Provisioning (Manager, Cashier, Inventory Clerk)
    └── User Role Assignments
[Phase 4] Business Operations & Multi-Tenancy Master
    ├── Business CRUD & POS Settings
    ├── Outlet (Branch) Management
    └── Business Staff & Outlet Assignments
[Phase 5] POS Register, Shifts & Cashier Operations
    ├── Cash Register CRUD & Hardware Binding
    ├── Shift Lifecycle (Open, Track, Close with Variance)
    ├── Cash Drawer Movements (Cash In, Out, Payout, Deposit)
    └── Cashier Sessions, Lock Screen & Numeric PIN Pad
[Phase 6] Hardware Terminal Devices
    ├── POS Device Registration & Machine Credential Generation
    ├── Device Lifecycle (Activate, Lock, Revoke, Rotate Secret)
    └── Machine Device Authentication
[Phase 7] Warehouses & Storage Location Management
    ├── Warehouse CRUD
    └── Storage Mapping (Zone, Aisle, Rack, Shelf, Bin)
[Phase 8] Testing, Hardening & Deployment
    ├── Route Protection & Role Guards
    ├── Performance Optimization & Error Boundaries
    └── Production Build & CI/CD
```

---

## 🛠️ Phase 1: Core Foundation & API Infrastructure

- [x] **1.1 Environment & App Configuration**
  - [x] Create `.env` with `NEXT_PUBLIC_API_BASE_URL=https://smartpos-api.servicefixit.me/api/v1`.
  - [x] Configure `next.config.ts` for external image domains (remote avatar and logo URLs).
  - [x] Set up client device UUID persistence helper (generate and store persistent device UUID in `localStorage`).

- [x] **1.2 HTTP Client & Interceptor Layer**
  - [x] Implement a unified API fetch wrapper (`lib/api/client.ts`) with request/response interceptors.
  - [x] Inject `Authorization: Bearer <access_token>` on protected routes.
  - [x] Add automatic token refresh queue handling on `401 Unauthorized` using `POST /auth/refresh`.
  - [x] Handle standard API error responses (`ValidationException`, `ModelNotFoundException`, `AuthenticationException`).

- [ ] **1.3 TypeScript Schema Definitions**
  - [ ] Define Identity types (`User`, `Role`, `Permission`, `UserDevice`, `UserSession`, `LoginAttempt`).
  - [ ] Define Business types (`Business`, `BusinessSetting`, `BusinessUser`, `Outlet`, `Register`, `RegisterSession`, `CashDrawerSession`, `CashDrawerMovement`, `CashierProfile`, `CashierSession`, `PosDevice`, `Warehouse`, `WarehouseLocation`).
  - [ ] Define standardized pagination wrapper type (`LengthAwarePaginator<T>`).

- [ ] **1.4 Global Context & State Providers**
  - [ ] `AuthContext`: Manages current user, tokens, device info, login/logout actions.
  - [ ] `BusinessContext`: Tracks list of available businesses, selected active business UUID, and POS settings.
  - [ ] `OutletContext`: Tracks selected active outlet, assigned registers, and active shift state.

- [ ] **1.5 UI Design System & Shared Components**
  - [ ] Base typography, color tokens, and dark/light theme integration in Tailwind v4.
  - [ ] Form elements: TextInput, PasswordInput, SearchInput, Select, Checkbox, ToggleSwitch.
  - [ ] Feedback components: Toast notifications, Alert banners, Loading skeletons, Empty states.
  - [ ] Layout components: Modal dialogs, Slide-over drawers, Confirmation dialogs, Dropdown menus.
  - [ ] Data presentation: Data tables with pagination, sortable columns, and search filters.
  - [ ] App shells: Auth shell (centered auth cards) and Admin/POS dashboard shell (collapsible sidebar, tenant/outlet selector header).

---

## 🔐 Phase 2: Identity, Authentication & Account Security

- [ ] **2.1 Authentication Pages & Flows**
  - [ ] **Login Screen (`/auth/login`)**:
    - [ ] Credentials input (`login` = username/email/phone, `password`).
    - [ ] Automatic device identification (`device_uuid`, `device_name`, `device_type`, `platform`).
    - [ ] Store `access_token`, `refresh_token`, and user payload.
    - [ ] Handling for blocked device or inactive account errors.
  - [ ] **Register Screen (`/auth/register`)**:
    - [ ] Fields: Name, username, email, phone, password, password confirmation.
    - [ ] Validation and immediate authentication on success.
  - [ ] **Password Recovery Flow (`/auth/forgot-password`)**:
    - [ ] Step 1: Send OTP to email (`POST /auth/forgot-password/send-code`).
    - [ ] Step 2: 6-digit OTP verification screen (`POST /auth/verify-reset-code`) with attempt counter feedback.
    - [ ] Step 3: New password submission with `otp_uuid` (`POST /auth/reset-password`).
  - [ ] **Logout**:
    - [ ] Call `POST /auth/logout` with `refresh_token`, purge tokens, and redirect to login.

- [ ] **2.2 User Profile & Account Settings (`/settings/profile`)**
  - [ ] View current user profile (`GET /auth/me`).
  - [ ] Edit personal information (`PUT /users/{user}`).
  - [ ] Avatar management:
    - [ ] WebP image upload modal (`POST /users/{user}/avatar` via `multipart/form-data`).
    - [ ] Delete avatar button (`DELETE /users/{user}/avatar`).

- [ ] **2.3 Session & Device Security (`/settings/security`)**
  - [ ] Active Sessions list (`GET /sessions`):
    - [ ] Display IP address, browser/user agent, last activity, expiration.
    - [ ] Terminate specific session (`DELETE /sessions/{userSession}`).
    - [ ] Terminate all other sessions button (`DELETE /sessions?except_current=true`).
  - [ ] Registered Devices list (`GET /devices`):
    - [ ] Display device type, platform, trust status, block status, last seen.
    - [ ] Trust device action (`PATCH /devices/{userDevice}/trust`).
    - [ ] Block device action (`PATCH /devices/{userDevice}/block`).
  - [ ] Login Attempts audit table (`GET /login-attempts` with pagination).

- [ ] **2.4 POS Fast-Access PIN (`/settings/pos-pin`)**
  - [ ] Set or change 4-to-6 digit numeric POS PIN (`PUT /users/{user}/pos-pin`).
  - [ ] In-app PIN test / verification tool (`POST /users/{user}/pos-pin/verify`).

---

## 🛡️ Phase 3: RBAC & Access Control

- [ ] **3.1 Permissions Management (`/admin/permissions`)**
  - [ ] Paginated permissions directory (`GET /permissions`).
  - [ ] Filter permissions by module (Auth, Business, Outlet, Register, Inventory).
  - [ ] Batch permission creation modal (`POST /permissions`).
  - [ ] Edit and delete permission modals (`PUT/DELETE /permissions/{permission}`).

- [ ] **3.2 Roles Management (`/admin/roles`)**
  - [ ] Paginated roles list with badges for system vs. custom roles (`GET /roles`).
  - [ ] Create custom role modal (`POST /roles`).
  - [ ] Edit role details (`PUT /roles/{role}`).
  - [ ] Safe delete role (`DELETE /roles/{role}` with prevention banner for system roles).
  - [ ] **Role Auto-Provisioning button**: Trigger `POST /roles/provision` to instantiate default roles (`Store_Manager`, `Cashier`, `Inventory_Clerk`) for a business.
  - [ ] **Permission Matrix Editor**:
    - [ ] Interactive matrix to view and toggle permissions attached to a role.
    - [ ] Synchronize selected permissions (`POST /roles/{role}/permissions`).
    - [ ] "Attach All Permissions" one-click action (`POST /roles/{role}/permissions/all`).

- [ ] **3.3 User Role Assignment**
  - [ ] User details modal with role management tab (`GET /users/{user}`).
  - [ ] Assign role to user (`POST /users/{user}/roles`).
  - [ ] Revoke role from user (`DELETE /users/{user}/roles/{role}`).

---

## 🏢 Phase 4: Business Operations & Multi-Tenancy Master

- [ ] **4.1 Business Master Management (`/businesses`)**
  - [ ] Business Switcher component in the top navigation bar with search and active indicator.
  - [ ] List user's businesses (`GET /businesses`).
  - [ ] **Create Business Modal (`POST /businesses`)**:
    - [ ] Input: Name, code, legal name, tax number, registration number, address, currency, timezone, tax rate.
    - [ ] Success Dialog: Display auto-provisioned default outlet, cash register, and machine credentials (`device_code` and `machine_password`).
  - [ ] Edit business details (`PUT /businesses/{business}`).
  - [ ] Delete business modal (`DELETE /businesses/{business}`).

- [ ] **4.2 POS Global Settings (`/businesses/{business}/settings`)**
  - [ ] Receipt customization (receipt prefix, header, footer).
  - [ ] Tax configuration (enable/disable, default percentage, tax inclusive toggle).
  - [ ] Operational policies:
    - [ ] Allow negative inventory stock toggle.
    - [ ] Allow cashier discounts toggle & maximum discount percentage limit.
    - [ ] Terminal auto-lock timeout duration (minutes).

- [ ] **4.3 Outlets (Store Locations) (`/businesses/{business}/outlets`)**
  - [ ] Outlets grid/table displaying name, code, phone, address, and device count (`GET /businesses/{business}/outlets`).
  - [ ] Create outlet modal (`POST /businesses/{business}/outlets`) with "Main Outlet" checkbox.
  - [ ] Outlet detail page (`GET /outlets/{outlet}`) showing connected registers, POS hardware, and warehouses.
  - [ ] Update outlet configuration (`PUT /outlets/{outlet}`).
  - [ ] Delete outlet action (`DELETE /outlets/{outlet}`).

- [ ] **4.4 Staff Memberships & Access (`/businesses/{business}/staff`)**
  - [ ] List staff members for business (`GET /businesses/{business}/users`).
  - [ ] Add user to business modal (`POST /businesses/{business}/users` with role selection: `owner`, `manager`, `cashier`, `staff`, `admin`).
  - [ ] Update membership details (`PUT /businesses/{business}/users/{businessUser}`).
  - [ ] Suspend staff member toggle (`POST /businesses/{business}/users/{businessUser}/suspend`).
  - [ ] Remove staff member action (`DELETE /businesses/{business}/users/{businessUser}`).
  - [ ] Outlet Assignment sub-view:
    - [ ] List outlets assigned to user (`GET .../outlets`).
    - [ ] Assign outlet to user with `is_primary` flag (`POST .../outlets`).
    - [ ] Revoke outlet assignment (`DELETE .../outlets/{outlet}`).

---

## 🛒 Phase 5: POS Register, Shifts & Cashier Operations

- [ ] **5.1 Cash Registers Management (`/outlets/{outlet}/registers`)**
  - [ ] List cash registers with active status and connected hardware (`GET /outlets/{outlet}/registers`).
  - [ ] Create cash register modal (`POST /outlets/{outlet}/registers`) with default opening cash float and printer settings.
  - [ ] Edit register details (`PUT /registers/{register}`).
  - [ ] Delete register action (`DELETE /registers/{register}`).

- [ ] **5.2 Register Shift Lifecycle (`/pos/shift`)**
  - [ ] Active shift status widget in header (displays current cashier, opened time, opening balance).
  - [ ] Shift check: `GET /outlets/{outlet}/registers/{register}/shifts/current`.
  - [ ] **Open Shift Modal**:
    - [ ] Enter opening cash float (`POST .../shifts/open`).
    - [ ] Initialize associated cash drawer session.
  - [ ] **Close Shift Modal**:
    - [ ] Counted cash breakdown calculator.
    - [ ] Input closing cash amount (`POST .../shifts/{registerSession}/close`).
    - [ ] Show real-time variance calculation (`expected_cash` vs `closing_cash`).
  - [ ] Register Shifts audit history log (`GET /outlets/{outlet}/registers/{register}/shifts`).

- [ ] **5.3 Cash Drawer & Movements (`/pos/drawer`)**
  - [ ] Real-time cash drawer balance card (`GET /outlets/{outlet}/registers/{register}/drawers/{cashDrawerSession}`).
  - [ ] Cash movement history log (`GET .../drawers/{cashDrawerSession}/movements`).
  - [ ] **Record Cash Movement Modal (`POST .../drawers/{cashDrawerSession}/movements`)**:
    - [ ] Movement types: Cash In, Cash Out, Payout, Deposit, Float Adjustment, Sale, Refund.
    - [ ] Amount input with reason and reference notes.

- [ ] **5.4 Cashier Profiles & Terminal Lock Screen (`/pos/terminal`)**
  - [ ] Cashier profile permissions manager (`GET/PUT .../cashier-profile`):
    - [ ] Toggles for `can_sell`, `can_refund`, `can_void`, `can_discount`, and `max_discount_percent`.
  - [ ] Start Cashier Session (`POST /outlets/{outlet}/cashier-sessions/start`).
  - [ ] Current session watcher (`GET /outlets/{outlet}/cashier-sessions/current`).
  - [ ] **Terminal Lock Screen**:
    - [ ] Manual lock button (`POST .../lock`) and idle timeout auto-lock.
    - [ ] Full-screen locked terminal overlay.
    - [ ] Quick numeric keypad component for 4-to-6 digit PIN entry.
    - [ ] Unlock session verification (`POST .../unlock` with PIN code).
  - [ ] End Cashier Session action (`POST .../end`).

---

## 💻 Phase 6: Hardware & POS Terminal Devices

- [ ] **6.1 Hardware Device Registry (`/outlets/{outlet}/devices`)**
  - [ ] List registered POS terminals with online status and IP/MAC info (`GET /outlets/{outlet}/pos-devices`).
  - [ ] **Register POS Device Modal (`POST /outlets/{outlet}/pos-devices`)**:
    - [ ] Input: `machine_id`, `device_name`, `device_type`, `platform`, `register_uuid`.
    - [ ] One-time credential modal: Render generated `machine_password` with one-click copy button.
  - [ ] Update POS device details & register binding (`PUT /pos-devices/{posDevice}`).

- [ ] **6.2 Device Lifecycle & Security Controls**
  - [ ] Activate device action (`POST /pos-devices/{posDevice}/activate`).
  - [ ] Lock device action (`POST /pos-devices/{posDevice}/lock`).
  - [ ] Revoke device action (`POST /pos-devices/{posDevice}/revoke`).
  - [ ] Rotate Secret dialog (`POST /pos-devices/{posDevice}/rotate-secret`): Generates and displays new `machine_password`.
  - [ ] Device Sessions list & remote revocation (`GET/POST /pos-devices/{posDevice}/sessions`).

- [ ] **6.3 Hardware Terminal Authentication**
  - [ ] Standalone POS Machine Login screen for dedicated physical terminals.
  - [ ] Authenticate terminal via `machine_id` + `machine_password` (`POST /pos-devices/auth`).
  - [ ] Store returned `session_token` and device session state.

---

## 📦 Phase 7: Warehouse & Inventory Locations

- [ ] **7.1 Warehouse Management (`/businesses/{business}/warehouses`)**
  - [ ] List warehouses with status and linked outlets (`GET /businesses/{business}/warehouses`).
  - [ ] Create warehouse modal (`POST /businesses/{business}/warehouses`).
  - [ ] View warehouse details with storage location counts (`GET /warehouses/{warehouse}`).
  - [ ] Update warehouse details (`PUT /warehouses/{warehouse}`).
  - [ ] Delete warehouse action (`DELETE /warehouses/{warehouse}`).

- [ ] **7.2 Warehouse Storage Location Mapping (`/warehouses/{warehouse}/locations`)**
  - [ ] Hierarchical storage location table (`GET /warehouses/{warehouse}/locations`).
  - [ ] Create storage location modal (`POST /warehouses/{warehouse}/locations`):
    - [ ] Fields: Code, Zone, Aisle, Rack, Shelf, Bin, Description, Status.
  - [ ] Edit storage location modal (`PUT /warehouse-locations/{warehouseLocation}`).
  - [ ] Delete storage location action (`DELETE /warehouse-locations/{warehouseLocation}`).

---

## 🚀 Phase 8: Testing, Hardening & Deployment

- [ ] **8.1 Route Protection & Navigation Guards**
  - [ ] Next.js middleware for auth redirection (unauthenticated users redirected to `/auth/login`).
  - [ ] Active business check (redirect to `/businesses` if no active business is selected).
  - [ ] Role and permission checks for administrative pages (`/admin/*`).

- [ ] **8.2 Error Handling & Network Resilience**
  - [ ] Global error boundary and friendly 404/500 error pages.
  - [ ] Offline status banner when device loses network connectivity.
  - [ ] Form-level validation error mapping from backend `422 Unprocessable Entity` responses.

- [ ] **8.3 Performance Optimization**
  - [ ] Optimize bundle size and split client/server components.
  - [ ] Caching and optimistic updates for drawer movements and shift counts.
  - [ ] Web font optimization with Geist Sans/Mono.

- [ ] **8.4 Verification & Production Build**
  - [ ] Run ESLint check (`npm run lint`).
  - [ ] Run full Next.js production build (`npm run build`).
  - [ ] Verify zero TypeScript errors and ensure production bundle stability.
