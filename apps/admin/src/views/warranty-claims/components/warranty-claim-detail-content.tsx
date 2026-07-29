"use client";

import { FileText, Package, ShieldCheck, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type {
  WarrantyClaimAttachmentSummary,
  WarrantyClaimSummary,
  WarrantyClaimTimelineItem,
} from "@repo/shared";
import { Card, Table, TableBody, TableCell, TableRow } from "@repo/ui";
import {
  formatClaimCustomer,
  formatClaimDate,
  formatClaimDateTime,
  formatClaimServiceCenter,
} from "../warranty-claims.utils";
import { ClaimAttachmentsSection } from "./claim-attachments-section";
import {
  WarrantyClaimProductStatusBadge,
  WarrantyClaimWarrantyStatusBadge,
} from "./warranty-claim-related-status-badges";
import { WarrantyClaimTimeline } from "./warranty-claim-timeline";

type WarrantyClaimDetailContentProps = {
  canUpdate: boolean;
  claim: WarrantyClaimSummary;
  onAddAttachments: () => void;
  onRemoveAttachment: (attachment: WarrantyClaimAttachmentSummary) => void;
  timeline: WarrantyClaimTimelineItem[];
};

export function WarrantyClaimDetailContent({
  canUpdate,
  claim,
  onAddAttachments,
  onRemoveAttachment,
  timeline,
}: WarrantyClaimDetailContentProps) {
  const t = useTranslations("WarrantyClaims");
  const locale = useLocale();
  const product = claim.product;
  const warranty = claim.warranty;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card className="min-w-0 overflow-hidden">
        <section className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <SectionHeading icon={FileText} title={t("issueDetails")} />
          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">
            {claim.issueTitle}
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
            {claim.issueDetail ?? t("noIssueDetail")}
          </p>
        </section>

        <section className="grid border-b border-slate-200 dark:border-slate-800 md:grid-cols-2">
          <div className="p-5 sm:p-6 md:border-r md:border-slate-200 md:dark:border-slate-800">
            <SectionHeading icon={Package} title={t("productInfo")} />
            <DetailTable
              className="mt-4"
              items={[
                [t("product"), product?.name ?? "-"],
                [t("productCode"), product?.productCode ?? "-"],
                [t("serialNumber"), product?.serialNumber ?? "-"],
                [t("category"), product?.categoryRef.name ?? "-"],
                [
                  t("brandModel"),
                  [product?.brand, product?.model]
                    .filter(Boolean)
                    .join(" / ") || "-",
                ],
                [
                  t("modelYear"),
                  product?.modelYear ? String(product.modelYear) : "-",
                ],
                [
                  t("productStatus"),
                  <WarrantyClaimProductStatusBadge
                    key="product-status"
                    status={product?.status}
                  />,
                ],
              ]}
            />
          </div>

          <div className="border-t border-slate-200 p-5 dark:border-slate-800 sm:p-6 md:border-t-0">
            <SectionHeading icon={ShieldCheck} title={t("warrantyInfo")} />
            <DetailTable
              className="mt-4"
              items={[
                [t("warrantyCode"), claim.warrantyCode],
                [
                  t("warrantyStatus"),
                  <WarrantyClaimWarrantyStatusBadge
                    key="warranty-status"
                    status={warranty?.status}
                  />,
                ],
                [t("startDate"), formatClaimDate(warranty?.startDate)],
                [t("endDate"), formatClaimDate(warranty?.endDate)],
                [
                  t("durationMonths"),
                  warranty
                    ? t("durationMonthsValue", {
                        count: warranty.durationMonths,
                      })
                    : "-",
                ],
                [
                  t("coverageLimitAmount"),
                  formatMoneyLimit(
                    warranty?.coverageLimitAmount,
                    locale,
                    t("unlimited"),
                  ),
                ],
                [
                  t("maxClaimCount"),
                  warranty?.maxClaimCount === null ||
                  warranty?.maxClaimCount === undefined
                    ? t("unlimited")
                    : String(warranty.maxClaimCount),
                ],
                [
                  t("maxAmountPerClaim"),
                  formatMoneyLimit(
                    warranty?.maxAmountPerClaim,
                    locale,
                    t("unlimited"),
                  ),
                ],
              ]}
            />
          </div>
        </section>

        <WarrantyClaimTimeline claim={claim} timeline={timeline} />
      </Card>

      <Card className="overflow-hidden xl:sticky xl:top-24 xl:self-start">
        <section className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <SectionHeading icon={FileText} title={t("claimInfo")} />
          <DetailList
            className="mt-4"
            items={[
              [t("claimCode"), claim.claimCode],
              [t("submittedAt"), formatClaimDateTime(claim.submittedAt)],
              [t("dueAt"), formatClaimDate(claim.dueAt)],
              [t("resolvedAt"), formatClaimDateTime(claim.resolvedAt)],
            ]}
          />
        </section>

        <section className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <SectionHeading icon={UserRound} title={t("peopleAndService")} />
          <DetailList
            className="mt-4"
            items={[
              [t("customer"), formatClaimCustomer(claim)],
              [t("requesterName"), claim.requesterName ?? "-"],
              [t("requesterPhone"), claim.requesterPhone ?? "-"],
              [t("serviceCenter"), formatClaimServiceCenter(claim)],
            ]}
          />
        </section>

        <ClaimAttachmentsSection
          attachments={claim.attachments}
          canUpdate={canUpdate}
          onAdd={onAddAttachments}
          onRemove={onRemoveAttachment}
        />
      </Card>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof Package;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-slate-500" />
      <h2 className="font-semibold text-slate-950 dark:text-slate-50">
        {title}
      </h2>
    </div>
  );
}

function DetailList({
  className,
  items,
}: {
  className?: string;
  items: Array<[string, string]>;
}) {
  return (
    <dl className={`space-y-3 ${className ?? ""}`}>
      {items.map(([label, value]) => (
        <div
          className="grid gap-1 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]"
          key={label}
        >
          <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
          <dd className="min-w-0 break-words font-medium text-slate-950 dark:text-slate-50 sm:text-right">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DetailTable({
  className,
  items,
}: {
  className?: string;
  items: Array<[string, ReactNode]>;
}) {
  return (
    <div className={className}>
      <Table>
        <TableBody>
          {items.map(([label, value]) => (
            <TableRow key={label}>
              <TableCell className="w-[42%] pl-0 text-slate-500 dark:text-slate-400">
                {label}
              </TableCell>
              <TableCell className="break-words pr-0 text-right font-medium text-slate-950 dark:text-slate-50">
                {value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatMoneyLimit(
  value: string | null | undefined,
  locale: string,
  unlimitedLabel: string,
) {
  if (!value) return unlimitedLabel;

  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} VND`;

  return `${new Intl.NumberFormat(locale).format(amount)} VND`;
}
