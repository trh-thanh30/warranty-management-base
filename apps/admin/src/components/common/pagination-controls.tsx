"use client";

import type { ReactNode } from "react";
import {
  cn,
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

type PaginationPageItem = number | "ellipsis-start" | "ellipsis-end";

type PaginationControlsProps = {
  className?: string;
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
  variant?: "compact" | "default";
};

export function PaginationControls({
  className,
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
  variant = "default",
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);
  const pages = getPaginationItems(currentPage, safeTotalPages);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "mt-4 flex items-center justify-between gap-3",
          className,
        )}
      >
        {summary ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {summary}
          </p>
        ) : (
          <span />
        )}
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-label={previousLabel}
                className="size-9 px-0"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-9 min-w-10 items-center justify-center text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">
                {currentPage}/{safeTotalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                aria-label={nextLabel}
                className="size-9 px-0"
                disabled={currentPage >= safeTotalPages}
                onClick={() => onPageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {summary ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {summary}
          </p>
        ) : null}
        {onPageSizeChange && pageSize ? (
          <label className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{pageSizeLabel}</span>
            <Select
              onValueChange={(value) => onPageSizeChange(Number(value))}
              value={String(pageSize)}
            >
              <SelectTrigger className="h-9 w-20 border-slate-200 px-2 focus:border-slate-400 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
