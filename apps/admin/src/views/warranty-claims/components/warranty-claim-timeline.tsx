"use client";

import type {
  WarrantyClaimStatus,
  WarrantyClaimSummary,
  WarrantyClaimTimelineItem,
} from "@repo/shared";
import { Badge } from "@repo/ui";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  MessageSquareText,
  SearchCheck,
  Send,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";
import { formatClaimDateTime } from "../warranty-claims.utils";
import { WarrantyClaimStatusBadge } from "./warranty-claim-badges";

type WarrantyClaimTimelineProps = {
  claim: WarrantyClaimSummary;
  timeline: WarrantyClaimTimelineItem[];
};

const STATUS_TIMELINE_ICONS = {
  SUBMITTED: Send,
  REVIEWING: SearchCheck,
  APPROVED: BadgeCheck,
  REJECTED: XCircle,
  IN_REPAIR: Wrench,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
} satisfies Record<WarrantyClaimStatus, typeof Send>;

export function WarrantyClaimTimeline({
  claim,
  timeline,
}: WarrantyClaimTimelineProps) {
  const t = useTranslations("WarrantyClaims");
  const events = includeSubmittedEvent(claim, timeline);

  return (
    <section className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Clock3
          aria-hidden="true"
          className="size-4 text-slate-500 dark:text-slate-400"
        />
        <h2 className="font-semibold text-slate-950 dark:text-slate-50">
          {t("timeline")}
        </h2>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t("timelineDescription")}
      </p>

      {events.length > 0 ? (
        <ol className="mt-5">
          {events.map((event, index) => {
            const Icon =
              event.type === "STATUS_CHANGED"
                ? STATUS_TIMELINE_ICONS[event.toStatus]
                : Building2;
            const actor = formatTimelineActor(event);
            const note =
              event.type === "STATUS_CHANGED" ? event.note : event.reason;

            return (
              <li
                className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3"
                key={`${event.type}-${event.id}`}
              >
                <div className="flex flex-col items-center">
                  <span className="relative z-10 flex size-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  {index < events.length - 1 ? (
                    <span className="my-1 min-h-8 w-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  ) : null}
                </div>

                <article
                  className={`min-w-0 pb-5 ${
                    index < events.length - 1
                      ? "mb-5 border-b border-slate-200 dark:border-slate-800"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950 dark:text-slate-50">
                        {getTimelineTitle(event, t)}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {event.type === "STATUS_CHANGED"
                          ? t(`statusProgress.steps.${event.toStatus}`)
                          : getServiceCenterDescription(event)}
                      </p>
                    </div>
                    {event.type === "STATUS_CHANGED" ? (
                      <WarrantyClaimStatusBadge status={event.toStatus} />
                    ) : (
                      <Badge
                        className="whitespace-nowrap"
                        variant={
                          event.type === "SERVICE_CENTER_CHANGED"
                            ? "accent"
                            : "info"
                        }
                      >
                        {t(
                          event.type === "SERVICE_CENTER_CHANGED"
                            ? "serviceCenterChangedTimeline"
                            : "serviceCenterAssignedTimeline",
                        )}
                      </Badge>
                    )}
                  </div>

                  <TimelineDetailsDisclosure
                    actor={actor}
                    createdAt={event.createdAt}
                    note={note}
                    noteLabel={t(
                      event.type === "STATUS_CHANGED"
                        ? "timelineNote"
                        : "timelineReason",
                    )}
                  />
                </article>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-md border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <CircleDot aria-hidden="true" className="size-4" />
          {t("noTimeline")}
        </div>
      )}
    </section>
  );
}

function TimelineDetailsDisclosure({
  actor,
  createdAt,
  note,
  noteLabel,
}: {
  actor: string | null;
  createdAt: string;
  note: string | null;
  noteLabel: string;
}) {
  const locale = useLocale();
  const t = useTranslations("WarrantyClaims");
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  const label = t("timelineDetails");

  return (
    <div className="mt-3">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        aria-label={t(
          isOpen ? "collapseTimelineDetail" : "expandTimelineDetail",
          { label },
        )}
        className="flex w-full items-center gap-2 rounded-sm py-1 text-left text-sm font-medium text-slate-600 outline-none transition-colors hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:text-slate-50 dark:focus-visible:ring-blue-400"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Clock3 aria-hidden="true" className="size-4 shrink-0" />
        <span className="flex-1">{label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        aria-hidden={!isOpen}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        id={contentId}
      >
        <div className="overflow-hidden">
          <div className="mt-2 border-l-2 border-slate-200 pb-1 pl-3 dark:border-slate-700">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 aria-hidden="true" className="size-3.5" />
                {formatClaimDateTime(createdAt, locale)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound aria-hidden="true" className="size-3.5" />
                {t("timelineUpdatedBy", {
                  name: actor ?? t("timelineSystemActor"),
                })}
              </span>
            </div>

            {note ? (
              <div className="mt-3 flex items-start gap-2 text-sm">
                <MessageSquareText
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {noteLabel}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap wrap-break-word leading-6 text-slate-700 dark:text-slate-200">
                    {note}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function includeSubmittedEvent(
  claim: WarrantyClaimSummary,
  timeline: WarrantyClaimTimelineItem[],
): WarrantyClaimTimelineItem[] {
  const hasSubmittedEvent = timeline.some(
    (event) =>
      event.type === "STATUS_CHANGED" && event.toStatus === "SUBMITTED",
  );

  if (hasSubmittedEvent) return timeline;

  return [
    {
      changedBy: null,
      changedByUserId: null,
      createdAt: claim.submittedAt,
      fromStatus: null,
      id: `${claim.id}-submitted`,
      note: null,
      toStatus: "SUBMITTED",
      type: "STATUS_CHANGED",
    },
    ...timeline,
  ];
}

function getTimelineTitle(
  event: WarrantyClaimTimelineItem,
  t: ReturnType<typeof useTranslations<"WarrantyClaims">>,
) {
  if (event.type !== "STATUS_CHANGED") {
    return t(
      event.type === "SERVICE_CENTER_CHANGED"
        ? "serviceCenterChangedTimeline"
        : "serviceCenterAssignedTimeline",
    );
  }

  return `${event.fromStatus ? `${t(`statuses.${event.fromStatus}`)} → ` : ""}${t(`statuses.${event.toStatus}`)}`;
}

function getServiceCenterDescription(
  event: Exclude<WarrantyClaimTimelineItem, { type: "STATUS_CHANGED" }>,
) {
  return `${event.fromServiceCenter ? `${event.fromServiceCenter.name} → ` : ""}${event.toServiceCenter.name}`;
}

function formatTimelineActor(event: WarrantyClaimTimelineItem) {
  return (
    event.changedBy?.fullName ??
    event.changedBy?.username ??
    event.changedBy?.email ??
    null
  );
}
