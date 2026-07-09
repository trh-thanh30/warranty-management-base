import { z } from "zod";

const optionalText = z.string().trim();

export const customerFormSchema = z.object({
  address: optionalText.min(1, "addressRequired").max(255),
  customerCode: optionalText.refine(
    (value) => value.length === 0 || (value.length >= 4 && value.length <= 32),
    {
      message: "customerCodeLength",
    },
  ),
  email: optionalText.min(1, "emailRequired").email("emailInvalid"),
  fullName: optionalText.min(2, "fullNameRequired").max(120),
  phone: optionalText.min(1, "phoneRequired").min(6, "phoneLength").max(32),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
