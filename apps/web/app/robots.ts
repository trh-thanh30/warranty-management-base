import type { MetadataRoute } from "next";
import { resolveSiteOrigin } from "@/src/config/seo.config";

export function createRobots(
  siteOrigin = resolveSiteOrigin(),
): MetadataRoute.Robots {
  return {
    host: siteOrigin,
    rules: {
      allow: "/",
      userAgent: "*",
    },
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}

export default function robots(): MetadataRoute.Robots {
  return createRobots();
}
