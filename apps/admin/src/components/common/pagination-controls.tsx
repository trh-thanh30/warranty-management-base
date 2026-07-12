"use client";

import type { ReactNode } from "react";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui";

type PaginationPageItem = number | "ellipsis-start" | "ellipsis-end";

type PaginationControlsProps = {
  nextLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  page: number;
  pageSize?: number;
  pageSizeLabel?: string;
  pageSizeOptions?: number[];
  previousLabel: string;
  summary?: ReactNode;
  totalPages: number;
};

export function PaginationControls({
  nextLabel,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeLabel,
  pageSizeOptions = [10, 20, 50],
  previousLabel,
  summary,
  totalPages,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);
  const pages = getPaginationItems(currentPage, safeTotalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {summary ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {summary}
          </p>
        ) : null}
        {onPageSizeChange && pageSize ? (
          <label className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{pageSizeLabel}</span>
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              value={pageSize}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              {previousLabel}
            </PaginationPrevious>
          </PaginationItem>
          {pages.map((item) => (
            <PaginationItem key={item}>
              {typeof item === "number" ? (
                <PaginationButton
                  isActive={item === currentPage}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </PaginationButton>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              disabled={currentPage >= safeTotalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              {nextLabel}
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationPageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}
