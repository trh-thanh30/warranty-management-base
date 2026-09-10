import { z } from "zod";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "../constants/website-homepage.constants.ts";
import type {
  WebsiteEditableText,
  WebsiteHomepageContentByLocale,
} from "../types/website-homepage.types.ts";
import type { HomepagePreviewMessage } from "../types/website-site-setting.types.ts";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const editableTextSchema = z.object({
  align: z.enum(["left", "center", "right"]),
  bold: z.boolean(),
  color: z.enum(["default", "muted", "primary", "inverse"]),
  content: z.string(),
  font: z.enum(["heading", "body"]),
  italic: z.boolean(),
  size: z.enum(["s", "m", "l", "xl", "2xl"]),
});

export function isWebsiteEditableText(
  value: unknown,
): value is WebsiteEditableText {
  return editableTextSchema.safeParse(value).success;
}

function mergeHomepageValue(
  defaultValue: unknown,
  storedValue: unknown,
): unknown {
  if (isWebsiteEditableText(defaultValue)) {
    if (typeof storedValue === "string") {
      return { ...defaultValue, content: storedValue };
    }
    return isWebsiteEditableText(storedValue)
      ? structuredClone(storedValue)
      : structuredClone(defaultValue);
  }
  if (Array.isArray(defaultValue)) {
    return Array.isArray(storedValue)
      ? structuredClone(storedValue)
      : structuredClone(defaultValue);
  }
  if (!isPlainObject(defaultValue)) {
    return storedValue === undefined ? defaultValue : storedValue;
  }

  const storedObject = isPlainObject(storedValue) ? storedValue : {};
  return Object.fromEntries(
    Object.entries(defaultValue).map(([key, value]) => [
      key,
      mergeHomepageValue(value, storedObject[key]),
    ]),
  );
}

export function resolveWebsiteHomepageContent(
  storedValue: unknown,
): WebsiteHomepageContentByLocale {
  return mergeHomepageValue(
    DEFAULT_WEBSITE_HOMEPAGE_CONTENT,
    storedValue,
  ) as WebsiteHomepageContentByLocale;
}

const assetSchema = z
  .object({
    id: z.string(),
    mimeType: z.string(),
    url: z.string(),
  })
  .nullable();

const copySchema = z.object({
  landing: z.object({
    hero: z.object({
      eyebrow: editableTextSchema,
      titlePrefix: editableTextSchema,
      titleHighlight: editableTextSchema,
      titleSuffix: editableTextSchema,
      description: editableTextSchema,
      primaryCta: editableTextSchema,
      dealerCta: editableTextSchema,
      uvPercent: z.number(),
      originPercent: z.number(),
      warrantyYears: z.number(),
      uvLabel: editableTextSchema,
      originLabel: editableTextSchema,
      warrantyLabel: editableTextSchema,
      yearsSuffix: editableTextSchema,
    }),
    brandHeritage: z.object({
      brandLabel: editableTextSchema,
      headlineLine1: editableTextSchema,
      headlineLine2Prefix: editableTextSchema,
      headlineHighlight: editableTextSchema,
      headlineLine3: editableTextSchema,
      descriptionPrimary: editableTextSchema,
      descriptionSecondary: editableTextSchema,
      originEyebrow: editableTextSchema,
      originTitle: editableTextSchema,
      originDescriptionPrimary: editableTextSchema,
      originDescriptionSecondary: editableTextSchema,
    }),
    coreTech: z.object({
      eyebrow: editableTextSchema,
      title: editableTextSchema,
      description: editableTextSchema,
    }),
    milestones: z.object({
      eyebrow: editableTextSchema,
      title: editableTextSchema,
      description: editableTextSchema,
    }),
    pillars: z.object({
      eyebrow: editableTextSchema,
      title: editableTextSchema,
    }),
    network: z.object({
      eyebrow: editableTextSchema,
      titlePrefix: editableTextSchema,
      titleSuffix: editableTextSchema,
      description: editableTextSchema,
      viewDealersCta: editableTextSchema,
    }),
    testimonials: z.object({
      eyebrow: editableTextSchema,
      title: editableTextSchema,
    }),
    b2b: z.object({
      eyebrow: editableTextSchema,
      title: editableTextSchema,
      description: editableTextSchema,
      partnerCta: editableTextSchema,
    }),
  }),
  about: z.object({
    eyebrow: z.string(),
    title: z.string(),
    descriptionPrimary: z.string(),
    descriptionSecondary: z.string(),
    learnMore: z.string(),
    hotlineLabel: z.string(),
    imageAlt: z.string(),
  }),
  products: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    explore: z.string(),
    viewAll: z.string(),
  }),
  sputter: z.object({
    eyebrow: z.string(),
    title: z.string(),
    descriptionPrimary: z.string(),
    descriptionSecondary: z.string(),
    learnMore: z.string(),
    chamberImageAlt: z.string(),
    structureImageAlt: z.string(),
    warrantyYears: z.number(),
    yearsSuffix: z.string(),
    uvPercent: z.number(),
    irPercent: z.number(),
    warrantyLabel: z.string(),
    uvLabel: z.string(),
    irLabel: z.string(),
    details: z.object({
      warranty: z.object({ title: z.string(), description: z.string() }),
      uv: z.object({ title: z.string(), description: z.string() }),
      ir: z.object({ title: z.string(), description: z.string() }),
    }),
  }),
  comparison: z.object({
    eyebrow: z.string(),
    description: z.string(),
    bookNow: z.string(),
    standardTitle: z.string(),
    standardItems: z.tuple([z.string(), z.string(), z.string()]),
    fujitekItems: z.tuple([z.string(), z.string(), z.string()]),
  }),
  faq: z.object({ eyebrow: z.string() }),
});

const previewMessageSchema = z.object({
  data: z.object({
    heroSlides: z.array(
      z.object({
        desktopImage: assetSchema,
        id: z.string(),
        isActive: z.boolean(),
        key: z.string(),
        mobileImage: assetSchema,
        sortOrder: z.number(),
      }),
    ),
    homepage: z.object({
      aboutImage: assetSchema,
      copy: copySchema,
      sputterChamberImage: assetSchema,
      sputterStructureImage: assetSchema,
    }),
  }),
  locale: z.enum(["vi", "en"]),
  type: z.literal("warranty-homepage-preview:update"),
  version: z.literal(1),
});

export function isHomepagePreviewMessage(
  value: unknown,
): value is HomepagePreviewMessage {
  return previewMessageSchema.safeParse(value).success;
}
