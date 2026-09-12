"use client";

import React from "react";
import { BusinessShell } from "@/components/layout";

export default function BusinessesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessShell>
      <div className="w-full">{children}</div>
    </BusinessShell>
  );
}
