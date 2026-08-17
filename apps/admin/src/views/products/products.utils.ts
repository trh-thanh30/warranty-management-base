import {
  HttpClientError,
  type CreateProductBody,
  type ProductResponse,
  type ProductTemplateSummary,
  type UpdateProductBody,
} from "@repo/shared";
import { toNullableValue, toOptionalValue } from "../../utils/form.ts";
import type { ProductFormValues } from "./products.types";

export function getProductTemplateSearchKeywords(
  template: ProductTemplateSummary,
) {
  return [
    template.name,
    template.sku,
    template.brand,
    template.model,
    template.categoryRef?.name,
    template.categoryRef?.code,
    template.categoryRef?.slug,
  ].filter((keyword): keyword is string => Boolean(keyword?.trim()));
}

export function mergeProductTemplateOptions(
  items: ProductTemplateSummary[],
  currentTemplate?: ProductTemplateSummary | null,
) {
  if (
    !currentTemplate ||
    items.some((template) => template.id === currentTemplate.id)
  ) {
    return items;
  }

  return [currentTemplate, ...items];
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

export function getProductSaveErrorMatch(error: unknown) {
  if (!(error instanceof HttpClientError)) return null;

  const detailCode = getApiErrorDetailCode(error);
  const detailMessages = {
    WARRANTY_DURATION_NOT_DRAFT: [
      "warrantyDurationMonths",
      "warrantyDurationNotDraft",
    ],
    WARRANTY_DURATION_REQUIRED: [
      "warrantyDurationMonths",
      "durationMonthsRange",
    ],
  } as const;
  const messages = {
    "Product code already exists": ["productCode", "duplicateProductCode"],
    "Product code is required": ["productCode", "productCodeRequired"],
    "Product category not found": ["categoryId", "categoryNotFound"],
    "Product template not found": ["templateId", "templateNotFound"],
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
    "Warranty code already exists": ["warrantyCode", "duplicateWarrantyCode"],
    "Warranty code is invalid": ["warrantyCode", "warrantyCodeInvalid"],
    "Warranty code can only be changed while warranty is draft": [
      "warrantyCode",
      "warrantyCodeNotDraft",
    ],
    "Warranty code cannot be changed while an activation request is open": [
      "warrantyCode",
      "warrantyCodeOpenRequest",
    ],
    "Warranty duration is required": [
      "warrantyDurationMonths",
      "durationMonthsRange",
    ],
    "Warranty duration can only be changed while warranty is draft": [
      "warrantyDurationMonths",
      "warrantyDurationNotDraft",
    ],
  } as const;

  return (
    (detailCode
      ? detailMessages[detailCode as keyof typeof detailMessages]
      : undefined) ?? messages[error.message as keyof typeof messages]
  );
}

function getApiErrorDetailCode(error: HttpClientError) {
  if (!error.details || typeof error.details !== "object") return undefined;

  const code = (error.details as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
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
