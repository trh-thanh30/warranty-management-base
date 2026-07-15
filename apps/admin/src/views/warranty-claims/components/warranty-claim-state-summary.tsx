"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { WarrantyClaimSummary } from "@repo/shared";
import { formatClaimDate } from "../warranty-claims.utils";
import {
  WarrantyClaimOverdueBadge,
  WarrantyClaimPriorityBadge,
  WarrantyClaimStatusBadge,
} from "./warranty-claim-badges";

type WarrantyClaimStateSummaryProps = {
  claim: WarrantyClaimSummary;
};

function StateItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 py-3 sm:px-4 sm:first:pl-0 sm:last:pr-0">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
        {children}
      </dd>
    </div>
  );
}

export function WarrantyClaimStateSummary({
  claim,
}: WarrantyClaimStateSummaryProps) {
  const t = useTranslations("WarrantyClaims");

  return (
    <dl className="mt-4 grid divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <StateItem label={t("status")}>
        <WarrantyClaimStatusBadge status={claim.status} />
      </StateItem>
      <StateItem label={t("priority")}>
        <WarrantyClaimPriorityBadge priority={claim.priority} />
      </StateItem>
      <StateItem label={t("slaLabel")}>
        <WarrantyClaimOverdueBadge claim={claim} />
        {claim.dueAt ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("slaDueDate", { date: formatClaimDate(claim.dueAt) })}
          </span>
        ) : null}
      </StateItem>
    </dl>
  );
}
