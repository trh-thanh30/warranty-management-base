"use client";

import { PackageSearch, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  CategoryResponse,
  PaginatedResponse,
  ProductResponse,
  ProductSortBy,
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
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_FILTERS,
  WARRANTY_STATUS_FILTERS,
} from "../products.constants";
import type {
  ProductCategoryFilter,
  ProductStatusFilter,
  WarrantyStatusFilter,
} from "../products.types";
import { ProductsTable } from "./products-table";

type ProductsDirectoryCardProps = {
  canCreate: boolean;
  categories: CategoryResponse[];
  data?: PaginatedResponse<ProductResponse>;
  filters: {
    category: ProductCategoryFilter;
    categoryId: string;
    status: ProductStatusFilter;
    warrantyStatus: WarrantyStatusFilter;
  };
  isError: boolean;
  isLoading: boolean;
  onAssignOwner: (product: ProductResponse) => void;
  onCategoryChange: (category: ProductCategoryFilter) => void;
  onCategoryIdChange: (categoryId: string) => void;
  onClearFilters: () => void;
  onDelete: (product: ProductResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: ProductSortBy) => void;
  onStatusChange: (status: ProductStatusFilter) => void;
  onWarrantyStatusChange: (status: WarrantyStatusFilter) => void;
  pageSize: number;
  search: string;
  sortBy?: ProductSortBy;
  sortOrder: "asc" | "desc";
};

export function ProductsDirectoryCard({
  canCreate,
  categories,
  data,
  filters,
  isError,
  isLoading,
  onAssignOwner,
  onCategoryChange,
  onCategoryIdChange,
  onClearFilters,
  onDelete,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onStatusChange,
  onWarrantyStatusChange,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: ProductsDirectoryCardProps) {
  const t = useTranslations("Products");
  const hasFilters =
    Boolean(search.trim()) ||
    filters.category !== "ALL" ||
    filters.categoryId !== "ALL" ||
    filters.status !== "ALL" ||
    filters.warrantyStatus !== "ALL";

  return (
    <Card>
      <CardHeader className="gap-4">
        <div>
          <CardTitle>{t("directoryTitle")}</CardTitle>
          <CardDescription className="mt-1.5">
            {t("directoryDescription")}
          </CardDescription>
        </div>
        <ProductsDirectoryFilters
          categories={categories}
          filters={filters}
          onCategoryChange={onCategoryChange}
          onCategoryIdChange={onCategoryIdChange}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onWarrantyStatusChange={onWarrantyStatusChange}
          search={search}
        />
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <ProductsDirectoryContent
          canCreate={canCreate}
          data={data}
          hasFilters={hasFilters}
          isError={isError}
          isLoading={isLoading}
          onAssignOwner={onAssignOwner}
          onClearFilters={onClearFilters}
          onDelete={onDelete}
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

function ProductsDirectoryFilters({
  categories,
  filters,
  onCategoryChange,
  onCategoryIdChange,
  onSearchChange,
  onStatusChange,
  onWarrantyStatusChange,
  search,
}: Pick<
  ProductsDirectoryCardProps,
  | "categories"
  | "filters"
  | "onCategoryChange"
  | "onCategoryIdChange"
  | "onSearchChange"
  | "onStatusChange"
  | "onWarrantyStatusChange"
  | "search"
>) {
  const t = useTranslations("Products");

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative md:col-span-2 xl:col-span-1">
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
        aria-label={t("legacyCategoryFilter")}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        onChange={(event) =>
          onCategoryChange(event.target.value as ProductCategoryFilter)
        }
        value={filters.category}
      >
        <option value="ALL">{t("allLegacyCategories")}</option>
        {PRODUCT_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {t(`categories.${category}`)}
          </option>
        ))}
      </select>
      <select
        aria-label={t("dynamicCategoryFilter")}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        onChange={(event) => onCategoryIdChange(event.target.value)}
        value={filters.categoryId}
      >
        <option value="ALL">{t("allDynamicCategories")}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select
        aria-label={t("statusFilter")}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        onChange={(event) =>
          onStatusChange(event.target.value as ProductStatusFilter)
        }
        value={filters.status}
      >
        {PRODUCT_STATUS_FILTERS.map((status) => (
          <option key={status} value={status}>
            {t(`statuses.${status}`)}
          </option>
        ))}
      </select>
      <select
        aria-label={t("warrantyStatusFilter")}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
        onChange={(event) =>
          onWarrantyStatusChange(event.target.value as WarrantyStatusFilter)
        }
        value={filters.warrantyStatus}
      >
        {WARRANTY_STATUS_FILTERS.map((status) => (
          <option key={status} value={status}>
            {t(`warrantyStatuses.${status}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProductsDirectoryContent({
  canCreate,
  data,
  hasFilters,
  isError,
  isLoading,
  onAssignOwner,
  onClearFilters,
  onDelete,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onSortChange,
  pageSize,
  sortBy,
  sortOrder,
}: Pick<
  ProductsDirectoryCardProps,
  | "canCreate"
  | "data"
  | "isError"
  | "isLoading"
  | "onAssignOwner"
  | "onClearFilters"
  | "onDelete"
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
  const t = useTranslations("Products");

  if (isLoading) return <ProductsDirectorySkeleton />;

  if (isError) {
    return (
      <StatePanel
        action={
          <Button onClick={onRetry} variant="secondary">
            {t("tryAgain")}
          </Button>
        }
        description={t("loadErrorDescription")}
        icon={PackageSearch}
        title={t("loadErrorTitle")}
      />
    );
  }

  if (data && data.items.length > 0) {
    return (
      <>
        <ProductsTable
          items={data.items}
          onAssignOwner={onAssignOwner}
          onDelete={onDelete}
          onSortChange={onSortChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
        <ProductsPagination
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
        ) : canCreate ? (
          <Button asChild>
            <Link href="/products/create">{t("create")}</Link>
          </Button>
        ) : null
      }
      description={
        hasFilters ? t("emptyFilteredDescription") : t("emptyDescription")
      }
      icon={PackageSearch}
      title={hasFilters ? t("emptyFilteredTitle") : t("emptyTitle")}
    />
  );
}

function ProductsDirectorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-16 w-full" key={index} />
      ))}
    </div>
  );
}

function ProductsPagination({
  data,
  onPageChange,
  onPageSizeChange,
  pageSize,
}: {
  data: PaginatedResponse<ProductResponse>;
  onPageChange: ProductsDirectoryCardProps["onPageChange"];
  onPageSizeChange: ProductsDirectoryCardProps["onPageSizeChange"];
  pageSize: ProductsDirectoryCardProps["pageSize"];
}) {
  const t = useTranslations("Products");

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
