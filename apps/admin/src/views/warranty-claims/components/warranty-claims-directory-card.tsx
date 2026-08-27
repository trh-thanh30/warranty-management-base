"use client";

import { FileSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  PaginatedResponse,
  WarrantyClaimSortBy,
  WarrantyClaimSummary,
} from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateRangePicker,
  Input,
  Skeleton,
} from "@repo/ui";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import {
  WARRANTY_CLAIM_OVERDUE_FILTERS,
  WARRANTY_CLAIM_PRIORITY_FILTERS,
  WARRANTY_CLAIM_STATUS_FILTERS,
} from "../warranty-claims.constants";
import type {
  WarrantyClaimDirectoryFilters,
  WarrantyClaimAction,
  WarrantyClaimOverdueFilter,
  WarrantyClaimPriorityFilter,
  WarrantyClaimStatusFilter,
} from "../warranty-claims.types";
import { WarrantyClaimsTable } from "./warranty-claims-table";

type WarrantyClaimsDirectoryCardProps = {
  data?: PaginatedResponse<WarrantyClaimSummary>;
  filters: WarrantyClaimDirectoryFilters;
  isError: boolean;
  isLoading: boolean;
  onClaimAction: (
    claim: WarrantyClaimSummary,
    action: WarrantyClaimAction,
  ) => void;
  onClearFilters: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onOverdueChange: (value: WarrantyClaimOverdueFilter) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPriorityChange: (value: WarrantyClaimPriorityFilter) => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sortBy: WarrantyClaimSortBy) => void;
  onStatusChange: (value: WarrantyClaimStatusFilter) => void;
  pageSize: number;
  search: string;
  sortBy?: WarrantyClaimSortBy;
  sortOrder: "asc" | "desc";
};

export function WarrantyClaimsDirectoryCard({
  data,
  filters,
  isError,
  isLoading,
  onClaimAction,
  onClearFilters,
  onDateFromChange,
  onDateToChange,
  onOverdueChange,
  onPageChange,
  onPageSizeChange,
  onPriorityChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onStatusChange,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: WarrantyClaimsDirectoryCardProps) {
  const t = useTranslations("WarrantyClaims");
  const hasFilters =
    Boolean(search.trim()) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.serviceCenter !== "ALL" ||
    filters.isOverdue !== "ALL";

  return (
    <Card className="min-w-0 w-full max-w-full">
      <CardHeader className="min-w-0 gap-4 px-4 sm:px-6">
        <div className="min-w-0">
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5 break-words">
            {t("directoryDescription")}
          </CardDescription>
        </div>

        <WarrantyClaimsFilters
          filters={filters}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onOverdueChange={onOverdueChange}
          onPriorityChange={onPriorityChange}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          search={search}
        />
      </CardHeader>
      <CardContent className="min-w-0 px-4 sm:px-6">
        <WarrantyClaimsContent
          data={data}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onClearFilters={onClearFilters}
          onClaimAction={onClaimAction}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onRetry={onRetry}
          onSortChange={onSortChange}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </CardContent>
    </Card>
  );
}

function WarrantyClaimsFilters({
  filters,
  onDateFromChange,
  onDateToChange,
  onOverdueChange,
  onPriorityChange,
  onSearchChange,
  onStatusChange,
  search,
}: Pick<
  WarrantyClaimsDirectoryCardProps,
  | "filters"
  | "onDateFromChange"
  | "onDateToChange"
  | "onOverdueChange"
  | "onPriorityChange"
  | "onSearchChange"
  | "onStatusChange"
  | "search"
>) {
  const t = useTranslations("WarrantyClaims");

  return (
    <div className="grid min-w-0 w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
      <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label={t("searchLabel")}
          className="min-w-0 pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          value={search}
        />
      </div>
      <SelectControl
        ariaLabel={t("statusFilter")}
        onValueChange={(value) =>
          onStatusChange(value as WarrantyClaimStatusFilter)
        }
        options={WARRANTY_CLAIM_STATUS_FILTERS.map((status) => ({
          label: t(`statuses.${status}`),
          value: status,
        }))}
        triggerClassName="min-w-0 w-full max-w-full"
        value={filters.status}
      />
      <SelectControl
        ariaLabel={t("priorityFilter")}
        onValueChange={(value) =>
          onPriorityChange(value as WarrantyClaimPriorityFilter)
        }
        options={WARRANTY_CLAIM_PRIORITY_FILTERS.map((priority) => ({
          label: t(`priorities.${priority}`),
          value: priority,
        }))}
        triggerClassName="min-w-0 w-full max-w-full"
        value={filters.priority}
      />
      <SelectControl
        ariaLabel={t("overdueFilter")}
        onValueChange={(value) =>
          onOverdueChange(value as WarrantyClaimOverdueFilter)
        }
        options={WARRANTY_CLAIM_OVERDUE_FILTERS.map((filter) => ({
          label: t(`overdueFilters.${filter}`),
          value: filter,
        }))}
        triggerClassName="min-w-0 w-full max-w-full"
        value={filters.isOverdue}
      />
      <DateRangePicker
        ariaLabel={t("dateRange")}
        className="min-w-0 max-w-full md:col-span-2 xl:col-span-1"
        clearLabel={t("clearDateRange")}
        onValueChange={(range) => {
          onDateFromChange(range.from ?? "");
          onDateToChange(range.to ?? "");
        }}
        placeholder={t("dateRangePlaceholder")}
        value={{
          from: filters.dateFrom || undefined,
          to: filters.dateTo || undefined,
        }}
      />
    </div>
  );
}

function WarrantyClaimsContent({
  data,
  hasFilters,
  isError,
  isLoading,
  onClearFilters,
  onClaimAction,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSortChange,
  pageSize,
  sortBy,
  sortOrder,
}: Pick<
  WarrantyClaimsDirectoryCardProps,
  | "data"
  | "isError"
  | "isLoading"
  | "onClearFilters"
  | "onClaimAction"
  | "onPageChange"
  | "onPageSizeChange"
  | "onRetry"
  | "onSortChange"
  | "pageSize"
  | "sortBy"
  | "sortOrder"
> & {
  hasFilters: boolean;
}) {
  const t = useTranslations("WarrantyClaims");

  if (isLoading) return <WarrantyClaimsSkeleton />;

  if (isError) {
    return (
      <StatePanel
        action={
          <Button onClick={onRetry} variant="secondary">
            {t("tryAgain")}
          </Button>
        }
        description={t("loadErrorDescription")}
        icon={FileSearch}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <WarrantyClaimsTable
          items={data.items}
          onAction={onClaimAction}
          onSortChange={onSortChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        <PaginationControls
          nextLabel={t("next")}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          page={data.meta.page}
          pageSize={pageSize}
          pageSizeLabel={t("pageSize")}
          previousLabel={t("previous")}
          summary={t("pagination", {
            page: data.meta.page,
            total: data.meta.total,
            totalPages: Math.max(data.meta.totalPages, 1),
          })}
          totalPages={data.meta.totalPages}
        />
      </>
    );
  }

  return (
    <StatePanel
      action={
        hasFilters ? (
          <Button onClick={onClearFilters} variant="secondary">
            {t("clearFilters")}
          </Button>
        ) : null
      }
      description={
        hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
      }
      icon={FileSearch}
      title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function WarrantyClaimsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}
