import { SystemChangelog, CreateChangelogPayload, ChangelogComponent } from "@/types/changelog";

const API_BASE = process.env.NEXT_PUBLIC_BUSINESS_API_URL || "http://localhost:8002/api/v1";
const STORAGE_KEY = "smartpos_system_changelogs_cache";

export const INITIAL_CHANGELOGS: SystemChangelog[] = [
  {
    id: 4,
    version: "v1.2.1",
    title: "Dreams POS Settings Redesign & Admin Sidebar Navigation",
    component: "FRONTEND",
    change_type: "IMPROVEMENT",
    summary: "Complete overhaul of Settings into a 2-column Dreams POS architecture with 9-row security panel, hardware modals, and expandable admin sidebar navigation.",
    changes_list: [
      "Added dedicated Settings section to Admin Sidebar with circular chevrons and Logout action.",
      "Overhauled Security settings into 9 distinct rows (Password, 2FA, Google Auth, Phone, Email, Devices, Activity, Deactivate, Delete).",
      "Migrated Next.js middleware.ts to proxy.ts adhering to Next.js 16 conventions.",
      "Configured Vitest frontend test suite with 100% passing component unit tests.",
    ],
    author_name: "SmartPOS Engineering",
    author_email: "dev@smartpos.local",
    is_published: true,
    published_at: new Date().toISOString(),
  },
  {
    id: 3,
    version: "v1.2.0",
    title: "Feature Control Engine & Real-Time Maintenance Countdown",
    component: "FULL_STACK",
    change_type: "FEATURE",
    summary: "Empowered Store Owners and Admins to temporarily close individual features, show live ticking countdown clocks, and dispatch acknowledgment announcements to cashiers and staff.",
    changes_list: [
      "Created feature_controls, announcements, and announcement_reads tables with Redis caching in business-service.",
      "Developed CheckFeature middleware returning HTTP 503 with maintenance metadata and owner bypass.",
      "Built real-time ticking MaintenancePage with hour/minute/second countdown clock.",
      "Integrated CashierAnnouncementModal with automatic read receipts and 'I Understand' acknowledgement tracking.",
    ],
    author_name: "SmartPOS Core",
    author_email: "core@smartpos.local",
    is_published: true,
    published_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    version: "v1.1.0",
    title: "RBAC Hardening, Permissions Directory & Identity Service Lock",
    component: "SECURITY",
    change_type: "SECURITY_UPDATE",
    summary: "Hardened API token verification, locked identity-service on release/v1.0-prod, and established permission catalog matrix.",
    changes_list: [
      "Identity-service frozen on release/v1.0-prod branch and designated strictly read-only.",
      "Implemented Permissions directory with granular SaaS RBAC controls in frontend.",
      "Role provisioning and matrix assignments wired to business token claims.",
    ],
    author_name: "Security Team",
    author_email: "security@smartpos.local",
    is_published: true,
    published_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 1,
    version: "v1.0.0",
    title: "SmartPOS Initial Core Release",
    component: "FULL_STACK",
    change_type: "FEATURE",
    summary: "Initial release of SmartPOS multi-tenant retail architecture supporting cash registers, cashier shifts, cash drawer tracking, and POS hardware credentials.",
    changes_list: [
      "Multi-tenant business, outlet, and register management.",
      "POS device token authentication with rate-limiting.",
      "Cash drawer balance tracking and shift reconciliation.",
      "Next.js admin console and cashier layout.",
    ],
    author_name: "SmartPOS Architecture",
    author_email: "admin@smartpos.local",
    is_published: true,
    published_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
];

function getStoredLogs(): SystemChangelog[] {
  if (typeof window === "undefined") return INITIAL_CHANGELOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHANGELOGS));
      return INITIAL_CHANGELOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHANGELOGS;
  }
}

function saveStoredLogs(logs: SystemChangelog[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error("Failed to save changelogs to storage", err);
  }
}

export const ChangelogApi = {
  async fetchChangelogs(component?: ChangelogComponent | "ALL"): Promise<SystemChangelog[]> {
    try {
      const url = new URL(`${API_BASE}/changelogs`);
      if (component && component !== "ALL") {
        url.searchParams.set("component", component);
      }
      url.searchParams.set("published", "true");

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          saveStoredLogs(json.data);
          return json.data;
        }
      }
    } catch {
      // Graceful fallback to local cache
    }

    const stored = getStoredLogs();
    if (component && component !== "ALL") {
      return stored.filter((l) => l.component === component);
    }
    return stored;
  },

  async createChangelog(payload: CreateChangelogPayload): Promise<SystemChangelog> {
    const newLog: SystemChangelog = {
      id: Date.now(),
      version: payload.version,
      title: payload.title,
      component: payload.component,
      change_type: payload.change_type,
      summary: payload.summary,
      changes_list: payload.changes_list || [],
      author_name: payload.author_name || "SmartPOS Team",
      author_email: payload.author_email,
      is_published: payload.is_published ?? true,
      release_notes_url: payload.release_notes_url,
      published_at: payload.published_at || new Date().toISOString(),
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_access_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/changelogs`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const stored = getStoredLogs();
          saveStoredLogs([json.data, ...stored]);
          return json.data;
        }
      }
    } catch {
      // Local fallback
    }

    const stored = getStoredLogs();
    const updated = [newLog, ...stored];
    saveStoredLogs(updated);
    return newLog;
  },

  async deleteChangelog(id: number): Promise<boolean> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_access_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE}/changelogs/${id}`, {
        method: "DELETE",
        headers,
      });
    } catch {
      // fallback
    }

    const stored = getStoredLogs();
    saveStoredLogs(stored.filter((l) => l.id !== id));
    return true;
  },
};
