"use client";

import type {
  FeatureControl,
  Announcement,
  AnnouncementUser,
  AnnouncementRead,
  FeatureStatus,
} from "@/types/features-announcements";

const STORAGE_KEYS = {
  FEATURES: "smartpos_feature_controls",
  ANNOUNCEMENTS: "smartpos_announcements",
  ANNOUNCEMENT_USERS: "smartpos_announcement_users",
  ANNOUNCEMENT_READS: "smartpos_announcement_reads",
};

const DEFAULT_FEATURES: FeatureControl[] = [
  {
    id: "feat-1",
    slug: "products",
    name: "Products Catalog",
    description: "Item catalog, master SKU directory, barcode lookup, and pricing rules.",
    module: "Inventory",
    status: "coming_soon",
    is_enabled: false,
    announcement_id: "ann-3",
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-2",
    slug: "create-product",
    name: "Create Product",
    description: "Product onboarding, matrix variants, cost calculations, and WebP image uploads.",
    module: "Inventory",
    status: "coming_soon",
    is_enabled: false,
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-3",
    slug: "inventory-import",
    name: "Product & Stock Importer",
    description: "Bulk upload CSV and Excel product spreadsheets with automatic barcode validation.",
    module: "Inventory",
    status: "active",
    is_enabled: true,
    announcement_id: "ann-3",
    allowed_roles: ["admin", "owner", "manager"],
    updated_at: "2026-09-09T12:00:00Z",
  },
  {
    id: "feat-4",
    slug: "low-stocks",
    name: "Low Stock Alerts",
    description: "Automated threshold alerts, supplier PO drafts, and replenishment buffers.",
    module: "Inventory",
    status: "coming_soon",
    is_enabled: false,
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-5",
    slug: "expired-products",
    name: "Expired Products & Batching",
    description: "FIFO inventory tracking, expiration dates, and lot quarantine holds.",
    module: "Inventory",
    status: "coming_soon",
    is_enabled: false,
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-6",
    slug: "pos-terminal",
    name: "Point of Sale (POS) Terminal",
    description: "High-speed barcode scanner checkout, cash drawer kick, and ESC/POS thermal printing.",
    module: "POS & Registers",
    status: "active",
    is_enabled: true,
    allowed_roles: ["admin", "owner", "manager", "cashier"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-7",
    slug: "cash-drawer",
    name: "Cash Drawer & Shifts",
    description: "Drawer opening float reconciliation, blind closing, and shift discrepancy audits.",
    module: "POS & Registers",
    status: "active",
    is_enabled: true,
    allowed_roles: ["admin", "owner", "manager", "cashier"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-8",
    slug: "warehouses",
    name: "Warehouse Multi-Hub Management",
    description: "Multi-location bin storage, inter-store transfer orders, and cycle count audits.",
    module: "Operations & Store",
    status: "coming_soon",
    is_enabled: false,
    announcement_id: "ann-2",
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T10:30:00Z",
  },
  {
    id: "feat-9",
    slug: "outlets",
    name: "Outlets & Store Branches",
    description: "Multi-branch store hierarchy, cash register binding, and localized tax overrides.",
    module: "Operations & Store",
    status: "active",
    is_enabled: true,
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T09:00:00Z",
  },
  {
    id: "feat-10",
    slug: "roles-rbac",
    name: "Roles & RBAC Permissions Matrix",
    description: "Fine-grained system roles, custom permissions matrices, and staff role assignment.",
    module: "System & Governance",
    status: "active",
    is_enabled: true,
    allowed_roles: ["admin", "owner"],
    updated_at: "2026-09-09T09:00:00Z",
  },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "SmartPOS maintenance tonight at 11:00 PM.",
    content:
      "Scheduled database indexing and multi-region failover tests will take place tonight from 11:00 PM to 11:30 PM UTC. POS offline order buffering will be active during this period to ensure uninterrupted transactions.",
    type: "maintenance",
    priority: "urgent",
    published_at: "2026-09-09T08:00:00Z",
    expires_at: "2026-09-10T04:00:00Z",
    is_active: true,
    target_audience: "all",
    created_at: "2026-09-09T08:00:00Z",
    reads_count: 14,
  },
  {
    id: "ann-2",
    title: "Inventory update completed.",
    content:
      "All inventory valuation calculations, warehouse stock levels, and barcode indexing syncs have successfully finished across all physical store branches and warehouse storage locations.",
    type: "update",
    priority: "normal",
    published_at: "2026-09-09T10:30:00Z",
    expires_at: null,
    is_active: true,
    target_audience: "all",
    created_at: "2026-09-09T10:30:00Z",
    reads_count: 28,
  },
  {
    id: "ann-3",
    title: "New Product Import feature released.",
    content:
      "You can now batch import products, EAN barcodes, category tags, supplier costs, and opening stock quantities using standard CSV and Excel templates directly from the inventory dashboard.",
    type: "feature",
    priority: "normal",
    published_at: "2026-09-09T12:00:00Z",
    expires_at: null,
    is_active: true,
    target_audience: "all",
    created_at: "2026-09-09T12:00:00Z",
    reads_count: 42,
  },
];

const DEFAULT_READS: AnnouncementRead[] = [
  {
    announcement_id: "ann-1",
    user_uuid: "user-sarah",
    user_name: "Sarah Jenkins",
    user_role: "Store Manager",
    read_at: "2026-09-09T08:15:00Z",
  },
  {
    announcement_id: "ann-1",
    user_uuid: "user-john",
    user_name: "John Miller",
    user_role: "Cashier",
    read_at: "2026-09-09T08:30:00Z",
  },
  {
    announcement_id: "ann-2",
    user_uuid: "user-sarah",
    user_name: "Sarah Jenkins",
    user_role: "Store Manager",
    read_at: "2026-09-09T10:45:00Z",
  },
  {
    announcement_id: "ann-3",
    user_uuid: "user-alex",
    user_name: "Alex Rivera",
    user_role: "Administrator",
    read_at: "2026-09-09T12:05:00Z",
  },
];

export class FeaturesAnnouncementsStore {
  // --- Feature Controls ---
  static getFeatures(): FeatureControl[] {
    if (typeof window === "undefined") return DEFAULT_FEATURES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEATURES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(DEFAULT_FEATURES));
        return DEFAULT_FEATURES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_FEATURES;
    }
  }

  static saveFeatures(features: FeatureControl[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.FEATURES, JSON.stringify(features));
      window.dispatchEvent(new Event("smartpos_features_updated"));
    } catch (e) {
      console.error("Failed to save feature controls:", e);
    }
  }

  static updateFeatureStatus(slug: string, status: FeatureStatus): FeatureControl[] {
    const features = this.getFeatures();
    const updated = features.map((f) => {
      if (f.slug === slug) {
        return {
          ...f,
          status,
          is_enabled: status === "active",
          updated_at: new Date().toISOString(),
        };
      }
      return f;
    });
    this.saveFeatures(updated);
    return updated;
  }

  static addFeature(
    feature: Omit<FeatureControl, "id" | "updated_at">
  ): FeatureControl {
    const features = this.getFeatures();
    const newFeature: FeatureControl = {
      ...feature,
      id: `feat-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };
    const updated = [newFeature, ...features];
    this.saveFeatures(updated);
    return newFeature;
  }

  static updateAllFeatureStatus(status: FeatureStatus): FeatureControl[] {
    const features = this.getFeatures();
    const updated = features.map((f) => ({
      ...f,
      status,
      is_enabled: status === "active",
      updated_at: new Date().toISOString(),
    }));
    this.saveFeatures(updated);
    return updated;
  }

  static updateFeature(feature: FeatureControl): FeatureControl[] {
    const features = this.getFeatures();
    const index = features.findIndex((f) => f.id === feature.id || f.slug === feature.slug);
    let updated: FeatureControl[];
    if (index >= 0) {
      updated = [...features];
      updated[index] = { ...feature, updated_at: new Date().toISOString() };
    } else {
      updated = [...features, { ...feature, updated_at: new Date().toISOString() }];
    }
    this.saveFeatures(updated);
    return updated;
  }

  // --- Announcements ---
  static getAnnouncements(): Announcement[] {
    if (typeof window === "undefined") return DEFAULT_ANNOUNCEMENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
        return DEFAULT_ANNOUNCEMENTS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ANNOUNCEMENTS;
    }
  }

  static saveAnnouncements(announcements: Announcement[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
      window.dispatchEvent(new Event("smartpos_announcements_updated"));
    } catch (e) {
      console.error("Failed to save announcements:", e);
    }
  }

  static addAnnouncement(
    announcement: Omit<Announcement, "id" | "created_at" | "reads_count">
  ): Announcement {
    const announcements = this.getAnnouncements();
    const newAnn: Announcement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      created_at: new Date().toISOString(),
      reads_count: 0,
    };
    const updated = [newAnn, ...announcements];
    this.saveAnnouncements(updated);
    return newAnn;
  }

  static toggleAnnouncementActive(id: string): Announcement[] {
    const announcements = this.getAnnouncements();
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, is_active: !a.is_active } : a
    );
    this.saveAnnouncements(updated);
    return updated;
  }

  static deleteAnnouncement(id: string): Announcement[] {
    const announcements = this.getAnnouncements();
    const updated = announcements.filter((a) => a.id !== id);
    this.saveAnnouncements(updated);
    return updated;
  }

  // --- Announcement Reads ---
  static getReads(): AnnouncementRead[] {
    if (typeof window === "undefined") return DEFAULT_READS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT_READS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT_READS, JSON.stringify(DEFAULT_READS));
        return DEFAULT_READS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_READS;
    }
  }

  static getReadsForAnnouncement(announcementId: string): AnnouncementRead[] {
    return this.getReads().filter((r) => r.announcement_id === announcementId);
  }

  static markAsRead(
    announcementId: string,
    userUuid: string,
    userName: string,
    userRole?: string
  ): void {
    if (typeof window === "undefined") return;
    const reads = this.getReads();
    const existing = reads.find(
      (r) => r.announcement_id === announcementId && r.user_uuid === userUuid
    );
    if (!existing) {
      const newRead: AnnouncementRead = {
        announcement_id: announcementId,
        user_uuid: userUuid,
        user_name: userName,
        user_role: userRole,
        read_at: new Date().toISOString(),
      };
      const updatedReads = [...reads, newRead];
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT_READS, JSON.stringify(updatedReads));

      // Increment count on announcement
      const announcements = this.getAnnouncements();
      const updatedAnn = announcements.map((a) =>
        a.id === announcementId ? { ...a, reads_count: (a.reads_count || 0) + 1 } : a
      );
      this.saveAnnouncements(updatedAnn);
      window.dispatchEvent(new Event("smartpos_reads_updated"));
    }
  }

  static isReadByUser(announcementId: string, userUuid: string): boolean {
    const reads = this.getReads();
    return reads.some(
      (r) => r.announcement_id === announcementId && r.user_uuid === userUuid
    );
  }
}
