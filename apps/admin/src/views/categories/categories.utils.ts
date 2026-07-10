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

export function getCategoryMetadataSummary(
  metadata: Record<string, unknown> | null,
) {
  if (!metadata) return null;

  const entries = Object.entries(metadata);
  if (entries.length === 0) return null;

  return entries
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${formatMetadataValue(value)}`)
    .join(", ");
}

function formatMetadataValue(value: unknown) {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function shortCategoryId(categoryId: string) {
  return `${categoryId.slice(0, 8)}...`;
}
