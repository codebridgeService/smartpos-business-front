import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { BrandsListSkeleton } from "@/components/brands/BrandsListSkeleton";

const BrandsListView = dynamic(
  () => import("@/components/brands/brands-list-view").then((mod) => mod.BrandsListView),
  {
    loading: () => <BrandsListSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Brands Management | SmartPOS Business",
  description: "Browse product brands with live search, active status filters, and offline IndexedDB caching.",
};

export default function BusinessBrandsPage() {
  return <BrandsListView />;
}
