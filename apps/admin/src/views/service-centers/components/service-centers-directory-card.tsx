"use client";

import { Building2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  PaginatedResponse,
  ServiceCenterSortBy,
  ServiceCenterSummary,
} from "@repo/shared";
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
import { PaginationControls } from "@repo/ui/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";
import { SERVICE_CENTER_STATUS_FILTERS } from "../service-centers.constants";
import type { ServiceCenterStatusFilter } from "../service-centers.types";
import { ServiceCentersTable } from "./service-centers-table";

type ServiceCentersDirectoryCardProps = {
  canCreate: boolean;
  data?: PaginatedResponse<ServiceCenterSummary>;
  isError: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onDeactivate: (serviceCenter: ServiceCenterSummary) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onProvinceChange: (province: string) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: ServiceCenterSortBy) => void;
  onStatusChange: (status: ServiceCenterStatusFilter) => void;
  pageSize: number;
  province: string;
  provinceOptions: string[];
  provincesAreLoading: boolean;
  search: string;
  sortBy?: ServiceCenterSortBy;
  sortOrder: "asc" | "desc";
  status: ServiceCenterStatusFilter;
};

export function ServiceCentersDirectoryCard(
  props: ServiceCentersDirectoryCardProps,
) {
  const t = useTranslations("ServiceCenters");
  const hasFilters =
    Boolean(props.search.trim()) ||
    Boolean(props.province.trim()) ||
    props.status !== "ALL";

  return (
    <Card>
      <CardHeader className="gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <DirectoryFilters {...props} />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <DirectoryContent {...props} hasFilters={hasFilters} />
      </CardContent>
    </Card>
  );
}

function DirectoryFilters({
  onProvinceChange,
  onSearchChange,
  onStatusChange,
  province,
  provinceOptions,
  provincesAreLoading,
  search,
  status,
}: ServiceCentersDirectoryCardProps) {
  const t = useTranslations("ServiceCenters");

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-[18rem_13rem_12rem]">
      <div className="relative sm:col-span-2 xl:col-span-1">
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
        aria-label={t("provinceFilter")}
        disabled={provincesAreLoading || provinceOptions.length === 0}
        onValueChange={onProvinceChange}
        options={[
          {
            label: provincesAreLoading
              ? t("loadingProvinces")
              : t("allProvinces"),
            value: "",
          },
          ...provinceOptions.map((provinceOption) => ({
            label: provinceOption,
            value: provinceOption,
          })),
        ]}
        value={province}
      />
      <SelectControl
        aria-label={t("statusFilter")}
        onValueChange={(value) =>
          onStatusChange(value as ServiceCenterStatusFilter)
        }
        options={SERVICE_CENTER_STATUS_FILTERS.map((statusFilter) => ({
          label: t(`statuses.${statusFilter}`),
          value: statusFilter,
        }))}
        value={status}
      />
    </div>
  );
}

function DirectoryContent({
  canCreate,
  data,
  hasFilters,
  isError,
  isLoading,
  onClearFilters,
  onDeactivate,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSortChange,
  pageSize,
  sortBy,
  sortOrder,
}: ServiceCentersDirectoryCardProps & { hasFilters: boolean }) {
  const t = useTranslations("ServiceCenters");

  if (isLoading) {
    return <DirectorySkeleton />;
  }

  if (isError) {
    return (
      <StatePanel
        action={
          <Button onClick={onRetry} variant="secondary">
            {t("tryAgain")}
          </Button>
        }
        description={t("loadErrorDescription")}
        icon={Building2}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <ServiceCentersTable
          items={data.items}
          onDeactivate={onDeactivate}
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
        ) : canCreate ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/service-centers/create">
              <span className="sm:hidden">{t("createShort")}</span>
              <span className="hidden sm:inline">{t("create")}</span>
            </Link>
          </Button>
        ) : null
      }
      description={
        hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
      }
      icon={Building2}
      title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function DirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}
