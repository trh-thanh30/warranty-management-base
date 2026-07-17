import type { PaginationQuery } from "./pagination.types.ts";

export type ContentPageKind = "POLICY" | "GUIDE" | "INTRO" | "FAQ";

export type ContentPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ContentPageSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  kind: ContentPageKind;
  status: ContentPageStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContentPageSortBy =
  | "slug"
  | "title"
  | "kind"
  | "status"
  | "publishedAt"
  | "createdAt"
  | "updatedAt";

export type ListContentPagesQuery = PaginationQuery & {
  search?: string;
  kind?: ContentPageKind;
  status?: ContentPageStatus;
  sortBy?: ContentPageSortBy;
};

export type CreateContentPageBody = {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  kind?: ContentPageKind;
  status?: ContentPageStatus;
  publishedAt?: string;
};

export type UpdateContentPageBody = Partial<CreateContentPageBody>;
