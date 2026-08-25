import type {
  WarrantyActivationRequestSortBy,
  WarrantyActivationRequestStatus,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
import { isValidOptionalBirthdate } from "@/src/utils/birthdate";
import { containsDisallowedVietnamAddressDetailUnit } from "@repo/shared/utils";
import { z } from "zod";

export type WarrantyActivationRequestStatusFilter =
  | "ALL"
  | WarrantyActivationRequestStatus;

export type WarrantyActivationRequestDirectoryFilters = {
  dateFrom: string;
  dateTo: string;
  status: WarrantyActivationRequestStatusFilter;
  warrantyCode: string;
};

export type WarrantyActivationRequestSort = WarrantyActivationRequestSortBy;

export type WarrantyActivationRequestAction = "approve" | "reject";

export type WarrantyActivationRequestCreateFormValues = {
  addressDetail: string;
  activationProductIds: Record<string, string>;
  categoryId: string;
  categoryInputValues: Record<string, string>;
  customerBirthdate: string;
  customerEmail: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dealerAddress: string;
  dealerDistrict: string;
  dealerId: string;
  dealerName: string;
  dealerPhone: string;
  dealerProvince: string;
  filmFrontLeftSide: string;
  filmFrontRightSide: string;
  filmRearGlass: string;
  filmRearLeftSide: string;
  filmRearRightSide: string;
  filmSunroof: string;
  filmWindshield: string;
  note: string;
  productId: string;
  productName: string;
  provinceCode: string;
  salesName: string;
  vehicleModel: string;
  vehiclePlate: string;
  wardCode: string;
  warrantyCode: string;
};

export const warrantyActivationRequestCreateFormSchema = z.object({
  addressDetail: z
    .string()
    .trim()
    .max(255)
    .refine((value) => !containsDisallowedVietnamAddressDetailUnit(value), {
      message: "addressAdministrativeUnitNotAllowed",
    }),
  activationProductIds: z.record(z.string(), z.string().trim()),
  categoryId: z.string().trim().min(1, "categoryRequired"),
  categoryInputValues: z.record(z.string(), z.string().trim().max(500)),
  customerBirthdate: z.string().trim().refine(isValidOptionalBirthdate, {
    message: "birthdateInvalid",
  }),
  customerId: z.string().trim().min(1, "customerRequired"),
  customerEmail: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "emailInvalid",
    })
    .refine((value) => value.length <= 160, { message: "emailInvalid" }),
  customerName: z.string().trim().min(2, "customerNameRequired").max(120),
  customerPhone: z.string().trim().min(6, "phoneInvalid").max(32),
  dealerAddress: z.string().trim().max(255),
  dealerDistrict: z.string().trim().max(120),
  dealerId: z.string().trim(),
  dealerName: z.string().trim().max(160),
  dealerPhone: z.string().trim().max(32),
  dealerProvince: z.string().trim().max(120),
  filmFrontLeftSide: z.string().trim().max(120),
  filmFrontRightSide: z.string().trim().max(120),
  filmRearGlass: z.string().trim().max(120),
  filmRearLeftSide: z.string().trim().max(120),
  filmRearRightSide: z.string().trim().max(120),
  filmSunroof: z.string().trim().max(120),
  filmWindshield: z.string().trim().max(120),
  note: z.string().trim().max(1000, "noteLength"),
  productId: z.string().trim(),
  productName: z.string().trim(),
  provinceCode: z.string().trim().min(1, "provinceRequired"),
  salesName: z.string().trim().max(120),
  vehicleModel: z.string().trim().max(160),
  vehiclePlate: z.string().trim().max(32),
  wardCode: z.string().trim().min(1, "wardRequired"),
  warrantyCode: z.string().trim(),
});

export type SelectedWarrantyActivationRequest =
  WarrantyActivationRequestSummary | null;
