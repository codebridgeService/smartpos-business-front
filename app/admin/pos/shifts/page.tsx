"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { History } from "lucide-react";

export default function ShiftsPage() {
  return (
    <ComingSoon
      title="Shifts & Cashier Registers"
      description="Comprehensive shift management for tracking cashier opening floats, shift handovers, and closing reconciliations."
      category="Shift Operations"
      badgeText="In Progress"
      expectedDate="Q2 2026"
      progressPercentage={74}
      icon={<History className="h-6 w-6" />}
      features={[
        { title: "Opening Float Setup", description: "Mandatory cash float entry before registers can start taking payments.", status: "ready" },
        { title: "Cash Discrepancy Audits", description: "Automatic comparison between system sales totals and actual counted cash.", status: "in_progress" },
        { title: "Shift Handover Notes", description: "Shift managers can log observations, tips, and operational notes.", status: "planned" },
        { title: "End-of-Day Z-Report", description: "Automated daily closing statements broken down by payment methods.", status: "in_progress" },
      ]}
    />
  );
}
