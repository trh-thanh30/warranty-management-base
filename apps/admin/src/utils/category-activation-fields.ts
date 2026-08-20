import type {
  CategoryActivationFieldConfig,
  CategoryResponse,
} from "@repo/shared";

export function getCategoryActivationFields(
  category: CategoryResponse | null,
): CategoryActivationFieldConfig[] {
  if (!category || category.activationFormEnabled !== true) return [];

  return [...(category.activationFields ?? [])].sort(
    (left, right) => (left.order ?? 0) - (right.order ?? 0),
  );
}

export function normalizeActivationFieldKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function compactActivationInputValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, value.trim()])
      .filter(([key, value]) => Boolean(key) && Boolean(value)),
  );
}
