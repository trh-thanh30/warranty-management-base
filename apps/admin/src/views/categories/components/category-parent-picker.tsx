"use client";

import { useTranslations } from "next-intl";
import type { CategoryResponse, CategoryType } from "@repo/shared";
import { Badge } from "@repo/ui";
import { SelectControl } from "@/src/components/common/select-control";
import { useCategories } from "../hooks/use-categories";

type CategoryParentPickerProps = {
  currentCategoryId?: string;
  disabled?: boolean;
  onChange: (parentId: string) => void;
  type: CategoryType;
  value: string;
};

const NO_PARENT_VALUE = "";

export function CategoryParentPicker({
  currentCategoryId,
  disabled,
  onChange,
  type,
  value,
}: CategoryParentPickerProps) {
  const t = useTranslations("Categories");
  const categoriesQuery = useCategories(
    {
      limit: 100,
      page: 1,
      sortBy: "order",
      sortOrder: "asc",
      type,
    },
    {
      enabled: !disabled,
    },
  );
  const options =
    categoriesQuery.data?.items.filter(
      (category) => category.id !== currentCategoryId,
    ) ?? [];

  return (
    <div className="space-y-2">
      <SelectControl
        disabled={disabled || categoriesQuery.isLoading}
        onValueChange={onChange}
        options={[
          { label: t("noParent"), value: NO_PARENT_VALUE },
          ...options.map((category) => ({
            label: getParentOptionLabel(category, options),
            value: category.id,
          })),
        ]}
        value={value}
      />
      {categoriesQuery.isError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          {t("parentLoadError")}
        </p>
      ) : null}
      {value ? (
        <SelectedParentStatus categoryId={value} options={options} />
      ) : null}
    </div>
  );
}

function SelectedParentStatus({
  categoryId,
  options,
}: {
  categoryId: string;
  options: CategoryResponse[];
}) {
  const t = useTranslations("Categories");
  const selected = options.find((category) => category.id === categoryId);

  if (!selected || selected.isActive) return null;

  return <Badge variant="warning">{t("parentInactive")}</Badge>;
}

function getParentOptionLabel(
  category: CategoryResponse,
  categories: CategoryResponse[],
) {
  const path = buildParentPath(category, categories);
  return path.length > 0 ? path.join(" / ") : category.name;
}

function buildParentPath(
  category: CategoryResponse,
  categories: CategoryResponse[],
) {
  const path = [category.name];
  let cursor = category;
  const visited = new Set<string>([category.id]);

  while (cursor.parentId) {
    const parent = categories.find((item) => item.id === cursor.parentId);
    if (!parent || visited.has(parent.id)) break;
    path.unshift(parent.name);
    visited.add(parent.id);
    cursor = parent;
  }

  return path;
}
