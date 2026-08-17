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

export const productFormSchema = z.object({
  categoryId: optionalText.min(1, "categoryRequired"),
  displayName: optionalText.max(160, "displayNameLength"),
  installationPosition: optionalText.max(160, "installationPositionLength"),
  productCode: optionalText.max(64, "productCodeLength"),
  serialNumber: optionalText.max(64, "serialNumberLength"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  templateId: optionalText.min(1, "templateRequired"),
  warrantyDurationMonths: requiredWarrantyDuration,
  warrantyCode: optionalText
    .max(64, "warrantyCodeInvalid")
    .refine(
      (value) => !value || /^[A-Z0-9-]{6,64}$/i.test(value),
      "warrantyCodeInvalid",
    )
    .optional(),
});

export const productEditFormSchema = productFormSchema.extend({
  productCode: optionalText
    .min(1, "productCodeRequired")
    .max(64, "productCodeLength"),
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
