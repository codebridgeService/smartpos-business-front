"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { Tablet } from "lucide-react";

export default function PosDevicesPage() {
  return (
    <ComingSoon
      title="POS Devices & Terminals"
      description="Register POS hardware terminals, Android/iOS tablets, barcode scanners, and manage hardware authentication tokens."
      category="Hardware & IoT"
      badgeText="In Progress"
      expectedDate="Q2 2026"
      progressPercentage={65}
      icon={<Tablet className="h-6 w-6" />}
      features={[
        { title: "Device Token Provisioning", description: "Generate device-specific machine tokens for headless POS hardware.", status: "ready" },
        { title: "Hardware Pairing & Ping", description: "Monitor device heartbeat status, IP address, and platform version.", status: "in_progress" },
        { title: "Remote Device Revocation", description: "Instantly lock or wipe lost/stolen cashier tablets from the admin console.", status: "ready" },
        { title: "Printer & Cash Drawer Relay", description: "Map USB/Bluetooth thermal receipt printers to paired devices.", status: "planned" },
      ]}
    />
  );
}
