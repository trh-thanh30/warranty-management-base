import type { ContactSubmissionStatus } from "@repo/shared";
import { Badge } from "@repo/ui";
import { useTranslations } from "next-intl";

const STATUS_BADGE_CLASS_NAMES = {
  ARCHIVED:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
  IN_PROGRESS:
    "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  NEW: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  RESOLVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
} satisfies Record<ContactSubmissionStatus, string>;

export function ContactSubmissionStatusBadge({
  status,
}: {
  status: ContactSubmissionStatus;
}) {
  const t = useTranslations("ContactSubmissions");

  return (
    <Badge className={STATUS_BADGE_CLASS_NAMES[status]}>
      {t(`statuses.${status}`)}
    </Badge>
  );
}
