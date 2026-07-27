import { Construction, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge, Card, CardContent } from "@repo/ui";

export function WebsiteNavigationUpdatingState() {
  const t = useTranslations("WebsiteConfig.navigation");

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex min-h-96 items-center justify-center p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-72 rounded-full bg-slate-100/80 dark:bg-slate-900/60"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 size-64 rounded-full border-[40px] border-slate-100/70 dark:border-slate-900/50"
        />

        <section
          aria-labelledby="website-navigation-updating-title"
          className="relative z-10 mx-auto flex max-w-xl flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <div className="flex size-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Navigation aria-hidden="true" className="size-9" />
            </div>
            <div className="absolute -bottom-2 -right-3 flex size-9 items-center justify-center rounded-full border-4 border-white bg-amber-100 text-amber-700 dark:border-slate-950 dark:bg-amber-950 dark:text-amber-300">
              <Construction aria-hidden="true" className="size-4" />
            </div>
          </div>

          <Badge
            className="mb-4 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300"
            variant="outline"
          >
            {t("updatingBadge")}
          </Badge>
          <h2
            className="text-xl font-semibold text-slate-950 sm:text-2xl dark:text-slate-50"
            id="website-navigation-updating-title"
          >
            {t("updatingTitle")}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
            {t("updatingDescription")}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
