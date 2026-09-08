"use client";

import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import type {
  PaginatedResponse,
  WarrantyActivationRequestSortBy,
  WarrantyActivationRequestSummary,
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
import { FileSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { WARRANTY_ACTIVATION_REQUEST_STATUS_FILTERS } from "../warranty-activation-requests.constants";
import type {
  WarrantyActivationRequestAction,
  WarrantyActivationRequestDirectoryFilters,
  WarrantyActivationRequestStatusFilter,
} from "../warranty-activation-requests.types";
import { WarrantyActivationRequestsTable } from "./warranty-activation-requests-table";

type WarrantyActivationRequestsDirectoryCardProps = {
  data?: PaginatedResponse<WarrantyActivationRequestSummary>;
  filters: WarrantyActivationRequestDirectoryFilters;
  isError: boolean;
  isLoading: boolean;
  onAction: (
    request: WarrantyActivationRequestSummary,
    action: WarrantyActivationRequestAction,
  ) => void;
  onDownloadCertificate: (request: WarrantyActivationRequestSummary) => void;
  onClearFilters: () => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sortBy: WarrantyActivationRequestSortBy) => void;
  onViewCertificate: (request: WarrantyActivationRequestSummary) => void;
  onStatusChange: (value: WarrantyActivationRequestStatusFilter) => void;
  pageSize: number;
  search: string;
  sortBy?: WarrantyActivationRequestSortBy;
  sortOrder: "asc" | "desc";
};

export function WarrantyActivationRequestsDirectoryCard({
  data,
  filters,
  isError,
  isLoading,
  onAction,
  onDownloadCertificate,
  onClearFilters,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onViewCertificate,
  onStatusChange,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: WarrantyActivationRequestsDirectoryCardProps) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");
  const hasFilters =
    Boolean(search.trim()) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo) ||
    filters.status !== "ALL";

  return (
    <Card className="min-w-0 w-full max-w-full">
      <CardHeader className="min-w-0 gap-4 px-4 sm:px-6">
        <div className="min-w-0">
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5 wrap-break-word">
            {t("directoryDescription")}
          </CardDescription>
        </div>

        <WarrantyActivationRequestsFilters
          filters={filters}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          search={search}
        />
      </CardHeader>
      <CardContent className="min-w-0 px-4 sm:px-6">
        <WarrantyActivationRequestsContent
          data={data}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onAction={onAction}
          onClearFilters={onClearFilters}
          onDownloadCertificate={onDownloadCertificate}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onRetry={onRetry}
          onSortChange={onSortChange}
          onViewCertificate={onViewCertificate}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </CardContent>
    </Card>
  );
}

function WarrantyActivationRequestsFilters({
  filters,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
  onStatusChange,
  search,
}: Pick<
  WarrantyActivationRequestsDirectoryCardProps,
  | "filters"
  | "onDateFromChange"
  | "onDateToChange"
  | "onSearchChange"
  | "onStatusChange"
  | "search"
>) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  return (
    <div className="grid min-w-0 w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative min-w-0">
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
          onStatusChange(value as WarrantyActivationRequestStatusFilter)
        }
        options={WARRANTY_ACTIVATION_REQUEST_STATUS_FILTERS.map((status) => ({
          label: t(`statuses.${status}`),
          value: status,
        }))}
        triggerClassName="min-w-0 w-full max-w-full"
        value={filters.status}
      />
      <DateRangePicker
        ariaLabel={t("dateRange")}
        className="min-w-0 max-w-full"
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

function WarrantyActivationRequestsContent({
  data,
  hasFilters,
  isError,
  isLoading,
  onAction,
  onClearFilters,
  onDownloadCertificate,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSortChange,
  onViewCertificate,
  pageSize,
  sortBy,
  sortOrder,
}: Pick<
  WarrantyActivationRequestsDirectoryCardProps,
  | "data"
  | "isError"
  | "isLoading"
  | "onAction"
  | "onClearFilters"
  | "onDownloadCertificate"
  | "onPageChange"
  | "onPageSizeChange"
  | "onRetry"
  | "onSortChange"
  | "onViewCertificate"
  | "pageSize"
  | "sortBy"
  | "sortOrder"
> & {
  hasFilters: boolean;
}) {
  const t = useTranslations("WarrantyActivationRequestsAdmin");

  if (isLoading) return <WarrantyActivationRequestsSkeleton />;

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
      <div
        className="scroll-mt-24"
        id="warranty-activation-requests-directory-results"
      >
        <WarrantyActivationRequestsTable
          items={data.items}
          onAction={onAction}
          onDownloadCertificate={onDownloadCertificate}
          onSortChange={onSortChange}
          onViewCertificate={onViewCertificate}
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
          scrollTargetId="warranty-activation-requests-directory-results"
          summary={t("pagination", {
            page: data.meta.page,
            total: data.meta.total,
            totalPages: Math.max(data.meta.totalPages, 1),
          })}
          totalPages={data.meta.totalPages}
        />
      </div>
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

function WarrantyActivationRequestsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}
