"use client";

import { HttpClientError, type WebsiteLocale } from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import { Button, Card, CardContent } from "@repo/ui";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { usePermissions } from "@/src/hooks/use-permissions";
import {
  usePublishWebsiteSite,
  useSaveWebsiteSite,
  useWebsiteSite,
} from "@/src/hooks/use-website-config";
import { useToast } from "@/src/hooks/use-toast";
import { isWebsiteVersionConflict } from "@/src/lib/http-error.utils";
import { websiteConfigService } from "@/src/services/website-config/website-config.service";
import { PreviewDataDialog } from "../components/preview-data-dialog";
import { RevisionStatusBar } from "../components/revision-status-bar";
import { WebsiteConfigQueryState } from "../components/website-config-query-state";
import { WebsiteSiteConfigForm } from "./components/website-site-config-form";
import type { SiteAssetUrls, SiteDraft } from "./website-site-config.types";
import { toSiteDraft } from "./website-site-config.utils";

export function WebsiteSiteConfigView() {
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
    footerLogoUrl: "",
    headerLogoUrl: "",
    ogImageUrl: "",
  });
  const [dirty, setDirty] = useState(false);
  const conflict =
    isWebsiteVersionConflict(saveMutation.error) ||
    isWebsiteVersionConflict(publishMutation.error);

  useEffect(() => {
    if (!query.data) return;
    setForm(toSiteDraft(query.data));
    setAssets({
      footerLogoUrl: query.data.footerLogo?.url ?? "",
      headerLogoUrl: query.data.headerLogo?.url ?? "",
      ogImageUrl: query.data.ogImage?.url ?? "",
    });
    setDirty(false);
  }, [query.data]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  function change(updater: (current: SiteDraft) => SiteDraft) {
    setForm((current) => (current ? updater(current) : current));
    setDirty(true);
  }

  function showMutationError(error: unknown) {
    const field =
      error instanceof HttpClientError &&
      error.details &&
      typeof error.details === "object" &&
      "field" in error.details
        ? error.details.field
        : undefined;

    if (field === "contactEmail") {
      toast.error(t("toast.contactEmailInvalid"));
      return;
    }

    toast.error(
      error instanceof Error && error.message
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
      showMutationError(error);
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
      showMutationError(error);
    }
  }

  return (
    <PermissionGuard permissions={[PERMISSIONS.WEBSITE_CONFIG_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          actions={
            <PreviewDataDialog
              load={websiteConfigService.previewSite}
              locale={locale}
            />
          }
          description={t("site.description")}
          eyebrow={t("eyebrow")}
          title={t("site.title")}
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
        {conflict ? (
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-amber-950 dark:text-amber-100">
                  {t("states.conflict")}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {t("states.conflictDescription")}
                </p>
              </div>
              <Button
                onClick={() => void query.refetch()}
                type="button"
                variant="outline"
              >
                {t("actions.reload")}
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {form && query.data ? (
          <WebsiteSiteConfigForm
            assets={assets}
            canUpdate={canUpdate}
            form={form}
            locale={locale}
            onAssetsChange={setAssets}
            onChange={change}
            onLocaleChange={setLocale}
            site={query.data}
          />
        ) : null}
      </div>
    </PermissionGuard>
  );
}
