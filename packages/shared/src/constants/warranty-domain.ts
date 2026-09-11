import type {
  ContentPageKind,
  ContentPageStatus,
  WarrantyClaimPriority,
  WarrantyClaimStatus,
  WarrantyStatus,
} from "../types/index.ts";

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  DRAFT: "Chua kich hoat",
  ACTIVE: "Dang bao hanh",
  EXPIRED: "Het han",
  VOIDED: "Vo hieu",
};

export const WARRANTY_CLAIM_STATUS_LABELS: Record<WarrantyClaimStatus, string> =
  {
    SUBMITTED: "Da gui",
    REVIEWING: "Dang xem xet",
    APPROVED: "Da duyet",
    REJECTED: "Tu choi",
    IN_REPAIR: "Dang sua chua",
    COMPLETED: "Hoan thanh",
    CANCELLED: "Da huy",
  };

export const WARRANTY_CLAIM_PRIORITY_LABELS: Record<
  WarrantyClaimPriority,
  string
> = {
  LOW: "Thap",
  NORMAL: "Binh thuong",
  HIGH: "Cao",
  URGENT: "Khan cap",
};

export const CONTENT_PAGE_KIND_LABELS: Record<ContentPageKind, string> = {
  GENERAL_POLICY: "Chinh sach & quy dinh chung",
  PRIVACY_POLICY: "Chinh sach bao mat",
  PURCHASE_POLICY: "Chinh sach mua hang",
  WARRANTY_RETURN_POLICY: "Chinh sach bao hanh - Doi tra",
  SHIPPING_POLICY: "Chinh sach giao hang",
  PAYMENT_POLICY: "Chinh sach thanh toan",
  FAQ: "Cau hoi thuong gap",
};

export const CONTENT_PAGE_STATUS_LABELS: Record<ContentPageStatus, string> = {
  DRAFT: "Ban nhap",
  PUBLISHED: "Da xuat ban",
  ARCHIVED: "Luu tru",
};

export const WARRANTY_CLAIM_TERMINAL_STATUSES: WarrantyClaimStatus[] = [
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
];

export const WARRANTY_CLAIM_OPEN_STATUSES = [
  "SUBMITTED",
  "REVIEWING",
  "APPROVED",
  "IN_REPAIR",
] as const satisfies readonly WarrantyClaimStatus[];

export const WARRANTY_CLAIM_ISSUE_OPTIONS = [
  "bubble",
  "fade",
  "scratch",
  "other",
] as const;

export const WARRANTY_CLAIM_EVIDENCE_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const WARRANTY_CLAIM_EVIDENCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
] as const;

export type WarrantyClaimIssueOption =
  (typeof WARRANTY_CLAIM_ISSUE_OPTIONS)[number];

export function isWarrantyClaimIssueOption(
  value: unknown,
): value is WarrantyClaimIssueOption {
  return (
    typeof value === "string" &&
    (WARRANTY_CLAIM_ISSUE_OPTIONS as readonly string[]).includes(value)
  );
}
