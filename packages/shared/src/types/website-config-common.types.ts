export const WEBSITE_LOCALES = ["vi", "en"] as const;

export type WebsiteLocale = (typeof WEBSITE_LOCALES)[number];

export type WebsiteRevisionState = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type WebsiteRevisionMeta = {
  draftVersion: number;
  publishedVersion: number | null;
  hasUnpublishedChanges: boolean;
  lastPublishedAt: string | null;
  lastPublishedBy: {
    id: string;
    name: string;
  } | null;
};

export type WebsiteTranslation<T> = T & {
  locale: WebsiteLocale;
};

export type WebsiteVersionedMutation = {
  expectedVersion: number;
};

export type WebsitePublishResult = {
  revision: WebsiteRevisionMeta;
};

export type WebsiteConfigErrorCode =
  | "WEBSITE_CONFIG_VERSION_CONFLICT"
  | "WEBSITE_CONFIG_PUBLISH_INVALID"
  | "WEBSITE_CONFIG_REQUIRED_LOCALE_MISSING"
  | "WEBSITE_CONFIG_ASSET_INVALID"
  | "WEBSITE_CONFIG_URL_INVALID"
  | "WEBSITE_CONFIG_REFERENCE_CONFLICT";

export type WebsiteValidationIssue = {
  code: WebsiteConfigErrorCode;
  field: string;
  message: string;
};
