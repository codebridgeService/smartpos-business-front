"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Key,
  Shield,
  ShieldCheck,
  Search,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Layers,
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Calculator,
  Tablet,
  CreditCard,
  Package,
  FolderTree,
  Tag,
  Scale,
  Barcode,
  Smartphone,
  History,
  Lock,
  Boxes,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  FolderClosed,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { usePermissionStore } from "@/stores/usePermissionStore";
import {
  BatchCreatePermissionModal,
  EditPermissionModal,
  DeletePermissionModal,
} from "@/components/admin/permissions";
import type { Permission } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  SearchInput,
} from "@/components/ui";

// Comprehensive catalog of standard SmartPOS permissions (grounded in Identity Service RoleAndPermissionSeeder)
export const DEFAULT_PERMISSIONS: Permission[] = [
  // User Management
  {
    id: 1,
    uuid: "perm-users-01",
    code: "users.view",
    name: "View Users",
    module: "users",
    description: "Can view users list and details",
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    uuid: "perm-users-02",
    code: "users.create",
    name: "Create Users",
    module: "users",
    description: "Can create new users",
    created_at: null,
    updated_at: null,
  },
  {
    id: 3,
    uuid: "perm-users-03",
    code: "users.update",
    name: "Update Users",
    module: "users",
    description: "Can update user profiles",
    created_at: null,
    updated_at: null,
  },
  {
    id: 4,
    uuid: "perm-users-04",
    code: "users.delete",
    name: "Delete Users",
    module: "users",
    description: "Can delete users",
    created_at: null,
    updated_at: null,
  },
  {
    id: 5,
    uuid: "perm-users-05",
    code: "users.manage",
    name: "Full User Management",
    module: "users",
    description: "Can perform all user administrative actions",
    created_at: null,
    updated_at: null,
  },

  // Role Management
  {
    id: 6,
    uuid: "perm-roles-01",
    code: "roles.view",
    name: "View Roles",
    module: "roles",
    description: "Can view roles and permissions",
    created_at: null,
    updated_at: null,
  },
  {
    id: 7,
    uuid: "perm-roles-02",
    code: "roles.create",
    name: "Create Roles",
    module: "roles",
    description: "Can create new roles",
    created_at: null,
    updated_at: null,
  },
  {
    id: 8,
    uuid: "perm-roles-03",
    code: "roles.update",
    name: "Update Roles",
    module: "roles",
    description: "Can update roles",
    created_at: null,
    updated_at: null,
  },
  {
    id: 9,
    uuid: "perm-roles-04",
    code: "roles.delete",
    name: "Delete Roles",
    module: "roles",
    description: "Can delete roles",
    created_at: null,
    updated_at: null,
  },
  {
    id: 10,
    uuid: "perm-roles-05",
    code: "roles.manage",
    name: "Full Role Management",
    module: "roles",
    description: "Can perform all role administrative actions",
    created_at: null,
    updated_at: null,
  },
  {
    id: 11,
    uuid: "perm-roles-06",
    code: "user_roles.assign",
    name: "Assign User Roles",
    module: "roles",
    description: "Can assign roles to users",
    created_at: null,
    updated_at: null,
  },
  {
    id: 12,
    uuid: "perm-roles-07",
    code: "user_roles.remove",
    name: "Remove User Roles",
    module: "roles",
    description: "Can remove roles from users",
    created_at: null,
    updated_at: null,
  },

  // Permission Management
  {
    id: 13,
    uuid: "perm-perm-01",
    code: "permissions.view",
    name: "View Permissions",
    module: "permissions",
    description: "Can view permission lists",
    created_at: null,
    updated_at: null,
  },
  {
    id: 14,
    uuid: "perm-perm-02",
    code: "permissions.create",
    name: "Create Permissions",
    module: "permissions",
    description: "Can create permissions",
    created_at: null,
    updated_at: null,
  },
  {
    id: 15,
    uuid: "perm-perm-03",
    code: "permissions.update",
    name: "Update Permissions",
    module: "permissions",
    description: "Can update permissions",
    created_at: null,
    updated_at: null,
  },
  {
    id: 16,
    uuid: "perm-perm-04",
    code: "permissions.delete",
    name: "Delete Permissions",
    module: "permissions",
    description: "Can delete permissions",
    created_at: null,
    updated_at: null,
  },

  // POS Terminal Quick PIN Management
  {
    id: 17,
    uuid: "perm-pospin-01",
    code: "pos_pin.view",
    name: "View POS PIN Status",
    module: "pos_pin",
    description: "Can view POS PIN status",
    created_at: null,
    updated_at: null,
  },
  {
    id: 18,
    uuid: "perm-pospin-02",
    code: "pos_pin.update",
    name: "Update POS PIN",
    module: "pos_pin",
    description: "Can update cashier POS PIN",
    created_at: null,
    updated_at: null,
  },
  {
    id: 19,
    uuid: "perm-pospin-03",
    code: "pos_pin.verify",
    name: "Verify POS PIN",
    module: "pos_pin",
    description: "Can quick-verify POS PIN at terminal",
    created_at: null,
    updated_at: null,
  },
  {
    id: 20,
    uuid: "perm-pospin-04",
    code: "pos_pin.manage",
    name: "Full POS PIN Management",
    module: "pos_pin",
    description: "Can manage cashier PINs",
    created_at: null,
    updated_at: null,
  },

  // Device & Session Management
  {
    id: 21,
    uuid: "perm-devices-01",
    code: "devices.view",
    name: "View Devices",
    module: "devices",
    description: "Can view trusted devices",
    created_at: null,
    updated_at: null,
  },
  {
    id: 22,
    uuid: "perm-devices-02",
    code: "devices.trust",
    name: "Trust Devices",
    module: "devices",
    description: "Can mark user devices as trusted",
    created_at: null,
    updated_at: null,
  },
  {
    id: 23,
    uuid: "perm-devices-03",
    code: "devices.block",
    name: "Block Devices",
    module: "devices",
    description: "Can block/unblock devices",
    created_at: null,
    updated_at: null,
  },
  {
    id: 24,
    uuid: "perm-devices-04",
    code: "devices.manage",
    name: "Full Device Management",
    module: "devices",
    description: "Can manage device trust status",
    created_at: null,
    updated_at: null,
  },
  {
    id: 25,
    uuid: "perm-sess-01",
    code: "sessions.view",
    name: "View Active Sessions",
    module: "sessions",
    description: "Can view active sessions",
    created_at: null,
    updated_at: null,
  },
  {
    id: 26,
    uuid: "perm-sess-02",
    code: "sessions.revoke",
    name: "Revoke Sessions",
    module: "sessions",
    description: "Can terminate user sessions",
    created_at: null,
    updated_at: null,
  },

  // Security Audit & Dashboard
  {
    id: 27,
    uuid: "perm-dash-01",
    code: "dashboard.view",
    name: "View Dashboard",
    module: "dashboard",
    description: "Can view identity service metrics",
    created_at: null,
    updated_at: null,
  },
  {
    id: 28,
    uuid: "perm-sec-01",
    code: "login_attempts.view",
    name: "View Login Attempts",
    module: "security",
    description: "Can view login security logs",
    created_at: null,
    updated_at: null,
  },

  // POS Operation Permissions
  {
    id: 29,
    uuid: "perm-pos-01",
    code: "pos.access",
    name: "Access POS Terminal",
    module: "pos",
    description: "Can access cashier POS interface",
    created_at: null,
    updated_at: null,
  },
  {
    id: 30,
    uuid: "perm-pos-02",
    code: "pos.checkout",
    name: "Process Checkout",
    module: "pos",
    description: "Can process sales transactions",
    created_at: null,
    updated_at: null,
  },
  {
    id: 31,
    uuid: "perm-pos-03",
    code: "pos.refund",
    name: "Process Refund",
    module: "pos",
    description: "Can issue sales refunds",
    created_at: null,
    updated_at: null,
  },

  // Inventory Permissions
  {
    id: 32,
    uuid: "perm-inv-01",
    code: "inventory.view",
    name: "View Inventory",
    module: "inventory",
    description: "Can view store stock levels",
    created_at: null,
    updated_at: null,
  },
  {
    id: 33,
    uuid: "perm-inv-02",
    code: "inventory.update",
    name: "Update Inventory",
    module: "inventory",
    description: "Can adjust stock levels",
    created_at: null,
    updated_at: null,
  },

  // Business Management
  {
    id: 34,
    uuid: "perm-bus-01",
    code: "businesses.view",
    name: "View Businesses",
    module: "businesses",
    description: "Can view business profiles and details",
    created_at: null,
    updated_at: null,
  },
  {
    id: 35,
    uuid: "perm-bus-02",
    code: "businesses.create",
    name: "Create Businesses",
    module: "businesses",
    description: "Can create new businesses",
    created_at: null,
    updated_at: null,
  },
  {
    id: 36,
    uuid: "perm-bus-03",
    code: "businesses.update",
    name: "Update Businesses",
    module: "businesses",
    description: "Can update business details and settings",
    created_at: null,
    updated_at: null,
  },
  {
    id: 37,
    uuid: "perm-bus-04",
    code: "businesses.delete",
    name: "Delete Businesses",
    module: "businesses",
    description: "Can delete businesses",
    created_at: null,
    updated_at: null,
  },

  // Business User Membership
  {
    id: 38,
    uuid: "perm-busu-01",
    code: "business_users.view",
    name: "View Business Users",
    module: "business_users",
    description: "Can view users assigned to a business",
    created_at: null,
    updated_at: null,
  },
  {
    id: 39,
    uuid: "perm-busu-02",
    code: "business_users.manage",
    name: "Manage Business Users",
    module: "business_users",
    description: "Can add, update, suspend, or remove users in a business",
    created_at: null,
    updated_at: null,
  },

  // Outlets & Locations
  {
    id: 40,
    uuid: "perm-out-01",
    code: "outlets.view",
    name: "View Outlets",
    module: "outlets",
    description: "Can view outlet locations",
    created_at: null,
    updated_at: null,
  },
  {
    id: 41,
    uuid: "perm-out-02",
    code: "outlets.create",
    name: "Create Outlets",
    module: "outlets",
    description: "Can create new outlets for a business",
    created_at: null,
    updated_at: null,
  },
  {
    id: 42,
    uuid: "perm-out-03",
    code: "outlets.update",
    name: "Update Outlets",
    module: "outlets",
    description: "Can update outlet settings and details",
    created_at: null,
    updated_at: null,
  },
  {
    id: 43,
    uuid: "perm-out-04",
    code: "outlets.delete",
    name: "Delete Outlets",
    module: "outlets",
    description: "Can delete outlets",
    created_at: null,
    updated_at: null,
  },

  // Cash Registers & Drawers
  {
    id: 44,
    uuid: "perm-reg-01",
    code: "registers.view",
    name: "View Registers",
    module: "registers",
    description: "Can view cash registers and points of sale",
    created_at: null,
    updated_at: null,
  },
  {
    id: 45,
    uuid: "perm-reg-02",
    code: "registers.create",
    name: "Create Registers",
    module: "registers",
    description: "Can create new cash registers for an outlet",
    created_at: null,
    updated_at: null,
  },
  {
    id: 46,
    uuid: "perm-reg-03",
    code: "registers.update",
    name: "Update Registers",
    module: "registers",
    description: "Can update cash register configurations",
    created_at: null,
    updated_at: null,
  },
  {
    id: 47,
    uuid: "perm-reg-04",
    code: "registers.manage",
    name: "Manage Registers",
    module: "registers",
    description: "Can delete and manage cash registers",
    created_at: null,
    updated_at: null,
  },

  // POS Hardware Devices
  {
    id: 48,
    uuid: "perm-posdev-01",
    code: "pos_devices.view",
    name: "View POS Devices",
    module: "pos_devices",
    description: "Can view POS hardware devices and status",
    created_at: null,
    updated_at: null,
  },
  {
    id: 49,
    uuid: "perm-posdev-02",
    code: "pos_devices.create",
    name: "Create POS Devices",
    module: "pos_devices",
    description: "Can register new POS devices for an outlet",
    created_at: null,
    updated_at: null,
  },
  {
    id: 50,
    uuid: "perm-posdev-03",
    code: "pos_devices.update",
    name: "Update POS Devices",
    module: "pos_devices",
    description: "Can update POS device configurations",
    created_at: null,
    updated_at: null,
  },
  {
    id: 51,
    uuid: "perm-posdev-04",
    code: "pos_devices.manage",
    name: "Manage POS Devices",
    module: "pos_devices",
    description: "Can activate, revoke, lock, and rotate secrets for POS devices",
    created_at: null,
    updated_at: null,
  },

  // Products & Variants
  {
    id: 52,
    uuid: "perm-prod-01",
    code: "products.view",
    name: "View Products",
    module: "products",
    description: "Can view products, variants, and product catalog details",
    created_at: null,
    updated_at: null,
  },
  {
    id: 53,
    uuid: "perm-prod-02",
    code: "products.create",
    name: "Create Products",
    module: "products",
    description: "Can create new products and variants",
    created_at: null,
    updated_at: null,
  },
  {
    id: 54,
    uuid: "perm-prod-03",
    code: "products.update",
    name: "Update Products",
    module: "products",
    description: "Can update products and variants",
    created_at: null,
    updated_at: null,
  },
  {
    id: 55,
    uuid: "perm-prod-04",
    code: "products.delete",
    name: "Delete Products",
    module: "products",
    description: "Can delete products and variants",
    created_at: null,
    updated_at: null,
  },

  // Categories
  {
    id: 56,
    uuid: "perm-cat-01",
    code: "categories.view",
    name: "View Categories",
    module: "categories",
    description: "Can view product categories",
    created_at: null,
    updated_at: null,
  },
  {
    id: 57,
    uuid: "perm-cat-02",
    code: "categories.create",
    name: "Create Categories",
    module: "categories",
    description: "Can create product categories",
    created_at: null,
    updated_at: null,
  },
  {
    id: 58,
    uuid: "perm-cat-03",
    code: "categories.update",
    name: "Update Categories",
    module: "categories",
    description: "Can update product categories",
    created_at: null,
    updated_at: null,
  },
  {
    id: 59,
    uuid: "perm-cat-04",
    code: "categories.delete",
    name: "Delete Categories",
    module: "categories",
    description: "Can delete product categories",
    created_at: null,
    updated_at: null,
  },

  // Brands
  {
    id: 60,
    uuid: "perm-brand-01",
    code: "brands.view",
    name: "View Brands",
    module: "brands",
    description: "Can view product brands",
    created_at: null,
    updated_at: null,
  },
  {
    id: 61,
    uuid: "perm-brand-02",
    code: "brands.create",
    name: "Create Brands",
    module: "brands",
    description: "Can create product brands",
    created_at: null,
    updated_at: null,
  },
  {
    id: 62,
    uuid: "perm-brand-03",
    code: "brands.update",
    name: "Update Brands",
    module: "brands",
    description: "Can update product brands",
    created_at: null,
    updated_at: null,
  },
  {
    id: 63,
    uuid: "perm-brand-04",
    code: "brands.delete",
    name: "Delete Brands",
    module: "brands",
    description: "Can delete product brands",
    created_at: null,
    updated_at: null,
  },

  // Units
  {
    id: 64,
    uuid: "perm-unit-01",
    code: "units.view",
    name: "View Units",
    module: "units",
    description: "Can view units of measurement",
    created_at: null,
    updated_at: null,
  },
  {
    id: 65,
    uuid: "perm-unit-02",
    code: "units.create",
    name: "Create Units",
    module: "units",
    description: "Can create units of measurement",
    created_at: null,
    updated_at: null,
  },
  {
    id: 66,
    uuid: "perm-unit-03",
    code: "units.update",
    name: "Update Units",
    module: "units",
    description: "Can update units of measurement",
    created_at: null,
    updated_at: null,
  },
  {
    id: 67,
    uuid: "perm-unit-04",
    code: "units.delete",
    name: "Delete Units",
    module: "units",
    description: "Can delete units of measurement",
    created_at: null,
    updated_at: null,
  },

  // Product Codes & Barcodes
  {
    id: 68,
    uuid: "perm-pc-01",
    code: "product_codes.view",
    name: "View Product Codes",
    module: "product_codes",
    description: "Can view barcodes and SKUs",
    created_at: null,
    updated_at: null,
  },
  {
    id: 69,
    uuid: "perm-pc-02",
    code: "product_codes.create",
    name: "Create Product Codes",
    module: "product_codes",
    description: "Can create and generate barcodes and SKUs",
    created_at: null,
    updated_at: null,
  },
  {
    id: 70,
    uuid: "perm-pc-03",
    code: "product_codes.delete",
    name: "Delete Product Codes",
    module: "product_codes",
    description: "Can delete barcodes and SKUs",
    created_at: null,
    updated_at: null,
  },

  // Product Prices
  {
    id: 71,
    uuid: "perm-pp-01",
    code: "product_prices.view",
    name: "View Product Prices",
    module: "product_prices",
    description: "Can view pricing tiers and history",
    created_at: null,
    updated_at: null,
  },
  {
    id: 72,
    uuid: "perm-pp-02",
    code: "product_prices.create",
    name: "Create Product Prices",
    module: "product_prices",
    description: "Can create product prices",
    created_at: null,
    updated_at: null,
  },
  {
    id: 73,
    uuid: "perm-pp-03",
    code: "product_prices.update",
    name: "Update Product Prices",
    module: "product_prices",
    description: "Can update product prices",
    created_at: null,
    updated_at: null,
  },
  {
    id: 74,
    uuid: "perm-pp-04",
    code: "product_prices.delete",
    name: "Delete Product Prices",
    module: "product_prices",
    description: "Can delete product prices",
    created_at: null,
    updated_at: null,
  },

  // Product Images
  {
    id: 75,
    uuid: "perm-pi-01",
    code: "product_images.view",
    name: "View Product Images",
    module: "product_images",
    description: "Can view product gallery images",
    created_at: null,
    updated_at: null,
  },
  {
    id: 76,
    uuid: "perm-pi-02",
    code: "product_images.create",
    name: "Upload Product Images",
    module: "product_images",
    description: "Can upload product images",
    created_at: null,
    updated_at: null,
  },
  {
    id: 77,
    uuid: "perm-pi-03",
    code: "product_images.delete",
    name: "Delete Product Images",
    module: "product_images",
    description: "Can delete product images",
    created_at: null,
    updated_at: null,
  },

  // Label Templates & Barcode Printing
  {
    id: 78,
    uuid: "perm-lbl-01",
    code: "labels.view",
    name: "View Labels",
    module: "labels",
    description: "Can view label templates and print previews",
    created_at: null,
    updated_at: null,
  },
  {
    id: 79,
    uuid: "perm-lbl-02",
    code: "labels.print",
    name: "Print Barcode Labels",
    module: "labels",
    description: "Can print product barcode labels",
    created_at: null,
    updated_at: null,
  },
  {
    id: 80,
    uuid: "perm-lbl-03",
    code: "labels.manage",
    name: "Manage Label Templates",
    module: "labels",
    description: "Can create, update, and delete label templates",
    created_at: null,
    updated_at: null,
  },
];

