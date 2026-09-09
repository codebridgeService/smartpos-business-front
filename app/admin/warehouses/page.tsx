"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { Warehouse } from "lucide-react";

export default function WarehousesPage() {
  return (
    <ComingSoon
      title="Warehouses & Stock Storage"
      description="Centralized inventory storage management, aisle/bin shelf tracking, receiving supplier shipments, and bulk inventory dispatches."
      category="Inventory & Warehouses"
      badgeText="In Development"
      expectedDate="Q3 2026"
      progressPercentage={48}
      icon={<Warehouse className="h-6 w-6" />}
      features={[
        { title: "Storage Zones & Bins", description: "Map out warehouse racks, shelves, and bin locations for swift picking.", status: "ready" },
        { title: "Supplier Goods Receiving (GRN)", description: "Record incoming purchase orders with batch numbers and expiration dates.", status: "in_progress" },
        { title: "Cycle Counts & Audits", description: "Perform stock reconciliation via barcode terminal without halting sales.", status: "planned" },
        { title: "Dispatch to Outlets", description: "Bundle store replenishment orders with delivery notes and packing slips.", status: "planned" },
      ]}
    />
  );
}
