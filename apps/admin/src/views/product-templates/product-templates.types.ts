import { z } from "zod";

const optionalText = z.string().trim();
const optionalInteger = (min: number, max: number, message: string) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .int(message)
      .min(min, message)
      .max(max, message)
      .optional(),
  );

const optionalWarrantyDuration = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined ? null : value,
  z.union([
    z.null(),
    z.coerce.number().int("durationMonthsRange").min(1, "durationMonthsRange"),
  ]),
);

export const productTemplateFormSchema = z.object({
  sku: optionalText
    .max(64, "skuLength")
    .refine(
      (value) => !value || /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value),
      "skuInvalid",
    ),
  slug: optionalText
    .max(180, "slugLength")
    .refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      "slugInvalid",
    ),
  name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
  categoryId: optionalText.min(1, "categoryRequired"),
  brand: optionalText.max(80, "brandLength"),
  model: optionalText.max(80, "modelLength"),
  modelYear: optionalInteger(1900, 2100, "modelYearRange"),
  description: optionalText.max(5000, "descriptionLength"),
  shortDescription: optionalText.max(500, "shortDescriptionLength"),
  defaultWarrantyDurationMonths: optionalWarrantyDuration,
  defaultWarrantyTerms: optionalText.max(2000, "warrantyTermsLength"),
  coverAssetId: z.string(),
  coverImageUrl: z.string(),
  galleryImages: z.array(
    z.object({
      assetId: z.string(),
      url: z.string(),
    }),
  ),
  specifications: z.array(
    z.object({
      key: optionalText.max(160, "specificationLength"),
      value: optionalText.max(160, "specificationLength"),
    }),
  ),
  features: z.array(
    z.object({
      value: optionalText.max(300, "detailItemLength"),
    }),
  ),
  applications: z.array(
    z.object({
      value: optionalText.max(300, "detailItemLength"),
    }),
  ),
  isActive: z.boolean(),
  isPublished: z.boolean(),
});

export type ProductTemplateFormInput = z.input<
  typeof productTemplateFormSchema
>;
export type ProductTemplateFormValues = z.output<
  typeof productTemplateFormSchema
>;
