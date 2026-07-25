import type { ProductCategory, ProductSortBy } from "@repo/shared";
import { z } from "zod";
import {
  PRODUCT_CATEGORIES,
  type PRODUCT_STATUS_FILTERS,
  type WARRANTY_STATUS_FILTERS,
} from "./products.constants";

export type ProductCategoryFilter = "ALL" | ProductCategory;
export type ProductStatusFilter = (typeof PRODUCT_STATUS_FILTERS)[number];
export type WarrantyStatusFilter = (typeof WARRANTY_STATUS_FILTERS)[number];
export type ProductCategoryOption = (typeof PRODUCT_CATEGORIES)[number];
export type ProductDirectorySortBy = ProductSortBy;

const optionalText = z.string().trim();
const productSpecificationSchema = z
  .object({
    key: optionalText.max(160, "specificationKeyLength"),
    value: optionalText.max(160, "specificationValueLength"),
  })
  .superRefine((row, context) => {
    if (!row.key && row.value) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "specificationKeyRequired",
        path: ["key"],
      });
    }

    if (row.key && !row.value) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "specificationValueRequired",
        path: ["value"],
      });
    }
  });

export const productSpecificationsSchema = z
  .array(productSpecificationSchema)
  .superRefine((rows, context) => {
    const seenKeys = new Set<string>();

    rows.forEach((row, index) => {
      if (!row.key) return;

      const normalizedKey = row.key.toLocaleLowerCase();
      if (seenKeys.has(normalizedKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "specificationKeyDuplicate",
          path: [index, "key"],
        });
        return;
      }

      seenKeys.add(normalizedKey);
    });
  });
const optionalInteger = (messages: {
  integer: string;
  max: number;
  min: number;
  range: string;
}) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .int(messages.integer)
      .min(messages.min, messages.range)
      .max(messages.max, messages.range)
      .optional(),
  );

export const productFormSchema = z.object({
  brand: optionalText.max(80, "brandLength"),
  category: z.enum(PRODUCT_CATEGORIES),
  categoryId: optionalText.min(1, "categoryRequired"),
  coverAssetId: z.string(),
  coverImageUrl: z.string(),
  description: optionalText.max(5000, "descriptionLength"),
  installationPosition: optionalText.max(160, "installationPositionLength"),
  manufactureYear: optionalInteger({
    integer: "manufactureYearInteger",
    max: 2100,
    min: 1900,
    range: "manufactureYearRange",
  }),
  model: optionalText.max(80, "modelLength"),
  name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
  productCode: optionalText.max(64, "productCodeLength").optional(),
  serialNumber: optionalText.max(64, "serialNumberLength"),
  specifications: productSpecificationsSchema,
  status: z.enum(["ACTIVE", "INACTIVE"]),
  templateId: z.string(),
  createTemplate: z.boolean(),
  warrantyDurationMonths: optionalInteger({
    integer: "durationMonthsInteger",
    max: 120,
    min: 1,
    range: "durationMonthsRange",
  }),
  warrantyTerms: optionalText.max(2000, "warrantyTermsLength").optional(),
});

export const assignProductOwnerSchema = z
  .object({
    autoGenerateWarrantyCode: z.boolean(),
    customerId: optionalText.min(1, "customerRequired"),
    purchaseDate: optionalText,
    warrantyCode: optionalText,
  })
  .superRefine((values, context) => {
    if (values.autoGenerateWarrantyCode) return;

    if (!values.warrantyCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "warrantyCodeRequired",
        path: ["warrantyCode"],
      });
      return;
    }

    if (!/^[A-Z0-9-]{6,64}$/i.test(values.warrantyCode)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "warrantyCodeInvalid",
        path: ["warrantyCode"],
      });
    }
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
export type AssignProductOwnerFormValues = z.output<
  typeof assignProductOwnerSchema
>;
export type ProductSpecificationRow = z.output<
  typeof productSpecificationSchema
>;
