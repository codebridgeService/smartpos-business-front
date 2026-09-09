"use client";

import React from "react";
import { DashboardShell } from "@/components/layout";
import { AdminGuard } from "@/components/admin";
import { CashierAnnouncementModal } from "@/components/feature-control/CashierAnnouncementModal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell variant="admin">
      <AdminGuard>
        {children}
        <CashierAnnouncementModal />
      </AdminGuard>
    </DashboardShell>
  );
}
