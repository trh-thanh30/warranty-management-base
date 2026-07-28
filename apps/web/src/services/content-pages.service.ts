import type {
  ApiResponse,
  ContentPageSummary,
  PaginatedResponse,
} from "@repo/shared";

const apiBaseUrl =
  process.env.PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function getPublishedContentPage(
  slug: string,
): Promise<ContentPageSummary | null> {
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(
      `${apiBaseUrl}/public/content-pages/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as ApiResponse<ContentPageSummary>;
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function listPublishedContentPages(): Promise<
  ContentPageSummary[]
> {
  if (!apiBaseUrl) return [];

  try {
    const response = await fetch(
      `${apiBaseUrl}/public/content-pages?limit=100&sortBy=title&sortOrder=asc`,
      { cache: "no-store" },
    );
    if (!response.ok) return [];

    const payload = (await response.json()) as ApiResponse<
      PaginatedResponse<ContentPageSummary>
    >;
    return payload.data?.items ?? [];
  } catch {
    return [];
  }
}
