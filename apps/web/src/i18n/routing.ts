import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
  pathnames: {
    "/": "/",
    "/about": {
      vi: "/gioi-thieu",
      en: "/about",
    },
    "/products": {
      vi: "/san-pham",
      en: "/products",
    },
    "/products/[slug]": {
      vi: "/san-pham/[slug]",
      en: "/products/[slug]",
    },
    "/warranty": {
      vi: "/bao-hanh",
      en: "/warranty",
    },
    "/warranty/lookup": {
      vi: "/bao-hanh/tra-cuu",
      en: "/warranty/lookup",
    },
    "/warranty/activate": {
      vi: "/bao-hanh/kich-hoat",
      en: "/warranty/activate",
    },
    "/warranty/request": {
      vi: "/bao-hanh/yeu-cau",
      en: "/warranty/request",
    },
    "/warranty/track": {
      vi: "/bao-hanh/theo-doi",
      en: "/warranty/track",
    },
    "/dealers": {
      vi: "/he-thong-dai-ly",
      en: "/dealers",
    },
    "/support-centers": {
      vi: "/trung-tam-ho-tro",
      en: "/support-centers",
    },
    "/contact": {
      vi: "/lien-he",
      en: "/contact",
    },
    "/guide": {
      vi: "/huong-dan",
      en: "/guide",
    },
    "/policies": {
      vi: "/chinh-sach",
      en: "/policies",
    },
    "/policies/general": {
      vi: "/chinh-sach-quy-dinh-chung",
      en: "/policies/general",
    },
    "/policies/privacy": {
      vi: "/chinh-sach-bao-mat",
      en: "/policies/privacy",
    },
    "/policies/purchasing": {
      vi: "/chinh-sach-mua-hang",
      en: "/policies/purchasing",
    },
    "/policies/warranty-return": {
      vi: "/chinh-sach-bao-hanh-doi-tra",
      en: "/policies/warranty-return",
    },
    "/policies/shipping": {
      vi: "/chinh-sach-giao-hang",
      en: "/policies/shipping",
    },
    "/policies/payment": {
      vi: "/chinh-sach-thanh-toan",
      en: "/policies/payment",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
