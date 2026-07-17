import type { ContentPageKind, ContentPageStatus } from "@repo/shared";

export const CONTENT_PAGE_KINDS: ContentPageKind[] = [
  "POLICY",
  "GUIDE",
  "INTRO",
  "FAQ",
];

export const CONTENT_PAGE_STATUSES: ContentPageStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

export const CONTENT_PAGES_PAGE_SIZE = 20;
