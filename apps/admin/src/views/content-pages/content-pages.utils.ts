import { HttpClientError, type ContentPageSummary } from "@repo/shared";
import type { ContentPageFormValues } from "./content-pages.types";

export function getContentPageFormValues(
  page: ContentPageSummary | null,
): ContentPageFormValues {
  return {
    slug: page?.slug ?? "",
    title: page?.title ?? "",
    summary: page?.summary ?? "",
    content: page?.content ?? "",
    kind: page?.kind ?? "GENERAL_POLICY",
    categoryId: page?.categoryId ?? "",
  };
}

export function slugifyContentPageTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}

export function getContentPageSaveError(error: unknown) {
  if (
    error instanceof HttpClientError &&
    error.status === 409 &&
    error.message.toLowerCase().includes("slug")
  ) {
    return { field: "slug", messageKey: "duplicateSlug" } as const;
  }

  return null;
}

export function formatContentPageDate(value: string | null, locale: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
