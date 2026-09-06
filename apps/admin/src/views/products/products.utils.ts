import {
  HttpClientError,
  type CreateProductBody,
  type ProductResponse,
  type UpdateProductBody,
} from "@repo/shared";
import { toNullableValue, toOptionalValue } from "../../utils/form.ts";
import type { ProductFormValues } from "./products.types";

type ProductWarrantyPeriod = {
  endDate: string;
  startDate: string;
};

export type ProductWarrantyProgress = {
  percentage: number;
  remainingMonths: number;
  state: "active" | "expired" | "upcoming";
};

export function getProductWarrantyProgress(
  warranty: ProductWarrantyPeriod,
  now = new Date(),
): ProductWarrantyProgress {
  const start = new Date(warranty.startDate);
  const end = new Date(warranty.endDate);
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = now.getTime() - start.getTime();
  const percentage =
    totalDuration > 0
      ? Math.round(
          Math.min(1, Math.max(0, elapsedDuration / totalDuration)) * 100,
        )
      : 0;

  return {
    percentage,
    remainingMonths: getRemainingCalendarMonths(now, end),
    state: now < start ? "upcoming" : now >= end ? "expired" : "active",
  };
}

function getRemainingCalendarMonths(from: Date, to: Date) {
  if (from >= to) return 0;

  const wholeMonths =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    to.getUTCMonth() -
    from.getUTCMonth();
  const anchor = new Date(from);
  anchor.setUTCMonth(anchor.getUTCMonth() + wholeMonths);

  return wholeMonths + (anchor < to ? 1 : 0);
}

export function formatProductOwner(product: ProductResponse) {
  if (!product.owner) return "-";

  return (
    product.owner.fullName ||
    product.owner.customerCode ||
    product.owner.customerId
  );
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
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

export function getProductSpecifications(
  metadata: Record<string, unknown> | null | undefined,
) {
  const specifications = metadata?.specifications;
  if (!Array.isArray(specifications)) return [{ key: "", value: "" }];

  const values = specifications.flatMap((specification) => {
    if (
      !specification ||
      typeof specification !== "object" ||
      Array.isArray(specification)
    ) {
      return [];
    }
    const key =
      "key" in specification && typeof specification.key === "string"
        ? specification.key.trim()
        : "";
    const value =
      "value" in specification && typeof specification.value === "string"
        ? specification.value.trim()
        : "";
    return key || value ? [{ key, value }] : [];
  });

  return values.length ? values : [{ key: "", value: "" }];
}

export function getProductMetadataTextList(
  metadata: Record<string, unknown> | null | undefined,
  key: "applications" | "features",
) {
  const items = metadata?.[key];
  if (!Array.isArray(items)) return [{ value: "" }];

  const values = items.flatMap((item) =>
    typeof item === "string" && item.trim() ? [{ value: item.trim() }] : [],
  );
  return values.length ? values : [{ value: "" }];
}

export function mergeProductCatalogueMetadata(
  metadata: Record<string, unknown> | null | undefined,
  values: Pick<
    ProductFormValues,
    "applications" | "features" | "specifications" | "shortDescription"
  >,
): Record<string, unknown> | null {
  const nextMetadata = { ...(metadata ?? {}) };
  const specifications = values.specifications
    .map(({ key, value }) => ({ key: key.trim(), value: value.trim() }))
    .filter(({ key, value }) => key && value);
  const features = values.features
    .map(({ value }) => value.trim())
    .filter(Boolean);
  const applications = values.applications
    .map(({ value }) => value.trim())
    .filter(Boolean);

  setOrDeleteMetadataValue(nextMetadata, "specifications", specifications);
  setOrDeleteMetadataValue(nextMetadata, "features", features);
  setOrDeleteMetadataValue(nextMetadata, "applications", applications);
  if (values.shortDescription !== undefined) {
    const shortDescription = toOptionalValue(values.shortDescription);
    if (shortDescription) nextMetadata.shortDescription = shortDescription;
    else delete nextMetadata.shortDescription;
  }

  return Object.keys(nextMetadata).length > 0 ? nextMetadata : null;
}

export function getProductPhysicalMetadata(
  metadata: Record<string, unknown> | null | undefined,
) {
  const nextMetadata = { ...(metadata ?? {}) };
  delete nextMetadata.applications;
  delete nextMetadata.features;
  delete nextMetadata.shortDescription;
  delete nextMetadata.specifications;
  return Object.keys(nextMetadata).length > 0 ? nextMetadata : null;
}

function setOrDeleteMetadataValue(
  metadata: Record<string, unknown>,
  key: "applications" | "features" | "specifications",
  value: unknown[],
) {
  if (value.length) metadata[key] = value;
  else delete metadata[key];
}

export function toCreateProductBody(
  values: ProductFormValues,
): CreateProductBody {
  const metadata = mergeProductInstallationPosition(
    null,
    values.installationPosition,
  );
  const productCode = toOptionalValue(values.productCode);
  const catalogueMetadata = mergeProductCatalogueMetadata(null, values);

  return {
    name: values.displayName,
    categoryId: values.categoryId,
    ...(toOptionalValue(values.brand)
      ? { brand: toOptionalValue(values.brand) }
      : {}),
    ...(toOptionalValue(values.model)
      ? { model: toOptionalValue(values.model) }
      : {}),
    ...(values.modelYear ? { modelYear: values.modelYear } : {}),
    ...(toOptionalValue(values.description)
      ? { description: toOptionalValue(values.description) }
      : {}),
    ...(catalogueMetadata ? { catalogueMetadata } : {}),
    ...(toOptionalValue(values.coverAssetId)
      ? { coverAssetId: toOptionalValue(values.coverAssetId) }
      : {}),
    ...(values.galleryImages.some((image) => image.assetId)
      ? {
          galleryAssetIds: values.galleryImages
            .map((image) => image.assetId)
            .filter(Boolean),
        }
      : {}),
    displayName: values.displayName,
    metadata: metadata ?? undefined,
    ...(productCode ? { productCode } : {}),
    serialNumber: toOptionalValue(values.serialNumber),
    status: values.status,
    warrantyDurationMonths: values.warrantyDurationMonths,
    ...(toOptionalValue(values.warrantyTerms)
      ? { warrantyTerms: toOptionalValue(values.warrantyTerms) }
      : {}),
  };
}

export function toUpdateProductBody(
  values: ProductFormValues,
  existingMetadata: Record<string, unknown> | null,
  existingCatalogueMetadata: Record<string, unknown> | null = null,
): UpdateProductBody {
  return {
    name: values.displayName,
    categoryId: values.categoryId,
    brand: toNullableValue(values.brand),
    model: toNullableValue(values.model),
    modelYear: values.modelYear ?? null,
    description: toNullableValue(values.description),
    catalogueMetadata: mergeProductCatalogueMetadata(
      existingCatalogueMetadata,
      values,
    ),
    coverAssetId: toNullableValue(values.coverAssetId),
    galleryAssetIds: values.galleryImages
      .map((image) => image.assetId)
      .filter(Boolean),
    displayName: values.displayName,
    metadata: mergeProductInstallationPosition(
      existingMetadata,
      values.installationPosition,
    ),
    productCode: values.productCode.trim(),
    serialNumber: toNullableValue(values.serialNumber),
    status: values.status,
    warrantyDurationMonths: values.warrantyDurationMonths,
    warrantyTerms: toNullableValue(values.warrantyTerms),
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
    "Serial number already exists": ["serialNumber", "duplicateSerialNumber"],
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
