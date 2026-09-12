"use client";

import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@repo/ui";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";

type FullPageNotFoundProps = {
  embedded?: boolean;
};

export function FullPageNotFound({ embedded = false }: FullPageNotFoundProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("RouteStates");
  const routePath = `/${locale}${pathname === "/" ? "" : pathname}`;

  return (
    <main
      className={
        embedded
          ? "flex min-h-[32rem] items-center justify-center overflow-hidden bg-white px-6 py-16 dark:bg-slate-950 sm:px-10"
          : "flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16 dark:bg-slate-950 sm:px-10"
      }
    >
      <section className="w-full max-w-4xl text-center">
        <div className="inline-flex max-w-[calc(100vw-3rem)] items-center gap-2 overflow-hidden rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-slate-950 dark:bg-white"
          />
          <span className="shrink-0">{t("unknownRoute")}</span>
          <span aria-hidden="true" className="hidden">
            ·
          </span>
          <code className="max-w-44 truncate font-mono text-slate-950 dark:text-white sm:max-w-80">
            {routePath}
          </code>
        </div>

        <div className="mt-12 flex items-center gap-4 text-slate-950 dark:text-white sm:gap-8">
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-slate-300 dark:bg-slate-700"
          />
          <p className="text-8xl font-black leading-none tracking-[0.06em] sm:text-9xl">
            404
          </p>
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-slate-300 dark:bg-slate-700"
          />
        </div>

        <h1 className="mt-12 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          {t("notFoundTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-600 dark:text-slate-400">
          {t("notFoundDescription")}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            className="h-11 px-5"
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t("back")}
          </Button>
          <Button asChild className="h-11 px-5">
            <Link href="/dashboard">
              <LayoutDashboard aria-hidden="true" className="size-4" />
              {t("backToDashboard")}
            </Link>
          </Button>
        </div>

        <div className="mt-14 flex justify-center">
          <Image
            alt={t("brandName")}
            className="h-10 w-auto opacity-70 dark:opacity-80"
            height={40}
            src="/logo.png"
            width={200}
          />
        </div>
      </section>
    </main>
  );
}
