import type { MetadataRoute } from "next";
import {
  INDEXABLE_PATHNAMES,
  createLanguageAlternates,
  createLocalizedUrl,
  resolveSiteOrigin,
} from "@/src/config/seo.config";
import { routing } from "@/src/i18n/routing";

export function createSitemap(
  siteOrigin = resolveSiteOrigin(),
): MetadataRoute.Sitemap {
  return INDEXABLE_PATHNAMES.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: createLocalizedUrl(siteOrigin, pathname, locale),
      alternates: {
        languages: createLanguageAlternates(siteOrigin, pathname),
      },
      changeFrequency: pathname === "/warranty" ? "weekly" : "monthly",
      priority: pathname === "/warranty" ? 1 : 0.7,
    })),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  return createSitemap();
}
