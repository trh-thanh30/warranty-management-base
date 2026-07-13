import type { ProductCategory, ProductSortBy } from "@repo/shared";
import { z } from "zod";
import type {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_FILTERS,
  WARRANTY_STATUS_FILTERS,
} from "./products.constants";

export type ProductCategoryFilter = "ALL" | ProductCategory;
export type ProductStatusFilter = (typeof PRODUCT_STATUS_FILTERS)[number];
export type WarrantyStatusFilter = (typeof WARRANTY_STATUS_FILTERS)[number];
export type ProductCategoryOption = (typeof PRODUCT_CATEGORIES)[number];
export type ProductDirectorySortBy = ProductSortBy;

const optionalText = z.string().trim();
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

export const productFormSchema = z
  .object({
    activatedAt: optionalText,
    autoGenerateWarrantyCode: z.boolean(),
    brand: optionalText.max(80, "brandLength"),
    category: z.enum(["CAR", "ACCESSORY", "SPARE_PART", "SERVICE_PACKAGE"]),
    categoryId: z.string(),
    customerId: z.string(),
    description: optionalText.max(1000, "descriptionLength"),
    durationMonths: optionalInteger({
      integer: "durationMonthsInteger",
      max: 120,
      min: 1,
      range: "durationMonthsRange",
    }),
    manufactureYear: optionalInteger({
      integer: "manufactureYearInteger",
      max: 2100,
      min: 1900,
      range: "manufactureYearRange",
    }),
    metadata: optionalText,
    model: optionalText.max(80, "modelLength"),
    name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
    purchaseDate: optionalText,
    serialNumber: optionalText.max(64, "serialNumberLength"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    warrantyCode: optionalText,
    warrantyTerms: optionalText.max(2000, "warrantyTermsLength"),
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
