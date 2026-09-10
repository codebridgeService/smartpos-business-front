"use client";

import React from "react";
import { ComingSoon } from "@/components/common";
import { CreditCard } from "lucide-react";

export default function PosTerminalPage() {
  return (
    <ComingSoon
      title="POS Cashier Terminal"
      description="A lightning-fast, touch-friendly Point of Sale terminal designed for high-volume retail and quick service checkout."
      category="Sales & Operations"
      badgeText="Beta Soon"
      expectedDate="Q2 2026"
      progressPercentage={82}
      icon={<CreditCard className="h-6 w-6" />}
      features={[
        { title: "Split & Multi-Payment", description: "Accept cash, credit/debit card, and QR codes seamlessly.", status: "ready" },
        { title: "Offline Transaction Buffering", description: "Ring up orders without interruption even when internet connection drops.", status: "in_progress" },
        { title: "Hardware Barcode Scanner", description: "Instant product recognition via USB & Bluetooth handheld scanners.", status: "ready" },
        { title: "Thermal Receipt Printing", description: "Direct 80mm/58mm thermal receipt and kitchen order printing.", status: "planned" },
        { title: "Line Item Discounts & Notes", description: "Apply percentage or fixed price discounts on individual items or totals.", status: "ready" },
        { title: "Hold & Recall Carts", description: "Park orders for dining tables or pending shoppers with quick retrieval.", status: "in_progress" },
      ]}
    />
  );
}
