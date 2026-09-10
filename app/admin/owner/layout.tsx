"use client";

import React from "react";
import { OwnerGuard } from "@/components/owner";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OwnerGuard>{children}</OwnerGuard>;
}
