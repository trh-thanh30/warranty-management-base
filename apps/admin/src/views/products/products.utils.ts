import {
  type CreateProductBody,
  type ProductResponse,
  type UpdateProductBody,
} from "@repo/shared";
import { toNullableValue, toOptionalValue } from "../../utils/form.ts";
import type { ProductFormValues } from "./products.types";

export function formatProductOwner(product: ProductResponse) {
  if (!product.owner) return "-";

  return (
    product.owner.fullName ||
    product.owner.customerCode ||
    product.owner.customerId
  );
}

export function getProductCategoryLabel(product: ProductResponse) {
  return product.categoryRef.name;
}

export function getProductDisplayName(product: ProductResponse) {
  return product.displayName?.trim() || product.name;
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
  const metadata = mergeProductInstallationPosition(
    null,
    values.installationPosition,
  );
  const productCode = toOptionalValue(values.productCode);
  const warrantyCode = toOptionalValue(values.warrantyCode)?.toUpperCase();

  return {
    categoryId: values.categoryId,
    displayName: toOptionalValue(values.displayName),
    metadata: metadata ?? undefined,
    ...(productCode ? { productCode } : {}),
    ...(warrantyCode ? { warrantyCode } : {}),
    serialNumber: toOptionalValue(values.serialNumber),
    status: values.status,
    templateId: values.templateId,
    warrantyDurationMonths: values.warrantyDurationMonths,
  };
}

export function toUpdateProductBody(
  values: ProductFormValues,
  existingMetadata: Record<string, unknown> | null,
): UpdateProductBody {
  return {
    categoryId: values.categoryId,
    displayName: toNullableValue(values.displayName),
    metadata: mergeProductInstallationPosition(
      existingMetadata,
      values.installationPosition,
    ),
    productCode: values.productCode.trim(),
    serialNumber: toNullableValue(values.serialNumber),
    status: values.status,
    templateId: values.templateId,
    warrantyCode: values.warrantyCode?.trim() ?? "",
    warrantyDurationMonths: values.warrantyDurationMonths,
  };
}

export function toProductActiveStatus(checked: boolean) {
  return checked ? ("ACTIVE" as const) : ("INACTIVE" as const);
}

export function resolveProductCategoryId({
  currentCategoryId,
  templateCategoryId,
  templateChanged,
}: {
  currentCategoryId: string;
  templateCategoryId: string;
  templateChanged: boolean;
}) {
  return templateChanged
    ? templateCategoryId
    : currentCategoryId || templateCategoryId;
}
