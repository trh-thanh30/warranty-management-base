import { isValidOptionalBirthdate } from "@/src/utils/birthdate";
import { z } from "zod";

const optionalText = z.string().trim();

export const customerFormSchema = z.object({
  address: optionalText.max(255),
  addressDetail: optionalText.max(255),
  birthdate: optionalText.refine(isValidOptionalBirthdate, {
    message: "birthdateInvalid",
  }),
  customerCode: optionalText.refine(
    (value) => value.length === 0 || (value.length >= 4 && value.length <= 32),
    {
      message: "customerCodeLength",
    },
  ),
  email: z.union([optionalText.email("emailInvalid"), z.literal("")]),
  fullName: optionalText.min(2, "fullNameRequired").max(120),
  phone: optionalText.min(1, "phoneRequired").min(6, "phoneLength").max(32),
  provinceCode: optionalText,
  provinceName: optionalText,
  wardCode: optionalText,
  wardName: optionalText,
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerAddressFormSchema = customerFormSchema
  .pick({
    provinceCode: true,
    provinceName: true,
    wardCode: true,
    wardName: true,
  })
  .extend({
    addressDetail: optionalText.max(255),
  });

export type CustomerAddressFormValues = z.infer<
  typeof customerAddressFormSchema
>;
