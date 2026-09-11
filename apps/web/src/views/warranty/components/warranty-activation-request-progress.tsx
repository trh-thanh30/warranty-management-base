import { WarrantyResultRow } from "@/src/components/common/warranty-result-row";
import {
  formatDate,
  type PublicWarrantyActivationRequestStatus,
  type WarrantyActivationRequestStatus,
} from "@repo/shared";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Hash,
  RefreshCw,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type WarrantyActivationRequestProgressProps = {
  embedded?: boolean;
  request: PublicWarrantyActivationRequestStatus;
};

const STATUS_VARIANTS: Record<
  WarrantyActivationRequestStatus,
  "destructive" | "info" | "secondary" | "success" | "warning"
> = {
  ACTIVATED: "success",
  APPROVED: "info",
  CANCELLED: "secondary",
  PENDING: "warning",
  REJECTED: "destructive",
};

export function WarrantyActivationRequestProgress({
  embedded = false,
  request,
}: WarrantyActivationRequestProgressProps) {
  const locale = useLocale();
  const t = useTranslations("Warranty.track.activationResult");
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
          <p className="text-sm text-stone-gray">{t("requestCode")}</p>
          <h2 className="font-mono text-xl font-semibold">
            {request.requestCode}
          </h2>
        </div>
        <Badge
          className="w-fit px-3 py-1.5 text-sm font-semibold"
          variant={STATUS_VARIANTS[request.status]}
        >
          {t(`statuses.${request.status}`)}
        </Badge>
      </header>

      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
        <div className="divide-y divide-border-gray">
          <WarrantyResultRow
            icon={<Hash className="size-4" aria-hidden="true" />}
            label={t("requestCode")}
            value={request.requestCode}
          />
          <WarrantyResultRow
            icon={<Calendar className="size-4" aria-hidden="true" />}
            label={t("submittedAt")}
            value={formatDate(request.createdAt, {
              locale: dateLocale,
              showTime: true,
            })}
          />
          {request.reviewedAt ? (
            <WarrantyResultRow
              icon={<FileCheck2 className="size-4" aria-hidden="true" />}
              label={t("reviewedAt")}
              value={formatDate(request.reviewedAt, {
                locale: dateLocale,
                showTime: true,
              })}
            />
          ) : null}
          <WarrantyResultRow
            icon={<RefreshCw className="size-4" aria-hidden="true" />}
            label={t("updatedAt")}
            value={formatDate(request.updatedAt, {
              locale: dateLocale,
              showTime: true,
            })}
          />
        </div>

        <div
          className={cn(
            "rounded-md border p-5",
            request.status === "ACTIVATED"
              ? "border-success bg-success-surface"
              : request.status === "REJECTED"
                ? "border-premium-red/30 bg-premium-red/5"
                : "border-info-border bg-info-surface",
          )}
        >
          {request.status === "ACTIVATED" ? (
            <CheckCircle2
              className="size-6 text-success-text"
              aria-hidden="true"
            />
          ) : (
            <Clock3 className="size-6 text-info-text" aria-hidden="true" />
          )}
          <h3 className="mt-4 font-semibold text-deep-black">
            {t(`statuses.${request.status}`)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-gray">
            {t(`descriptions.${request.status}`)}
          </p>
        </div>
      </div>
    </section>
  );
}
