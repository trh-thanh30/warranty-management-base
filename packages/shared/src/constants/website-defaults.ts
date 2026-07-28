import type { WebsiteHeroFallbackSlide } from "../types/website-site-setting.types.ts";

export const DEFAULT_HOME_HERO_SLIDES = [
  {
    desktopUrl: "/bg_1.jpg",
    id: "10000000-0000-4000-8000-000000000001",
    key: "primary",
    mobileUrl: "/mobile_1.jpg",
    sortOrder: 0,
  },
  {
    desktopUrl: "/bg_2.jpg",
    id: "10000000-0000-4000-8000-000000000002",
    key: "technology",
    mobileUrl: "/mobile_2.jpg",
    sortOrder: 1,
  },
  {
    desktopUrl: "/bg_3.jpg",
    id: "10000000-0000-4000-8000-000000000003",
    key: "protection",
    mobileUrl: "/mobile_3.jpg",
    sortOrder: 2,
  },
] as const satisfies ReadonlyArray<WebsiteHeroFallbackSlide>;
