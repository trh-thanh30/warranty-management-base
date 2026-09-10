"use client";

import type { WebsiteLocale, WebsiteSiteSetting } from "@repo/shared";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui";
import { House, Image, Images, MapPin, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleTabs } from "../../components/locale-tabs";
import { HomepageHeroEditor, toPreviewUrl } from "../homepage-hero-editor";
import { ThumbnailUploadPanel } from "../thumbnail-upload-panel";
import type {
  SiteAssetUrls,
  SiteAssetUrlsUpdater,
  SiteDraft,
  SiteDraftUpdater,
} from "../website-site-config.types";
import { ContactEditor } from "./contact-editor";
import { HomepageVisualEditor } from "./homepage-visual-editor";
import { IdentityEditor } from "./identity-editor";
import { OfficeEditor } from "./office-editor";
import { SocialEditor } from "./social-editor";

export function WebsiteSiteConfigForm({
  assets,
  canUpdate,
  form,
  locale,
  onAssetsChange,
  onChange,
  onLocaleChange,
  site,
}: {
  assets: SiteAssetUrls;
  canUpdate: boolean;
  form: SiteDraft;
  locale: WebsiteLocale;
  onAssetsChange: SiteAssetUrlsUpdater;
  onChange: SiteDraftUpdater;
  onLocaleChange: (locale: WebsiteLocale) => void;
  site: WebsiteSiteSetting;
}) {
  const t = useTranslations("WebsiteConfig");

  return (
    <Tabs className="space-y-5" defaultValue="identity">
      <Card>
        <CardContent className="p-2">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-transparent p-0 lg:grid-cols-5">
            <ConfigTab
              icon={<Image aria-hidden="true" className="size-4" />}
              label={t("site.tabs.identity")}
              value="identity"
            />
            <ConfigTab
              icon={<House aria-hidden="true" className="size-4" />}
              label={t("site.tabs.homepage")}
              value="homepage"
            />
            <ConfigTab
              icon={<Images aria-hidden="true" className="size-4" />}
              label={t("site.tabs.thumbnails")}
              value="thumbnails"
            />
            <ConfigTab
              icon={<MapPin aria-hidden="true" className="size-4" />}
              label={t("site.tabs.contact")}
              value="contact"
            />
            <ConfigTab
              icon={<Share2 aria-hidden="true" className="size-4" />}
              label={t("site.tabs.socials")}
              value="socials"
            />
          </TabsList>
        </CardContent>
      </Card>

      <TabsContent className="mt-0" value="identity">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <IdentityEditor
              disabled={!canUpdate}
              footerLogo={{
                onChange: (assetId, url) => {
                  onChange((current) => ({
                    ...current,
                    footerLogoAssetId: assetId,
                  }));
                  onAssetsChange((current) => ({
                    ...current,
                    footerLogoUrl: url,
                  }));
                },
                persistedUrl: site.footerLogo?.url ?? "",
                url: assets.footerLogoUrl,
              }}
              headerLogo={{
                onChange: (assetId, url) => {
                  onChange((current) => ({
                    ...current,
                    headerLogoAssetId: assetId,
                  }));
                  onAssetsChange((current) => ({
                    ...current,
                    headerLogoUrl: url,
                  }));
                },
                persistedUrl: site.headerLogo?.url ?? "",
                url: assets.headerLogoUrl,
              }}
              ogImage={{
                onChange: (assetId, url) => {
                  onChange((current) => ({
                    ...current,
                    ogImageAssetId: assetId,
                  }));
                  onAssetsChange((current) => ({
                    ...current,
                    ogImageUrl: url,
                  }));
                },
                persistedUrl: site.ogImage?.url ?? "",
                url: assets.ogImageUrl,
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="mt-0" value="homepage">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="space-y-8">
              <LocaleTabs locale={locale} onChange={onLocaleChange} />
              <HomepageVisualEditor
                disabled={!canUpdate}
                form={form}
                heroImageUrl={toPreviewUrl(
                  site.heroSlides.find((slide) => slide.isActive)?.desktopImage
                    ?.url ?? "/hero/hero_5.jpg",
                )}
                locale={locale}
                onChange={onChange}
              />
              <div className="border-t" />
              <HomepageHeroEditor
                configuredSlides={site.heroSlides}
                disabled={!canUpdate}
                onChange={(heroSlides) =>
                  onChange((current) => ({ ...current, heroSlides }))
                }
                slides={form.heroSlides}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="mt-0" value="thumbnails">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <ThumbnailUploadPanel disabled={!canUpdate} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="mt-0" value="contact">
        <Card>
          <CardContent className="space-y-8 p-5 sm:p-6">
            <LocaleTabs locale={locale} onChange={onLocaleChange} />
            <OfficeEditor
              disabled={!canUpdate}
              form={form}
              locale={locale}
              onChange={onChange}
            />
            <ContactEditor
              disabled={!canUpdate}
              form={form}
              onChange={onChange}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent className="mt-0" value="socials">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <SocialEditor
              disabled={!canUpdate}
              form={form}
              onChange={onChange}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ConfigTab({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <TabsTrigger
      className="min-h-12 gap-2 px-4 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-slate-50 dark:data-[state=active]:text-slate-950"
      value={value}
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}
