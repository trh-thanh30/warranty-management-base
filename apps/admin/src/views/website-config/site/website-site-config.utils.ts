import { arrayMove } from "@dnd-kit/sortable";
import type { WebsiteSiteSetting } from "@repo/shared";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "@repo/shared/constants";
import { createDefaultHeroSlideDrafts } from "./homepage-hero-editor";
import type { SiteDraft } from "./website-site-config.types";

export function toSiteDraft(site: WebsiteSiteSetting): SiteDraft {
  const homepage = site.homepage ?? {
    aboutImage: null,
    content: structuredClone(DEFAULT_WEBSITE_HOMEPAGE_CONTENT),
    sputterChamberImage: null,
    sputterStructureImage: null,
  };

  return {
    contactEmail: site.contactEmail,
    footerLogoAssetId: site.footerLogo?.id ?? null,
    headerLogoAssetId: site.headerLogo?.id ?? null,
    heroSlides:
      site.heroSlides.length > 0
        ? site.heroSlides.map((slide) => ({
            desktopAssetId: slide.desktopImage?.id ?? null,
            id: slide.id,
            isActive: slide.isActive,
            key: slide.key,
            mobileAssetId: slide.mobileImage?.id ?? null,
            sortOrder: slide.sortOrder,
          }))
        : createDefaultHeroSlideDrafts(),
    homepage: {
      aboutImageAssetId: homepage.aboutImage?.id ?? null,
      content: structuredClone(homepage.content),
      sputterChamberImageAssetId: homepage.sputterChamberImage?.id ?? null,
      sputterStructureImageAssetId: homepage.sputterStructureImage?.id ?? null,
    },
    offices: structuredClone(site.offices),
    ogImageAssetId: site.ogImage?.id ?? null,
    socialLinks: structuredClone(site.socialLinks),
    websiteUrl: site.websiteUrl,
  };
}

export function reorderById<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
) {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from < 0 || to < 0 || from === to) return items;

  return arrayMove(items, from, to).map((item, sortOrder) => ({
    ...item,
    sortOrder,
  }));
}
