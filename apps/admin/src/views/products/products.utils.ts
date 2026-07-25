import {
  formatDate,
  type CreateProductBody,
  type ProductResponse,
} from "@repo/shared";
import { toOptionalValue } from "../../utils/form.ts";
import { toOptionalRichText } from "../../utils/rich-text.ts";
import type {
  ProductFormValues,
  ProductSpecificationRow,
} from "./products.types";

export function formatProductCreatedAt(createdAt: string) {
  return formatDate(createdAt);
}

export function formatProductOwner(product: ProductResponse) {
  if (!product.owner) return "-";

  return (
    product.owner.fullName ||
    product.owner.customerCode ||
    product.owner.customerId
  );
}

export function getProductCategoryLabel(product: ProductResponse) {
  return product.categoryRef?.name ?? product.category;
}

export function getProductDisplayName(product: ProductResponse) {
  const secondary = [product.brand, product.model].filter(Boolean).join(" ");
  return secondary ? `${product.name} · ${secondary}` : product.name;
}

export function getProductSpecifications(
  metadata: Record<string, unknown> | null | undefined,
): ProductSpecificationRow[] {
  const specifications = metadata?.specifications;
  if (Array.isArray(specifications)) {
    return specifications.flatMap((specification) => {
      if (!isRecord(specification)) return [];

      const { key, value } = specification;
      if (typeof key !== "string" || typeof value !== "string") return [];

      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      if (!trimmedKey || !trimmedValue) return [];

      return [{ key: trimmedKey, value: trimmedValue }];
    });
  }

  if (!isRecord(specifications)) return [];

  return Object.entries(specifications).flatMap(([key, value]) => {
    if (typeof value !== "string") return [];

    const trimmedKey = key.trim();
    const trimmedValue = value.trim();
    if (!trimmedKey || !trimmedValue) return [];

    return [{ key: trimmedKey, value: trimmedValue }];
  });
}

export function mergeProductSpecifications(
  metadata: Record<string, unknown> | null | undefined,
  rows: ProductSpecificationRow[],
): Record<string, unknown> | null {
  const nextMetadata = { ...(metadata ?? {}) };
  delete nextMetadata.specifications;

  const specifications = rows
    .map((row) => ({ key: row.key.trim(), value: row.value.trim() }))
    .filter(({ key, value }) => key && value);

  if (specifications.length > 0) {
    nextMetadata.specifications = specifications;
  }

  return Object.keys(nextMetadata).length > 0 ? nextMetadata : null;
}

export function getProductInstallationPosition(
  metadata: Record<string, unknown> | null | undefined,
) {
  return typeof metadata?.installationPosition === "string"
    ? metadata.installationPosition
    : "";
}

export function mergeProductInstallationPosition(
  metadata: Record<string, unknown> | null | undefined,
  installationPosition: string,
): Record<string, unknown> | null {
  const nextMetadata = { ...(metadata ?? {}) };
  const trimmedPosition = installationPosition.trim();

  if (trimmedPosition) {
    nextMetadata.installationPosition = trimmedPosition;
  } else {
    delete nextMetadata.installationPosition;
  }

  return Object.keys(nextMetadata).length > 0 ? nextMetadata : null;
}

export function toCreateProductBody(
  values: ProductFormValues,
): CreateProductBody {
  const sharedMetadata = values.templateId
    ? null
    : mergeProductSpecifications(null, values.specifications);
  const metadata = mergeProductInstallationPosition(
    sharedMetadata,
    values.installationPosition,
  );

  return {
    brand: toOptionalValue(values.brand),
    category: values.category,
    categoryId: values.categoryId,
    coverAssetId: toOptionalValue(values.coverAssetId),
    description: toOptionalRichText(values.description),
    isPublished: values.isPublished,
    manufactureYear: values.manufactureYear,
    metadata: metadata ?? undefined,
    model: toOptionalValue(values.model),
    name: values.name.trim(),
    serialNumber: toOptionalValue(values.serialNumber),
    slug: toOptionalValue(values.slug),
    status: values.status,
    templateId: toOptionalValue(values.templateId),
    createTemplate: values.createTemplate,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function toProductActiveStatus(checked: boolean) {
  return checked ? ("ACTIVE" as const) : ("INACTIVE" as const);
}

export function toProductSlugPreview(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .replaceAll("đ", "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveSpecificationMove(
  items: Array<{ id: string }>,
  activeId: string,
  overId: string | undefined,
) {
  if (!overId || activeId === overId) return null;

  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  return from >= 0 && to >= 0 ? { from, to } : null;
}
