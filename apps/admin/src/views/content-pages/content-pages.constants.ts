import type { ContentPageKind, ContentPageStatus } from "@repo/shared";

export const CONTENT_PAGE_KINDS: ContentPageKind[] = [
  "GENERAL_POLICY",
  "PRIVACY_POLICY",
  "PURCHASE_POLICY",
  "WARRANTY_RETURN_POLICY",
  "SHIPPING_POLICY",
  "PAYMENT_POLICY",
  "FAQ",
];

export const CONTENT_PAGE_STATUSES: ContentPageStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

export const CONTENT_PAGES_PAGE_SIZE = 20;
