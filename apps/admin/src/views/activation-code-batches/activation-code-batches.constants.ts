import type { ActivationCodeReportStatus } from "@repo/shared";

export const ACTIVATION_CODE_BATCH_STATUSES = [
  "AVAILABLE",
  "PENDING_APPROVAL",
  "ACTIVATED",
  "EXPIRED",
  "REVOKED",
  "REPLACED",
] as const satisfies readonly ActivationCodeReportStatus[];
