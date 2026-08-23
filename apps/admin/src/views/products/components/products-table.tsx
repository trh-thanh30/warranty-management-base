"use client";

import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import {
  formatDate,
  type ProductResponse,
  type ProductSortBy,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableScroll,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import {
  Eye,
  Layers3,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatProductOwner,
  getProductCategoryLabel,
  getProductDisplayName,
} from "../products.utils";
import { ProductStatusBadge } from "./product-status-badge";
import { WarrantyStatusBadge } from "./warranty-status-badge";

type ProductsTableProps = {
  items: ProductResponse[];
  onDelete: (product: ProductResponse) => void;
  onAssignOwner: (product: ProductResponse) => void;
  onSortChange: (sortBy: ProductSortBy) => void;
  sortBy?: ProductSortBy;
  sortOrder: "asc" | "desc";
};

export function ProductsTable({
  items,
  onAssignOwner,
  onDelete,
  onSortChange,
  sortBy,
  sortOrder,
}: ProductsTableProps) {
  const t = useTranslations("Products");

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.map((product) => (
          <ProductMobileCard
            key={product.id}
            onAssignOwner={onAssignOwner}
            onDelete={onDelete}
            product={product}
          />
        ))}
      </div>

      <TableScroll className="hidden max-h-144 overflow-y-scroll rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table className="min-w-6xl [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <TableHeader className="sticky top-0 z-10 bg-white dark:bg-slate-950">
            <TableRow>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="name"
                sortOrder={sortOrder}
              >
                {t("name")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="warrantyCode"
                sortOrder={sortOrder}
              >
                {t("warrantyCode")}
              </SortableTableHead>
              <TableHead className="whitespace-nowrap">
                {t("category")}
              </TableHead>
              <TableHead className="whitespace-nowrap">{t("owner")}</TableHead>
              <TableHead className="whitespace-nowrap">
                {t("warrantyStatus")}
              </TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="status"
                sortOrder={sortOrder}
              >
                {t("productStatus")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="createdAt"
                sortOrder={sortOrder}
              >
                {t("createdAt")}
              </SortableTableHead>
              <TableHead aria-label={t("actions")} className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((product) => (
              <ProductTableRow
                key={product.id}
                onAssignOwner={onAssignOwner}
                onDelete={onDelete}
                product={product}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </>
  );
}

function ProductTableRow({
  onAssignOwner,
  onDelete,
  product,
}: {
  onAssignOwner: ProductsTableProps["onAssignOwner"];
  onDelete: ProductsTableProps["onDelete"];
  product: ProductResponse;
}) {
  const locale = useLocale();

  return (
    <TableRow>
      <TableCell>
        <ProductName product={product} />
      </TableCell>
      <TableCell className="font-mono text-xs">
        {product.warrantyCode ?? "-"}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <span className="block max-w-64 truncate">
          {getProductCategoryLabel(product)}
        </span>
      </TableCell>
      <TableCell>
        <span className="block max-w-52 truncate">
          {formatProductOwner(product)}
        </span>
      </TableCell>
      <TableCell>
        <WarrantyStatusBadge status={product.warranty?.status} />
      </TableCell>
      <TableCell>
        <ProductStatusBadge status={product.status} />
      </TableCell>
      <TableCell>{formatDate(product.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <ProductActionsMenu
          onAssignOwner={onAssignOwner}
          onDelete={onDelete}
          product={product}
        />
      </TableCell>
    </TableRow>
  );
}

function ProductMobileCard({
  onAssignOwner,
  onDelete,
  product,
}: {
  onAssignOwner: ProductsTableProps["onAssignOwner"];
  onDelete: ProductsTableProps["onDelete"];
  product: ProductResponse;
}) {
  const t = useTranslations("Products");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <ProductName product={product} />
        <ProductActionsMenu
          onAssignOwner={onAssignOwner}
          onDelete={onDelete}
          product={product}
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <ProductMobileField
          label={t("warrantyCode")}
          value={product.warrantyCode ?? "-"}
        />
        <ProductMobileField
          label={t("category")}
          value={getProductCategoryLabel(product)}
        />
        <ProductMobileField
          label={t("owner")}
          value={formatProductOwner(product)}
        />
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("productStatus")}
          </dt>
          <dd className="mt-1">
            <ProductStatusBadge status={product.status} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

function ProductName({ product }: { product: ProductResponse }) {
  return (
    <div className="min-w-0 lg:max-w-64">
      <span className="block truncate font-medium text-slate-950 dark:text-slate-50">
        {getProductDisplayName(product)}
      </span>
      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
        {product.name} · {product.template.sku}
      </p>
    </div>
  );
}

function ProductMobileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}

function ProductActionsMenu({
  onAssignOwner,
  onDelete,
  product,
}: {
  onAssignOwner: ProductsTableProps["onAssignOwner"];
  onDelete: ProductsTableProps["onDelete"];
  product: ProductResponse;
}) {
  const t = useTranslations("Products");
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const canEdit = hasPermission(PERMISSIONS.PRODUCT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRODUCT_DELETE);
  const canAssignOwner = hasPermission(PERMISSIONS.PRODUCT_ASSIGN_OWNER);
  const canCreateProduct = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canViewTemplate = hasPermission(PERMISSIONS.PRODUCT_TEMPLATE_VIEW);
  const isDeleted = product.status === "DELETED";

  const hasTemplateAction =
    canViewTemplate || (canCreateProduct && product.template.isActive);
  if (
    isDeleted ||
    (!canView &&
      !canEdit &&
      !canDelete &&
      !canAssignOwner &&
      !hasTemplateAction)
  ) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { name: product.name })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.id}`}>
              <Eye className="mr-2 size-4" />
              {t("viewDetail")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canCreateProduct && product.template.isActive ? (
          <DropdownMenuItem asChild>
            <Link href={`/products/create?templateId=${product.template.id}`}>
              <PlusCircle className="mr-2 size-4" />
              {t("createAnotherFromTemplate")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canViewTemplate ? (
          <DropdownMenuItem asChild>
            <Link href={`/product-templates/${product.template.id}`}>
              <Layers3 className="mr-2 size-4" />
              {t("viewProductTemplate")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canAssignOwner ? (
          <DropdownMenuItem onSelect={() => onAssignOwner(product)}>
            <UserPlus className="mr-2 size-4" />
            {t("assignOwner")}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 dark:text-red-400"
              onSelect={() => onDelete(product)}
            >
              <Trash2 className="mr-2 size-4" />
              {t("delete")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
