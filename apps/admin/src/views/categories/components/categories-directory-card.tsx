"use client";

import { FolderTree, Search, Tags } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse, PaginatedResponse } from "@repo/shared";
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
import {
  CATEGORY_STATUS_FILTERS,
  CATEGORY_TYPES,
} from "../categories.constants";
import type {
  CategoryStatusFilter,
  CategoryTypeFilter,
} from "../categories.types";
import { CategoriesTable } from "./categories-table";

type CategoriesDirectoryCardProps = {
  canCreate: boolean;
  data?: PaginatedResponse<CategoryResponse>;
  isError: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
  onEdit: (category: CategoryResponse) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: CategoryStatusFilter) => void;
  onTypeChange: (type: CategoryTypeFilter) => void;
  search: string;
  status: CategoryStatusFilter;
  type: CategoryTypeFilter;
};

export function CategoriesDirectoryCard({
  canCreate,
  data,
  isError,
  isLoading,
  onClearFilters,
  onCreate,
  onEdit,
  onPageChange,
  onRetry,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  search,
  status,
  type,
}: CategoriesDirectoryCardProps) {
  const t = useTranslations("Categories");
  const hasFilters =
    Boolean(search.trim()) || status !== "ALL" || type !== "ALL";

  return (
    <Card>
      <CardHeader className="gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <CategoriesDirectoryFilters
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onTypeChange={onTypeChange}
          search={search}
          status={status}
          type={type}
        />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <CategoriesDirectoryContent
          data={data}
          canCreate={canCreate}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onClearFilters={onClearFilters}
          onCreate={onCreate}
          onEdit={onEdit}
          onPageChange={onPageChange}
          onRetry={onRetry}
        />
      </CardContent>
    </Card>
  );
}

function CategoriesDirectoryFilters({
  onSearchChange,
  onStatusChange,
  onTypeChange,
  search,
  status,
  type,
}: Pick<
  CategoriesDirectoryCardProps,
  | "onSearchChange"
  | "onStatusChange"
  | "onTypeChange"
  | "search"
  | "status"
  | "type"
>) {
  const t = useTranslations("Categories");

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
      <select
        aria-label={t("typeFilter")}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        onChange={(event) =>
          onTypeChange(event.target.value as CategoryTypeFilter)
        }
        value={type}
      >
        <option value="ALL">{t("allTypes")}</option>
        {CATEGORY_TYPES.map((categoryType) => (
          <option key={categoryType} value={categoryType}>
            {t(`types.${categoryType}`)}
          </option>
        ))}
      </select>
      <select
        aria-label={t("statusFilter")}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        onChange={(event) =>
          onStatusChange(event.target.value as CategoryStatusFilter)
        }
        value={status}
      >
        {CATEGORY_STATUS_FILTERS.map((statusFilter) => (
          <option key={statusFilter} value={statusFilter}>
            {t(`statuses.${statusFilter}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

function CategoriesDirectoryContent({
  data,
  canCreate,
  hasFilters,
  isError,
  isLoading,
  onClearFilters,
  onCreate,
  onEdit,
  onPageChange,
  onRetry,
}: Pick<
  CategoriesDirectoryCardProps,
  "data" | "isError" | "isLoading" | "onPageChange" | "onRetry"
> & {
  canCreate: CategoriesDirectoryCardProps["canCreate"];
  hasFilters: boolean;
  onClearFilters: CategoriesDirectoryCardProps["onClearFilters"];
  onCreate: CategoriesDirectoryCardProps["onCreate"];
  onEdit: CategoriesDirectoryCardProps["onEdit"];
}) {
  const t = useTranslations("Categories");

  if (isLoading) {
    return <CategoriesDirectorySkeleton />;
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
        icon={FolderTree}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <CategoriesTable items={data.items} onEdit={onEdit} />
        <CategoriesPagination data={data} onPageChange={onPageChange} />
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
          <Button onClick={onCreate}>{t("create")}</Button>
        ) : null
      }
      description={
        hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
      }
      icon={Tags}
      title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function CategoriesDirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}

function CategoriesPagination({
  data,
  onPageChange,
}: {
  data: PaginatedResponse<CategoryResponse>;
  onPageChange: CategoriesDirectoryCardProps["onPageChange"];
}) {
  const t = useTranslations("Categories");

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
