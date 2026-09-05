"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { LengthAwarePaginator } from "@/types";
import { Button } from "./button";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  paginator?: LengthAwarePaginator<T>;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No records found",
  emptyDescription = "There are no items to display right now.",
  paginator,
  onPageChange,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-900/75">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-400">
                    <Inbox className="h-10 w-10 mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {emptyDescription}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || row.uuid || rowIdx}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-5 py-3.5 text-zinc-800 dark:text-zinc-200 ${
                        col.className || ""
                      }`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {paginator && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {paginator.from || 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {paginator.to || 0}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {paginator.total}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!paginator.prev_page_url}
              onClick={() => onPageChange?.(paginator.current_page - 1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-zinc-700 dark:text-zinc-300">
              Page {paginator.current_page} of {paginator.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!paginator.next_page_url}
              onClick={() => onPageChange?.(paginator.current_page + 1)}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
