"use client";

import {
  ArrowRight,
  CircleCheckBig,
  FilePenLine,
  Globe2,
  TriangleAlert,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type {
  WebsiteConfigOverviewItem,
  WebsiteConfigOverviewStatus,
} from "@repo/shared";
import { PERMISSIONS } from "@repo/shared/constants";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { PageHeader } from "@/src/components/common/page-header";
import { PermissionGuard } from "@/src/components/permission-guard";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useWebsiteConfigOverview } from "@/src/hooks/use-website-config";
import { Link } from "@/src/i18n/navigation";
import { WebsiteConfigQueryState } from "../components/website-config-query-state";

const cards = {
  site: { href: "/website-config/site", icon: Globe2 },
} as const;

export function WebsiteConfigOverviewView() {
  const t = useTranslations("WebsiteConfig");
  const { user } = useAuth();
  const query = useWebsiteConfigOverview({ enabled: Boolean(user) });

  return (
    <PermissionGuard permissions={[PERMISSIONS.WEBSITE_CONFIG_VIEW]}>
      <div className="space-y-6">
        <PageHeader
          description={t("overview.description")}
          eyebrow={t("eyebrow")}
          title={t("overview.title")}
        />
        <WebsiteConfigQueryState
          isError={query.isError}
          isLoading={query.isLoading}
          onRetry={() => void query.refetch()}
        />
        {query.data ? (
          <>
            <OverviewSummary items={query.data.items} />
            <section
              aria-labelledby="website-config-domains"
              className="space-y-3"
            >
              <div>
                <h2
                  className="text-base font-semibold text-slate-950 dark:text-slate-50"
                  id="website-config-domains"
                >
                  {t("overview.domainsTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("overview.domainsDescription")}
                </p>
              </div>
              <div className="grid max-w-2xl gap-4">
                {query.data.items.map((item) => (
                  <OverviewCard item={item} key={item.key} />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </PermissionGuard>
  );
}

function OverviewSummary({ items }: { items: WebsiteConfigOverviewItem[] }) {
  const t = useTranslations("WebsiteConfig");
  const publishedCount = items.filter(
    (item) => item.publishedVersion !== null,
  ).length;
  const draftCount = items.filter((item) => item.hasUnpublishedChanges).length;
  const warningCount = items.reduce(
    (total, item) => total + item.validationWarningCount,
    0,
  );

  const metrics = [
    {
      icon: CircleCheckBig,
      label: t("overview.publishedDomains"),
      value: t("overview.domainCount", {
        count: publishedCount,
        total: items.length,
      }),
    },
    {
      icon: FilePenLine,
      label: t("overview.pendingDrafts"),
      value: String(draftCount),
    },
    {
      icon: TriangleAlert,
      label: t("overview.validationWarnings"),
      value: String(warningCount),
    },
  ];

  return (
    <section
      aria-label={t("overview.summaryLabel")}
      className="grid overflow-hidden rounded-lg border border-slate-200 bg-white sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-950"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            className={[
              "flex items-center gap-3 px-4 py-4 sm:px-5",
              index > 0
                ? "border-t border-slate-200 sm:border-l sm:border-t-0 dark:border-slate-800"
                : "",
            ].join(" ")}
            key={metric.label}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Icon aria-hidden="true" className="size-4" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-slate-950 dark:text-slate-50">
                {metric.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function OverviewCard({ item }: { item: WebsiteConfigOverviewItem }) {
  const t = useTranslations("WebsiteConfig");
  const format = useFormatter();
  const config = cards[item.key];
  const Icon = config.icon;
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <StatusBadge status={item.status} />
        </div>
        <CardTitle className="pt-2">{t(`overview.${item.key}`)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">
          {t(`overview.${item.key}Description`)}
        </p>
        <dl className="grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900/60">
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">
              {t("overview.draftLabel")}
            </dt>
            <dd className="mt-1 font-medium tabular-nums text-slate-950 dark:text-slate-50">
              v{item.draftVersion}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">
              {t("overview.publicLabel")}
            </dt>
            <dd className="mt-1 font-medium tabular-nums text-slate-950 dark:text-slate-50">
              {item.publishedVersion ? `v${item.publishedVersion}` : "—"}
            </dd>
          </div>
        </dl>
        <div className="min-h-10 text-xs text-slate-500 dark:text-slate-400">
          <p>
            {item.lastPublishedAt
              ? t("overview.lastPublished", {
                  value: format.dateTime(new Date(item.lastPublishedAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                })
              : t("status.neverPublished")}
          </p>
          {item.lastPublishedBy ? (
            <p className="mt-1">
              {t("overview.publishedBy", {
                name: item.lastPublishedBy.name,
              })}
            </p>
          ) : null}
          {item.validationWarningCount > 0 ? (
            <p className="mt-1 font-medium text-amber-700 dark:text-amber-400">
              {t("overview.warnings", {
                count: item.validationWarningCount,
              })}
            </p>
          ) : null}
        </div>
        <Button asChild className="mt-auto min-h-11 sm:min-h-9">
          <Link href={config.href}>
            {t("overview.open")}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: WebsiteConfigOverviewStatus }) {
  const t = useTranslations("WebsiteConfig");
  const label =
    status === "NOT_CONFIGURED"
      ? t("status.notConfigured")
      : status === "DRAFT"
        ? t("status.draft")
        : status === "PUBLISHED"
          ? t("status.published")
          : t("status.unpublishedChanges");
  return (
    <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>
      {label}
    </Badge>
  );
}
