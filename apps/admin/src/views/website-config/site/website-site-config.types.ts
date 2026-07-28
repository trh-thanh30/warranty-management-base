import type { UpdateWebsiteSiteSettingBody } from "@repo/shared";

export type SiteDraft = Omit<UpdateWebsiteSiteSettingBody, "expectedVersion">;

export type SiteDraftUpdater = (
  updater: (current: SiteDraft) => SiteDraft,
) => void;

export type SiteAssetUrls = {
  footerLogoUrl: string;
  headerLogoUrl: string;
  ogImageUrl: string;
};

export type SiteAssetUrlsUpdater = (
  updater: (current: SiteAssetUrls) => SiteAssetUrls,
) => void;
