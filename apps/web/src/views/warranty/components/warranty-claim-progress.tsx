import { WarrantyResultRow } from "@/src/components/common/warranty-result-row";
import type {
  PublicWarrantyClaimSummary,
  WarrantyClaimPriority,
  WarrantyClaimStatus,
} from "@repo/shared";
import { formatDate } from "@repo/shared";
import {
  Calendar,
  Check,
  CircleAlert,
  Clock3,
  Flag,
  Hash,
  MapPin,
  Package,
  Wrench,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@repo/ui/lib/utils";

type WarrantyClaimProgressProps = {
  claim: PublicWarrantyClaimSummary;
  embedded?: boolean;
};

const STATUS_CLASS_NAMES: Record<WarrantyClaimStatus, string> = {
  SUBMITTED: "bg-light-gray text-charcoal",
  REVIEWING: "bg-accent-gold/15 text-charcoal",
  APPROVED: "bg-premium-red/10 text-premium-red",
  REJECTED: "bg-premium-red text-white",
  IN_REPAIR: "bg-accent-gold/25 text-deep-black",
  COMPLETED: "bg-deep-black text-white",
  CANCELLED: "bg-border-gray text-stone-gray",
};

export function WarrantyClaimProgress({
  claim,
  embedded = false,
}: WarrantyClaimProgressProps) {
  const locale = useLocale();
  const t = useTranslations("Warranty.track");
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <section
      className={cn(
        "overflow-hidden bg-white",
        !embedded && "rounded-md border border-border-gray shadow-sm",
      )}
    >
      <header className="flex flex-col gap-4 border-b border-border-gray p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-sm text-stone-gray">{t("result.claimCode")}</p>
          <h2 className="font-mono text-xl font-semibold">{claim.claimCode}</h2>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_CLASS_NAMES[claim.status]}`}
        >
          {t(`statuses.${claim.status}`)}
        </span>
      </header>

      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="divide-y divide-border-gray">
          <WarrantyResultRow
            icon={<Hash className="size-4" />}
            label={t("result.warrantyCode")}
            value={claim.warrantyCode}
          />
          <WarrantyResultRow
            icon={<Flag className="size-4" />}
            label={t("result.priority")}
            value={t(`priorities.${claim.priority as WarrantyClaimPriority}`)}
          />
          <WarrantyResultRow
            icon={<CircleAlert className="size-4" />}
            label={t("result.issue")}
            value={claim.issueTitle}
          />
          <WarrantyResultRow
            icon={<Calendar className="size-4" />}
            label={t("result.submittedAt")}
            value={formatDate(claim.submittedAt, {
              locale: dateLocale,
              showTime: true,
            })}
          />
          {claim.dueAt ? (
            <WarrantyResultRow
              icon={<Clock3 className="size-4" />}
              label={t("result.dueAt")}
              value={formatDate(claim.dueAt, { locale: dateLocale })}
            />
          ) : null}
          {claim.resolvedAt ? (
            <WarrantyResultRow
              icon={<Check className="size-4" />}
              label={t("result.resolvedAt")}
              value={formatDate(claim.resolvedAt, {
                locale: dateLocale,
                showTime: true,
              })}
            />
          ) : null}

          {claim.product ? (
            <WarrantyResultRow
              icon={<Package className="size-4" />}
              label={t("result.product")}
              value={[
                claim.product.name,
                claim.product.brand,
                claim.product.model,
              ]
                .filter(Boolean)
                .join(" - ")}
            />
          ) : null}

          {claim.serviceCenter ? (
            <WarrantyResultRow
              icon={<MapPin className="size-4" />}
              label={t("result.serviceCenter")}
              value={
                <span className="space-y-1">
                  <span className="block font-semibold text-deep-black">
                    {claim.serviceCenter.name}
                  </span>
                  <span className="block">
                    {[
                      claim.serviceCenter.address,
                      claim.serviceCenter.district,
                      claim.serviceCenter.province,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                  <span className="block">
                    {[claim.serviceCenter.phone, claim.serviceCenter.email]
                      .filter(Boolean)
                      .join(" - ")}
                  </span>
                </span>
              }
            />
          ) : null}
        </div>

        <div>
          <h3 className="mb-5 flex items-center gap-2 font-semibold uppercase">
            <Clock3 className="size-5 text-premium-red" />
            {t("timeline.title")}
          </h3>
          <ol className="space-y-0">
            {claim.timeline.map((event, index) => {
              const isLast = index === claim.timeline.length - 1;
              const label =
                event.type === "STATUS_CHANGED"
                  ? t("timeline.statusChanged", {
                      status: t(`statuses.${event.status}`),
                    })
                  : t(
                      event.type === "SERVICE_CENTER_ASSIGNED"
                        ? "timeline.serviceCenterAssigned"
                        : "timeline.serviceCenterChanged",
                      { name: event.serviceCenterName },
                    );

              return (
                <li
                  className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-6 last:pb-0"
                  key={`${event.type}-${event.createdAt}-${index}`}
                >
                  {!isLast ? (
                    <span className="absolute bottom-0 left-3.5 top-7 w-px bg-border-gray" />
                  ) : null}
                  <span className="relative z-10 flex size-7 items-center justify-center rounded-full bg-premium-red text-white">
                    {event.type === "STATUS_CHANGED" ? (
                      <Check className="size-4" />
                    ) : (
                      <Wrench className="size-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <time className="mt-1 block text-xs text-stone-gray">
                      {formatDate(event.createdAt, {
                        locale: dateLocale,
                        showTime: true,
                      })}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
