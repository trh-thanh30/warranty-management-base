import type {
  WebsiteLocale,
  WebsiteRevisionMeta,
  WebsiteTranslation,
  WebsiteVersionedMutation,
} from "./website-config-common.types.ts";
import type {
  WebsiteHomepageContentByLocale,
  WebsiteHomepageCopy,
} from "./website-homepage.types.ts";

export type WebsiteAssetReference = {
  id: string;
  mimeType: string;
  url: string;
};

export type WebsiteHeroSlide = {
  desktopImage: WebsiteAssetReference | null;
  id: string;
  isActive: boolean;
  key: string;
  mobileImage: WebsiteAssetReference | null;
  sortOrder: number;
};

export type WebsiteHeroFallbackSlide = {
  desktopUrl: string;
  id: string;
  key: string;
  mobileUrl: string;
  sortOrder: number;
};

export type WebsiteHomepageDraft = {
  aboutImage: WebsiteAssetReference | null;
  content: WebsiteHomepageContentByLocale;
  sputterChamberImage: WebsiteAssetReference | null;
  sputterStructureImage: WebsiteAssetReference | null;
};

export type UpdateWebsiteHomepageBody = {
  aboutImageAssetId: string | null;
  content: WebsiteHomepageContentByLocale;
  sputterChamberImageAssetId: string | null;
  sputterStructureImageAssetId: string | null;
};

export type PublicWebsiteHomepage = {
  aboutImage: WebsiteAssetReference | null;
  copy: WebsiteHomepageCopy;
  sputterChamberImage: WebsiteAssetReference | null;
  sputterStructureImage: WebsiteAssetReference | null;
};

export type WebsiteOfficeText = {
  address: string;
  label: string;
};

export type WebsiteOffice = {
  id: string;
  isActive: boolean;
  isHeadquarters: boolean;
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
  heroSlides: WebsiteHeroSlide[];
  homepage: WebsiteHomepageDraft;
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
  heroSlides: Array<{
    desktopAssetId: string | null;
    id: string;
    isActive: boolean;
    key: string;
    mobileAssetId: string | null;
    sortOrder: number;
  }>;
  homepage: UpdateWebsiteHomepageBody;
  offices: WebsiteOffice[];
  ogImageAssetId: string | null;
  socialLinks: WebsiteSocialLink[];
  websiteUrl: string;
};

export type PublicWebsiteSiteSetting = {
  contactEmail: string;
  footerLogo: WebsiteAssetReference | null;
  headerLogo: WebsiteAssetReference | null;
  heroSlides: WebsiteHeroSlide[];
  homepage: PublicWebsiteHomepage;
  locale: WebsiteLocale;
  offices: Array<Omit<WebsiteOffice, "translations"> & WebsiteOfficeText>;
  ogImage: WebsiteAssetReference | null;
  socialLinks: WebsiteSocialLink[];
  updatedAt: string;
  version: number;
  websiteUrl: string;
};
