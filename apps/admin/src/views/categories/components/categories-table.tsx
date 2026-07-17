"use client";

import { Ban, MoreHorizontal, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse, CategorySortBy } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
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
} from "@repo/ui";
import { SortableTableHead } from "@/src/components/common/sortable-table-head";
import { usePermissions } from "@/src/hooks/use-permissions";
import { Link } from "@/src/i18n/navigation";
import {
  formatCategoryCreatedAt,
  getCategoryDisplayCode,
  getCategoryParentLabel,
} from "../categories.utils";
import { stripHtml } from "@/src/utils/rich-text";
import { CategoryStatusBadge } from "./category-status-badge";
import { CategoryTypeBadge } from "./category-type-badge";

type CategoriesTableProps = {
  items: CategoryResponse[];
  onDeactivate: (category: CategoryResponse) => void;
  onSortChange: (sortBy: CategorySortBy) => void;
  sortBy?: CategorySortBy;
  sortOrder: "asc" | "desc";
};

export function CategoriesTable({
  items,
  onDeactivate,
  onSortChange,
  sortBy,
  sortOrder,
}: CategoriesTableProps) {
  const t = useTranslations("Categories");

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.map((category) => (
          <CategoryMobileCard
            category={category}
            items={items}
            key={category.id}
            onDeactivate={onDeactivate}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("code")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="slug"
                sortOrder={sortOrder}
              >
                {t("slug")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="name"
                sortOrder={sortOrder}
              >
                {t("name")}
              </SortableTableHead>
              <TableHead>{t("parent")}</TableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="order"
                sortOrder={sortOrder}
              >
                {t("order")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="isActive"
                sortOrder={sortOrder}
              >
                {t("status")}
              </SortableTableHead>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="createdAt"
                sortOrder={sortOrder}
              >
                {t("createdAt")}
              </SortableTableHead>
              <TableHead aria-label={t("actions")} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((category) => (
              <CategoryTableRow
                category={category}
                items={items}
                key={category.id}
                onDeactivate={onDeactivate}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function CategoryTableRow({
  category,
  items,
  onDeactivate,
}: {
  category: CategoryResponse;
  items: CategoryResponse[];
  onDeactivate: CategoriesTableProps["onDeactivate"];
}) {
  const parentLabel = getCategoryParentLabel(category, items);

  return (
    <TableRow>
      <TableCell>
        <CategoryTypeBadge type={category.type} />
      </TableCell>
      <TableCell className="font-mono text-xs">
        {getCategoryDisplayCode(category)}
      </TableCell>
      <TableCell className="font-mono text-xs">{category.slug}</TableCell>
      <TableCell>
        <div className="max-w-[14rem]">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {category.name}
          </p>
          {category.description ? (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              {stripHtml(category.description)}
            </p>
          ) : null}
        </div>
      </TableCell>
      <TableCell>{parentLabel ?? "-"}</TableCell>
      <TableCell>{category.order}</TableCell>
      <TableCell>
        <CategoryStatusBadge isActive={category.isActive} />
      </TableCell>
      <TableCell>{formatCategoryCreatedAt(category.createdAt)}</TableCell>
      <TableCell className="text-right">
        <CategoryActionsMenu category={category} onDeactivate={onDeactivate} />
      </TableCell>
    </TableRow>
  );
}

function CategoryMobileCard({
  category,
  items,
  onDeactivate,
}: {
  category: CategoryResponse;
  items: CategoryResponse[];
  onDeactivate: CategoriesTableProps["onDeactivate"];
}) {
  const t = useTranslations("Categories");
  const parentLabel = getCategoryParentLabel(category, items);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-950 dark:text-slate-50">
            {category.name}
          </p>
          <p className="mt-1 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
            {category.slug}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <CategoryTypeBadge type={category.type} />
            <CategoryStatusBadge isActive={category.isActive} />
          </div>
          <CategoryActionsMenu
            category={category}
            onDeactivate={onDeactivate}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CategoryMobileField
          label={t("code")}
          value={getCategoryDisplayCode(category)}
        />
        <CategoryMobileField label={t("parent")} value={parentLabel ?? "-"} />
        <CategoryMobileField
          label={t("order")}
          value={String(category.order)}
        />
        <CategoryMobileField
          label={t("createdAt")}
          value={formatCategoryCreatedAt(category.createdAt)}
        />
      </dl>
    </article>
  );
}

function CategoryMobileField({
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

function CategoryActionsMenu({
  category,
  onDeactivate,
}: {
  category: CategoryResponse;
  onDeactivate: CategoriesTableProps["onDeactivate"];
}) {
  const t = useTranslations("Categories");
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.CATEGORY_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CATEGORY_DELETE);

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("openActions", { name: category.name })}
          className="size-10 md:size-9"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canEdit ? (
          <DropdownMenuItem asChild>
            <Link href={`/categories/${category.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              {t("edit")}
            </Link>
          </DropdownMenuItem>
        ) : null}
        {canDelete && category.isActive ? (
          <>
            {canEdit ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 dark:text-red-400"
              onSelect={() => onDeactivate(category)}
            >
              <Ban className="mr-2 size-4" />
              {t("deactivate")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
