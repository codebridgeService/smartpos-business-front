"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/layout";
import { useToast } from "@/components/ui/toast";
import { FeatureGuard } from "@/components/feature-control/FeatureGuard";
import {
  CreditCard,
  History,
  CircleDollarSign,
  MapPin,
  Users,
  Warehouse,
  Settings,
  Sparkles,
  Layers,
  Clock,
  ArrowLeft,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  Send,
  Rocket,
  Flame,
  MessageSquare,
  Calendar,
  Monitor,
  ChevronRight,
  ShieldCheck,
  Zap,
  Package,
  PackagePlus,
  ClockAlert,
  TrendingDown,
  TrendingUp,
  FolderTree,
  GitFork,
  Award,
  Scale,
  SlidersHorizontal,
  BadgeCheck,
  Barcode,
  QrCode,
  ArrowLeftRight,
  Receipt,
  Mail,
  CheckSquare,
  Boxes,
} from "lucide-react";

interface FeatureHighlight {
  title: string;
  description: string;
  status: "ready" | "in_progress" | "planned";
}

interface ModuleConfig {
  key: string;
  label: string;
  title: string;
  description: string;
  category: string;
  badgeText: string;
  expectedDate: string;
  daysToLaunch: number;
  progressPercentage: number;
  icon: React.ReactNode;
  features: FeatureHighlight[];
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  products: {
    key: "products",
    label: "Products Catalog",
    title: "Products & Item Catalog",
    description: "Comprehensive product inventory directory with SKU tracking, barcode lookup, multi-tier pricing, and category classification.",
    category: "Inventory & Catalog",
    badgeText: "Next Sprint",
    expectedDate: "May 2026",
    daysToLaunch: 21,
    progressPercentage: 75,
    icon: <Package className="h-6 w-6" />,
    features: [
      { title: "Real-Time Stock Quantities", description: "Track inventory levels across all store outlets with auto-synced updates", status: "ready" },
      { title: "Barcode & SKU Lookup", description: "Fast barcode scanning and automatic SKU code generation", status: "in_progress" },
      { title: "Multi-Tier Pricing", description: "Configure wholesale, retail, and promotional outlet pricing", status: "planned" },
    ],
  },
  "create-product": {
    key: "create-product",
    label: "Create Product",
    title: "Product Onboarding & Creator",
    description: "Intuitive product creator with image upload, barcode assignment, variant matrix builder, and tax calculation rules.",
    category: "Inventory & Catalog",
    badgeText: "In Development",
    expectedDate: "May 2026",
    daysToLaunch: 24,
    progressPercentage: 70,
    icon: <PackagePlus className="h-6 w-6" />,
    features: [
      { title: "Matrix Variant Generator", description: "Generate color, size, and material SKUs in one click", status: "ready" },
      { title: "High-Resolution Image Gallery", description: "Upload WebP optimized product images and thumbnails", status: "in_progress" },
      { title: "Supplier Cost & Margin Engine", description: "Calculate gross profit margins automatically from cost and tax rates", status: "planned" },
    ],
  },
  "expired-products": {
    key: "expired-products",
    label: "Expired Products",
    title: "Batch & Expiration Date Auditing",
    description: "Track product expiration schedules, FIFO inventory rotation, quarantine holds, and batch write-offs.",
    category: "Inventory Quality",
    badgeText: "Designing",
    expectedDate: "June 2026",
    daysToLaunch: 45,
    progressPercentage: 50,
    icon: <ClockAlert className="h-6 w-6" />,
    features: [
      { title: "Early Expiration Alerts", description: "Automated notifications 30, 15, and 7 days prior to expiry", status: "ready" },
      { title: "Quarantine Stock Hold", description: "Prevent cashier scanning of expired batch lots at checkout", status: "in_progress" },
      { title: "Disposal & Write-Off Logs", description: "Audit trail for damaged, expired, or decommissioned goods", status: "planned" },
    ],
  },
  "low-stocks": {
    key: "low-stocks",
    label: "Low Stock Alerts",
    title: "Low Stock & Reorder Forecasting",
    description: "Intelligent reorder point calculations, safety stock buffers, and automated supplier purchase order drafts.",
    category: "Stock Management",
    badgeText: "In Progress",
    expectedDate: "June 2026",
    daysToLaunch: 40,
    progressPercentage: 60,
    icon: <TrendingDown className="h-6 w-6" />,
    features: [
      { title: "Dynamic Reorder Thresholds", description: "Set minimum and maximum stock level triggers per outlet", status: "ready" },
      { title: "Supplier PO Generation", description: "One-click purchase order creation for depleted items", status: "in_progress" },
      { title: "Predictive Stockout Warning", description: "Forecast days until stock exhaustion based on sales velocity", status: "planned" },
    ],
  },
  category: {
    key: "category",
    label: "Categories",
    title: "Product Categories & Hierarchies",
    description: "Organize items into structured department taxonomies, visual touch categories, and custom POS quick-keys.",
    category: "Catalog Taxonomy",
    badgeText: "In Development",
    expectedDate: "May 2026",
    daysToLaunch: 28,
    progressPercentage: 65,
    icon: <FolderTree className="h-6 w-6" />,
    features: [
      { title: "Visual Category Badges", description: "Custom color tags and icons on the POS checkout screen", status: "ready" },
      { title: "Parent & Sub-Category Tree", description: "Multi-level department nesting with drag-and-drop sorting", status: "in_progress" },
      { title: "Bulk Category Reassignment", description: "Quickly move batches of items between departments", status: "planned" },
    ],
  },
  "sub-category": {
    key: "sub-category",
    label: "Sub Categories",
    title: "Sub-Category Deep Classification",
    description: "Fine-grained secondary taxonomy for retail departments, apparel cuts, and grocery aisles.",
    category: "Catalog Taxonomy",
    badgeText: "In Development",
    expectedDate: "May 2026",
    daysToLaunch: 30,
    progressPercentage: 60,
    icon: <GitFork className="h-6 w-6" />,
    features: [
      { title: "Aisle & Shelf Mapping", description: "Associate sub-categories with physical store locations", status: "ready" },
      { title: "Filter & Search Facets", description: "Enhanced filtering on POS terminal and digital catalogs", status: "in_progress" },
      { title: "Inherited Tax Rules", description: "Automatic inheritance of parent category tax and discount policies", status: "planned" },
    ],
  },
  brands: {
    key: "brands",
    label: "Brands & Vendors",
    title: "Brands & Manufacturer Directory",
    description: "Manage official brand partnerships, manufacturer warranties, vendor logos, and authorized distributor accounts.",
    category: "Vendors & Brands",
    badgeText: "Designing",
    expectedDate: "June 2026",
    daysToLaunch: 55,
    progressPercentage: 45,
    icon: <Award className="h-6 w-6" />,
    features: [
      { title: "Brand Logos & Profiles", description: "Display brand badges on receipts and product detail cards", status: "ready" },
      { title: "Vendor Association", description: "Link products directly to authorized regional distributors", status: "in_progress" },
      { title: "Brand Sales Analytics", description: "Performance breakdown and revenue attribution by brand", status: "planned" },
    ],
  },
  units: {
    key: "units",
    label: "Units of Measure",
    title: "Units of Measurement (UoM)",
    description: "Metric and imperial conversions for pieces, kilograms, liters, cartons, and bulk case packaging.",
    category: "Measurement Units",
    badgeText: "In Progress",
    expectedDate: "May 2026",
    daysToLaunch: 32,
    progressPercentage: 65,
    icon: <Scale className="h-6 w-6" />,
    features: [
      { title: "Decimal Precision Support", description: "Sell weighed items (e.g. 1.45 kg) with scale hardware integration", status: "ready" },
      { title: "Base & Secondary Conversions", description: "Automatically unpack 1 Box into 24 individual Pieces", status: "in_progress" },
      { title: "Custom Unit Abbreviation", description: "Localized display symbols (pcs, kg, ltr, box, pack)", status: "planned" },
    ],
  },
  "variant-attributes": {
    key: "variant-attributes",
    label: "Variant Attributes",
    title: "Variant Attributes & Option Sets",
    description: "Define customizable product attributes including sizes, colors, flavors, materials, and pack dimensions.",
    category: "Product Matrix",
    badgeText: "Designing",
    expectedDate: "June 2026",
    daysToLaunch: 50,
    progressPercentage: 55,
    icon: <SlidersHorizontal className="h-6 w-6" />,
    features: [
      { title: "Attribute Preset Templates", description: "Standardized size runs (XS-XXL) and color swatches", status: "ready" },
      { title: "Variant Surcharge Pricing", description: "Add price modifiers per attribute option (e.g. +$2 for Large)", status: "in_progress" },
      { title: "Unique Barcode per Variant", description: "Dedicated EAN/UPC barcodes per attribute combination", status: "planned" },
    ],
  },
  warranties: {
    key: "warranties",
    label: "Warranties",
    title: "Product Warranty Policies",
    description: "Track manufacturer and store warranties, claims, serial number lookups, and replacement policies.",
    category: "Customer Service",
    badgeText: "Planned",
    expectedDate: "July 2026",
    daysToLaunch: 70,
    progressPercentage: 35,
    icon: <BadgeCheck className="h-6 w-6" />,
    features: [
      { title: "Receipt Warranty Terms", description: "Auto-print warranty coverage duration directly on checkout receipt", status: "ready" },
      { title: "Serial Number Claims", description: "Lookup purchase date and warranty status by scanning device serial", status: "in_progress" },
      { title: "RMA & Replacement Flow", description: "Integrated return merchandise authorization with vendor RMA codes", status: "planned" },
    ],
  },
  "print-barcode": {
    key: "print-barcode",
    label: "Print Barcode",
    title: "Barcode Label Designer & Printing",
    description: "Design and print adhesive shelf tags and product barcode stickers using ESC/POS thermal printers.",
    category: "Hardware & Labels",
    badgeText: "In Progress",
    expectedDate: "June 2026",
    daysToLaunch: 42,
    progressPercentage: 60,
    icon: <Barcode className="h-6 w-6" />,
    features: [
      { title: "Label Sheet & Thermal Rolls", description: "Supports 50x30mm, 40x20mm thermal rolls and A4 adhesive sheets", status: "ready" },
      { title: "Code 128 & EAN-13 Support", description: "Universal barcode standards compatible with all laser scanners", status: "in_progress" },
      { title: "Batch Price Tag Printing", description: "Print replacement labels for all recently discounted items", status: "planned" },
    ],
  },
  "print-qr-code": {
    key: "print-qr-code",
    label: "Print QR Code",
    title: "QR Code Tag & Digital Menu Generator",
    description: "Generate dynamic QR codes for contactless digital menus, product story pages, and payment redirects.",
    category: "Hardware & Labels",
    badgeText: "In Progress",
    expectedDate: "June 2026",
    daysToLaunch: 44,
    progressPercentage: 58,
    icon: <QrCode className="h-6 w-6" />,
    features: [
      { title: "Product Digital Twin", description: "QR codes linking customers to nutrition facts and allergen info", status: "ready" },
      { title: "Table & Shelf Placement", description: "Generate stylized branded QR stickers for customer scanning", status: "in_progress" },
      { title: "High-Resolution Vector Export", description: "Export in SVG, PNG, and PDF ready for commercial printing", status: "planned" },
    ],
  },
  "stock-adjustment": {
    key: "stock-adjustment",
    label: "Stock Adjustment",
    title: "Inventory Stock Adjustments",
    description: "Audit physical stock versus system ledger counts, record shrinkage, and adjust inventory balances.",
    category: "Stock Auditing",
    badgeText: "Designing",
    expectedDate: "June 2026",
    daysToLaunch: 60,
    progressPercentage: 45,
    icon: <TrendingUp className="h-6 w-6" />,
    features: [
      { title: "Shrinkage & Damage Codes", description: "Classify write-downs by theft, spoilage, breakage, or count discrepancy", status: "ready" },
      { title: "Manager Approval Gate", description: "High-value adjustments require supervisor authorization PIN", status: "in_progress" },
      { title: "Automatic General Ledger Sync", description: "Post financial loss adjustments straight to accounting accounts", status: "planned" },
    ],
  },
  "stock-transfer": {
    key: "stock-transfer",
    label: "Stock Transfer",
    title: "Inter-Outlet & Warehouse Transfers",
    description: "Request, dispatch, and receive inventory transfers between business branches with transit tracking.",
    category: "Logistics",
    badgeText: "In Development",
    expectedDate: "July 2026",
    daysToLaunch: 68,
    progressPercentage: 50,
    icon: <ArrowLeftRight className="h-6 w-6" />,
    features: [
      { title: "In-Transit Inventory Hold", description: "Track stock in transit between dispatch and destination receiving", status: "ready" },
      { title: "Transfer Manifest Receipts", description: "Generate shipping manifests with driver signatures and batch seals", status: "in_progress" },
      { title: "Discrepancy Resolution", description: "Flag receiving shortages or damaged items on delivery confirmation", status: "planned" },
    ],
  },
  pos: {
    key: "pos",
    label: "POS Terminal",
    title: "Point of Sale (POS) Terminal",
    description: "High-speed barcode scanning, fast touch checkout, offline order buffering, and receipt printing with hardware cash drawer relays.",
    category: "Operations & Sales",
    badgeText: "Beta Soon",
    expectedDate: "May 2026",
    daysToLaunch: 38,
    progressPercentage: 85,
    icon: <CreditCard className="h-6 w-6" />,
    features: [
      { title: "Split & Multi-Payment", description: "Accept cash, card, and digital QR payments in a single transaction", status: "ready" },
      { title: "Offline-First Sync", description: "Process sales uninterrupted even during sudden internet disconnects", status: "in_progress" },
      { title: "Receipt Printing & ESC/POS", description: "Direct thermal 80mm/58mm output via USB & Network printers", status: "planned" },
    ],
  },
  shifts: {
    key: "shifts",
    label: "Shifts & Registers",
    title: "Shifts & Cashier Registers",
    description: "Manage register open/close sessions, cashier shift handovers, float adjustments, and discrepancy audits.",
    category: "Shift Management",
    badgeText: "In Development",
    expectedDate: "May 2026",
    daysToLaunch: 45,
    progressPercentage: 70,
    icon: <History className="h-6 w-6" />,
    features: [
      { title: "Opening Float Reconciliation", description: "Cash drawer counting with automatic denomination breakdown", status: "ready" },
      { title: "X & Z Reports Generation", description: "End-of-shift audits with automatic over/short calculations", status: "in_progress" },
      { title: "Blind Cashier Closing", description: "Enforce blind cash entry to eliminate end-of-shift skimming", status: "planned" },
    ],
  },
  drawer: {
    key: "drawer",
    label: "Cash Drawer",
    title: "Cash Drawer & Cash Flow",
    description: "Track cash in/out movements, petty cash slips, float additions, and drawer drop audits in real time.",
    category: "Cash Management",
    badgeText: "In Development",
    expectedDate: "June 2026",
    daysToLaunch: 60,
    progressPercentage: 62,
    icon: <CircleDollarSign className="h-6 w-6" />,
    features: [
      { title: "Pay-In / Pay-Out Tracking", description: "Log cash dropped or petty cash taken with audit reason codes", status: "ready" },
      { title: "Hardware Drawer Kick Relay", description: "Automated RJ12 drawer kick via thermal printer signal", status: "in_progress" },
      { title: "Cash Flow Ledger", description: "Auditable live balance per active terminal", status: "planned" },
    ],
  },
  outlets: {
    key: "outlets",
    label: "Outlets & Branches",
    title: "Store Outlets & Branches Hub",
    description: "Multi-branch store management, geographic zones, and outlet-specific tax & pricing configurations.",
    category: "Multi-Branch",
    badgeText: "In Progress",
    expectedDate: "August 2026",
    daysToLaunch: 95,
    progressPercentage: 55,
    icon: <MapPin className="h-6 w-6" />,
    features: [
      { title: "Multi-Branch Hierarchy", description: "Centralized master control over multiple retail stores", status: "ready" },
      { title: "Regional Pricing Rules", description: "Location-based price overrides and tax zones", status: "in_progress" },
      { title: "Outlet Transfer Orders", description: "Seamless stock transfers between business branches", status: "planned" },
    ],
  },
  staff: {
    key: "staff",
    label: "Staff Management",
    title: "Staff & Member Management",
    description: "Employee onboarding, shift assignments, commission tracking, and quick 4-digit PIN terminal security.",
    category: "Human Resources",
    badgeText: "In Development",
    expectedDate: "August 2026",
    daysToLaunch: 104,
    progressPercentage: 50,
    icon: <Users className="h-6 w-6" />,
    features: [
      { title: "Employee Profiles & PINs", description: "Quick 4-digit PIN login on POS cash registers", status: "ready" },
      { title: "Commission Tracking", description: "Track sales performance by cashier and server", status: "in_progress" },
      { title: "Granular Role Assignment", description: "Attach fine-grained permissions per branch outlet", status: "planned" },
    ],
  },
  warehouses: {
    key: "warehouses",
    label: "Warehouses Hub",
    title: "Warehouse & Inventory Hub",
    description: "Centralized multi-warehouse inventory control, batch numbers, expiration tracking, and supplier stock-ins.",
    category: "Supply Chain",
    badgeText: "In Development",
    expectedDate: "September 2026",
    daysToLaunch: 120,
    progressPercentage: 45,
    icon: <Warehouse className="h-6 w-6" />,
    features: [
      { title: "Batch & Serial Numbers", description: "Track items by manufacturing batch and expiration date", status: "ready" },
      { title: "Low Stock Automated Alerts", description: "Automated reorder triggers and supplier purchase orders", status: "in_progress" },
      { title: "Stock Auditing & Cycle Counts", description: "Barcode-based physical inventory count audit", status: "planned" },
    ],
  },
  settings: {
    key: "settings",
    label: "System Settings",
    title: "Business & System Settings",
    description: "Configure receipts, currency, tax rates, payment gateways, invoice templates, and system preferences.",
    category: "Configuration",
    badgeText: "In Development",
    expectedDate: "June 2026",
    daysToLaunch: 48,
    progressPercentage: 65,
    icon: <Settings className="h-6 w-6" />,
    features: [
      { title: "Receipt Customizer", description: "Upload logos, QR codes, and customize header/footer notes", status: "ready" },
      { title: "Tax & Surcharge Engine", description: "Flexible VAT, GST, and service charge rules", status: "in_progress" },
      { title: "Payment Gateway Integrations", description: "Connect Stripe, PayPal, and regional QR gateways", status: "planned" },
    ],
  },
  chat: {
    key: "chat",
    label: "Team Chat",
    title: "Team & Store Live Chat",
    description: "Internal team communication, shift hand-off messaging, and omnichannel customer support chats inside the POS system.",
    category: "Communication",
    badgeText: "Designing",
    expectedDate: "July 2026",
    daysToLaunch: 75,
    progressPercentage: 45,
    icon: <MessageSquare className="h-6 w-6" />,
    features: [
      { title: "Staff Direct Messaging", description: "Private and store-wide channels for announcement broadcasts", status: "ready" },
      { title: "Order Link Sharing", description: "Attach specific POS receipt numbers directly inside chat bubbles", status: "in_progress" },
      { title: "Customer WhatsApp Sync", description: "Reply to customer WhatsApp inquiries from the POS console", status: "planned" },
    ],
  },
  calendar: {
    key: "calendar",
    label: "Calendar & Events",
    title: "Bookings & Appointment Calendar",
    description: "Schedule appointments, manage staff rotas, set reservation reminders, and track key seasonal sales events.",
    category: "Scheduling",
    badgeText: "Designing",
    expectedDate: "July 2026",
    daysToLaunch: 82,
    progressPercentage: 40,
    icon: <Calendar className="h-6 w-6" />,
    features: [
      { title: "Service Appointment Slots", description: "Client booking scheduling with automated SMS confirmations", status: "ready" },
      { title: "Staff Roster Planning", description: "Visual drag-and-drop weekly employee shift scheduler", status: "in_progress" },
      { title: "Promotional Calendar", description: "Automate scheduled discount campaigns across specific dates", status: "planned" },
    ],
  },
  email: {
    key: "email",
    label: "Email Center",
    title: "Transactional & Marketing Email Center",
    description: "Send automated e-receipts, invoice PDFs, supplier purchase requests, and promotional campaigns.",
    category: "Communication",
    badgeText: "Designing",
    expectedDate: "July 2026",
    daysToLaunch: 80,
    progressPercentage: 40,
    icon: <Mail className="h-6 w-6" />,
    features: [
      { title: "Digital E-Receipts", description: "Send customers clean, responsive PDF receipts via email", status: "ready" },
      { title: "Automated Daily Sales Summary", description: "Evening briefing emailed to business owners and executives", status: "in_progress" },
      { title: "Supplier PO Mailer", description: "Auto-email purchase order PDFs directly to supplier sales desks", status: "planned" },
    ],
  },
  todo: {
    key: "todo",
    label: "Staff Tasks & Todo",
    title: "Store Tasks & Shift Checklist",
    description: "Assign opening/closing checklists, restocking duties, and store maintenance tasks to on-duty staff.",
    category: "Operations",
    badgeText: "Designing",
    expectedDate: "July 2026",
    daysToLaunch: 85,
    progressPercentage: 35,
    icon: <CheckSquare className="h-6 w-6" />,
    features: [
      { title: "Opening & Closing Procedures", description: "Mandatory checklists required before cashier shift closeout", status: "ready" },
      { title: "Duty Assignment per Shift", description: "Assign clean-up and display restock tasks to specific team members", status: "in_progress" },
      { title: "Manager Verification", description: "Store managers can review completed task photos and timestamps", status: "planned" },
    ],
  },
  "file-manager": {
    key: "file-manager",
    label: "File Manager",
    title: "Digital Media & Document Repository",
    description: "Centralized cloud asset management for product photos, vendor contracts, receipts, and compliance certificates.",
    category: "Media & Assets",
    badgeText: "Planned",
    expectedDate: "August 2026",
    daysToLaunch: 90,
    progressPercentage: 30,
    icon: <Boxes className="h-6 w-6" />,
    features: [
      { title: "High-Performance Cloud Storage", description: "S3/MinIO backed secure asset hosting with CDN caching", status: "ready" },
      { title: "Drag-and-Drop Bulk Upload", description: "Batch upload hundreds of product images simultaneously", status: "in_progress" },
      { title: "Image Optimization", description: "Automatic WebP compression and multi-size thumbnail generation", status: "planned" },
    ],
  },
  packages: {
    key: "packages",
    label: "Subscription Packages",
    title: "Multi-Tenant Subscription Packages",
    description: "Manage SaaS subscription plans, billing tiers, register limits, and business feature bundles.",
    category: "Billing & Plans",
    badgeText: "In Progress",
    expectedDate: "May 2026",
    daysToLaunch: 20,
    progressPercentage: 80,
    icon: <Package className="h-6 w-6" />,
    features: [
      { title: "Tiered Plan Matrix", description: "Starter, Pro, and Enterprise tiers with register hardware limits", status: "ready" },
      { title: "Feature Entitlements", description: "Toggle module access per subscription plan level", status: "in_progress" },
      { title: "Automated Recurring Billing", description: "Stripe & PayPal billing webhooks with automatic renewal", status: "planned" },
    ],
  },
  transactions: {
    key: "transactions",
    label: "Transactions Ledger",
    title: "Global Billing & Invoices Ledger",
    description: "Comprehensive audit log of subscription fees, SaaS tenant invoices, payment gateway reconciliations.",
    category: "Financials",
    badgeText: "In Progress",
    expectedDate: "May 2026",
    daysToLaunch: 22,
    progressPercentage: 75,
    icon: <Receipt className="h-6 w-6" />,
    features: [
      { title: "Invoice Generation", description: "Automated branded PDF invoice generation for tenant subscription dues", status: "ready" },
      { title: "Payment Gateway Auditing", description: "Real-time webhook reconciliation for charge successes and refunds", status: "in_progress" },
      { title: "Financial Export", description: "Export full transaction histories to CSV and Excel for tax filings", status: "planned" },
    ],
  },
  "expired-plans": {
    key: "expired-plans",
    label: "Expired Plans",
    title: "Subscription Expirations & Grace Period",
    description: "Manage subscription expirations, automated renewal reminders, and grace-period access policies.",
    category: "Subscription Lifecycle",
    badgeText: "In Development",
    expectedDate: "June 2026",
    daysToLaunch: 35,
    progressPercentage: 65,
    icon: <ClockAlert className="h-6 w-6" />,
    features: [
      { title: "Automated Grace Periods", description: "Configurable 7-day grace window before service suspension", status: "ready" },
      { title: "Renewal Reminder Dispatch", description: "Automated email and SMS notices 14, 7, and 1 day prior to expiration", status: "in_progress" },
      { title: "One-Click Plan Renewal", description: "Instant card charge to restore full active tenant privileges", status: "planned" },
    ],
  },
};

