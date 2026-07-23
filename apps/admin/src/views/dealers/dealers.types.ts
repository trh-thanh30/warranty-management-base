import { PHONE_NUMBER_PATTERN } from "@repo/shared/constants";
import { z } from "zod";
import type { DEALER_STATUS_FILTERS } from "./dealers.constants";

export type DealerStatusFilter = (typeof DEALER_STATUS_FILTERS)[number];

const optionalText = z.string().trim();

export const dealerFormSchema = z.object({
  address: optionalText.min(4, "addressRequired").max(255, "addressLength"),
  district: optionalText.max(120, "districtLength"),
  isActive: z.boolean(),
  name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
  phone: optionalText
    .max(32, "phoneLength")
    .refine(
      (value) => value.length === 0 || PHONE_NUMBER_PATTERN.test(value),
      "phoneInvalid",
    ),
  province: optionalText.min(2, "provinceRequired").max(120, "provinceLength"),
  salesName: optionalText.max(120, "salesNameLength"),
});

export type DealerFormValues = z.infer<typeof dealerFormSchema>;
