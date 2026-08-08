"use client";

import { FormPageShell } from "@/src/components/common/form-page-shell";
import { PaginationControls } from "@repo/ui/pagination-controls";
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { StatePanel } from "@/src/components/common/state-panel";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import {
  formatDate,
  type ProductResponse,
  type ProductSortBy,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Badge,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { ExternalLink, PackageSearch, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useProducts } from "../products/hooks/use-products";
import { useCustomer } from "./hooks/use-customers";

type CustomerProductsViewProps = {
  customerId: string;
};

export function CustomerProductsView({
  customerId,
}: CustomerProductsViewProps) {
  const t = useTranslations("Customers");
  const tProducts = useTranslations("Products");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<ProductSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const customerQuery = useCustomer(customerId);
  const productsQuery = useProducts({
    limit: pageSize,
    ownerCustomerId: customerId,
    page,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  });
  const customerName = customerQuery.data?.fullName ?? t("unknownCustomer");
  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;
  const isEmpty = !productsQuery.isLoading && products.length === 0;
  const summary = useMemo(() => {
    if (!meta) return "";
    return t("productsPagination", {
      page: meta.page,
      total: meta.total,
      totalPages: meta.totalPages,
    });
  }, [meta, t]);

  function handleSortChange(nextSortBy: ProductSortBy) {
    if (sortBy === nextSortBy) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortOrder("asc");
    }
    setPage(1);
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.CUSTOMER_VIEW]}>
      <FormPageShell
        maxWidthClassName="max-w-6xl"
        backHref="/customers"
        backLabel={t("backToDirectory")}
        description={t("customerProductsDescription", { name: customerName })}
        eyebrow={t("eyebrow")}
        title={t("customerProductsTitle")}
      >
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">
                {t("customerProductsDirectoryTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("customerProductsDirectoryDescription")}
              </p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={t("productSearchPlaceholder")}
                value={search}
              />
            </div>
          </div>

          <div className="mt-5 max-h-[60vh] overflow-x-auto overflow-y-scroll rounded-md border border-slate-200 dark:border-slate-800">
            <Table className="min-w-max whitespace-nowrap">
              <TableHeader className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <SortableTableHead
                    activeSortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortBy="name"
                    sortOrder={sortOrder}
                  >
                    {tProducts("name")}
                  </SortableTableHead>
                  <SortableTableHead
                    activeSortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortBy="productCode"
                    sortOrder={sortOrder}
                  >
                    {tProducts("productCode")}
                  </SortableTableHead>
                  <SortableTableHead
                    activeSortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortBy="warrantyCode"
                    sortOrder={sortOrder}
                  >
                    {tProducts("warrantyCode")}
                  </SortableTableHead>
                  <TableHead>{tProducts("serialNumber")}</TableHead>
                  <TableHead>{tProducts("category")}</TableHead>
                  <TableHead>{tProducts("warrantyStatus")}</TableHead>
                  <SortableTableHead
                    activeSortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortBy="status"
                    sortOrder={sortOrder}
                  >
                    {tProducts("productStatus")}
                  </SortableTableHead>
                  <SortableTableHead
                    activeSortBy={sortBy}
                    onSortChange={handleSortChange}
                    sortBy="createdAt"
                    sortOrder={sortOrder}
                  >
                    {tProducts("createdAt")}
                  </SortableTableHead>
                  <TableHead aria-label={t("actions")} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <CustomerProductRow key={product.id} product={product} />
                ))}
              </TableBody>
            </Table>
            {productsQuery.isLoading ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                {t("loadingProducts")}
              </div>
            ) : null}
            {productsQuery.isError ? (
              <StatePanel
                action={
                  <Button
                    onClick={() => {
                      void productsQuery.refetch();
                    }}
                    variant="secondary"
                  >
                    {t("tryAgain")}
                  </Button>
                }
                description={t("loadProductsErrorDescription")}
                icon={PackageSearch}
                title={t("loadProductsErrorTitle")}
              />
            ) : null}
            {isEmpty ? (
              <StatePanel
                description={
                  search
                    ? t("emptyProductsFilteredDescription")
                    : t("emptyProductsDescription")
                }
                icon={PackageSearch}
                title={
                  search
                    ? t("emptyProductsFilteredTitle")
                    : t("emptyProductsTitle")
                }
              />
            ) : null}
          </div>

          {meta ? (
            <PaginationControls
              nextLabel={t("next")}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
              page={meta.page}
              pageSize={pageSize}
              pageSizeLabel={t("pageSize")}
              previousLabel={t("previous")}
              summary={summary}
              totalPages={meta.totalPages}
            />
          ) : null}
        </section>
      </FormPageShell>
    </PermissionGuard>
  );
}

function CustomerProductRow({ product }: { product: ProductResponse }) {
  const locale = useLocale();
  const t = useTranslations("Customers");
  const tProducts = useTranslations("Products");

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <div className="max-w-52">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {product.name}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {[product.brand, product.model].filter(Boolean).join(" ") || "-"}
          </p>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono text-xs">
        {product.productCode}
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono text-xs">
        {product.warrantyCode ?? "-"}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {product.serialNumber ?? "-"}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {product.categoryRef.name}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {product.warranty?.status ? (
          <Badge
            variant={
              product.warranty.status === "ACTIVE" ? "success" : "secondary"
            }
          >
            {tProducts(`warrantyStatuses.${product.warranty.status}`)}
          </Badge>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge
          variant={
            product.status === "ACTIVE"
              ? "success"
              : product.status === "DELETED"
                ? "destructive"
                : "secondary"
          }
        >
          {tProducts(`statuses.${product.status}`)}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatDate(product.createdAt, { locale })}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/products/${product.id}`}>
            <ExternalLink className="mr-2 size-4" />
            {t("viewProduct")}
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
