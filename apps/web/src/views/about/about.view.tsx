import { getCachedSiteSetting } from "@/src/services/website-config/website-config.service";
import { HomepageRenderer } from "@repo/homepage";
import type { WebsiteLocale } from "@repo/shared";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "@repo/shared/constants";
import { AboutNetworkMap } from "./components/about-network-map";

export async function AboutView({
  params,
}: {
  params: Promise<{ locale: WebsiteLocale }>;
}) {
  const { locale } = await params;
  const site = await getCachedSiteSetting(locale).catch(() => null);
  const copy =
    site?.homepage?.copy?.landing ??
    DEFAULT_WEBSITE_HOMEPAGE_CONTENT[locale].landing;
  const heroImageUrl =
    site?.heroSlides.find((slide) => slide.isActive)?.desktopImage?.url ??
    "/hero/hero_5.jpg";

  return (
    <HomepageRenderer
      brandStoryImageUrl={site?.homepage?.aboutImage?.url ?? "/hero/hero_6.jpg"}
      copy={copy}
      heroImageUrl={heroImageUrl}
      networkContent={<AboutNetworkMap />}
      technologyOriginImageUrl={
        site?.homepage?.sputterChamberImage?.url ?? "/hero/hero_7.jpg"
      }
    />
  );
}
