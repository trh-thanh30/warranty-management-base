import type { ApiResponse, PublicWebsiteSiteSetting } from "@repo/shared";
import type { AppLocale } from "@/src/i18n/routing";

const apiBaseUrl =
  process.env.PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function getPublicSiteSettings(
  locale: AppLocale,
): Promise<PublicWebsiteSiteSetting | null> {
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(
      `${apiBaseUrl}/public/site-settings?locale=${encodeURIComponent(locale)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;

    const payload =
      (await response.json()) as ApiResponse<PublicWebsiteSiteSetting>;
    return payload.data ?? null;
  } catch {
    return null;
  }
}
