"use client";

import React from "react";
import { CommonTablePageSkeleton } from "@/components/common/CommonTablePageSkeleton";

export default function AdminUsersLoading() {
  return <CommonTablePageSkeleton columns={5} rows={8} showKpis={true} />;
}
