"use client";

import { Ban, ImageIcon, MoreHorizontal, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CategoryResponse } from "@repo/shared";
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
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  formatCategoryCreatedAt,
  getCategoryDisplayCode,
  getCategoryParentLabel,
} from "../categories.utils";
import { CategoryStatusBadge } from "./category-status-badge";
import { CategoryTypeBadge } from "./category-type-badge";
import { MetadataSummary } from "./metadata-summary";

type CategoriesTableProps = {
  items: CategoryResponse[];
  onDeactivate: (category: CategoryResponse) => void;
  onEdit: (category: CategoryResponse) => void;
};

export function CategoriesTable({
  items,
  onDeactivate,
  onEdit,
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
            onEdit={onEdit}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 dark:border-slate-800 lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("code")}</TableHead>
              <TableHead>{t("slug")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("parent")}</TableHead>
              <TableHead>{t("icon")}</TableHead>
              <TableHead>{t("imageUrl")}</TableHead>
              <TableHead>{t("order")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("metadata")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
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
                onEdit={onEdit}
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
  onEdit,
}: {
  category: CategoryResponse;
  items: CategoryResponse[];
  onDeactivate: CategoriesTableProps["onDeactivate"];
  onEdit: CategoriesTableProps["onEdit"];
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
              {category.description}
            </p>
          ) : null}
        </div>
      </TableCell>
      <TableCell>{parentLabel ?? "-"}</TableCell>
      <TableCell>{category.icon ?? "-"}</TableCell>
      <TableCell>
        <ImageUrlCell imageUrl={category.imageUrl} />
      </TableCell>
      <TableCell>{category.order}</TableCell>
      <TableCell>
        <CategoryStatusBadge isActive={category.isActive} />
      </TableCell>
      <TableCell>
        <MetadataSummary metadata={category.metadata} />
      </TableCell>
      <TableCell>{formatCategoryCreatedAt(category.createdAt)}</TableCell>
      <TableCell className="text-right">
        <CategoryActionsMenu
          category={category}
          onDeactivate={onDeactivate}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  );
}

function CategoryMobileCard({
  category,
  items,
  onDeactivate,
  onEdit,
}: {
  category: CategoryResponse;
  items: CategoryResponse[];
  onDeactivate: CategoriesTableProps["onDeactivate"];
  onEdit: CategoriesTableProps["onEdit"];
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
            onEdit={onEdit}
          />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <CategoryMobileField
          label={t("code")}
          value={getCategoryDisplayCode(category)}
        />
        <CategoryMobileField label={t("parent")} value={parentLabel ?? "-"} />
        <CategoryMobileField label={t("icon")} value={category.icon ?? "-"} />
        <CategoryMobileField
          label={t("order")}
          value={String(category.order)}
        />
        <CategoryMobileField
          label={t("imageUrl")}
          value={category.imageUrl ?? "-"}
        />
        <CategoryMobileField
          label={t("createdAt")}
          value={formatCategoryCreatedAt(category.createdAt)}
        />
      </dl>

      <div className="mt-4">
        <p className="mb-1 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
          {t("metadata")}
        </p>
        <MetadataSummary metadata={category.metadata} />
      </div>
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

function ImageUrlCell({ imageUrl }: { imageUrl: string | null }) {
  if (!imageUrl) return <span>-</span>;

  return (
    <span className="inline-flex max-w-[12rem] items-center gap-2 truncate text-xs text-slate-500 dark:text-slate-400">
      <ImageIcon className="size-4 shrink-0" />
      <span className="truncate">{imageUrl}</span>
    </span>
  );
}

function CategoryActionsMenu({
  category,
  onDeactivate,
  onEdit,
}: {
  category: CategoryResponse;
  onDeactivate: CategoriesTableProps["onDeactivate"];
  onEdit: CategoriesTableProps["onEdit"];
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
          <DropdownMenuItem onSelect={() => onEdit(category)}>
            <Pencil className="mr-2 size-4" />
            {t("edit")}
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
