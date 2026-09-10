"use client";

import type { WebsiteLocale } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  usePublishWebsiteSite,
  useSaveWebsiteSite,
  useWebsiteSite,
} from "@/src/hooks/use-website-config";
import { useToast } from "@/src/hooks/use-toast";
import { toPreviewUrl } from "./homepage-hero-editor";
import { HomepageVisualEditor } from "./components/homepage-visual-editor";
import type { SiteAssetUrls, SiteDraft } from "./website-site-config.types";
import { toSiteDraft } from "./website-site-config.utils";

export function HomepageEditorView() {
  const t = useTranslations("WebsiteConfig");
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const canUpdate = hasPermission(PERMISSIONS.WEBSITE_CONFIG_UPDATE);
  const query = useWebsiteSite({ enabled: Boolean(user) });
  const saveMutation = useSaveWebsiteSite();
  const publishMutation = usePublishWebsiteSite();
  const locale: WebsiteLocale = "vi";
  const [form, setForm] = useState<SiteDraft | null>(null);
  const [assets, setAssets] = useState<SiteAssetUrls>({
    brandStoryImageUrl: "",
    footerLogoUrl: "",
    headerLogoUrl: "",
    ogImageUrl: "",
    technologyOriginImageUrl: "",
  });

  useEffect(() => {
    if (!query.data) return;
    setForm(toSiteDraft(query.data));
    setAssets({
      brandStoryImageUrl: query.data.homepage.aboutImage?.url ?? "",
      footerLogoUrl: query.data.footerLogo?.url ?? "",
      headerLogoUrl: query.data.headerLogo?.url ?? "",
      ogImageUrl: query.data.ogImage?.url ?? "",
      technologyOriginImageUrl:
        query.data.homepage.sputterChamberImage?.url ?? "",
    });
  }, [query.data]);

  function change(updater: (current: SiteDraft) => SiteDraft) {
    setForm((current) => (current ? updater(current) : current));
  }

  async function publish() {
    if (!query.data || !form) return;
    try {
      await saveMutation.mutateAsync({
        ...form,
        expectedVersion: query.data.revision.draftVersion,
      });
      const refreshed = await query.refetch();
      await publishMutation.mutateAsync({
        expectedVersion:
          refreshed.data?.revision.draftVersion ??
          query.data.revision.draftVersion,
      });
      toast.success(t("toast.published"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.error"));
    }
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.WEBSITE_CONFIG_VIEW]}>
      <div className="min-h-screen">
        {form && query.data ? (
          <HomepageVisualEditor
            disabled={!canUpdate}
            form={form}
            heroImageUrl={toPreviewUrl(
              query.data.heroSlides.find((slide) => slide.isActive)
                ?.desktopImage?.url ?? "/hero/hero_5.jpg",
            )}
            imageUrls={assets}
            locale={locale}
            onAssetsChange={setAssets}
            onChange={change}
            onPublish={publish}
            standalone
          />
        ) : null}
      </div>
    </PermissionGuard>
  );
}
