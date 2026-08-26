"use client";

import { Search, UserRoundX, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  CustomerSummary,
  ListCustomersQuery,
  PaginatedResponse,
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
import { StatePanel } from "@/src/components/common/state-panel";
import { SelectControl } from "@/src/components/common/select-control";
import { Link } from "@/src/i18n/navigation";
import { CustomersTable } from "./customers-table";

type CustomerSortBy = NonNullable<ListCustomersQuery["sortBy"]>;

type CustomersDirectoryCardProps = {
  canCreate: boolean;
  data?: PaginatedResponse<CustomerSummary>;
  isError: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: CustomerSortBy) => void;
  onStatusChange: (status: "ACTIVE" | "DELETED" | "ALL") => void;
  onDelete?: (customer: CustomerSummary) => void;
  pageSize: number;
  search: string;
  sortBy?: CustomerSortBy;
  sortOrder: "asc" | "desc";
  status: "ACTIVE" | "DELETED" | "ALL";
};

export function CustomersDirectoryCard({
  canCreate,
  data,
  isError,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSearchChange,
  onStatusChange,
  onSortChange,
  pageSize,
  search,
  status,
  sortBy,
  sortOrder,
  onDelete,
}: CustomersDirectoryCardProps) {
  const t = useTranslations("Customers");
  const hasSearch = Boolean(search.trim());

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <CustomersDirectoryFilters
          onSearchChange={onSearchChange}
          search={search}
          status={status}
          onStatusChange={onStatusChange}
        />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <CustomersDirectoryContent
          canCreate={canCreate}
          data={data}
          hasSearch={hasSearch}
          isError={isError}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onRetry={onRetry}
          onSearchChange={onSearchChange}
          onSortChange={onSortChange}
          pageSize={pageSize}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}

function CustomersDirectoryFilters({
  onStatusChange,
  onSearchChange,
  search,
  status,
}: {
  onStatusChange: (status: "ACTIVE" | "DELETED" | "ALL") => void;
  onSearchChange: (search: string) => void;
  search: string;
  status: "ACTIVE" | "DELETED" | "ALL";
}) {
  const t = useTranslations("Customers");

  return (
    <div className="flex w-full gap-2 lg:w-[32rem]">
      <SelectControl
        ariaLabel={t("statusFilter")}
        className="w-40"
        onValueChange={(value) =>
          onStatusChange(value as "ACTIVE" | "DELETED" | "ALL")
        }
        options={[
          { label: t("statusActive"), value: "ACTIVE" },
          { label: t("statusDeleted"), value: "DELETED" },
          { label: t("statusAll"), value: "ALL" },
        ]}
        value={status}
      />
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          aria-label={t("searchLabel")}
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          value={search}
        />
      </div>
    </div>
  );
}

function CustomersDirectoryContent({
  canCreate,
  data,
  hasSearch,
  isError,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onDelete,
  pageSize,
  sortBy,
  sortOrder,
}: Pick<
  CustomersDirectoryCardProps,
  | "canCreate"
  | "data"
  | "isError"
  | "isLoading"
  | "onPageChange"
  | "onPageSizeChange"
  | "onRetry"
  | "onSearchChange"
  | "onSortChange"
  | "onDelete"
  | "pageSize"
  | "sortBy"
  | "sortOrder"
> & {
  hasSearch: boolean;
}) {
  const t = useTranslations("Customers");

  if (isLoading) {
    return <CustomersDirectorySkeleton />;
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
        <CustomersTable
          items={data.items}
          onDelete={onDelete}
          onSortChange={onSortChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        <CustomersPagination
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
        hasSearch ? (
          <Button onClick={() => onSearchChange("")} variant="secondary">
            {t("clearSearch")}
          </Button>
        ) : canCreate ? (
          <Button asChild>
            <Link href="/customers/create">{t("create")}</Link>
          </Button>
        ) : null
      }
      description={
        hasSearch ? t("emptyFilteredDescription") : t("emptyDescription")
      }
      icon={Users}
      title={hasSearch ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function CustomersDirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}

function CustomersPagination({
  data,
  onPageChange,
  onPageSizeChange,
  pageSize,
}: {
  data: PaginatedResponse<CustomerSummary>;
  onPageChange: CustomersDirectoryCardProps["onPageChange"];
  onPageSizeChange: CustomersDirectoryCardProps["onPageSizeChange"];
  pageSize: CustomersDirectoryCardProps["pageSize"];
}) {
  const t = useTranslations("Customers");

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