// Module metadata (Display name, Icon, Description, Theme accent)
interface ModuleMeta {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

const MODULE_REGISTRY: Record<string, ModuleMeta> = {
  dashboard: {
    title: "Dashboard & Analytics",
    description: "Executive KPIs, sales metrics, and administrative overviews",
    icon: <LayoutDashboard className="h-4.5 w-4.5 text-orange-500" />,
    accent: "border-orange-200 dark:border-orange-900/50",
  },
  businesses: {
    title: "Business & Tenancy",
    description: "Multi-tenant company profiles, settings, and regional currencies",
    icon: <Store className="h-4.5 w-4.5 text-blue-500" />,
    accent: "border-blue-200 dark:border-blue-900/50",
  },
  business_users: {
    title: "Business Staff & Members",
    description: "Employee assignment, tenant memberships, and user provisioning",
    icon: <Users className="h-4.5 w-4.5 text-indigo-500" />,
    accent: "border-indigo-200 dark:border-indigo-900/50",
  },
  outlets: {
    title: "Outlets & Branches",
    description: "Store branches, physical locations, and regional outlet management",
    icon: <Building2 className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  registers: {
    title: "Cash Registers & Cashiers",
    description: "POS physical cash counters, drawer management, and shift balances",
    icon: <Calculator className="h-4.5 w-4.5 text-teal-500" />,
    accent: "border-teal-200 dark:border-teal-900/50",
  },
  pos_devices: {
    title: "POS Hardware Devices",
    description: "Android tablets, receipt printers, customer displays, and device tokens",
    icon: <Tablet className="h-4.5 w-4.5 text-cyan-500" />,
    accent: "border-cyan-200 dark:border-cyan-900/50",
  },
  pos: {
    title: "POS & Sales Checkout",
    description: "Live point of sale terminal operations, refunds, and split tenders",
    icon: <CreditCard className="h-4.5 w-4.5 text-amber-500" />,
    accent: "border-amber-200 dark:border-amber-900/50",
  },
  pos_pin: {
    title: "POS Quick PIN",
    description: "Cashier rapid terminal unlocking, PIN security, and fast authentication",
    icon: <Lock className="h-4.5 w-4.5 text-amber-500" />,
    accent: "border-amber-200 dark:border-amber-900/50",
  },
  inventory: {
    title: "Inventory & Warehouses",
    description: "Central warehouse stocks, batch transfers, and count adjustments",
    icon: <Layers className="h-4.5 w-4.5 text-purple-500" />,
    accent: "border-purple-200 dark:border-purple-900/50",
  },
  products: {
    title: "Product Catalog",
    description: "Master product catalog, SKU variants, and barcode lookups",
    icon: <Package className="h-4.5 w-4.5 text-rose-500" />,
    accent: "border-rose-200 dark:border-rose-900/50",
  },
  categories: {
    title: "Categories & Taxonomies",
    description: "Product categories, sub-categories, and navigation trees",
    icon: <FolderTree className="h-4.5 w-4.5 text-lime-500" />,
    accent: "border-lime-200 dark:border-lime-900/50",
  },
  brands: {
    title: "Brands & Manufacturers",
    description: "Product brand registry, vendor details, and trade marks",
    icon: <Tag className="h-4.5 w-4.5 text-pink-500" />,
    accent: "border-pink-200 dark:border-pink-900/50",
  },
  units: {
    title: "Units of Measurement",
    description: "Measurement units (kg, pcs, boxes) and conversion formulas",
    icon: <Scale className="h-4.5 w-4.5 text-violet-500" />,
    accent: "border-violet-200 dark:border-violet-900/50",
  },
  product_codes: {
    title: "Barcodes & SKUs",
    description: "Product barcode generation, SKU registry, and automated code lookups",
    icon: <Barcode className="h-4.5 w-4.5 text-indigo-500" />,
    accent: "border-indigo-200 dark:border-indigo-900/50",
  },
  product_prices: {
    title: "Product Pricing Tiers",
    description: "Wholesale, retail, and promotional tier price structures",
    icon: <CreditCard className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  product_images: {
    title: "Product Gallery & Media",
    description: "Product photography, variant media uploads, and catalog galleries",
    icon: <FolderOpen className="h-4.5 w-4.5 text-cyan-500" />,
    accent: "border-cyan-200 dark:border-cyan-900/50",
  },
  labels: {
    title: "Barcodes & Thermal Labels",
    description: "Barcode and QR code generator and printing specifications",
    icon: <Barcode className="h-4.5 w-4.5 text-slate-500" />,
    accent: "border-slate-200 dark:border-slate-800",
  },
  roles: {
    title: "Roles & RBAC Policies",
    description: "Role templates, tenant permissions, and access assignment",
    icon: <ShieldCheck className="h-4.5 w-4.5 text-sky-500" />,
    accent: "border-sky-200 dark:border-sky-900/50",
  },
  permissions: {
    title: "System Permissions",
    description: "Master list of granular capabilities and API access rules",
    icon: <Key className="h-4.5 w-4.5 text-amber-500" />,
    accent: "border-amber-200 dark:border-amber-900/50",
  },
  users: {
    title: "User Accounts",
    description: "User profile directory, account verification, and status",
    icon: <Users className="h-4.5 w-4.5 text-blue-500" />,
    accent: "border-blue-200 dark:border-blue-900/50",
  },
  devices: {
    title: "Device Security",
    description: "Browser fingerprinting, trusted device registry, and blocklist",
    icon: <Smartphone className="h-4.5 w-4.5 text-emerald-500" />,
    accent: "border-emerald-200 dark:border-emerald-900/50",
  },
  sessions: {
    title: "Active Sessions",
    description: "JWT tokens, refresh sessions, and remote session revocation",
    icon: <History className="h-4.5 w-4.5 text-orange-500" />,
    accent: "border-orange-200 dark:border-orange-900/50",
  },
  security: {
    title: "Security & Audit Logs",
    description: "Brute-force protection, login attempts, and pentest monitoring",
    icon: <Lock className="h-4.5 w-4.5 text-rose-500" />,
    accent: "border-rose-200 dark:border-rose-900/50",
  },
};

export default function AdminPermissionsPage() {
  const {
    permissions,
    isLoading,
    error,
    searchQuery,
    selectedModule,
    selectedAction,
    collapsedModules,
    isBatchModalOpen,
    permissionToEdit,
    permissionToDelete,
    setPermissions,
    setSearchQuery,
    setSelectedModule,
    setSelectedAction,
    toggleModuleCollapse,
    toggleAllModules,
    openBatchModal,
    closeBatchModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    fetchPermissions,
    getModules,
    getGroupedMatrix,
  } = usePermissionStore();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (usePermissionStore.getState().permissions.length === 0) {
      setPermissions(DEFAULT_PERMISSIONS);
    }
    void fetchPermissions();
  }, [fetchPermissions, setPermissions]);

  // Copy code handler with visual feedback
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 2000);
    } catch {
      // Ignore clipboard error
    }
  };

  // Derive unique modules and grouped permissions directly from PermissionState getters
  const allModules = useMemo(() => getModules(), [permissions, getModules]);
  const groupedPermissions = useMemo(
    () => getGroupedMatrix(),
    [permissions, searchQuery, selectedModule, selectedAction, getGroupedMatrix]
  );

  // Helper for action badge styling
  const getActionBadge = (code: string) => {
    const action = code.split(".").pop()?.toLowerCase() || "";

    if (action.includes("create") || action.includes("assign")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
          Create
        </span>
      );
    }
    if (action.includes("update") || action.includes("trust") || action.includes("verify")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
          Update
        </span>
      );
    }
    if (action.includes("delete") || action.includes("remove") || action.includes("block") || action.includes("revoke")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          Delete
        </span>
      );
    }
    if (action.includes("manage") || action.includes("access") || action.includes("checkout")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
          Manage
        </span>
      );
    }
    if (action.includes("print")) {
      return (
        <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
          Print
        </span>
      );
    }

    // Default: View
    return (
      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
        View
      </span>
    );
  };

  const areAllCollapsed =
    allModules.length > 0 && allModules.every((mod) => collapsedModules[mod]);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-1">
            <Link href="/admin" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/roles" className="hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
              Roles & RBAC
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-zinc-100 font-semibold">Permissions Directory</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60">
              <Key className="h-6 w-6" />
            </div>
            System Permissions Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            List of all granular permissions ordered by module for role assignment and API capability enforcement.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/admin/roles">
            <Button variant="outline" size="md" leftIcon={<Shield className="h-4 w-4" />}>
              Manage Roles
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="md"
            onClick={() => void fetchPermissions(true)}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Reload
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={openBatchModal}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Batch Create
          </Button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div
          data-testid="permissions-error-banner"
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Server Notice:</strong> {error}. Showing offline fallback catalog.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchPermissions(true)}
            isLoading={isLoading}
            className="shrink-0"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Permissions</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {permissions.length}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Active Modules</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {allModules.length}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">RBAC Enforcement</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Identity Service</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-zinc-400">Filtered Results</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {groupedPermissions.totalMatching}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <SearchInput
              placeholder="Search by permission code, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Module Filter Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Module:</span>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all">All Modules ({allModules.length})</option>
                {allModules.map((mod) => (
                  <option key={mod} value={mod}>
                    {MODULE_REGISTRY[mod]?.title || mod.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
              <span>Action:</span>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="all">All Actions</option>
                <option value="view">View</option>
                <option value="create">Create / Add</option>
                <option value="update">Update / Edit</option>
                <option value="delete">Delete / Remove</option>
                <option value="manage">Manage / Operate</option>
              </select>
            </div>

            {/* Expand / Collapse All */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleAllModules(areAllCollapsed)}
              leftIcon={
                areAllCollapsed ? (
                  <FolderOpen className="h-3.5 w-3.5" />
                ) : (
                  <FolderClosed className="h-3.5 w-3.5" />
                )
              }
            >
              {areAllCollapsed ? "Expand All" : "Collapse All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Permissions List Grouped and Ordered by Module */}
      {groupedPermissions.sortedModuleKeys.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">
            No permissions match your search criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the module selector, or clearing active filters.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedModule("all");
                setSelectedAction("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedPermissions.sortedModuleKeys.map((moduleKey) => {
            const modulePerms = groupedPermissions.groups[moduleKey];
            const meta = MODULE_REGISTRY[moduleKey] || {
              title: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1),
              description: `Operations and access control for ${moduleKey}`,
              icon: <Layers className="h-4.5 w-4.5 text-slate-500" />,
              accent: "border-slate-200 dark:border-zinc-800",
            };
            const isCollapsed = collapsedModules[moduleKey] ?? false;

            return (
              <div
                key={moduleKey}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-150"
              >
                {/* Module Header / Accordion Bar */}
                <div
                  onClick={() => toggleModuleCollapse(moduleKey)}
                  className="px-5 py-3.5 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 shadow-xs shrink-0">
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {meta.title}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold uppercase">
                          {moduleKey}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900/60">
                      {modulePerms.length} {modulePerms.length === 1 ? "Permission" : "Permissions"}
                    </span>
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Module Permissions Table / List */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {modulePerms.map((perm) => {
                      const isCopied = copiedCode === perm.code;

                      return (
                        <div
                          key={perm.code}
                          className="px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                                {perm.name}
                              </span>
                              {getActionBadge(perm.code)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {perm.description || "Grants access to this operation."}
                            </p>
                          </div>

                          {/* Permission Code Key with Quick Copy & Row Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 font-mono text-[11px] text-slate-700 dark:text-zinc-300 select-all">
                              <span>{perm.code}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(perm.code)}
                                title="Copy permission code"
                                className={`p-1 rounded transition-colors ${
                                  isCopied
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                }`}
                              >
                                {isCopied ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openEditModal(perm)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              title="Edit permission"
                              aria-label="Edit permission"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteModal(perm)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete permission"
                              aria-label="Delete permission"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Permissions Modals */}
      <BatchCreatePermissionModal
        isOpen={isBatchModalOpen}
        onClose={closeBatchModal}
        onSuccess={async () => {
          await fetchPermissions(true);
        }}
      />

      <EditPermissionModal
        isOpen={Boolean(permissionToEdit)}
        onClose={closeEditModal}
        permission={permissionToEdit}
        onSuccess={async () => {
          await fetchPermissions(true);
        }}
      />

      <DeletePermissionModal
        isOpen={Boolean(permissionToDelete)}
        onClose={closeDeleteModal}
        permission={permissionToDelete}
        onSuccess={async () => {
          await fetchPermissions(true);
        }}
      />
    </div>
  );
}
