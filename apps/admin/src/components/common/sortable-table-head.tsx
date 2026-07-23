"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@repo/ui";

type SortOrder = "asc" | "desc";

type SortableTableHeadProps<TSortBy extends string> = {
  activeSortBy?: TSortBy;
  children: ReactNode;
  onSortChange: (sortBy: TSortBy) => void;
  sortBy: TSortBy;
  sortOrder: SortOrder;
};

export function SortableTableHead<TSortBy extends string>({
  activeSortBy,
  children,
  onSortChange,
  sortBy,
  sortOrder,
}: SortableTableHeadProps<TSortBy>) {
  const isActive = activeSortBy === sortBy;
  const SortIcon = isActive
    ? sortOrder === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <TableHead className="whitespace-nowrap">
      <button
        className="inline-flex items-center gap-1.5 whitespace-nowrap text-left font-medium uppercase text-inherit transition-colors hover:text-slate-950 dark:hover:text-slate-50"
        onClick={() => onSortChange(sortBy)}
        type="button"
      >
        <span className="whitespace-nowrap">{children}</span>
        <SortIcon
          aria-hidden="true"
          className={isActive ? "size-3.5" : "size-3.5 opacity-50"}
        />
      </button>
    </TableHead>
  );
}
