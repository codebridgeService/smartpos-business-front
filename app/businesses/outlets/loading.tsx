"use client";

import React from "react";
import { CommonTablePageSkeleton } from "@/components/common/CommonTablePageSkeleton";

export default function BusinessOutletsLoading() {
  return <CommonTablePageSkeleton columns={5} rows={6} showKpis={true} />;
}
