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
