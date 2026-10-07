"use client";

import React from "react";
import { StorageCacheSkeleton } from "@/components/storage";

export default function BusinessStorageLoading() {
  return <StorageCacheSkeleton animation="shimmer" />;
}
