import type {
  WarrantyActivationRequestSortBy,
  WarrantyActivationRequestStatus,
  WarrantyActivationRequestSummary,
} from "@repo/shared";
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
  customerBirthdate: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  note: string;
  productId: string;
  productName: string;
  provinceCode: string;
  wardCode: string;
  warrantyCode: string;
};

export const warrantyActivationRequestCreateFormSchema = z.object({
  addressDetail: z.string().trim().min(1, "addressRequired").max(255),
  customerBirthdate: z.string().trim(),
  customerEmail: z.string().trim().email("emailInvalid").max(160),
  customerName: z.string().trim().min(2, "customerNameRequired").max(120),
  customerPhone: z.string().trim().min(6, "phoneInvalid").max(32),
  note: z.string().trim().max(1000, "noteLength"),
  productId: z.string().trim().min(1, "productRequired"),
  productName: z.string().trim().min(1, "productRequired"),
  provinceCode: z.string().trim().min(1, "provinceRequired"),
  wardCode: z.string().trim().min(1, "wardRequired"),
  warrantyCode: z.string().trim(),
});

export type SelectedWarrantyActivationRequest =
  WarrantyActivationRequestSummary | null;
