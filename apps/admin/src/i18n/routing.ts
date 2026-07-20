import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
