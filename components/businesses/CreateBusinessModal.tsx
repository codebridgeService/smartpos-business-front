"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Sparkles,
  Info,
  DollarSign,
  Clock,
  Receipt,
  FileText,
  MapPin,
  Mail,
  Phone,
  Hash,
  Check,
  UserCheck,
  ShieldCheck,
  Key,
  Search,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StoreBusinessRequest, Role, User, Permission } from "@/types";
import { rolesApi } from "@/lib/api/roles";
import { usersApi } from "@/lib/api/users";

interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoreBusinessRequest) => Promise<void>;
  isLoading?: boolean;
}

const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar (USD)" },
  { code: "KHR", symbol: "៛", name: "Khmer Riel (KHR)" },
  { code: "EUR", symbol: "€", name: "Euro (EUR)" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar (SGD)" },
];

const COMMON_TIMEZONES = [
  { value: "Asia/Phnom_Penh", label: "Asia/Phnom_Penh (GMT+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
];

const FALLBACK_OWNER_ROLES = [
  {
    code: "owner",
    name: "Business Owner",
    badge: "Full Access",
    desc: "Full root authority over tenant outlets, billing, staff, and hardware configurations.",
  },
  {
    code: "super_admin",
    name: "Super Admin",
    badge: "System Level",
    desc: "Platform-wide administrative privileges and configuration control.",
  },
  {
    code: "admin",
    name: "Administrator",
    badge: "Tenant Admin",
    desc: "Administrative management over store operations and users.",
  },
  {
    code: "pos_admin",
    name: "POS Admin",
    badge: "Store Ops",
    desc: "Operational authority over point-of-sale terminals, registers, and daily shifts.",
  },
  {
    code: "inventory_admin",
    name: "Inventory Admin",
    badge: "Warehouse",
    desc: "Stock adjustment, warehouse operations, product transfers, and supplier management.",
  },
  {
    code: "finance_admin",
    name: "Finance Admin",
    badge: "Accounting",
    desc: "Financial reports, accounting ledgers, cash drawer reconciliation, and taxes.",
  },
  {
    code: "hr_admin",
    name: "HR Admin",
    badge: "Staff",
    desc: "Employee roles, PIN authorization, cashier onboarding, and shift assignment.",
  },
];

export function CreateBusinessModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateBusinessModalProps) {
  const [formData, setFormData] = useState<StoreBusinessRequest>({
    name: "",
    code: "",
    legal_name: "",
    registration_number: "",
    tax_number: "",
    phone: "",
    email: "",
    address: "",
    city: "Phnom Penh",
    country_code: "KH",
    currency_code: "USD",
    currency_symbol: "$",
    default_currency: "USD",
    timezone: "Asia/Phnom_Penh",
    tax_rate: 10,
    is_tax_inclusive: false,
    receipt_header: "Welcome to SmartPOS",
    receipt_footer: "Thank you for your business! Please come again.",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    owner_role_code: "owner",
    owner_user_uuid: "",
  });

  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "owner" | "tax_currency" | "contact">("general");

  // Dynamic Roles State
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<Role | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingRoleDetail, setIsLoadingRoleDetail] = useState(false);
  const [showPermissionsList, setShowPermissionsList] = useState(false);

  // User Search & Selection State
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  // Fetch available roles from Identity API
  const loadRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    try {
      const res = await rolesApi.getRoles({ per_page: 50 });
      let roles: Role[] = [];
      if (Array.isArray(res)) {
        roles = res;
      } else if (res && typeof res === "object" && "data" in res && Array.isArray(res.data)) {
        roles = res.data;
      }
      if (roles.length > 0) {
        setAvailableRoles(roles);
      }
    } catch {
      // Fallback to static list if offline
    } finally {
      setIsLoadingRoles(false);
    }
  }, []);

  // Fetch role details with loaded permissions: GET /api/v1/roles/{role}
  const loadRoleDetail = useCallback(async (roleCodeOrUuid: string) => {
    if (!roleCodeOrUuid) return;
    setIsLoadingRoleDetail(true);
    try {
      const detail = await rolesApi.getRole(roleCodeOrUuid);
      setSelectedRoleDetail(detail);
    } catch {
      setSelectedRoleDetail(null);
    } finally {
      setIsLoadingRoleDetail(false);
    }
  }, []);

  // Fetch roles and role details when modal is open
  useEffect(() => {
    if (isOpen) {
      void loadRoles();
      void loadRoleDetail(formData.owner_role_code || "owner");
    }
  }, [isOpen, loadRoles, loadRoleDetail, formData.owner_role_code]);

  // Search users from Identity API
  useEffect(() => {
    if (!userSearchTerm.trim() || userSearchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearchingUsers(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const paginator = await usersApi.getUsers({ search: userSearchTerm.trim(), per_page: 10 });
        setSearchResults(paginator.data || []);
        setIsSearchDropdownOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setFormData((prev) => ({
      ...prev,
      owner_user_uuid: user.uuid,
      owner_name: user.name,
      owner_email: user.email,
      owner_phone: user.phone || prev.owner_phone || "",
    }));
    setUserSearchTerm("");
    setIsSearchDropdownOpen(false);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setFormData((prev) => ({
      ...prev,
      owner_user_uuid: "",
    }));
  };

  const handleRoleSelect = (roleCode: string, roleUuid?: string) => {
    setFormData((prev) => ({ ...prev, owner_role_code: roleCode }));
    void loadRoleDetail(roleUuid || roleCode);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => {
      const updated: StoreBusinessRequest = { ...prev, name: newName };
      if (!codeManuallyEdited) {
        updated.code = newName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 30);
      }
      return updated;
    });
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const selected = COMMON_CURRENCIES.find((c) => c.code === currencyCode);
    setFormData((prev) => ({
      ...prev,
      currency_code: currencyCode,
      default_currency: currencyCode,
      currency_symbol: selected?.symbol || "$",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name?.trim()) {
      setErrorMessage("Business name is required.");
      setActiveTab("general");
      return;
    }

    if (!formData.code?.trim()) {
      setErrorMessage("Unique business code is required.");
      setActiveTab("general");
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: "",
        code: "",
        legal_name: "",
        registration_number: "",
        tax_number: "",
        phone: "",
        email: "",
        address: "",
        city: "Phnom Penh",
        country_code: "KH",
        currency_code: "USD",
        currency_symbol: "$",
        default_currency: "USD",
        timezone: "Asia/Phnom_Penh",
        tax_rate: 10,
        is_tax_inclusive: false,
        receipt_header: "Welcome to SmartPOS",
        receipt_footer: "Thank you for your business! Please come again.",
        owner_name: "",
        owner_email: "",
        owner_phone: "",
        owner_role_code: "owner",
        owner_user_uuid: "",
      });
      setSelectedUser(null);
      setCodeManuallyEdited(false);
      setActiveTab("general");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create business.";
      setErrorMessage(msg);
    }
  };

  // Compile combined role list (API roles + Fallbacks)
  const displayRoles = availableRoles.length > 0
    ? availableRoles.map((r) => {
        const fallback = FALLBACK_OWNER_ROLES.find((f) => f.code === r.code);
        return {
          uuid: r.uuid,
          code: r.code,
          name: r.name,
          badge: r.is_system ? "System Role" : "Custom Role",
          desc: fallback?.desc || `Role for ${r.name} with configured privileges.`,
          permissionsCount: r.permissions?.length ?? 0,
        };
      })
    : FALLBACK_OWNER_ROLES.map((f) => ({
        uuid: "",
        code: f.code,
        name: f.name,
        badge: f.badge,
        desc: f.desc,
        permissionsCount: 0,
      }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Create New Business Tenant
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              Auto-provisions initial default outlet, cash register, and terminal credentials
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 pb-1 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "general"
                ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shadow-2xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            General Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("owner")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "owner"
                ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shadow-2xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Owner & Tenancy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tax_currency")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "tax_currency"
                ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shadow-2xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            Tax & Currency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "contact"
                ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shadow-2xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            Address & Contact
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: General Details */}
        {activeTab === "general" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FreshMart Organics"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Business Code / Slug <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. freshmart-organics"
                    value={formData.code}
                    onChange={(e) => {
                      setCodeManuallyEdited(true);
                      setFormData((prev) => ({ ...prev, code: e.target.value.toLowerCase() }));
                    }}
                    className="w-full font-mono px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-zinc-500 mt-1">
                  Unique identifier used in system URLs and receipts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Legal Registered Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. FreshMart Co., Ltd."
                  value={formData.legal_name || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, legal_name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 00012345-KH"
                  value={formData.registration_number || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, registration_number: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-xs text-orange-950 dark:text-orange-300 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-900 dark:text-orange-200">Instant Multi-Tenancy Provisioning</p>
                <p className="text-[11.5px] text-orange-800/80 dark:text-orange-300/80 mt-0.5 leading-relaxed">
                  Creating this business automatically spins up your default Main Outlet, Register
                  #1, and registers hardware machine authentication credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Owner & Tenancy */}
        {activeTab === "owner" && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Tenant Owner & Admin Assignment
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Assign a system user or configure direct tenant credentials to link to this business.
                  </p>
                </div>
              </div>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                Root Admin
              </span>
            </div>

            {/* Existing User Search / Assignment */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-orange-500" />
                  <span>Assign Existing User (Optional)</span>
                </label>
                {selectedUser && (
                  <button
                    type="button"
                    onClick={handleClearSelectedUser}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <X className="h-3 w-3" /> Unlink User
                  </button>
                )}
              </div>

              {selectedUser ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {selectedUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                          {selectedUser.name}
                        </p>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.2 rounded">
                          {selectedUser.uuid.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[10px]">
                    <Check className="h-3 w-3 mr-1" /> Linked
                  </Badge>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search existing users by name, email, or phone..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      onFocus={() => {
                        if (searchResults.length > 0) setIsSearchDropdownOpen(true);
                      }}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                    {isSearchingUsers && (
                      <Loader2 className="absolute right-3 h-3.5 w-3.5 text-orange-500 animate-spin" />
                    )}
                  </div>

                  {/* Dropdown Results */}
                  {isSearchDropdownOpen && searchResults.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl divide-y divide-slate-100 dark:divide-zinc-700">
                      {searchResults.map((u) => (
                        <button
                          key={u.uuid}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="w-full text-left p-2.5 hover:bg-orange-50/60 dark:hover:bg-orange-950/30 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-[11px] text-slate-700 dark:text-zinc-300">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {u.name}
                              </p>
                              <p className="text-[10.5px] text-slate-500 dark:text-zinc-400">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60">
                            Select User
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Owner Role Selection with loaded permissions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Owner System Role <span className="text-orange-500">*</span>
                </label>
                {isLoadingRoles && (
                  <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading roles...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayRoles.map((r) => {
                  const isSelected = (formData.owner_role_code || "owner") === r.code;
                  return (
                    <button
                      key={r.uuid || r.code}
                      type="button"
                      onClick={() => handleRoleSelect(r.code, r.uuid)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-orange-50/80 dark:bg-orange-950/40 border-orange-500 text-orange-950 dark:text-orange-200 ring-2 ring-orange-500/20"
                          : "bg-white dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold ${
                            isSelected
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {r.name}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                          }`}
                        >
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 leading-tight">
                        {r.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loaded Role Permissions Inspector: GET /api/v1/roles/{role} */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-850">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Role Permissions ({selectedRoleDetail?.permissions?.length ?? 0} loaded)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPermissionsList((prev) => !prev)}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {showPermissionsList ? (
                    <>
                      <span>Hide Permissions</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Preview Loaded Permissions</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              {isLoadingRoleDetail && (
                <div className="py-2 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                  <span>Loading role permissions from Identity Service...</span>
                </div>
              )}

              {showPermissionsList && !isLoadingRoleDetail && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 max-h-36 overflow-y-auto no-scrollbar flex flex-wrap gap-1.5">
                  {selectedRoleDetail?.permissions && selectedRoleDetail.permissions.length > 0 ? (
                    selectedRoleDetail.permissions.map((perm) => (
                      <span
                        key={typeof perm === "string" ? perm : perm.code}
                        className="px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/60 text-[10px] font-mono text-orange-700 dark:text-orange-300"
                      >
                        {typeof perm === "string" ? perm : perm.code}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No granular permissions loaded for this role template.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Owner Details Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.owner_name || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner_name: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Owner Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. owner@freshmart.com"
                  value={formData.owner_email || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner_email: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  Receives machine tokens and outlet activation keys upon creation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Owner Direct Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +855 12 345 678"
                  value={formData.owner_phone || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner_phone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  User UUID (Linked Identity)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={formData.owner_user_uuid || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, owner_user_uuid: e.target.value }))}
                  className="w-full font-mono px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tax & Currency */}
        {activeTab === "tax_currency" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Default Operating Currency
                </label>
                <select
                  value={formData.currency_code || "USD"}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                >
                  {COMMON_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Operating Timezone
                </label>
                <select
                  value={formData.timezone || "Asia/Phnom_Penh"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                >
                  {COMMON_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Tax Identification Number (VAT/TIN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. K001-90212345"
                  value={formData.tax_number || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tax_number: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="10"
                  value={formData.tax_rate ?? 10}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Tax Inclusive Toggle */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-850/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Tax-Inclusive Product Pricing
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  When enabled, retail shelf prices already include tax. When off, tax is added at
                  checkout.
                </p>
              </div>
              <input
                type="checkbox"
                checked={!!formData.is_tax_inclusive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_tax_inclusive: e.target.checked }))
                }
                className="h-4.5 w-4.5 rounded-lg text-orange-500 focus:ring-orange-500 accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Contact & Address */}
        {activeTab === "contact" && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Official Company Email
                </label>
                <input
                  type="email"
                  placeholder="contact@freshmart.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  General Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+855 12 345 678"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Headquarters Address
              </label>
              <textarea
                rows={2}
                placeholder="Building #123, Russian Blvd, Phnom Penh"
                value={formData.address || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Phnom Penh"
                  value={formData.city || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Country Code
                </label>
                <input
                  type="text"
                  placeholder="KH"
                  value={formData.country_code || "KH"}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country_code: e.target.value.toUpperCase() }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-mono"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="12000"
                  value={formData.postal_code || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, postal_code: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            {activeTab !== "general" && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "owner") setActiveTab("general");
                  else if (activeTab === "tax_currency") setActiveTab("owner");
                  else if (activeTab === "contact") setActiveTab("tax_currency");
                }}
                className="font-medium text-slate-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
              >
                ← Previous Step
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-orange-500/25 cursor-pointer"
            >
              {isLoading ? "Provisioning..." : "Create & Provision Tenant"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
