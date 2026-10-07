import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { CategoriesListSkeleton } from "@/components/categories/CategoriesListSkeleton";

const CategoriesListView = dynamic(
  () =>
    import("@/components/categories/categories-list-view").then(
      (mod) => mod.CategoriesListView
    ),
  {
    loading: () => <CategoriesListSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Categories Management | SmartPOS Business",
  description:
    "Display a listing of categories with optional tree view, filters, and pagination.",
};

export default function BusinessCategoryPage() {
  return (
    <Suspense fallback={<CategoriesListSkeleton />}>
      <CategoriesListView />
    </Suspense>
  );
}
