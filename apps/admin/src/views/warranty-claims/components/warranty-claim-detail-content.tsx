"use client";

import {
  Clock3,
  FileText,
  Package,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
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
  formatClaimProduct,
  formatClaimServiceCenter,
} from "../warranty-claims.utils";
import { ClaimAttachmentsSection } from "./claim-attachments-section";

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
                [t("product"), formatClaimProduct(claim)],
                [t("serialNumber"), claim.product?.serialNumber ?? "-"],
                [t("productStatus"), claim.product?.status ?? "-"],
              ]}
            />
          </div>

          <div className="border-t border-slate-200 p-5 dark:border-slate-800 sm:p-6 md:border-t-0">
            <SectionHeading icon={ShieldCheck} title={t("warrantyInfo")} />
            <DetailTable
              className="mt-4"
              items={[
                [t("warrantyCode"), claim.warrantyCode],
                [t("warrantyStatus"), claim.warranty?.status ?? "-"],
                [t("startDate"), formatClaimDate(claim.warranty?.startDate)],
                [t("endDate"), formatClaimDate(claim.warranty?.endDate)],
              ]}
            />
          </div>
        </section>

        <TimelineSection timeline={timeline} />
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
  items: Array<[string, string]>;
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

function TimelineSection({
  timeline,
}: {
  timeline: WarrantyClaimTimelineItem[];
}) {
  const t = useTranslations("WarrantyClaims");

  return (
    <section className="p-5 sm:p-6">
      <SectionHeading icon={Clock3} title={t("timeline")} />
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("timelineDescription")}
      </p>

      {timeline.length > 0 ? (
        <ol className="mt-5 space-y-0">
          {timeline.map((event, index) => (
            <li className="flex gap-4" key={`${event.type}-${event.id}`}>
              <div className="flex flex-col items-center">
                <span className="mt-1.5 size-3 rounded-full border-2 border-slate-950 bg-white dark:border-slate-50 dark:bg-slate-950" />
                {index < timeline.length - 1 ? (
                  <span className="my-1 min-h-12 w-px flex-1 bg-slate-200 dark:bg-slate-800" />
                ) : null}
              </div>
              <div className="min-w-0 pb-6">
                <p className="font-medium text-slate-950 dark:text-slate-50">
                  {event.type === "STATUS_CHANGED"
                    ? `${event.fromStatus ? `${t(`statuses.${event.fromStatus}`)} → ` : ""}${t(`statuses.${event.toStatus}`)}`
                    : t(
                        event.type === "SERVICE_CENTER_CHANGED"
                          ? "serviceCenterChangedTimeline"
                          : "serviceCenterAssignedTimeline",
                      )}
                </p>
                {event.type !== "STATUS_CHANGED" ? (
                  <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {event.fromServiceCenter
                      ? `${event.fromServiceCenter.name} → `
                      : ""}
                    {event.toServiceCenter.name}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatClaimDateTime(event.createdAt)}
                  {event.changedBy?.fullName
                    ? ` · ${event.changedBy.fullName}`
                    : ""}
                </p>
                {(
                  event.type === "STATUS_CHANGED" ? event.note : event.reason
                ) ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {event.type === "STATUS_CHANGED"
                      ? event.note
                      : event.reason}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm text-slate-500">{t("noTimeline")}</p>
      )}
    </section>
  );
}
