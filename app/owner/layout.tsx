"use client";

import React from "react";
import { DashboardShell } from "@/components/layout";
import { OwnerGuard } from "@/components/owner";

export default function OwnerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell variant="default">
      <OwnerGuard>{children}</OwnerGuard>
    </DashboardShell>
  );
}
