import type {
  CreateProductTemplateBody,
  ProductTemplateSummary,
  UpdateProductTemplateBody,
} from "@repo/shared";
import { toOptionalValue } from "@/src/utils/form";
import { toOptionalRichText, toNullableRichText } from "@/src/utils/rich-text";
import type {
  ProductTemplateFormInput,
  ProductTemplateFormValues,
} from "./product-templates.types";

export function getTemplateSpecifications(
  metadata: Record<string, unknown> | null | undefined,
) {
  const rows = metadata?.specifications;
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    const key = "key" in row && typeof row.key === "string" ? row.key : "";
    const value =
      "value" in row && typeof row.value === "string" ? row.value : "";
    return key.trim() && value.trim()
      ? [{ key: key.trim(), value: value.trim() }]
      : [];
  });
}

function toMetadata(values: ProductTemplateFormValues) {
  const specifications = values.specifications
    .map(({ key, value }) => ({ key: key.trim(), value: value.trim() }))
    .filter(({ key, value }) => key && value);
  return specifications.length > 0 ? { specifications } : undefined;
}

export function toCreateTemplateBody(
  values: ProductTemplateFormValues,
): CreateProductTemplateBody {
  return {
    name: values.name.trim(),
    category: values.category,
    categoryId: values.categoryId,
    brand: toOptionalValue(values.brand),
    model: toOptionalValue(values.model),
    manufactureYear: values.manufactureYear,
    description: toOptionalRichText(values.description),
    defaultWarrantyDurationMonths: values.defaultWarrantyDurationMonths,
    defaultWarrantyTerms: toOptionalValue(values.defaultWarrantyTerms),
    metadata: toMetadata(values),
    coverAssetId: toOptionalValue(values.coverAssetId),
    galleryAssetIds: values.galleryImages
      .map((image) => image.assetId)
      .filter(Boolean),
  };
}

export function toUpdateTemplateBody(
  values: ProductTemplateFormValues,
): UpdateProductTemplateBody {
  return {
    name: values.name.trim(),
    category: values.category,
    categoryId: values.categoryId,
    brand: toOptionalValue(values.brand) ?? null,
    model: toOptionalValue(values.model) ?? null,
    manufactureYear: values.manufactureYear ?? null,
    description: toNullableRichText(values.description),
    defaultWarrantyDurationMonths: values.defaultWarrantyDurationMonths,
    defaultWarrantyTerms: toOptionalValue(values.defaultWarrantyTerms) ?? null,
    metadata: toMetadata(values) ?? null,
    isActive: values.isActive,
    coverAssetId: toOptionalValue(values.coverAssetId) ?? null,
    galleryAssetIds: values.galleryImages
      .map((image) => image.assetId)
      .filter(Boolean),
  };
}

export function getProductTemplateDefaults(
  template: ProductTemplateSummary | null,
): ProductTemplateFormInput {
  const cover = template?.assets.find((asset) => asset.role === "COVER");
  const gallery =
    template?.assets
      .filter((asset) => asset.role === "GALLERY")
      .map((asset) => ({ assetId: asset.assetId, url: asset.url })) ?? [];
  const specifications = getTemplateSpecifications(template?.metadata);
  return {
    name: template?.name ?? "",
    category: template?.category ?? "ACCESSORY",
    categoryId: template?.categoryId ?? "",
    brand: template?.brand ?? "",
    model: template?.model ?? "",
    manufactureYear: template?.manufactureYear ?? undefined,
    description: template?.description ?? "",
    defaultWarrantyDurationMonths:
      template?.defaultWarrantyDurationMonths ?? 36,
    defaultWarrantyTerms: template?.defaultWarrantyTerms ?? "",
    coverAssetId: cover?.assetId ?? "",
    coverImageUrl: cover?.url ?? "",
    galleryImages: gallery,
    specifications: specifications.length
      ? specifications
      : [{ key: "", value: "" }],
    isActive: template?.isActive ?? true,
  };
}
