import { z } from "zod";

const optionalText = z.string().trim().optional();
const productCategories = [
  "CAR",
  "ACCESSORY",
  "SPARE_PART",
  "SERVICE_PACKAGE",
] as const;

export const warrantyActivationFormSchema = z.object({
  activatedAt: z.string().min(1, "activatedAtRequired"),
  addressDetail: z.string().trim().min(1, "addressRequired").max(255),
  brand: optionalText,
  category: z.enum(productCategories),
  categoryId: optionalText,
  customerEmail: z.string().trim().email("emailInvalid").max(160),
  customerName: z.string().trim().min(2, "customerNameRequired").max(120),
  customerPhone: z.string().trim().min(6, "phoneInvalid").max(32),
  description: optionalText,
  durationMonths: z.coerce
    .number()
    .int("durationMonthsInteger")
    .min(1, "durationMonthsRange")
    .max(120, "durationMonthsRange"),
  manufactureYear: z.coerce
    .number()
    .int("manufactureYearInteger")
    .min(1900, "manufactureYearRange")
    .max(2100, "manufactureYearRange")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  model: optionalText,
  productId: optionalText,
  productName: z.string().trim().min(2, "productNameRequired").max(160),
  provinceCode: z.string().min(1, "provinceRequired"),
  purchaseDate: optionalText,
  serialNumber: optionalText,
  terms: z.string().trim().max(2000, "termsLength").optional(),
  wardCode: z.string().min(1, "wardRequired"),
  warrantyCode: optionalText,
});

export type WarrantyActivationFormInput = z.input<
  typeof warrantyActivationFormSchema
>;
export type WarrantyActivationFormValues = z.output<
  typeof warrantyActivationFormSchema
>;
