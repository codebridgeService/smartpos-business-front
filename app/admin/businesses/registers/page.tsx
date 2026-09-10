"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { Calculator } from "lucide-react";

export default function RegistersPage() {
  return (
    <ComingSoon
      title="Store Registers & Cash Desks"
      description="Configure physical cash counters, register numbering, designated outlets, default cash drawers, and opening balance mandates."
      category="Store Infrastructure"
      badgeText="In Progress"
      expectedDate="Q2 2026"
      progressPercentage={70}
      icon={<Calculator className="h-6 w-6" />}
      features={[
        { title: "Register Numbering & Outlets", description: "Bind counters (e.g., Register #01, Counter A) to specific store outlets.", status: "ready" },
        { title: "Drawer Balance Enforcement", description: "Require cashier opening count before enabling sales ring-up.", status: "in_progress" },
        { title: "Terminal Pairing", description: "Securely associate POS tablets and desktop cashiers to dedicated registers.", status: "planned" },
        { title: "Audit & Discrepancy Logs", description: "Complete session history and end-of-day register z-reports.", status: "in_progress" },
      ]}
    />
  );
}
