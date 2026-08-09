"use client";

import Image from "next/image";
import { Container } from "@/src/components/common/container";
import { WarrantyPolicyShortcut } from "@/src/components/common/warranty-policy-shortcut";
import { Link } from "@/src/i18n/navigation";
import { useWarrantyClaimTracking } from "@/src/hooks/use-warranty-claim-tracking";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, FileText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { WarrantyBackLink } from "./components/warranty-back-link";
import { WarrantyClaimProgress } from "./components/warranty-claim-progress";
import { WarrantyTrackForm } from "./components/warranty-track-form";

const guideSteps = [{ id: "one" }, { id: "two" }, { id: "three" }] as const;

export function WarrantyTrackView() {
  const t = useTranslations("Warranty.track");
  const searchParams = useSearchParams();
  const { data, isPending, reset, track } = useWarrantyClaimTracking();
  const initialClaimCode = searchParams.get("claimCode") ?? "";

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <section className="relative flex h-[220px] w-full items-center overflow-hidden bg-deep-black sm:h-[280px]">
        <Image
          src="/708986914_976804048389364_3900113787497783781_n.jpg"
          alt={t("title")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-deep-black via-deep-black/80 to-transparent" />
        <Container className="relative z-20 max-w-[1400px] space-y-3">
          <span className="inline-block rounded-md bg-premium-red px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            {t("eyebrow")}
          </span>
          <h1 className="font-condensed text-3xl font-semibold uppercase leading-tight tracking-wider text-white sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-sm font-medium text-white/80 sm:text-base">
            {t("description")}
          </p>
        </Container>
      </section>

      <Container className="relative z-30 flex max-w-250 flex-col space-y-10 py-12 sm:py-20">
        <div className="border-b border-border-gray pb-6">
          <WarrantyBackLink />
        </div>

        <header className="mx-auto max-w-2xl space-y-2 text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-wider text-deep-black sm:text-3xl">
            {t("form.title")}
          </h2>
          <p className="text-sm text-stone-gray sm:text-base">
            {t("form.description")}
          </p>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-md border border-border-gray bg-white shadow-sm">
          <motion.section className="order-2" layout>
            <div className="mx-6 border-t border-border-gray py-6 sm:mx-10 sm:py-8">
              <WarrantyTrackForm
                initialValue={initialClaimCode}
                isPending={isPending}
                onSubmit={track}
                onValueChange={reset}
              />
            </div>

            <AnimatePresence mode="wait">
              {data ? (
                <motion.div
                  animate={{ opacity: 1, height: "auto" }}
                  className="mx-6 overflow-hidden border-t border-border-gray sm:mx-10"
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  key={data.claimCode}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  <WarrantyClaimProgress claim={data} embedded />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.section>

          <section className="order-1 p-6 sm:p-10">
            <div className="space-y-8">
              <div>
                <p className="text-center text-base font-semibold uppercase tracking-wider text-stone-gray">
                  {t("guide.title")}
                </p>
                <p className="mx-auto mt-2 max-w-xl text-center text-sm text-stone-gray">
                  {t("guide.description")}
                </p>
                <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                  {guideSteps.map((step) => (
                    <li
                      className="space-y-1 rounded-md border border-border-gray bg-surface-muted/70 p-4 text-center"
                      key={step.id}
                    >
                      <span className="inline-block rounded-md bg-premium-red/10 px-2.5 py-0.5 text-xs font-condensed font-semibold uppercase tracking-widest text-premium-red">
                        {t(`guide.steps.${step.id}.badge`)}
                      </span>
                      <h3 className="pt-1 text-sm font-semibold uppercase text-deep-black">
                        {t(`guide.steps.${step.id}.title`)}
                      </h3>
                      <p className="text-sm text-stone-gray">
                        {t(`guide.steps.${step.id}.description`)}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="border-t border-border-gray pt-6">
                <p className="text-center text-sm font-semibold uppercase tracking-wider text-stone-gray">
                  {t("otherActions.title")}
                </p>
                <div className="mt-4 grid gap-3 text-center text-xs font-semibold uppercase tracking-wide sm:grid-cols-3">
                  <Link
                    className="group flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:border-premium-red hover:bg-premium-red hover:text-white"
                    href={APP_ROUTES.warrantyActivate}
                  >
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>{t("otherActions.activate")}</span>
                  </Link>
                  <Link
                    className="group flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:border-premium-red hover:bg-premium-red hover:text-white"
                    href={APP_ROUTES.warrantyRequest}
                  >
                    <FileText className="size-4 shrink-0" />
                    <span>{t("otherActions.request")}</span>
                  </Link>
                  <Link
                    className="group flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:border-premium-red hover:bg-premium-red hover:text-white"
                    href={APP_ROUTES.dealers}
                  >
                    <Building2 className="size-4 shrink-0" />
                    <span>{t("otherActions.dealers")}</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <WarrantyPolicyShortcut />
      </Container>
    </main>
  );
}
