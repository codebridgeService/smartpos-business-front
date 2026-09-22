"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/context/business-context";
import { usersApi } from "@/lib/api/users";
import { businessUsersApi } from "@/lib/api/business-users";
import { outletsApi } from "@/lib/api/outlets";
import { rolesApi } from "@/lib/api/roles";
import { cashierProfilesApi } from "@/lib/api/cashier-profiles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ToggleSwitch } from "@/components/ui/toggle";
import type { Outlet, Role } from "@/types";
import {
  UserPlus,
  ArrowLeft,
  Shield,
  CreditCard,
  User,
  Crown,
  Package,
  Store,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Hash,
  Phone,
  Mail,
  Lock,
  Building2,
  Percent,
  RotateCcw,
  Ban,
  Check,
} from "lucide-react";

interface RoleCardConfig {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: any;
  accentColor: string;
  bgActive: string;
  borderActive: string;
  isCashierProfile: boolean;
}

const PRESET_ROLES: RoleCardConfig[] = [
  {
    id: "cashier",
    title: "Cashier",
    badge: "POS Checkout",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    description: "Operates register counters, processes customer sales, cash drawer float, and fast checkout.",
    icon: CreditCard,
    accentColor: "text-emerald-500",
    bgActive: "bg-emerald-500/5 dark:bg-emerald-950/20",
    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20",
    isCashierProfile: true,
  },
  {
    id: "staff",
    title: "Store Staff",
    badge: "General Ops",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    description: "Floor staff, customer assistance, basic product catalog lookups, and order fulfillment.",
    icon: User,
    accentColor: "text-blue-500",
    bgActive: "bg-blue-500/5 dark:bg-blue-950/20",
    borderActive: "border-blue-500 ring-2 ring-blue-500/20",
    isCashierProfile: false,
  },
  {
    id: "manager",
    title: "Store Manager",
    badge: "Supervisory",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    description: "Supervises branch shifts, reconciles cash drawers, authorizes discounts, voids, and returns.",
    icon: Shield,
    accentColor: "text-purple-500",
    bgActive: "bg-purple-500/5 dark:bg-purple-950/20",
    borderActive: "border-purple-500 ring-2 ring-purple-500/20",
    isCashierProfile: true,
  },
  {
    id: "inventory",
    title: "Inventory Specialist",
    badge: "Warehousing",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    description: "Manages warehouse stock levels, supplier receiving, stock transfers, and count audits.",
    icon: Package,
    accentColor: "text-amber-500",
    bgActive: "bg-amber-500/5 dark:bg-amber-950/20",
    borderActive: "border-amber-500 ring-2 ring-amber-500/20",
    isCashierProfile: false,
  },
  {
    id: "admin",
    title: "Business Admin",
    badge: "Full Control",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    description: "Full administrative access over business settings, outlets, team members, and reports.",
    icon: Crown,
    accentColor: "text-rose-500",
    bgActive: "bg-rose-500/5 dark:bg-rose-950/20",
    borderActive: "border-rose-500 ring-2 ring-rose-500/20",
    isCashierProfile: true,
  },
];

