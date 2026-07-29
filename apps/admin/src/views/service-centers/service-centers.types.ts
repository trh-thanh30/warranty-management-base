import type { SERVICE_CENTER_STATUS_FILTERS } from "./service-centers.constants";
import { PHONE_NUMBER_PATTERN } from "@repo/shared/constants";
import { z } from "zod";

export type ServiceCenterStatusFilter =
  (typeof SERVICE_CENTER_STATUS_FILTERS)[number];

const optionalText = z.string().trim();
const requiredCoordinate = (minimum: number, maximum: number) =>
  z
    .union([z.number(), z.nan()])
    .refine(Number.isFinite, "locationRequired")
    .refine(
      (value) =>
        !Number.isFinite(value) || (value >= minimum && value <= maximum),
      "coordinateInvalid",
    );

export const serviceCenterFormSchema = z.object({
  address: optionalText.min(4, "addressRequired").max(255, "addressLength"),
  district: optionalText.min(2, "wardRequired").max(120, "districtLength"),
  email: optionalText.refine(
    (value) =>
      value.length === 0 || z.string().email().safeParse(value).success,
    "emailInvalid",
  ),
  isActive: z.boolean(),
  latitude: requiredCoordinate(-90, 90),
  longitude: requiredCoordinate(-180, 180),
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
