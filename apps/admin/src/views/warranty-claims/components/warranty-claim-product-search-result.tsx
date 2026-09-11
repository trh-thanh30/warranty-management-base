import type { WarrantyListItem } from "@repo/shared";
import { useLocale, useTranslations } from "next-intl";
import { formatClaimDate } from "../warranty-claims.utils";

type WarrantyClaimProductSearchResultProps = {
  warranty: WarrantyListItem;
};

export function WarrantyClaimProductSearchResult({
  warranty,
}: WarrantyClaimProductSearchResultProps) {
  const locale = useLocale();
  const t = useTranslations("WarrantyClaims");
  const productName = warranty.product.displayName ?? warranty.product.name;

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="min-w-0 font-semibold text-slate-950 dark:text-slate-50">
          {warranty.warrantyCode}
        </span>
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          {t(`warrantyStatuses.${warranty.status}`)}
        </span>
      </span>
      <span className="grid min-w-0 gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
        <span className="truncate">
          {productName} · {warranty.product.productCode}
        </span>
        <span className="truncate">
          {warranty.serialNumber ?? "-"} · {warranty.owner?.fullName ?? "-"}
        </span>
        <span className="truncate sm:col-span-2">
          {formatClaimDate(warranty.startDate, locale)} –{" "}
          {formatClaimDate(warranty.endDate, locale)}
        </span>
        {warranty.openClaim ? (
          <span className="font-medium text-amber-700 dark:text-amber-300 sm:col-span-2">
            {t("openClaimOption", {
              claimCode: warranty.openClaim.claimCode,
              status: t(`statuses.${warranty.openClaim.status}`),
            })}
          </span>
        ) : null}
      </span>
    </span>
  );
}
