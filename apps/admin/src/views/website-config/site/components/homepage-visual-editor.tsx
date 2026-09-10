"use client";

import { Puck, type Data } from "@puckeditor/core";
import type { WebsiteLocale } from "@repo/shared";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { SiteDraft, SiteDraftUpdater } from "../website-site-config.types";
import {
  fromHomepagePuckData,
  type HomepagePuckComponents,
  toHomepagePuckData,
} from "./homepage-puck.adapters";
import {
  createHomepagePuckConfig,
  getHomepageEditorPermissions,
} from "./homepage-puck.config";

export function HomepageVisualEditor({
  disabled,
  form,
  heroImageUrl,
  locale,
  onChange,
}: {
  disabled: boolean;
  form: SiteDraft;
  heroImageUrl: string;
  locale: WebsiteLocale;
  onChange: SiteDraftUpdater;
}) {
  const t = useTranslations("WebsiteConfig.site.homepageEditor");
  const [error, setError] = useState<string | null>(null);
  const copy = form.homepage.content[locale].landing;
  const data = useMemo(() => toHomepagePuckData(copy), [copy]);
  const config = useMemo(
    () => createHomepagePuckConfig({ heroImageUrl }),
    [heroImageUrl],
  );

  function update(next: Data<HomepagePuckComponents>) {
    try {
      const landing = fromHomepagePuckData(next);
      setError(null);
      onChange((current) => ({
        ...current,
        homepage: {
          ...current.homepage,
          content: {
            ...current.homepage.content,
            [locale]: {
              ...current.homepage.content[locale],
              landing,
            },
          },
        },
      }));
    } catch {
      setError(t("invalidData"));
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-950 dark:text-slate-50">
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {disabled ? t("readOnly") : t("description")}
        </p>
      </div>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="min-h-[720px] overflow-hidden rounded-lg border bg-white">
        <Puck
          config={config}
          data={data}
          height="720px"
          onChange={update}
          permissions={getHomepageEditorPermissions(disabled)}
          ui={{
            leftSideBarVisible: false,
            previewMode: disabled ? "interactive" : "edit",
            rightSideBarVisible: true,
          }}
          viewports={[
            { label: t("viewports.desktop"), width: 1440 },
            { label: t("viewports.tablet"), width: 768 },
            { label: t("viewports.mobile"), width: 390 },
          ]}
        />
      </div>
    </section>
  );
}
