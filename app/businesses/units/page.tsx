import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { UnitsListSkeleton } from "@/components/units/UnitsListSkeleton";

const UnitsListView = dynamic(
  () => import("@/components/units/units-list-view").then((mod) => mod.UnitsListView),
  {
    loading: () => <UnitsListSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Measurement Units | SmartPOS Business",
  description:
    "Display a listing of measurement units with search and active status filters, offline caching, and decimal precision scaling.",
};

export default function BusinessUnitsPage() {
  return (
    <Suspense fallback={<UnitsListSkeleton />}>
      <UnitsListView />
    </Suspense>
  );
}
