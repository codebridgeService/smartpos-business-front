"use client";

import React from "react";
import { CommonTablePageSkeleton } from "@/components/common/CommonTablePageSkeleton";

export default function BusinessWarehousesLoading() {
  return <CommonTablePageSkeleton columns={5} rows={6} showKpis={true} />;
}
