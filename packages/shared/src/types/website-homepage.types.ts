import type { WebsiteLocale } from "./website-config-common.types.ts";

export type WebsiteTextStyle = {
  align: "left" | "center" | "right";
  bold: boolean;
  color: "default" | "muted" | "primary" | "inverse";
  font: "heading" | "body";
  italic: boolean;
  size: "s" | "m" | "l" | "xl" | "2xl";
};

export type WebsiteEditableText = WebsiteTextStyle & {
  content: string;
};

export type WebsiteHomepageCopy = {
  landing: {
    hero: {
      eyebrow: WebsiteEditableText;
      titlePrefix: WebsiteEditableText;
      titleHighlight: WebsiteEditableText;
      titleSuffix: WebsiteEditableText;
      description: WebsiteEditableText;
      primaryCta: WebsiteEditableText;
      dealerCta: WebsiteEditableText;
      uvPercent: number;
      originPercent: number;
      warrantyYears: number;
      uvLabel: WebsiteEditableText;
      originLabel: WebsiteEditableText;
      warrantyLabel: WebsiteEditableText;
      yearsSuffix: WebsiteEditableText;
    };
    brandHeritage: {
      brandLabel: WebsiteEditableText;
      headlineLine1: WebsiteEditableText;
      headlineLine2Prefix: WebsiteEditableText;
      headlineHighlight: WebsiteEditableText;
      headlineLine3: WebsiteEditableText;
      descriptionPrimary: WebsiteEditableText;
      descriptionSecondary: WebsiteEditableText;
      originEyebrow: WebsiteEditableText;
      originTitle: WebsiteEditableText;
      originDescriptionPrimary: WebsiteEditableText;
      originDescriptionSecondary: WebsiteEditableText;
    };
    coreTech: {
      eyebrow: WebsiteEditableText;
      title: WebsiteEditableText;
      description: WebsiteEditableText;
    };
    milestones: {
      eyebrow: WebsiteEditableText;
      title: WebsiteEditableText;
      description: WebsiteEditableText;
    };
    pillars: { eyebrow: WebsiteEditableText; title: WebsiteEditableText };
    network: {
      eyebrow: WebsiteEditableText;
      titlePrefix: WebsiteEditableText;
      titleSuffix: WebsiteEditableText;
      description: WebsiteEditableText;
      viewDealersCta: WebsiteEditableText;
    };
    testimonials: {
      eyebrow: WebsiteEditableText;
      title: WebsiteEditableText;
    };
    b2b: {
      eyebrow: WebsiteEditableText;
      title: WebsiteEditableText;
      description: WebsiteEditableText;
      partnerCta: WebsiteEditableText;
    };
  };
  about: {
    eyebrow: string;
    title: string;
    descriptionPrimary: string;
    descriptionSecondary: string;
    learnMore: string;
    hotlineLabel: string;
    imageAlt: string;
  };
  products: {
    eyebrow: string;
    title: string;
    description: string;
    explore: string;
    viewAll: string;
  };
  sputter: {
    eyebrow: string;
    title: string;
    descriptionPrimary: string;
    descriptionSecondary: string;
    learnMore: string;
    chamberImageAlt: string;
    structureImageAlt: string;
    warrantyYears: number;
    yearsSuffix: string;
    uvPercent: number;
    irPercent: number;
    warrantyLabel: string;
    uvLabel: string;
    irLabel: string;
    details: {
      warranty: { title: string; description: string };
      uv: { title: string; description: string };
      ir: { title: string; description: string };
    };
  };
  comparison: {
    eyebrow: string;
    description: string;
    bookNow: string;
    standardTitle: string;
    standardItems: [string, string, string];
    fujitekItems: [string, string, string];
  };
  faq: {
    eyebrow: string;
  };
};

export type WebsiteHomepageContentByLocale = Record<
  WebsiteLocale,
  WebsiteHomepageCopy
>;
