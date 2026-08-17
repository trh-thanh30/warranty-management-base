import { PHONE_NUMBER_PATTERN } from "@repo/shared/constants";
import { containsDisallowedVietnamAddressDetailUnit } from "@repo/shared/utils";
import { z } from "zod";

export type WarrantyActivationFormValidationMessages = {
  addressAdministrativeUnitNotAllowed: string;
  addressRequired: string;
  customerEmailInvalid: string;
  customerEmailRequired: string;
  customerNameInvalid: string;
  customerPhoneInvalid: string;
  provinceRequired: string;
  vehiclePlateInvalid: string;
  wardRequired: string;
  warrantyCodeInvalid: string;
};

export type WarrantyActivationFormValues = {
  addressDetail: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  provinceCode: string;
  vehiclePlate: string;
  wardCode: string;
  warrantyCode: string;
};

export function createWarrantyActivationFormSchema(
  messages: WarrantyActivationFormValidationMessages,
) {
  return z.object({
    addressDetail: z
      .string()
      .trim()
      .min(1, messages.addressRequired)
      .max(255, messages.addressRequired)
      .refine(
        (value) => !containsDisallowedVietnamAddressDetailUnit(value),
        messages.addressAdministrativeUnitNotAllowed,
      ),
    customerEmail: z
      .string()
      .trim()
      .min(1, messages.customerEmailRequired)
      .max(160, messages.customerEmailInvalid)
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        messages.customerEmailInvalid,
      ),
    customerName: z
      .string()
      .trim()
      .min(2, messages.customerNameInvalid)
      .max(120, messages.customerNameInvalid),
    customerPhone: z
      .string()
      .trim()
      .min(6, messages.customerPhoneInvalid)
      .max(32, messages.customerPhoneInvalid)
      .regex(PHONE_NUMBER_PATTERN, messages.customerPhoneInvalid),
    provinceCode: z.string().trim().min(1, messages.provinceRequired),
    vehiclePlate: z
      .string()
      .trim()
      .min(2, messages.vehiclePlateInvalid)
      .max(32, messages.vehiclePlateInvalid),
    wardCode: z.string().trim().min(1, messages.wardRequired),
    warrantyCode: z
      .string()
      .trim()
      .min(6, messages.warrantyCodeInvalid)
      .max(64, messages.warrantyCodeInvalid)
      .regex(/^[A-Z0-9-]+$/i, messages.warrantyCodeInvalid),
  });
}
