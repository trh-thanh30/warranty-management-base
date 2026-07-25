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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@repo/ui";
import { PaginationControls } from "@/src/components/common/pagination-controls";
import { StatePanel } from "@/src/components/common/state-panel";
import { Link } from "@/src/i18n/navigation";
import {
  PRODUCT_PUBLICATION_FILTERS,
  PRODUCT_STATUS_FILTERS,
} from "../products.constants";
import type {
  ProductPublicationFilter,
  ProductStatusFilter,
} from "../products.types";
import { ProductsTable } from "./products-table";

type ProductsDirectoryCardProps = {
  canCreate: boolean;
  categories: CategoryResponse[];
  data?: PaginatedResponse<ProductResponse>;
  filters: {
    categoryId: string;
    publication: ProductPublicationFilter;
    status: ProductStatusFilter;
  };
  isError: boolean;
  isLoading: boolean;
  onCategoryIdChange: (categoryId: string) => void;
  onClearFilters: () => void;
  onAssignOwner: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPublicationChange: (publication: ProductPublicationFilter) => void;
  onRetry: () => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: ProductSortBy) => void;
  onStatusChange: (status: ProductStatusFilter) => void;
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
  onCategoryIdChange,
  onClearFilters,
  onAssignOwner,
  onDelete,
  onPageChange,
  onPageSizeChange,
  onPublicationChange,
  onRetry,
  onSearchChange,
  onSortChange,
  onStatusChange,
  pageSize,
  search,
  sortBy,
  sortOrder,
}: ProductsDirectoryCardProps) {
  const t = useTranslations("Products");
  const hasFilters =
    Boolean(search.trim()) ||
    filters.categoryId !== "ALL" ||
    filters.publication !== "ALL" ||
    filters.status !== "ALL";

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
          onCategoryIdChange={onCategoryIdChange}
          onSearchChange={onSearchChange}
          onPublicationChange={onPublicationChange}
          onStatusChange={onStatusChange}
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
          onClearFilters={onClearFilters}
          onAssignOwner={onAssignOwner}
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
  onCategoryIdChange,
  onSearchChange,
  onPublicationChange,
  onStatusChange,
  search,
}: Pick<
  ProductsDirectoryCardProps,
  | "categories"
  | "filters"
  | "onCategoryIdChange"
  | "onSearchChange"
  | "onPublicationChange"
  | "onStatusChange"
  | "search"
>) {
  const t = useTranslations("Products");

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
      <Select
        onValueChange={(value) =>
          onPublicationChange(value as ProductPublicationFilter)
        }
        value={filters.publication}
      >
        <SelectTrigger aria-label={t("publicationFilter")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_PUBLICATION_FILTERS.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`publicationStatuses.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={onCategoryIdChange} value={filters.categoryId}>
        <SelectTrigger aria-label={t("dynamicCategoryFilter")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t("allDynamicCategories")}</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) => onStatusChange(value as ProductStatusFilter)}
        value={filters.status}
      >
        <SelectTrigger aria-label={t("statusFilter")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_STATUS_FILTERS.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`statuses.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProductsDirectoryContent({
  canCreate,
  data,
  hasFilters,
  isError,
  isLoading,
  onClearFilters,
  onAssignOwner,
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
  | "onClearFilters"
  | "onAssignOwner"
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
