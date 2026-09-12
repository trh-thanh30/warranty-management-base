import { PHONE_NUMBER_PATTERN } from "@repo/shared/constants";
import { z } from "zod";

export type WarrantyActivationFormValidationMessages = {
  addressRequired: string;
  customerEmailInvalid: string;
  customerEmailRequired: string;
  customerNameInvalid: string;
  customerPhoneInvalid: string;
  installedAtFuture: string;
  installedAtInvalid: string;
  installedAtRequired: string;
  provinceRequired: string;
  vehiclePlateInvalid: string;
  wardRequired: string;
  activationCodeInvalid: string;
};

export type WarrantyActivationFormValues = {
  addressDetail: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  installedAt: string;
  provinceCode: string;
  vehiclePlate: string;
  wardCode: string;
  activationCode: string;
};

export function createWarrantyActivationFormSchema(
  messages: WarrantyActivationFormValidationMessages,
) {
  return z.object({
    addressDetail: z
      .string()
      .trim()
      .min(1, messages.addressRequired)
      .max(255, messages.addressRequired),
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
    installedAt: z
      .string()
      .trim()
      .min(1, messages.installedAtRequired)
      .refine(
        (value) => !Number.isNaN(new Date(value).getTime()),
        messages.installedAtInvalid,
      )
      .refine(
        (value) => new Date(value).getTime() <= Date.now(),
        messages.installedAtFuture,
      ),
    provinceCode: z.string().trim().min(1, messages.provinceRequired),
    vehiclePlate: z
      .string()
      .trim()
      .min(2, messages.vehiclePlateInvalid)
      .max(32, messages.vehiclePlateInvalid),
    wardCode: z.string().trim().min(1, messages.wardRequired),
    activationCode: z
      .string()
      .trim()
      .min(6, messages.activationCodeInvalid)
      .max(120, messages.activationCodeInvalid)
      .regex(/^[A-Z0-9-]+$/i, messages.activationCodeInvalid),
  });
}
