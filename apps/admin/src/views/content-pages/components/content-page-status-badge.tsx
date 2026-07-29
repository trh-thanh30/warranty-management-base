import type { ContentPageStatus } from "@repo/shared";
import { Badge } from "@repo/ui";
import { useTranslations } from "next-intl";

export function ContentPageStatusBadge({
  status,
}: {
  status: ContentPageStatus;
}) {
  const t = useTranslations("ContentPages");
  const className =
    status === "PUBLISHED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
      : status === "ARCHIVED"
        ? "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300";
  return (
    <Badge className={className} variant="secondary">
      {t(`statuses.${status}`)}
    </Badge>
  );
}
