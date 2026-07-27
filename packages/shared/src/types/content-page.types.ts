import type { PaginationQuery } from "./pagination.types.ts";
import type { CategorySummary } from "./category.types.ts";

export type ContentPageKind =
  | "GENERAL_POLICY"
  | "PRIVACY_POLICY"
  | "PURCHASE_POLICY"
  | "WARRANTY_RETURN_POLICY"
  | "SHIPPING_POLICY"
  | "PAYMENT_POLICY"
  | "FAQ";

export type ContentPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ContentPageFaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContentPageFaqItemInput = {
  question: string;
  answer: string;
  isActive?: boolean;
};

export type ContentPageSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  faqItems: ContentPageFaqItem[];
  kind: ContentPageKind;
  categoryId: string | null;
  categoryRef: CategorySummary | null;
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
  categoryId?: string | null;
  status?: ContentPageStatus;
  sortBy?: ContentPageSortBy;
};

export type CreateContentPageBody = {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  faqItems?: ContentPageFaqItemInput[];
  kind?: ContentPageKind;
  status?: ContentPageStatus;
  publishedAt?: string;
};

export type UpdateContentPageBody = Partial<CreateContentPageBody>;

export type ReorderContentPageFaqItemsBody = {
  itemIds: string[];
};

export type ParseContentDocumentResult = {
  content: string;
};
