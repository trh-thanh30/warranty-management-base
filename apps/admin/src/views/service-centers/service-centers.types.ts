import type { SERVICE_CENTER_STATUS_FILTERS } from "./service-centers.constants";
import { PHONE_NUMBER_PATTERN } from "@repo/shared/constants";
import { z } from "zod";

export type ServiceCenterStatusFilter =
  (typeof SERVICE_CENTER_STATUS_FILTERS)[number];

const optionalText = z.string().trim();

export const serviceCenterFormSchema = z.object({
  address: optionalText.min(4, "addressRequired").max(255, "addressLength"),
  district: optionalText.min(2, "wardRequired").max(120, "districtLength"),
  email: optionalText.refine(
    (value) =>
      value.length === 0 || z.string().email().safeParse(value).success,
    "emailInvalid",
  ),
  googleMapsUrl: optionalText.refine(
    (value) => value.length === 0 || z.string().url().safeParse(value).success,
    "googleMapsUrlInvalid",
  ),
  isActive: z.boolean(),
  name: optionalText.min(2, "nameRequired").max(160, "nameLength"),
  phone: optionalText
    .max(32, "phoneLength")
    .refine(
      (value) => value.length === 0 || PHONE_NUMBER_PATTERN.test(value),
      "phoneInvalid",
    ),
  province: optionalText.min(2, "provinceRequired").max(120, "provinceLength"),
});

export type ServiceCenterFormValues = z.infer<typeof serviceCenterFormSchema>;
