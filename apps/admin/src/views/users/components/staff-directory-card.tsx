"use client";

import { Search, UserRoundX, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  ApiUserStatus,
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
import { StatePanel } from "@/src/components/common/state-panel";
import { StaffTable } from "./staff-table";

type StaffStatusFilter = "ALL" | ApiUserStatus;

type StaffDirectoryCardProps = {
  data?: PaginatedResponse<UserAccountSummary>;
  isError: boolean;
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (user: UserAccountSummary) => void;
  onPermissions: (user: UserAccountSummary) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: StaffStatusFilter) => void;
  onToggleStatus: (user: UserAccountSummary) => void;
  search: string;
  setPage: (page: number | ((current: number) => number)) => void;
  status: StaffStatusFilter;
};

export function StaffDirectoryCard({
  data,
  isError,
  isLoading,
  onCreate,
  onEdit,
  onPermissions,
  onRetry,
  onSearchChange,
  onStatusChange,
  onToggleStatus,
  search,
  setPage,
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
          data={data}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onCreate={onCreate}
          onEdit={onEdit}
          onPermissions={onPermissions}
          onRetry={onRetry}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onToggleStatus={onToggleStatus}
          setPage={setPage}
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
      <select
        aria-label={t("statusFilter")}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950"
        onChange={(event) =>
          onStatusChange(event.target.value as StaffStatusFilter)
        }
        value={status}
      >
        <option value="ALL">{t("allStatuses")}</option>
        <option value="ACTIVE">{t("active")}</option>
        <option value="INACTIVE">{t("inactive")}</option>
      </select>
    </div>
  );
}

function StaffDirectoryContent({
  data,
  hasFilters,
  isError,
  isLoading,
  onCreate,
  onEdit,
  onPermissions,
  onRetry,
  onSearchChange,
  onStatusChange,
  onToggleStatus,
  setPage,
}: Pick<
  StaffDirectoryCardProps,
  | "data"
  | "isError"
  | "isLoading"
  | "onCreate"
  | "onEdit"
  | "onPermissions"
  | "onRetry"
  | "onSearchChange"
  | "onStatusChange"
  | "onToggleStatus"
  | "setPage"
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
          onEdit={onEdit}
          onPermissions={onPermissions}
          onToggleStatus={onToggleStatus}
        />
        <StaffPagination data={data} setPage={setPage} />
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
        ) : (
          <Button onClick={onCreate}>{t("create")}</Button>
        )
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
  setPage,
}: {
  data: PaginatedResponse<UserAccountSummary>;
  setPage: StaffDirectoryCardProps["setPage"];
}) {
  const t = useTranslations("Staff");

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t("pagination", {
          page: data.meta.page,
          totalPages: Math.max(data.meta.totalPages, 1),
          total: data.meta.total,
        })}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          className="w-full sm:w-auto"
          disabled={!data.meta.hasPreviousPage}
          onClick={() => setPage((current) => current - 1)}
          variant="secondary"
        >
          {t("previous")}
        </Button>
        <Button
          className="w-full sm:w-auto"
          disabled={!data.meta.hasNextPage}
          onClick={() => setPage((current) => current + 1)}
          variant="secondary"
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
