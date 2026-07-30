import type {
  PublicWarrantyClaimSummary,
  WarrantyClaimPriority,
  WarrantyClaimStatus,
} from "@repo/shared";
import { formatDate } from "@repo/shared";
import { Check, Clock3, MapPin, Package, Wrench } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type WarrantyClaimProgressProps = {
  claim: PublicWarrantyClaimSummary;
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

export function WarrantyClaimProgress({ claim }: WarrantyClaimProgressProps) {
  const locale = useLocale();
  const t = useTranslations("Warranty.track");
  const dateLocale = locale === "vi" ? "vi-VN" : "en-US";

  return (
    <section className="overflow-hidden rounded-md border border-border-gray bg-white shadow-sm">
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
        <div className="space-y-7">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Detail
              label={t("result.warrantyCode")}
              value={claim.warrantyCode}
            />
            <Detail
              label={t("result.priority")}
              value={t(`priorities.${claim.priority as WarrantyClaimPriority}`)}
            />
            <Detail label={t("result.issue")} value={claim.issueTitle} />
            <Detail
              label={t("result.submittedAt")}
              value={formatDate(claim.submittedAt, {
                locale: dateLocale,
                showTime: true,
              })}
            />
            {claim.dueAt ? (
              <Detail
                label={t("result.dueAt")}
                value={formatDate(claim.dueAt, { locale: dateLocale })}
              />
            ) : null}
            {claim.resolvedAt ? (
              <Detail
                label={t("result.resolvedAt")}
                value={formatDate(claim.resolvedAt, {
                  locale: dateLocale,
                  showTime: true,
                })}
              />
            ) : null}
          </dl>

          {claim.product ? (
            <div className="flex gap-3 border-t border-border-gray pt-6">
              <Package className="mt-0.5 size-5 shrink-0 text-premium-red" />
              <div>
                <h3 className="text-sm font-semibold uppercase">
                  {t("result.product")}
                </h3>
                <p className="mt-1 text-sm text-stone-gray">
                  {[
                    claim.product.name,
                    claim.product.brand,
                    claim.product.model,
                  ]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
            </div>
          ) : null}

          {claim.serviceCenter ? (
            <div className="flex gap-3 border-t border-border-gray pt-6">
              <MapPin className="mt-0.5 size-5 shrink-0 text-premium-red" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold uppercase">
                  {t("result.serviceCenter")}
                </h3>
                <p className="text-sm font-medium">
                  {claim.serviceCenter.name}
                </p>
                <p className="text-sm text-stone-gray">
                  {[
                    claim.serviceCenter.address,
                    claim.serviceCenter.district,
                    claim.serviceCenter.province,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-sm text-stone-gray">
                  {[claim.serviceCenter.phone, claim.serviceCenter.email]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              </div>
            </div>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-stone-gray">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
