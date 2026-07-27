import type {
  WebsiteLocale,
  WebsiteRevisionMeta,
  WebsiteTranslation,
  WebsiteVersionedMutation,
} from "./website-config-common.types.ts";

export type WebsiteAssetReference = {
  id: string;
  mimeType: string;
  url: string;
};

export type WebsiteOfficeText = {
  address: string;
  label: string;
};

export type WebsiteOffice = {
  id: string;
  isActive: boolean;
  phone: string | null;
  sortOrder: number;
  translations: Array<WebsiteTranslation<WebsiteOfficeText>>;
};

export type WebsiteSocialPlatform =
  | "FACEBOOK"
  | "ZALO"
  | "TIKTOK"
  | "YOUTUBE"
  | "OTHER";

export type WebsiteSocialLink = {
  id: string;
  isActive: boolean;
  label: string;
  platform: WebsiteSocialPlatform;
  sortOrder: number;
  url: string;
};

export type WebsiteSiteSetting = {
  contactEmail: string;
  footerLogo: WebsiteAssetReference | null;
  headerLogo: WebsiteAssetReference | null;
  offices: WebsiteOffice[];
  ogImage: WebsiteAssetReference | null;
  revision: WebsiteRevisionMeta;
  siteKey: string;
  socialLinks: WebsiteSocialLink[];
  websiteUrl: string;
};

export type UpdateWebsiteSiteSettingBody = WebsiteVersionedMutation & {
  contactEmail: string;
  footerLogoAssetId: string | null;
  headerLogoAssetId: string | null;
  offices: WebsiteOffice[];
  ogImageAssetId: string | null;
  socialLinks: WebsiteSocialLink[];
  websiteUrl: string;
};

export type PublicWebsiteSiteSetting = {
  contactEmail: string;
  footerLogo: WebsiteAssetReference | null;
  headerLogo: WebsiteAssetReference | null;
  locale: WebsiteLocale;
  offices: Array<Omit<WebsiteOffice, "translations"> & WebsiteOfficeText>;
  ogImage: WebsiteAssetReference | null;
  socialLinks: WebsiteSocialLink[];
  updatedAt: string;
  version: number;
  websiteUrl: string;
};
