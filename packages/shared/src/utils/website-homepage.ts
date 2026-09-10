import { z } from "zod";
import { DEFAULT_WEBSITE_HOMEPAGE_CONTENT } from "../constants/website-homepage.constants.ts";
import type {
  WebsiteEditableText,
  WebsiteHomepageContentByLocale,
} from "../types/website-homepage.types.ts";

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