export default function CreateBusinessUserPage() {
  const router = useRouter();
  const { activeBusiness } = useBusiness();
  const toast = useToast();

  const businessUuid = activeBusiness?.uuid || "";

  // Data
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [customRoles, setCustomRoles] = useState<Role[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form: Role
  const [selectedRole, setSelectedRole] = useState<string>("cashier");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [selectedCustomRoleUuid, setSelectedCustomRoleUuid] = useState("");

  // Form: User Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form: Job & Outlet
  const [primaryOutletUuid, setPrimaryOutletUuid] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [notes, setNotes] = useState("");

  // Form: Cashier / POS Permissions
  const [pinCode, setPinCode] = useState("");
  const [canRefund, setCanRefund] = useState(false);
  const [canVoid, setCanVoid] = useState(false);
  const [canDiscount, setCanDiscount] = useState(false);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState("10.00");

  // Load Outlets and Custom Business Roles
  useEffect(() => {
    if (!businessUuid) return;

    let isMounted = true;
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const [outletsRes, rolesRes] = await Promise.allSettled([
          outletsApi.getOutlets(businessUuid),
          rolesApi.getRoles({ business_uuid: businessUuid }),
        ]);

        if (isMounted) {
          if (outletsRes.status === "fulfilled") {
            setOutlets(outletsRes.value);
            if (outletsRes.value.length > 0) {
              setPrimaryOutletUuid(outletsRes.value[0].uuid);
            }
          }
          if (rolesRes.status === "fulfilled") {
            const raw = rolesRes.value;
            const roleList = Array.isArray(raw)
              ? raw
              : "data" in raw && Array.isArray(raw.data)
              ? raw.data
              : [];
            setCustomRoles(roleList);
          }
        }
      } catch (e) {
        console.error("Failed to load metadata:", e);
      } finally {
        if (isMounted) setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
    return () => {
      isMounted = false;
    };
  }, [businessUuid]);

  // Auto-suggest employee code when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (!username && val) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15));
    }
  };

  // Generate random secure password
  const generatePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
    setShowPassword(true);
  };

  // Auto-generate 4-digit PIN
  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(pin);
  };

  const selectedRoleConfig = PRESET_ROLES.find((r) => r.id === selectedRole) || PRESET_ROLES[0];
  const requiresCashierPIN = selectedRoleConfig.isCashierProfile || selectedRole === "cashier";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide the staff member's full name.");
      return;
    }

    if (!email.trim() && !username.trim()) {
      setError("Please provide an email address or username for login.");
      return;
    }

    if (pinCode && pinCode.length !== 4) {
      setError("POS PIN code must be exactly 4 digits.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create or Register User Account in Identity Service
      const roleCodeToAssign = isCustomRole ? selectedCustomRoleUuid : selectedRole;

      const userRes = await usersApi.createUser({
        name: name.trim(),
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password || undefined,
        role_code: roleCodeToAssign,
        business_uuid: businessUuid,
      });

      const createdUser = userRes.data;
      const userUuid = createdUser.uuid;

      // 2. Attach User to Business Membership
      const businessUser = await businessUsersApi.addBusinessUser(businessUuid, {
        user_uuid: userUuid,
        role: roleCodeToAssign,
        job_title: jobTitle.trim() || selectedRoleConfig.title,
        employee_code: employeeCode.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        pin_code: pinCode.trim() || undefined,
        status: "active",
        is_owner: selectedRole === "admin",
      });

      // 3. Assign Primary Outlet if selected
      if (primaryOutletUuid && businessUser.uuid) {
        try {
          await businessUsersApi.assignUserOutlet(businessUuid, businessUser.uuid, {
            outlet_uuid: primaryOutletUuid,
            is_primary: true,
            is_active: true,
          });
        } catch (outletErr) {
          console.warn("Failed to assign primary outlet:", outletErr);
        }
      }

      // 4. Update Cashier Permissions if relevant
      if (requiresCashierPIN && pinCode) {
        try {
          await cashierProfilesApi.updateProfile(businessUuid, businessUser.uuid, {
            display_name: name.trim(),
            can_sell: true,
            can_refund: canRefund,
            can_void: canVoid,
            can_discount: canDiscount,
            max_discount_percent: canDiscount ? maxDiscountPercent : "0.00",
            pin_code: pinCode,
          });
        } catch (profileErr) {
          console.warn("Cashier profile setup note:", profileErr);
        }
      }

      toast.success(`User "${name}" successfully created with role: ${selectedRoleConfig.title}!`);
      router.push("/businesses/staff");
    } catch (err: any) {
      console.error("Create user error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create user. Please check credentials and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header & Navigation */}
      <div>
        <Link
          href="/businesses/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Staff & Members</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create User / Staff Member
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Add a new user account as a Cashier, Staff, Manager, or Admin for{" "}
              <strong>{activeBusiness?.name || "this business"}</strong>.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* 2. ROLE SELECTION MATRIX (The Core Requirement) */}
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                1. Select Role & Access Level <span className="text-orange-500">*</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Choose the member&apos;s functional role: Cashier, Staff, Manager, or Custom Role.
              </p>
            </div>
            <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
              {selectedRoleConfig.title}
            </Badge>
          </div>

          {/* Preset Roles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {PRESET_ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = !isCustomRole && selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setIsCustomRole(false);
                    setSelectedRole(r.id);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? `${r.borderActive} ${r.bgActive} shadow-sm`
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-2xs ${r.accentColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge className={`text-[10px] py-0 px-1.5 font-bold uppercase tracking-wider ${r.badgeColor}`}>
                        {r.badge}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{r.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Optional: Pick from Custom Business Roles */}
          {customRoles.length > 0 && (
            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Or Assign Custom Business Role:
              </label>
              <select
                value={isCustomRole ? selectedCustomRoleUuid : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setIsCustomRole(true);
                    setSelectedCustomRoleUuid(e.target.value);
                  } else {
                    setIsCustomRole(false);
                  }
                }}
                className="w-full sm:w-80 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">-- Choose Custom Role --</option>
                {customRoles.map((role) => (
                  <option key={role.uuid} value={role.code || role.uuid}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </Card>

        {/* 3. USER ACCOUNT CREDENTIALS */}
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xs space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              2. User Account Credentials
            </h2>
            <p className="text-xs text-zinc-500">
              Basic identity information for login and store attribution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. John Doe / Sok Dara"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  placeholder="cashier@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Username (for Login)
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="john_cashier"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Password with Auto-generate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Login Password
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Generate
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. OUTLET & EMPLOYEE DETAILS */}
        <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xs space-y-4">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              3. Store Assignment & Operational Info
            </h2>
            <p className="text-xs text-zinc-500">
              Assign the staff member to an outlet branch and set job classification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Primary Outlet */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Primary Outlet Assignment <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select
                  value={primaryOutletUuid}
                  onChange={(e) => setPrimaryOutletUuid(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                >
                  {outlets.map((o) => (
                    <option key={o.uuid} value={o.uuid}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Employee Code / Badge #
              </label>
              <input
                type="text"
                placeholder="EMP-007"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="+855 12 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lead Cashier (Morning Shift)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Administrative Notes
              </label>
              <input
                type="text"
                placeholder="Onboarding notes, shift preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
        </Card>

        {/* 5. CASHIER / POS TERMINAL PERMISSIONS (Highlighted when Cashier or Manager) */}
        {requiresCashierPIN && (
          <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-3xl shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    4. Cashier POS Terminal Quick PIN & Privileges
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Set up terminal lock PIN code and register permissions for this cashier.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={generatePin}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate PIN
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  4-Digit Terminal Quick PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full sm:w-48 px-4 py-2.5 text-center tracking-widest font-mono text-lg font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Quick unlock code for the POS terminal lock screen.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-3 bg-white/60 dark:bg-zinc-900/60 p-4 rounded-2xl border border-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Can Process Customer Refunds
                    </span>
                  </div>
                  <ToggleSwitch checked={canRefund} onChange={setCanRefund} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Can Void Cart Line Items
                    </span>
                  </div>
                  <ToggleSwitch checked={canVoid} onChange={setCanVoid} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Can Apply Custom Discounts
                    </span>
                  </div>
                  <ToggleSwitch checked={canDiscount} onChange={setCanDiscount} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Form Submit & Cancel */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Link href="/businesses/staff">
            <Button type="button" variant="outline" disabled={isSubmitting} className="rounded-xl px-5">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-6 shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isSubmitting ? "Creating User..." : `Create ${selectedRoleConfig.title}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
