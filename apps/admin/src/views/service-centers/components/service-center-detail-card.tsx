"use client";

import type { ReactNode } from "react";
import type { ServiceCenterSummary } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { useTranslations } from "next-intl";
import { formatServiceCenterCreatedAt } from "../service-centers.utils";
import { ServiceCenterStatusBadge } from "./service-center-status-badge";

export function ServiceCenterDetailCard({
  serviceCenter,
}: {
  serviceCenter: ServiceCenterSummary;
}) {
  const t = useTranslations("ServiceCenters");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{serviceCenter.name}</CardTitle>
        <CardDescription>{serviceCenter.address}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <DetailSection title={t("locationDetails")}>
          <DetailItem label={t("province")} value={serviceCenter.province} />
          <DetailItem
            label={t("district")}
            value={serviceCenter.district ?? "-"}
          />
          <DetailItem label={t("address")} value={serviceCenter.address} />
        </DetailSection>
        <DetailSection title={t("contactDetails")}>
          <DetailItem label={t("phone")} value={serviceCenter.phone ?? "-"} />
          <DetailItem label={t("email")} value={serviceCenter.email ?? "-"} />
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {t("status")}
            </dt>
            <dd>
              <ServiceCenterStatusBadge isActive={serviceCenter.isActive} />
            </dd>
          </div>
          <DetailItem
            label={t("createdAt")}
            value={formatServiceCenterCreatedAt(serviceCenter.createdAt)}
          />
        </DetailSection>
      </CardContent>
    </Card>
  );
}

export function ServiceCenterDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-3 rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <h2 className="font-medium text-slate-950 dark:text-slate-50">{title}</h2>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium text-slate-950 dark:text-slate-50">
        {value}
      </dd>
    </div>
  );
}
