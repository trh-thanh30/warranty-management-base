"use client";

import { Search, UserRoundX, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  ApiUserStatus,
  ListUsersQuery,
  PaginatedResponse,
  UserAccountSummary,
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
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { SelectControl } from "@/src/components/common/select-control";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";
import { StaffTable } from "./staff-table";

type StaffStatusFilter = "ALL" | ApiUserStatus;
type StaffSortBy = NonNullable<ListUsersQuery["sortBy"]>;

type StaffDirectoryCardProps = {
  canCreate: boolean;
  data?: PaginatedResponse<UserAccountSummary>;
  isError: boolean;
  isLoading: boolean;
  onPermissions: (user: UserAccountSummary) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: StaffSortBy) => void;
  onStatusChange: (status: StaffStatusFilter) => void;
  onToggleStatus: (user: UserAccountSummary) => void;
  pageSize: number;
  search: string;
  sortBy?: StaffSortBy;
  sortOrder: "asc" | "desc";
  status: StaffStatusFilter;
};

export function StaffDirectoryCard({
  canCreate,
  data,
  isError,
  isLoading,
  onPermissions,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onStatusChange,
  onToggleStatus,
  pageSize,
  search,
  sortBy,
  sortOrder,
  status,
}: StaffDirectoryCardProps) {
  const t = useTranslations("Staff");
  const hasFilters = Boolean(search || status !== "ALL");

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <StaffDirectoryFilters
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          search={search}
          status={status}
        />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <StaffDirectoryContent
          canCreate={canCreate}
          data={data}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onPermissions={onPermissions}
          onRetry={onRetry}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
          onStatusChange={onStatusChange}
          onToggleStatus={onToggleStatus}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </CardContent>
    </Card>
  );
}

function StaffDirectoryFilters({
  onSearchChange,
  onStatusChange,
  search,
  status,
}: {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: StaffStatusFilter) => void;
  search: string;
  status: StaffStatusFilter;
}) {
  const t = useTranslations("Staff");

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_10rem]">
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
        aria-label={t("statusFilter")}
        onValueChange={(value) => onStatusChange(value as StaffStatusFilter)}
        options={[
          { label: t("allStatuses"), value: "ALL" },
          { label: t("active"), value: "ACTIVE" },
          { label: t("inactive"), value: "INACTIVE" },
        ]}
        value={status}
      />
    </div>
  );
}

function StaffDirectoryContent({
  canCreate,
  data,
  hasFilters,
  isError,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onPermissions,
  onRetry,
  onSearchChange,
  onSortChange,
  onStatusChange,
  onToggleStatus,
  pageSize,
  sortBy,
  sortOrder,
}: Pick<
  StaffDirectoryCardProps,
  | "canCreate"
  | "data"
  | "isError"
  | "isLoading"
  | "onPageChange"
  | "onPageSizeChange"
  | "onPermissions"
  | "onRetry"
  | "onSearchChange"
  | "onSortChange"
  | "onStatusChange"
  | "onToggleStatus"
  | "pageSize"
  | "sortBy"
  | "sortOrder"
> & {
  hasFilters: boolean;
}) {
  const t = useTranslations("Staff");

  if (isLoading) {
    return <StaffDirectorySkeleton />;
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
        icon={UserRoundX}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <StaffTable
          items={data.items}
          onPermissions={onPermissions}
          onSortChange={onSortChange}
          onToggleStatus={onToggleStatus}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        <StaffPagination
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
          <Button
            onClick={() => {
              onSearchChange("");
              onStatusChange("ALL");
            }}
            variant="secondary"
          >
            {t("clearFilters")}
          </Button>
        ) : canCreate ? (
          <Button asChild>
            <Link href="/users/create">{t("create")}</Link>
          </Button>
        ) : null
      }
      description={
        hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
      }
      icon={Users}
      title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function StaffDirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}

function StaffPagination({
  data,
  onPageChange,
  onPageSizeChange,
  pageSize,
}: {
  data: PaginatedResponse<UserAccountSummary>;
  onPageChange: StaffDirectoryCardProps["onPageChange"];
  onPageSizeChange: StaffDirectoryCardProps["onPageSizeChange"];
  pageSize: StaffDirectoryCardProps["pageSize"];
}) {
  const t = useTranslations("Staff");

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
