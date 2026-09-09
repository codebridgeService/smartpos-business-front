"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { MapPin } from "lucide-react";

export default function OutletsPage() {
  return (
    <ComingSoon
      title="Outlets & Branch Locations"
      description="Configure store branches, define regional operating hours, receipt templates, and localized tax configurations."
      category="Branch Operations"
      badgeText="In Development"
      expectedDate="Q3 2026"
      progressPercentage={60}
      icon={<MapPin className="h-6 w-6" />}
      features={[
        { title: "Multi-Store Hierarchy", description: "Designate main flagship outlets and secondary retail branches.", status: "ready" },
        { title: "Outlet-Level Inventory", description: "Isolate product stocks, prices, and barcodes by store location.", status: "in_progress" },
        { title: "Branch Operational Hours", description: "Set individual opening, closing, and holiday operating times.", status: "planned" },
        { title: "Inter-Branch Stock Transfers", description: "Transfer products between stores with transit tracking and confirmation.", status: "planned" },
      ]}
    />
  );
}
