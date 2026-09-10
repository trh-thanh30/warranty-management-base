"use client";

import { HttpClientError, type WebsiteLocale } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button, Card, CardContent } from "@repo/ui";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { Link } from "@/src/i18n/navigation";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  usePublishWebsiteSite,
  useSaveWebsiteSite,
  useWebsiteSite,
} from "@/src/hooks/use-website-config";
import { useToast } from "@/src/hooks/use-toast";
import { toPreviewUrl } from "./homepage-hero-editor";
import { HomepageVisualEditor } from "./components/homepage-visual-editor";
import { HomepageHeroEditor } from "./homepage-hero-editor";
import { LocaleTabs } from "../components/locale-tabs";
import { RevisionStatusBar } from "../components/revision-status-bar";
import { WebsiteConfigQueryState } from "../components/website-config-query-state";
import type { SiteAssetUrls, SiteDraft } from "./website-site-config.types";
import { toSiteDraft } from "./website-site-config.utils";

export function HomepageEditorView() {
  const t = useTranslations("WebsiteConfig");
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const canUpdate = hasPermission(PERMISSIONS.WEBSITE_CONFIG_UPDATE);
  const canPublish = hasPermission(PERMISSIONS.WEBSITE_CONFIG_PUBLISH);
  const query = useWebsiteSite({ enabled: Boolean(user) });
  const saveMutation = useSaveWebsiteSite();
  const publishMutation = usePublishWebsiteSite();
  const [locale, setLocale] = useState<WebsiteLocale>("vi");
  const [form, setForm] = useState<SiteDraft | null>(null);
  const [assets, setAssets] = useState<SiteAssetUrls>({
    brandStoryImageUrl: "",
    footerLogoUrl: "",
    headerLogoUrl: "",
    ogImageUrl: "",
    technologyOriginImageUrl: "",
  });
  const [dirty, setDirty] = useState(false);

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
    setDirty(false);
  }, [query.data]);

  function change(updater: (current: SiteDraft) => SiteDraft) {
    setForm((current) => (current ? updater(current) : current));
    setDirty(true);
  }

  function showError(error: unknown) {
    toast.error(
      error instanceof HttpClientError || error instanceof Error
        ? error.message
        : t("toast.error"),
    );
  }

  async function saveDraft() {
    if (!form || !query.data) return;
    try {
      await saveMutation.mutateAsync({
        ...form,
        expectedVersion: query.data.revision.draftVersion,
      });
      setDirty(false);
      toast.success(t("toast.saved"));
    } catch (error) {
      showError(error);
    }
  }

  async function publish() {
    if (!query.data) return;
    try {
      await publishMutation.mutateAsync({
        expectedVersion: query.data.revision.draftVersion,
      });
      setDirty(false);
      toast.success(t("toast.published"));
    } catch (error) {
      showError(error);
    }
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.WEBSITE_CONFIG_VIEW]}>
      <div className="space-y-6">
        <Button asChild variant="ghost">
          <Link href="/website-config/site">
            <ArrowLeft className="size-4" />
            {t("homepageEditor.backToSite")}
          </Link>
        </Button>
        <PageHeader
          description={t("homepageEditor.description")}
          eyebrow={t("eyebrow")}
          title={t("homepageEditor.title")}
        />
        <WebsiteConfigQueryState
          isError={query.isError}
          isLoading={query.isLoading}
          onRetry={() => void query.refetch()}
        />
        {query.data ? (
          <RevisionStatusBar
            canPublish={canPublish}
            canSave={canUpdate}
            hasUnsavedChanges={dirty}
            isPublishing={publishMutation.isPending}
            isSaving={saveMutation.isPending}
            onPublish={publish}
            onSave={saveDraft}
            revision={query.data.revision}
          />
        ) : null}
        {form && query.data ? (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <LocaleTabs locale={locale} onChange={setLocale} />
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
              />
              <div className="my-8 border-t" />
              <HomepageHeroEditor
                configuredSlides={query.data.heroSlides}
                disabled={!canUpdate}
                onChange={(heroSlides) =>
                  change((current) => ({ ...current, heroSlides }))
                }
                slides={form.heroSlides}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PermissionGuard>
  );
}
