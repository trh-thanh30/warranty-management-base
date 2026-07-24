import {
  formatDate,
  HttpClientError,
  type CreateWarrantyClaimBody,
  type ServiceCenterSummary,
  type WarrantyClaimPriority,
  type WarrantyClaimStatus,
  type WarrantyClaimSummary,
} from "@repo/shared";
import {
  WARRANTY_CLAIM_ATTACHMENT_MAX_SIZE,
  WARRANTY_CLAIM_ATTACHMENT_MIME_TYPES,
  WARRANTY_CLAIM_TERMINAL_STATUSES,
} from "./warranty-claims.constants.ts";
import type { WarrantyClaimCreateFormValues } from "./warranty-claims.types.ts";

type TranslateWarrantyClaim = (key: string) => string;

const CREATE_FIELD_ERROR_KEYS = [
  "issueDetailLength",
  "issueTitleRequired",
  "productRequired",
  "requesterNameLength",
  "requesterNameRequired",
  "requesterPhoneLength",
  "requesterPhoneRequired",
  "warrantyCodeRequired",
] as const;

const CREATE_ERROR_MESSAGE_KEYS: Record<string, string> = {
  "could not create warranty claim": "apiErrors.WARRANTY_CLAIM_CREATE_FAILED",
  "warranty is voided": "apiErrors.WARRANTY_VOIDED",
  "warranty not found": "apiErrors.WARRANTY_CODE_NOT_FOUND",
};

export type WarrantyClaimAttachmentValidationError =
  | "attachmentTooLarge"
  | "attachmentTypeInvalid";

export function validateWarrantyClaimAttachment(file: {
  size: number;
  type: string;
}): WarrantyClaimAttachmentValidationError | null {
  if (
    !WARRANTY_CLAIM_ATTACHMENT_MIME_TYPES.includes(
      file.type as (typeof WARRANTY_CLAIM_ATTACHMENT_MIME_TYPES)[number],
    )
  ) {
    return "attachmentTypeInvalid";
  }

  if (file.size > WARRANTY_CLAIM_ATTACHMENT_MAX_SIZE) {
    return "attachmentTooLarge";
  }

  return null;
}

export function formatAttachmentSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;

  return `${Math.round((size / (1024 * 1024)) * 10) / 10} MB`;
}

export function formatClaimDate(value: string | null | undefined) {
  return formatDate(value, { locale: "vi-VN" });
}

export function formatClaimDateTime(value: string | null | undefined) {
  return formatDate(value, { locale: "vi-VN", showTime: true });
}

export function formatResolutionHours(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return `${Math.round(value * 10) / 10}h`;
}

export function formatClaimCustomer(claim: WarrantyClaimSummary) {
  return (
    claim.customer?.fullName ??
    claim.requesterName ??
    claim.customer?.customerCode ??
    "-"
  );
}

export function formatClaimProduct(claim: WarrantyClaimSummary) {
  if (!claim.product) return "-";

  return [claim.product.name, claim.product.brand, claim.product.model]
    .filter(Boolean)
    .join(" · ");
}

export function formatClaimServiceCenter(claim: WarrantyClaimSummary) {
  return claim.serviceCenter?.name ?? "-";
}

export function formatServiceCenterOption(serviceCenter: ServiceCenterSummary) {
  return [serviceCenter.name, serviceCenter.province]
    .filter(Boolean)
    .join(" · ");
}

export function toCreateWarrantyClaimBody(
  values: WarrantyClaimCreateFormValues,
): CreateWarrantyClaimBody {
  return {
    issueDetail: values.issueDetail.trim() || undefined,
    issueTitle: values.issueTitle.trim(),
    requesterName: values.requesterName.trim(),
    requesterPhone: values.requesterPhone.trim(),
    warrantyCode: values.warrantyCode.trim().toUpperCase(),
  };
}

export function translateWarrantyClaimCreateFieldError(
  message: string | undefined,
  translate: TranslateWarrantyClaim,
) {
  if (!message) return undefined;

  return CREATE_FIELD_ERROR_KEYS.includes(
    message as (typeof CREATE_FIELD_ERROR_KEYS)[number],
  )
    ? translate(message)
    : message;
}

export function resolveWarrantyClaimCreateError(
  error: unknown,
  translate: TranslateWarrantyClaim,
) {
  if (!(error instanceof HttpClientError)) return translate("saveError");

  const key = CREATE_ERROR_MESSAGE_KEYS[error.message.trim().toLowerCase()];

  return key ? translate(key) : error.message || translate("saveError");
}

export function isClaimOverdue(claim: WarrantyClaimSummary) {
  if (!claim.dueAt) return false;
  if (WARRANTY_CLAIM_TERMINAL_STATUSES.includes(claim.status)) return false;

  return new Date(claim.dueAt).getTime() < Date.now();
}

export function getClaimSlaLabel(claim: WarrantyClaimSummary) {
  if (claim.slaBreachedAt) return "breached";
  if (isClaimOverdue(claim)) return "overdue";
  if (!claim.dueAt) return "notSet";

  return "onTrack";
}

export function getPriorityBadgeVariant(priority: WarrantyClaimPriority) {
  if (priority === "URGENT") return "destructive";
  if (priority === "HIGH") return "warning";
  if (priority === "NORMAL") return "secondary";

  return "default";
}

export function getStatusBadgeVariant(status: WarrantyClaimStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "REJECTED" || status === "CANCELLED") return "destructive";
  if (status === "REVIEWING") return "info";
  if (status === "APPROVED") return "accent";
  if (status === "IN_REPAIR") return "warning";

  return "secondary";
}
