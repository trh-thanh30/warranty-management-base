"use client";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ListTodo,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { WarrantyClaimSummary } from "@repo/shared";
import { Button } from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { formatClaimDateTime } from "../warranty-claims.utils";
import {
  WarrantyClaimOverdueBadge,
  WarrantyClaimPriorityBadge,
  WarrantyClaimStatusBadge,
} from "./warranty-claim-badges";

type WarrantyClaimDetailHeaderProps = {
  canAssignServiceCenter: boolean;
  canUpdate: boolean;
  canUpdateStatus: boolean;
  claim: WarrantyClaimSummary;
  hasStatusTransitions: boolean;
  onAssignServiceCenter: () => void;
  onUpdatePriority: () => void;
  onUpdateStatus: () => void;
};

export function WarrantyClaimDetailHeader({
  canAssignServiceCenter,
  canUpdate,
  canUpdateStatus,
  claim,
  hasStatusTransitions,
  onAssignServiceCenter,
  onUpdatePriority,
  onUpdateStatus,
}: WarrantyClaimDetailHeaderProps) {
  const t = useTranslations("WarrantyClaims");

  return (
    <header className="space-y-4">
      <Button asChild size="sm" variant="ghost">
        <Link className="-ml-3 w-fit" href="/warranty-claims">
          <ArrowLeft className="size-4" />
          {t("backToDirectory")}
        </Link>
      </Button>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {t("detailTitle")}
          </p>
          <h1 className="mt-1 break-all font-mono text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
            {claim.claimCode}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <WarrantyClaimStatusBadge status={claim.status} />
            <WarrantyClaimPriorityBadge priority={claim.priority} />
            <WarrantyClaimOverdueBadge claim={claim} />
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CalendarClock className="size-4 shrink-0" />
            {t("submittedAt")}: {formatClaimDateTime(claim.submittedAt)}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end">
          {canAssignServiceCenter ? (
            <Button onClick={onAssignServiceCenter} variant="secondary">
              <Building2 className="size-4" />
              {t("assignServiceCenter")}
            </Button>
          ) : null}
          {canUpdate ? (
            <Button onClick={onUpdatePriority} variant="secondary">
              <SlidersHorizontal className="size-4" />
              {t("updatePriority")}
            </Button>
          ) : null}
          {canUpdateStatus && hasStatusTransitions ? (
            <Button onClick={onUpdateStatus}>
              <ListTodo className="size-4" />
              {t("updateStatus")}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
