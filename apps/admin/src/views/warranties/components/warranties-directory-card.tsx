"use client";

import { Search, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PaginatedResponse, WarrantyListItem } from "@repo/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from "@repo/ui";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { WARRANTY_STATUS_FILTERS } from "../warranties.constants";
import type { WarrantySortBy, WarrantyStatusFilter } from "../warranties.types";
import { WarrantiesTable } from "./warranties-table";

type WarrantiesDirectoryCardProps = {
  data?: PaginatedResponse<WarrantyListItem>;
  filters: {
    status: WarrantyStatusFilter;
  };
  isError: boolean;
  isLoading: boolean;
  onActivate: (warranty: WarrantyListItem) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: WarrantySortBy) => void;
  onStatusChange: (status: WarrantyStatusFilter) => void;
  pageSize: number;
  search: string;
  sortBy?: WarrantySortBy;
  sortOrder: "asc" | "desc";
};

export function WarrantiesDirectoryCard({
  data,
  filters,
  isError,
  isLoading,
  onActivate,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onStatusChange,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: WarrantiesDirectoryCardProps) {
  const t = useTranslations("Warranties");
  const hasFilters = Boolean(search.trim()) || filters.status !== "ALL";

  return (
    <Card>
      <CardHeader className="gap-4">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <WarrantiesDirectoryFilters
          filters={filters}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          search={search}
        />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <WarrantiesDirectoryContent
          data={data}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onActivate={onActivate}
          onClearFilters={onClearFilters}
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

function WarrantiesDirectoryFilters({
  filters,
  onSearchChange,
  onStatusChange,
  search,
}: Pick<
  WarrantiesDirectoryCardProps,
  "filters" | "onSearchChange" | "onStatusChange" | "search"
>) {
  const t = useTranslations("Warranties");

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label={t("searchLabel")}
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          value={search}
        />
      </div>
      <SelectControl
        ariaLabel={t("statusFilter")}
        onValueChange={(value) => onStatusChange(value as WarrantyStatusFilter)}
        options={WARRANTY_STATUS_FILTERS.map((status) => ({
          label: t(`statuses.${status}`),
          value: status,
        }))}
        value={filters.status}
      />
    </div>
  );
}

function WarrantiesDirectoryContent({
  data,
  hasFilters,
  isError,
  isLoading,
  onActivate,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSortChange,
  pageSize,
  sortBy,
  sortOrder,
}: Pick<
  WarrantiesDirectoryCardProps,
  | "data"
  | "isError"
  | "isLoading"
  | "onActivate"
  | "onClearFilters"
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
  const t = useTranslations("Warranties");

  if (isLoading) return <WarrantiesDirectorySkeleton />;

  if (isError) {
    return (
      <StatePanel
        action={
          <Button onClick={onRetry} variant="secondary">
            {t("tryAgain")}
          </Button>
        }
        description={t("loadErrorDescription")}
        icon={ShieldCheck}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <WarrantiesTable
          items={data.items}
          onActivate={onActivate}
          onSortChange={onSortChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        <WarrantiesPagination
          data={data}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSize={pageSize}
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
      icon={ShieldCheck}
      title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function WarrantiesDirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}

function WarrantiesPagination({
  data,
  onPageChange,
  onPageSizeChange,
  pageSize,
}: {
  data: PaginatedResponse<WarrantyListItem>;
  onPageChange: WarrantiesDirectoryCardProps["onPageChange"];
  onPageSizeChange: WarrantiesDirectoryCardProps["onPageSizeChange"];
  pageSize: WarrantiesDirectoryCardProps["pageSize"];
}) {
  const t = useTranslations("Warranties");

  return (
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
  );
}
