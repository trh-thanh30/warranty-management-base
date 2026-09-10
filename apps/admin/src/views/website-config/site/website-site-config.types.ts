import type { UpdateWebsiteSiteSettingBody } from "@repo/shared";

export type SiteDraft = Omit<UpdateWebsiteSiteSettingBody, "expectedVersion">;

export type SiteDraftUpdater = (
  updater: (current: SiteDraft) => SiteDraft,
) => void;

export type SiteAssetUrls = {
  brandStoryImageUrl: string;
  footerLogoUrl: string;
  headerLogoUrl: string;
  ogImageUrl: string;
  technologyOriginImageUrl: string;
};

export type SiteAssetUrlsUpdater = (
  updater: (current: SiteAssetUrls) => SiteAssetUrls,
) => void;
