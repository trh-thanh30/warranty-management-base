import { ArrowUpRight, Clock3, FileText } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";
import { contentPagesService } from "@/src/services/content-pages/content-pages.service";
import { POLICY_CONFIGS, toPolicyLocale } from "./policy.constants";

export async function PolicyView() {
  const [locale, t, pages] = await Promise.all([
    getLocale(),
    getTranslations("PolicyPage"),
    contentPagesService.listPublishedContentPages().catch(() => []),
  ]);
  const policyLocale = toPolicyLocale(locale);
  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black">
      <section className="border-b border-border-gray bg-white">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-9 bg-premium-red" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-premium-red">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-gray sm:text-lg">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 py-10 sm:py-14">
        {POLICY_CONFIGS.map((config) => {
          const page = pagesBySlug.get(config.slugs[policyLocale]);

          return (
            <Link
              className="group flex min-h-36 flex-col justify-between rounded-2xl border border-border-gray bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-premium-red hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:gap-8"
              href={config.href}
              key={config.key}
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-premium-red">
                  <FileText aria-hidden="true" className="size-4" />
                  <span>{t(`labels.${config.key}`)}</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-deep-black">
                  {page?.title ?? t(`titles.${config.key}`)}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-gray">
                  {page?.summary ?? t("missingCard")}
                </p>
              </div>
              <div className="mt-5 flex shrink-0 items-center justify-between gap-5 sm:mt-0">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-stone-gray">
                  <Clock3 aria-hidden="true" className="size-4" />
                  {page ? t("available") : t("unavailable")}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 text-premium-red transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
