import { DEFAULT_HOME_HERO_SLIDES } from "../constants/website-defaults.ts";
import type { WebsiteHeroSlide } from "../types/website-site-setting.types.ts";

export type ResolvedWebsiteHeroSlide = {
  id: string;
  key: string;
  sortOrder: number;
  url: string;
};

export function resolveWebsiteHeroSlides(
  configuredSlides: WebsiteHeroSlide[] | null | undefined,
): {
  desktop: ResolvedWebsiteHeroSlide[];
  mobile: ResolvedWebsiteHeroSlide[];
} {
  const activeSlides = (configuredSlides ?? [])
    .filter((slide) => slide.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  const defaultDesktop = () =>
    DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
      id: slide.id,
      key: slide.key,
      sortOrder: slide.sortOrder,
      url: slide.desktopUrl,
    }));
  const defaultMobile = () =>
    DEFAULT_HOME_HERO_SLIDES.map((slide) => ({
      id: slide.id,
      key: slide.key,
      sortOrder: slide.sortOrder,
      url: slide.mobileUrl,
    }));

  const desktop = activeSlides.flatMap((slide) =>
    slide.desktopImage
      ? [
          {
            id: slide.id,
            key: slide.key,
            sortOrder: slide.sortOrder,
            url: slide.desktopImage.url,
          },
        ]
      : [],
  );
  const mobile = activeSlides.flatMap((slide) =>
    slide.mobileImage
      ? [
          {
            id: slide.id,
            key: slide.key,
            sortOrder: slide.sortOrder,
            url: slide.mobileImage.url,
          },
        ]
      : [],
  );

  return {
    desktop: desktop.length > 0 ? desktop : defaultDesktop(),
    mobile: mobile.length > 0 ? mobile : defaultMobile(),
  };
}
