"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { CircleDollarSign } from "lucide-react";

export default function CashDrawerPage() {
  return (
    <ComingSoon
      title="Cash Drawer Management"
      description="Monitor physical cash in registers, log petty cash expenses (pay-outs), register top-ups (pay-ins), and view audit trails."
      category="Cash Flow"
      badgeText="In Progress"
      expectedDate="Q2 2026"
      progressPercentage={68}
      icon={<CircleDollarSign className="h-6 w-6" />}
      features={[
        { title: "Pay-In & Pay-Out Logging", description: "Record cash entering or leaving drawer with category reasons and cashier signatures.", status: "ready" },
        { title: "Cash Limit Alerts", description: "Notify managers when cash in drawer exceeds the insurance limit to perform cash drops.", status: "in_progress" },
        { title: "Drawer Kick Relay", description: "Trigger electronic drawer opening on cash receipt print.", status: "planned" },
        { title: "Real-time Cash Float Balance", description: "Live tracking of expected drawer balance across each active counter.", status: "in_progress" },
      ]}
    />
  );
}
