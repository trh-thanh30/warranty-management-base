import {
  formatDate,
  HttpClientError,
  type CreateWarrantyClaimBody,
  type ListProductsQuery,
  type ListWarrantyClaimsQuery,
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
import {
  getLocalizedApiError,
  type ApiErrorTranslator,
} from "@/src/lib/localized-api-error.utils";
import type {
  WarrantyClaimDirectoryFilters,
  WarrantyClaimCreateFormValues,
  WarrantyClaimRequesterSource,
  WarrantyClaimSort,
} from "./warranty-claims.types.ts";

type TranslateWarrantyClaim = (key: string) => string;

const CREATE_FIELD_ERROR_KEYS = [
  "evidenceRequired",
  "evidenceTooLarge",
  "evidenceTypeInvalid",
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

export function buildWarrantyClaimListQuery(
  filters: WarrantyClaimDirectoryFilters,
  search: string,
  page: number,
  pageSize: number,
  sortBy: WarrantyClaimSort,
  sortOrder: "asc" | "desc",
): ListWarrantyClaimsQuery {
  return {
    assignmentStatus:
      filters.serviceCenter === "UNASSIGNED" ? "UNASSIGNED" : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    isOverdue:
      filters.isOverdue === "ALL"
        ? undefined
        : filters.isOverdue === "OVERDUE"
          ? "true"
          : "false",
    limit: pageSize,
    page,
    priority: filters.priority === "ALL" ? undefined : filters.priority,
    search: search.trim() || undefined,
    serviceCenterId:
      filters.serviceCenter === "ALL" || filters.serviceCenter === "UNASSIGNED"
        ? undefined
        : filters.serviceCenter,
    sortBy,
    sortOrder,
    status: filters.status === "ALL" ? undefined : filters.status,
  };
}

export function buildWarrantyClaimProductQuery(
  search: string,
): ListProductsQuery {
  const normalizedSearch = search.trim();

  return {
    claimEligible: "true",
    limit: 20,
    search: normalizedSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  };
}

export function getWarrantyClaimRequesterValues(
  source: WarrantyClaimRequesterSource | null | undefined,
): Pick<WarrantyClaimCreateFormValues, "requesterName" | "requesterPhone"> {
  return {
    requesterName: source?.fullName ?? "",
    requesterPhone: source?.phone ?? "",
  };
}

export function getWarrantyClaimRequesterPrefill(
  owner:
    | (WarrantyClaimRequesterSource & { customerId?: string })
    | null
    | undefined,
  customer: (WarrantyClaimRequesterSource & { id: string }) | null | undefined,
): Pick<WarrantyClaimCreateFormValues, "requesterName" | "requesterPhone"> {
  const source =
    customer && customer.id === owner?.customerId ? customer : owner;

  return getWarrantyClaimRequesterValues(source);
}

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

export function formatClaimDate(
  value: string | null | undefined,
  locale: string,
) {
  return formatDate(value, { locale });
}

export function formatClaimDateTime(
  value: string | null | undefined,
  locale: string,
) {
  return formatDate(value, { locale, showTime: true });
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
  apiErrors?: ApiErrorTranslator,
) {
  if (!(error instanceof HttpClientError)) return translate("saveError");

  const key = CREATE_ERROR_MESSAGE_KEYS[error.message.trim().toLowerCase()];

  return key
    ? apiErrors?.has?.(key.replace("apiErrors.", ""))
      ? apiErrors(key.replace("apiErrors.", ""))
      : translate(key)
    : getLocalizedApiError(error, translate, { apiErrors });
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
