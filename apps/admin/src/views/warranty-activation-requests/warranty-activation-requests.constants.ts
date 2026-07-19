import type { WarrantyActivationRequestStatus } from "@repo/shared";

export const WARRANTY_ACTIVATION_REQUESTS_PAGE_SIZE = 10;

export const WARRANTY_ACTIVATION_REQUEST_STATUS_FILTERS = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVATED",
  "CANCELLED",
] as const satisfies readonly ("ALL" | WarrantyActivationRequestStatus)[];
