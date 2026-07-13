import type { ProductResponse } from "@repo/shared";

export function formatProductCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(createdAt));
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

export function parseMetadata(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("metadataObjectRequired");
  }

  return parsed as Record<string, unknown>;
}

export function stringifyMetadata(metadata: Record<string, unknown> | null) {
  return metadata ? JSON.stringify(metadata, null, 2) : "";
}
