"use client";

import { ActivationCodeStatusBadge } from "@/src/components/activation-code-status-badge";
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
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import {
  Copy,
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  getProductCategoryLabel,
  getProductDisplayName,
} from "../products.utils";
import { ProductStatusBadge } from "./product-status-badge";
import { WarrantyStatusBadge } from "./warranty-status-badge";

type ProductsTableProps = {
  items: ProductResponse[];
  onDelete: (product: ProductResponse) => void;
  onRestore: (product: ProductResponse) => void;
  onAssignOwner: (product: ProductResponse) => void;
  onAssignCodes: (product: ProductResponse) => void;
  onSortChange: (sortBy: ProductSortBy) => void;
  sortBy?: ProductSortBy;
  sortOrder: "asc" | "desc";
};

export function ProductsTable({
  items,
  onAssignCodes,
  onAssignOwner,
  onDelete,
  onRestore,
  onSortChange,
  sortBy,
  sortOrder,
}: ProductsTableProps) {
  const t = useTranslations("Products");

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-3 lg:hidden">
        {items.map((product) => (
          <ProductMobileCard
            key={product.id}
            onAssignOwner={onAssignOwner}
            onAssignCodes={onAssignCodes}
            onDelete={onDelete}
            onRestore={onRestore}
            product={product}
          />
        ))}
      </div>

      <TableScroll className="hidden max-h-144 overflow-y-scroll rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table className="min-w-[88rem] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
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
              <TableHead className="whitespace-nowrap">
                {t("category")}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t("warrantyStatus")}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {t("activationCode")}
              </TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="status"
                sortOrder={sortOrder}
              >
                {t("productStatus")}
              </SortableTableHead>
              <TableHead className="whitespace-nowrap">
                {t("warrantyDuration")}
              </TableHead>
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
                onAssignCodes={onAssignCodes}
                onDelete={onDelete}
                onRestore={onRestore}
                product={product}
              />
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </TooltipProvider>
  );
}

function ProductTableRow({
  onAssignCodes,
  onAssignOwner,
  onDelete,
  onRestore,
  product,
}: {
  onAssignCodes: ProductsTableProps["onAssignCodes"];
  onAssignOwner: ProductsTableProps["onAssignOwner"];
  onDelete: ProductsTableProps["onDelete"];
  onRestore: ProductsTableProps["onRestore"];
  product: ProductResponse;
}) {
  const locale = useLocale();
  const t = useTranslations("Products");

  return (
    <TableRow>
      <TableCell>
        <ProductName product={product} />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="block max-w-64 truncate outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              tabIndex={0}
            >
              {getProductCategoryLabel(product)}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-80 wrap-break-word" side="top">
            {getProductCategoryLabel(product)}
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell>
        <WarrantyStatusBadge status={product.warranty?.status} />
      </TableCell>
      <TableCell>
        <ProductActivationCodeCell product={product} />
      </TableCell>
      <TableCell>
        <ProductStatusBadge status={product.status} />
      </TableCell>
      <TableCell>
        {product.warrantyDurationMonths
          ? t("durationValue", {
              count: product.warrantyDurationMonths,
            })
          : "-"}
      </TableCell>
      <TableCell>{formatDate(product.createdAt, { locale })}</TableCell>

      <TableCell className="text-right">
        <ProductActionsMenu
          onAssignCodes={onAssignCodes}
          onAssignOwner={onAssignOwner}
          onDelete={onDelete}
          onRestore={onRestore}
          product={product}
        />
      </TableCell>
    </TableRow>
  );
}

function ProductMobileCard({
  onAssignCodes,
  onAssignOwner,
  onDelete,
  onRestore,
  product,
}: {
  onAssignCodes: ProductsTableProps["onAssignCodes"];
  onAssignOwner: ProductsTableProps["onAssignOwner"];
  onDelete: ProductsTableProps["onDelete"];
  onRestore: ProductsTableProps["onRestore"];
  product: ProductResponse;
}) {
  const t = useTranslations("Products");

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <ProductName product={product} />
        <ProductActionsMenu
          onAssignCodes={onAssignCodes}
          onAssignOwner={onAssignOwner}
          onDelete={onDelete}
          onRestore={onRestore}
          product={product}
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("warrantyStatus")}
          </dt>
          <dd className="mt-1">
            <WarrantyStatusBadge status={product.warranty?.status} />
          </dd>
        </div>
        <ProductMobileField
          label={t("category")}
          value={getProductCategoryLabel(product)}
        />
        <div className="col-span-2 min-w-0">
          <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {t("activationCode")}
          </dt>
          <dd className="mt-1">
            <ProductActivationCodeCell product={product} />
          </dd>
        </div>
        <ProductMobileField
          label={t("warrantyDuration")}
          value={
            product.warrantyDurationMonths
              ? t("durationValue", {
                  count: product.warrantyDurationMonths,
                })
              : "-"
          }
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

