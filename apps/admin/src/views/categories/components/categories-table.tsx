"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  ChevronRight,
  CornerDownRight,
  MoreHorizontal,
  Pencil,
  SlidersHorizontal,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatDate,
  type CategorySortBy,
  type CategoryTreeNode,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Button,
  cn,
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
import { stripHtml } from "@/src/utils/rich-text";
import {
  getCategoryDisplayCode,
  groupVisibleCategoryBranches,
} from "../categories.utils";
import { CategoryStatusBadge } from "./category-status-badge";
import { CategoryTypeBadge } from "./category-type-badge";

type CategoriesTableProps = {
  items: CategoryTreeNode[];
  onDeactivate: (category: CategoryTreeNode) => void;
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
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const visibleBranches = useMemo(
    () => groupVisibleCategoryBranches(items, collapsedIds),
    [collapsedIds, items],
  );

  function toggleCategory(categoryId: string) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {visibleBranches.map((branch) => (
          <section
            aria-label={branch[0]?.category.name}
            className="space-y-3"
            key={branch[0]?.category.id}
          >
            {branch.map(({ category, depth, parentName }) => (
              <CategoryMobileCard
                category={category}
                collapsed={collapsedIds.has(category.id)}
                depth={depth}
                key={category.id}
                onDeactivate={onDeactivate}
                onToggle={toggleCategory}
                parentName={parentName}
              />
            ))}
          </section>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                activeSortBy={sortBy}
                onSortChange={onSortChange}
                sortBy="name"
                sortOrder={sortOrder}
              >
                {t("name")}
              </SortableTableHead>
              <TableHead>{t("code")}</TableHead>
              <TableHead>{t("type")}</TableHead>
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
          {visibleBranches.map((branch) => (
            <TableBody
              className="border-b border-slate-300 last:border-b-0 dark:border-slate-700"
              key={branch[0]?.category.id}
            >
              {branch.map(({ category, depth, parentName }) => (
                <CategoryTableRow
                  category={category}
                  collapsed={collapsedIds.has(category.id)}
                  depth={depth}
                  key={category.id}
                  onDeactivate={onDeactivate}
                  onToggle={toggleCategory}
                  parentName={parentName}
                />
              ))}
            </TableBody>
          ))}
        </Table>
      </div>
    </>
  );
}

function CategoryTableRow({
  category,
  collapsed,
  depth,
  onDeactivate,
  onToggle,
  parentName,
}: {
  category: CategoryTreeNode;
  collapsed: boolean;
  depth: number;
  onDeactivate: CategoriesTableProps["onDeactivate"];
  onToggle: (categoryId: string) => void;
  parentName: string | null;
}) {
  const locale = useLocale();

  return (
    <TableRow className={cn(category.isContextOnly && "bg-slate-50/70")}>
      <TableCell>
        <CategoryTreeName
          category={category}
          collapsed={collapsed}
          depth={depth}
          onToggle={onToggle}
          parentName={parentName}
        />
      </TableCell>
      <TableCell className="font-mono text-xs">
        {getCategoryDisplayCode(category)}
      </TableCell>
      <TableCell>
        <CategoryTypeBadge type={category.type} />
      </TableCell>
      <TableCell>{category.order}</TableCell>
      <TableCell>
        <CategoryStatusBadge isActive={category.isActive} />
      </TableCell>
      <TableCell>{formatDate(category.createdAt, { locale })}</TableCell>
      <TableCell className="text-right">
        <CategoryActionsMenu category={category} onDeactivate={onDeactivate} />
      </TableCell>
    </TableRow>
  );
}

function CategoryTreeName({
  category,
  collapsed,
  depth,
  onToggle,
  parentName,
}: {
  category: CategoryTreeNode;
  collapsed: boolean;
  depth: number;
  onToggle: (categoryId: string) => void;
  parentName: string | null;
}) {
  const t = useTranslations("Categories");
  const hasChildren = category.children.length > 0;

  return (
    <div
      className="flex min-w-52 items-start gap-1"
      style={{ paddingInlineStart: `${Math.min(depth, 5) * 20}px` }}
    >
      {hasChildren ? (
        <Button
          aria-expanded={!collapsed}
          aria-label={t(collapsed ? "expandCategory" : "collapseCategory", {
            name: category.name,
          })}
          className="mt-0.5 size-8 shrink-0"
          onClick={() => onToggle(category.id)}
          size="icon"
          variant="ghost"
        >
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform duration-150 motion-reduce:transition-none",
              !collapsed && "rotate-90",
            )}
          />
        </Button>
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center">
          {depth > 0 ? (
            <CornerDownRight
              aria-hidden="true"
              className="size-4 text-slate-300 dark:text-slate-700"
            />
          ) : null}
        </span>
      )}

      <div className="min-w-0 max-w-[20rem] pt-1">
        <p
          className={cn(
            "truncate font-medium text-slate-950 dark:text-slate-50",
            category.isContextOnly && "text-slate-500 dark:text-slate-400",
          )}
        >
          {category.name}
        </p>
        {parentName ? (
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {t("belongsTo", { name: parentName })}
          </p>
        ) : category.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
            {stripHtml(category.description)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CategoryMobileCard({
  category,
  collapsed,
  depth,
  onDeactivate,
  onToggle,
  parentName,
}: {
  category: CategoryTreeNode;
  collapsed: boolean;
  depth: number;
  onDeactivate: CategoriesTableProps["onDeactivate"];
  onToggle: (categoryId: string) => void;
  parentName: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations("Categories");
  const hasChildren = category.children.length > 0;

  return (
    <article
      className={cn(
        "rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950",
        category.isContextOnly && "bg-slate-50/70 dark:bg-slate-900/50",
      )}
      style={{ marginInlineStart: `${Math.min(depth, 3) * 12}px` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-1">
          {hasChildren ? (
            <Button
              aria-expanded={!collapsed}
              aria-label={t(collapsed ? "expandCategory" : "collapseCategory", {
                name: category.name,
              })}
              className="-ml-2 size-10 shrink-0"
              onClick={() => onToggle(category.id)}
              size="icon"
              variant="ghost"
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  "size-4 transition-transform duration-150 motion-reduce:transition-none",
                  !collapsed && "rotate-90",
                )}
              />
            </Button>
          ) : null}
          <div className="min-w-0 pt-2">
            <p className="truncate font-medium text-slate-950 dark:text-slate-50">
              {category.name}
            </p>
            {parentName ? (
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {t("belongsTo", { name: parentName })}
              </p>
            ) : null}
          </div>
        </div>
        <CategoryActionsMenu category={category} onDeactivate={onDeactivate} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <CategoryTypeBadge type={category.type} />
        <CategoryStatusBadge isActive={category.isActive} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CategoryMobileField
          label={t("code")}
          value={getCategoryDisplayCode(category)}
        />
        <CategoryMobileField
          label={t("order")}
          value={String(category.order)}
        />
        <CategoryMobileField
          label={t("createdAt")}
          value={formatDate(category.createdAt, { locale })}
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
  category: CategoryTreeNode;
  onDeactivate: CategoriesTableProps["onDeactivate"];
}) {
  const t = useTranslations("Categories");
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(PERMISSIONS.CATEGORY_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CATEGORY_DELETE);

  if (!canEdit && !canDelete) return null;

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
          <>
            <DropdownMenuItem asChild>
              <Link href={`/categories/${category.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                {t("edit")}
              </Link>
            </DropdownMenuItem>
            {category.type === "PRODUCT" ? (
              <DropdownMenuItem asChild>
                <Link href={`/categories/${category.id}/activation-fields`}>
                  <SlidersHorizontal className="mr-2 size-4" />
                  {t("configureActivationFields")}
                </Link>
              </DropdownMenuItem>
            ) : null}
          </>
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
