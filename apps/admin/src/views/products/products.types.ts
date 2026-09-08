import type { ProductSortBy } from "@repo/shared";
import { z } from "zod";
import { type PRODUCT_STATUS_FILTERS } from "./products.constants";

export type ProductStatusFilter = (typeof PRODUCT_STATUS_FILTERS)[number];
export type ProductDirectorySortBy = ProductSortBy;

const optionalText = z.string().trim();
const requiredWarrantyDuration = z
  .union([z.number(), z.string()])
  .transform((value) => (typeof value === "number" ? value : Number(value)))
  .pipe(
    z
      .number({ invalid_type_error: "durationMonthsRange" })
      .int("durationMonthsRange")
      .min(1, "durationMonthsRange"),
  );
const optionalModelYear = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : Number(value),
  z.number().int().min(1900).max(2200).optional(),
);
const catalogueTextItem = z.object({
  value: optionalText.max(300, "catalogueMetadataItemLength"),
});
const catalogueSpecification = z.object({
  key: optionalText.max(120, "specificationKeyLength"),
  value: optionalText.max(300, "specificationValueLength"),
});

export const productFormSchema = z.object({
  categoryId: optionalText.min(1, "categoryRequired"),
  displayName: optionalText
    .min(1, "nameRequired")
    .max(160, "displayNameLength"),
  brand: optionalText.max(80, "brandLength"),
  model: optionalText.max(80, "modelLength"),
  modelYear: optionalModelYear,
  shortDescription: optionalText.max(500, "shortDescriptionLength").optional(),
  description: optionalText.max(1000, "descriptionLength"),
  coverAssetId: z.string(),
  coverImageUrl: z.string(),
  galleryImages: z.array(
    z.object({
      assetId: z.string(),
      url: z.string(),
    }),
  ),
  features: z.array(catalogueTextItem).max(50),
  applications: z.array(catalogueTextItem).max(50),
  specifications: z.array(catalogueSpecification).max(50),
  installationPosition: optionalText.max(160, "installationPositionLength"),
  productCode: optionalText.max(64, "productCodeLength"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  warrantyTerms: optionalText.max(2000, "warrantyTermsLength"),
  warrantyDurationMonths: requiredWarrantyDuration,
});

export const productEditFormSchema = productFormSchema.extend({
  productCode: optionalText
    .min(1, "productCodeRequired")
    .max(64, "productCodeLength"),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
