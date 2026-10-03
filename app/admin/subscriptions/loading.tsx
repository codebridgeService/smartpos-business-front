"use client";

import React from "react";
import { CommonTablePageSkeleton } from "@/components/common/CommonTablePageSkeleton";

export default function AdminSubscriptionsLoading() {
  return <CommonTablePageSkeleton columns={6} rows={6} showKpis={true} />;
}
