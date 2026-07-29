"use client";

import type { ReactNode } from "react";
import { cn } from "./lib/utils";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type PaginationPageItem = number | "ellipsis-start" | "ellipsis-end";

export type PaginationControlsClassNames = {
  activePageButton?: string;
  directionButton?: string;
  pageButton?: string;
  pageStatus?: string;
};

export type PaginationControlsProps = {
  className?: string;
  classNames?: PaginationControlsClassNames;
  nextLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onScrollToTarget?: (targetId: string) => void;
  page: number;
  pageLabel?: (page: number) => string;
  pageSize?: number;
  pageSizeLabel?: string;
  pageSizeOptions?: number[];
  paginationLabel?: string;
  previousLabel: string;
  scrollTargetId?: string;
  showDesktopDirectionLabels?: boolean;
  summary?: ReactNode;
  totalPages: number;
  variant?: "compact" | "default";
};

export function PaginationControls({
  className,
  classNames,
  nextLabel,
  onPageChange,
  onPageSizeChange,
  onScrollToTarget,
  page,
  pageLabel,
  pageSize,
  pageSizeLabel,
  pageSizeOptions = [10, 20, 50],
  paginationLabel,
  previousLabel,
  scrollTargetId,
  showDesktopDirectionLabels = true,
  summary,
  totalPages,
  variant = "default",
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);
  const pages = getPaginationItems(currentPage, safeTotalPages);
  const changePage = (nextPage: number) => {
    if (nextPage === currentPage) return;

    onPageChange(nextPage);

    if (!scrollTargetId) return;

    window.requestAnimationFrame(() => {
      if (onScrollToTarget) {
        onScrollToTarget(scrollTargetId);
        return;
      }

      const scrollTarget = document.getElementById(scrollTargetId);
      if (!scrollTarget) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      scrollTarget.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

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
        <Pagination
          aria-label={paginationLabel}
          className="mx-0 w-auto justify-end"
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-label={previousLabel}
                className={cn("size-9 px-0", classNames?.directionButton)}
                disabled={currentPage <= 1}
                onClick={() => changePage(currentPage - 1)}
              />
            </PaginationItem>
            <PaginationItem>
              <span
                className={cn(
                  "flex h-9 min-w-10 items-center justify-center text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300",
                  classNames?.pageStatus,
                )}
              >
                {currentPage}/{safeTotalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                aria-label={nextLabel}
                className={cn("size-9 px-0", classNames?.directionButton)}
                disabled={currentPage >= safeTotalPages}
                onClick={() => changePage(currentPage + 1)}
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
        "mt-4 flex min-w-0 max-w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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

      <Pagination
        aria-label={paginationLabel}
        className="mx-0 min-w-0 max-w-full justify-start sm:hidden"
      >
        <PaginationContent className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1">
          <PaginationItem className="flex min-w-0 flex-1">
            <PaginationPrevious
              aria-label={previousLabel}
              className={cn(
                "h-11 w-full min-w-0 whitespace-nowrap px-1 text-xs",
                classNames?.directionButton,
              )}
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
            >
              {previousLabel}
            </PaginationPrevious>
          </PaginationItem>
          <PaginationItem className="shrink-0">
            <span
              className={cn(
                "flex h-11 min-w-10 items-center justify-center px-1 text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300",
                classNames?.pageStatus,
              )}
            >
              {currentPage}/{safeTotalPages}
            </span>
          </PaginationItem>
          <PaginationItem className="flex min-w-0 flex-1">
            <PaginationNext
              aria-label={nextLabel}
              className={cn(
                "h-11 w-full min-w-0 whitespace-nowrap px-1 text-xs",
                classNames?.directionButton,
              )}
              disabled={currentPage >= safeTotalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              {nextLabel}
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Pagination
        aria-label={paginationLabel}
        className="mx-0 hidden min-w-0 max-w-full justify-start overflow-x-auto pb-1 sm:flex xl:w-auto xl:justify-end"
      >
        <PaginationContent className="min-w-max">
          <PaginationItem>
            <PaginationPrevious
              aria-label={previousLabel}
              className={cn(
                !showDesktopDirectionLabels && "size-9 px-0",
                classNames?.directionButton,
              )}
              disabled={currentPage <= 1}
              onClick={() => changePage(currentPage - 1)}
            >
              {showDesktopDirectionLabels ? previousLabel : null}
            </PaginationPrevious>
          </PaginationItem>
          {pages.map((item) => (
            <PaginationItem key={item}>
              {typeof item === "number" ? (
                <PaginationButton
                  aria-label={pageLabel?.(item)}
                  className={cn(
                    classNames?.pageButton,
                    item === currentPage && classNames?.activePageButton,
                  )}
                  isActive={item === currentPage}
                  onClick={() => changePage(item)}
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
              aria-label={nextLabel}
              className={cn(
                !showDesktopDirectionLabels && "size-9 px-0",
                classNames?.directionButton,
              )}
              disabled={currentPage >= safeTotalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              {showDesktopDirectionLabels ? nextLabel : null}
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationPageItem[] {
  const safeTotalPages = Math.max(1, Math.trunc(totalPages));
  const safeCurrentPage = Math.min(
    Math.max(1, Math.trunc(currentPage)),
    safeTotalPages,
  );

  if (safeTotalPages <= 7) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  if (safeCurrentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", safeTotalPages];
  }

  if (safeCurrentPage >= safeTotalPages - 3) {
    return [
      1,
      "ellipsis-start",
      safeTotalPages - 4,
      safeTotalPages - 3,
      safeTotalPages - 2,
      safeTotalPages - 1,
      safeTotalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    safeCurrentPage - 1,
    safeCurrentPage,
    safeCurrentPage + 1,
    "ellipsis-end",
    safeTotalPages,
  ];
}