const ALIAS_MAP: Record<string, string> = {
  product: "products",
  create_product: "create-product",
  expired_products: "expired-products",
  low_stocks: "low-stocks",
  low_stock: "low-stocks",
  "low-stock": "low-stocks",
  categories: "category",
  sub_category: "sub-category",
  "sub-categories": "sub-category",
  brand: "brands",
  unit: "units",
  attributes: "variant-attributes",
  "variant-attribute": "variant-attributes",
  warranty: "warranties",
  barcode: "print-barcode",
  "print-barcodes": "print-barcode",
  qr: "print-qr-code",
  qrcode: "print-qr-code",
  "print-qr": "print-qr-code",
  adjustment: "stock-adjustment",
  "stock-adjustments": "stock-adjustment",
  transfer: "stock-transfer",
  "stock-transfers": "stock-transfer",
  package: "packages",
  transaction: "transactions",
  "expired-plan": "expired-plans",
};

const resolveKey = (key: string | null): string => {
  if (!key) return "products";
  const normalized = key.toLowerCase().trim();
  if (MODULE_CONFIGS[normalized]) return normalized;
  if (ALIAS_MAP[normalized] && MODULE_CONFIGS[ALIAS_MAP[normalized]]) {
    return ALIAS_MAP[normalized];
  }
  return "products";
};

function ComingSoonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success } = useToast();

  const rawParam = searchParams.get("module") || searchParams.get("feature");
  const [selectedKey, setSelectedKey] = useState<string>(resolveKey(rawParam));

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Synchronize when query param changes
  useEffect(() => {
    const param = searchParams.get("module") || searchParams.get("feature");
    setSelectedKey(resolveKey(param));
  }, [searchParams]);

  const currentModule = MODULE_CONFIGS[selectedKey] || MODULE_CONFIGS.products;

  // Live countdown timer based on current module's daysToLaunch
  const [timeLeft, setTimeLeft] = useState({
    days: currentModule.daysToLaunch,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    // Re-initialize countdown target whenever module switches
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + currentModule.daysToLaunch);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentModule.daysToLaunch]);

  const handleSelectModule = (key: string) => {
    setSelectedKey(key);
    // Update URL query smoothly without full navigation
    window.history.replaceState(null, "", `/coming-soon?feature=${key}`);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    success(`You're on the list! We'll notify ${email} the moment ${currentModule.title} goes live.`);
    setEmail("");
  };

  const targetFeatureKey =
    selectedKey === "products"
      ? "dashboard.products"
      : selectedKey === "create-product"
      ? "product.create"
      : selectedKey === "expired-products"
      ? "product.expired"
      : `dashboard.${selectedKey}`;

  return (
    <FeatureGuard featureKey={targetFeatureKey} fallbackTitle={currentModule.title}>
      <div className="w-full max-w-6xl mx-auto py-6 sm:py-8 space-y-8 animate-slide-up">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-orange-600 hover:border-orange-300 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-orange-600 hover:border-orange-300 transition-all shadow-2xs"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-orange-500" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/pos"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm shadow-orange-500/25 transition-all"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Launch POS</span>
          </Link>
        </div>
      </div>

      {/* Interactive Module Switcher Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-orange-500" />
            <span>Roadmap Announcements & Upcoming Modules</span>
          </span>
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
            Select module to view roadmap
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {Object.values(MODULE_CONFIGS).map((mod) => {
            const isSelected = mod.key === selectedKey;
            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => handleSelectModule(mod.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20 scale-[1.02]"
                    : "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 shadow-2xs"
                }`}
              >
                <span className={isSelected ? "text-white" : "text-slate-500 dark:text-zinc-400"}>
                  {React.cloneElement(mod.icon as React.ReactElement<{ className?: string }>, {
                    className: "h-4 w-4",
                  })}
                </span>
                <span>{mod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Hero Showcase Card */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-gradient-to-b from-white to-orange-50/20 dark:from-zinc-900 dark:to-orange-950/10 p-6 sm:p-10 shadow-lg shadow-orange-500/5 backdrop-blur-md overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFF0E0] dark:bg-orange-950/60 text-[#E05305] dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 shadow-2xs">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span>{currentModule.badgeText}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Layers className="h-3 w-3 text-slate-500" />
                  <span>{currentModule.category}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>Expected: {currentModule.expectedDate}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  {currentModule.icon}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {currentModule.title}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl">
                {currentModule.description}
              </p>
            </div>

            {/* Development Progress Box */}
            <div className="w-full lg:w-72 rounded-2xl bg-white dark:bg-zinc-800/80 p-5 border border-slate-200/90 dark:border-zinc-700/80 shadow-sm shrink-0 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-zinc-300">Development Progress</span>
                <span className="text-orange-600 dark:text-orange-400 text-sm font-black">
                  {currentModule.progressPercentage}%
                </span>
              </div>

              <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${currentModule.progressPercentage}%` }}
                />
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Sprint In Progress</span>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>QA Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
                  <Rocket className="h-4 w-4" />
                  <span>Estimated Deployment Countdown</span>
                </div>
                <div className="text-sm text-slate-300">
                  Feature branches are staging in continuous integration builds.
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 min-w-[60px] sm:min-w-[72px] border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.days).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    Days
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 min-w-[60px] sm:min-w-[72px] border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    Hours
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 min-w-[60px] sm:min-w-[72px] border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    Mins
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-3 min-w-[60px] sm:min-w-[72px] border border-white/10">
                  <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    Secs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlight Cards Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              <span>Core Capabilities in this Release</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentModule.features.map((feat, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 space-y-2.5 shadow-2xs hover:border-orange-300 dark:hover:border-orange-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        feat.status === "ready"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60"
                          : feat.status === "in_progress"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {feat.status === "ready"
                        ? "Completed"
                        : feat.status === "in_progress"
                        ? "Engineering"
                        : "Planned"}
                    </span>
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        feat.status === "ready"
                          ? "text-emerald-500"
                          : feat.status === "in_progress"
                          ? "text-amber-500"
                          : "text-slate-300 dark:text-zinc-700"
                      }`}
                    />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Early Access Notification Subscription Box */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="h-7 w-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Get Notified on Launch Day
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md">
            Join the priority beta release channel. We will send you early release notes and immediate access the day this module deploys.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto max-w-md">
          <input
            type="email"
            placeholder="Enter your work email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            required
          />
          <button
            type="submit"
            disabled={subscribed}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all shrink-0 cursor-pointer ${
              subscribed
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25"
            }`}
          >
            {subscribed ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Subscribed!</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Notify Me</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
    </FeatureGuard>
  );
}

export default function ComingSoonPage() {
  return (
    <DashboardShell variant="admin">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-20">
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <Layers className="h-5 w-5 animate-spin text-orange-500" />
              <span>Loading roadmap announcement...</span>
            </div>
          </div>
        }
      >
        <ComingSoonContent />
      </Suspense>
    </DashboardShell>
  );
}
