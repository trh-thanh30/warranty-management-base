import type {
  ApiResponse,
  PublicWebsiteSiteSetting,
  WebsiteLocale,
} from "@repo/shared";

export async function getPublicWebsiteSiteSetting(
  locale: WebsiteLocale,
): Promise<PublicWebsiteSiteSetting | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(
      `${apiBaseUrl}/public/site-settings?locale=${locale}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;

    const payload =
      (await response.json()) as ApiResponse<PublicWebsiteSiteSetting>;
    return payload.data;
  } catch {
    return null;
  }
}
