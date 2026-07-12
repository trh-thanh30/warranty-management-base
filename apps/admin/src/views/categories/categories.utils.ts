import type { CategoryResponse } from "@repo/shared";

export function formatCategoryCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(createdAt));
}

export function getCategoryParentLabel(
  category: CategoryResponse,
  categories: CategoryResponse[],
) {
  if (!category.parentId) return null;

  const parent = categories.find((item) => item.id === category.parentId);

  return parent?.name ?? shortCategoryId(category.parentId);
}

export function getCategoryDisplayCode(category: CategoryResponse) {
  return category.code || "-";
}

function shortCategoryId(categoryId: string) {
  return `${categoryId.slice(0, 8)}...`;
}
