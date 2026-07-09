"use client";

import { Search, UserRoundX, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerSummary, PaginatedResponse } from "@repo/shared";
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
import { StatePanel } from "@/src/components/common/state-panel";
import { CustomersTable } from "./customers-table";

type CustomersDirectoryCardProps = {
  canCreate: boolean;
  data?: PaginatedResponse<CustomerSummary>;
  isError: boolean;
  isLoading: boolean;
  onCreate: () => void;
  onEdit: (customer: CustomerSummary) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  search: string;
};

export function CustomersDirectoryCard({
  canCreate,
  data,
  isError,
  isLoading,
  onCreate,
  onEdit,
  onPageChange,
  onRetry,
  onSearchChange,
  search,
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
        />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <CustomersDirectoryContent
          canCreate={canCreate}
          data={data}
          hasSearch={hasSearch}
          isError={isError}
          isLoading={isLoading}
          onCreate={onCreate}
          onEdit={onEdit}
          onPageChange={onPageChange}
          onRetry={onRetry}
          onSearchChange={onSearchChange}
        />
      </CardContent>
    </Card>
  );
}

function CustomersDirectoryFilters({
  onSearchChange,
  search,
}: {
  onSearchChange: (search: string) => void;
  search: string;
}) {
  const t = useTranslations("Customers");

  return (
    <div className="w-full lg:w-[24rem]">
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
    </div>
  );
}

function CustomersDirectoryContent({
  canCreate,
  data,
  hasSearch,
  isError,
  isLoading,
  onCreate,
  onEdit,
  onPageChange,
  onRetry,
  onSearchChange,
}: Pick<
  CustomersDirectoryCardProps,
  | "canCreate"
  | "data"
  | "isError"
  | "isLoading"
  | "onCreate"
  | "onEdit"
  | "onPageChange"
  | "onRetry"
  | "onSearchChange"
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
        <CustomersTable items={data.items} onEdit={onEdit} />
        <CustomersPagination data={data} onPageChange={onPageChange} />
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
          <Button onClick={onCreate}>{t("create")}</Button>
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
}: {
  data: PaginatedResponse<CustomerSummary>;
  onPageChange: CustomersDirectoryCardProps["onPageChange"];
}) {
  const t = useTranslations("Customers");

  return (
    <PaginationControls
      nextLabel={t("next")}
      onPageChange={onPageChange}
      page={data.meta.page}
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