function ProductActivationCodeCell({ product }: { product: ProductResponse }) {
  const t = useTranslations("Products");
  const activationCode = product.assignedActivationCode;

  if (!activationCode) {
    return <Badge variant="secondary">{t("activationCodeUnassigned")}</Badge>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-950 dark:text-slate-50">
          {activationCode.code}
        </p>
        <ActivationCodeStatusBadge status={activationCode.status} />
      </div>
    </div>
  );
}

function ProductName({ product }: { product: ProductResponse }) {
  const displayName = getProductDisplayName(product);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          aria-label={displayName}
          className="min-w-0 cursor-default outline-none focus-visible:ring-2 focus-visible:ring-slate-400 lg:max-w-64"
          tabIndex={0}
        >
          <span className="block truncate font-medium text-slate-950 dark:text-slate-50">
            {displayName}
          </span>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
            {product.name} · {product.productCode}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 wrap-break-word" side="top">
        {displayName}
      </TooltipContent>
    </Tooltip>
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
  onAssignCodes,
  onAssignOwner,
  onDelete,
  onRestore,
  product,
}: {
  onAssignCodes: ProductsTableProps["onAssignCodes"];
  onAssignOwner: ProductsTableProps["onAssignOwner"];
  onDelete: ProductsTableProps["onDelete"];
  onRestore: ProductsTableProps["onRestore"];
  product: ProductResponse;
}) {
  const t = useTranslations("Products");
  const { hasPermission } = usePermissions();
  const canView = hasPermission(PERMISSIONS.PRODUCT_VIEW);
  const canEdit = hasPermission(PERMISSIONS.PRODUCT_UPDATE);
  const canCreate = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canDelete = hasPermission(PERMISSIONS.PRODUCT_DELETE);
  const canAssignOwner = hasPermission(PERMISSIONS.PRODUCT_ASSIGN_OWNER);
  const canAssignCodes = hasPermission(
    PERMISSIONS.ACTIVATION_CODE_ASSIGN_PRODUCT,
  );
  const isDeleted = product.status === "DELETED";

  if (
    (isDeleted && !canDelete) ||
    (!isDeleted &&
      !canView &&
      !canEdit &&
      !canDelete &&
      !canAssignOwner &&
      !canAssignCodes &&
      !canCreate)
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
        {isDeleted ? (
          <DropdownMenuItem onSelect={() => onRestore(product)}>
            <RotateCcw className="mr-2 size-4" />
            {t("restore")}
          </DropdownMenuItem>
        ) : null}
        {!isDeleted ? (
          <>
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
            {canCreate ? (
              <DropdownMenuItem asChild>
                <Link href={`/products/create?cloneFrom=${product.id}`}>
                  <Copy className="mr-2 size-4" />
                  {t("clone")}
                </Link>
              </DropdownMenuItem>
            ) : null}
            {canAssignOwner && product.warranty ? (
              <DropdownMenuItem onSelect={() => onAssignOwner(product)}>
                <UserPlus className="mr-2 size-4" />
                {t("assignOwner")}
              </DropdownMenuItem>
            ) : null}
            {canAssignCodes &&
            product.categoryRef?.activationCodeEnabled === true ? (
              <DropdownMenuItem
                disabled={
                  product.status !== "ACTIVE" ||
                  !product.warrantyDurationMonths ||
                  Boolean(
                    product.assignedActivationCode &&
                    !product.assignedActivationCode.canReplace,
                  )
                }
                onSelect={() => onAssignCodes(product)}
              >
                <KeyRound className="mr-2 size-4" />
                {t(
                  product.assignedActivationCode &&
                    !product.assignedActivationCode.canReplace
                    ? "activationCodeChangeLocked"
                    : product.assignedActivationCode
                      ? "replaceActivationCode"
                      : "assignActivationCodes",
                )}
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
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
