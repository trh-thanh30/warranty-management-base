"use client";

import Image from "next/image";
import { Container } from "@/src/components/common/container";
import { WarrantyPolicyShortcut } from "@/src/components/common/warranty-policy-shortcut";
import { Link } from "@/src/i18n/navigation";
import { useWarrantyClaimTracking } from "@/src/hooks/use-warranty-claim-tracking";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Clock3, FileText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { WarrantyBackLink } from "./components/warranty-back-link";
import { WarrantyClaimProgress } from "./components/warranty-claim-progress";
import { WarrantyTrackForm } from "./components/warranty-track-form";

const guideSteps = [
  { id: "one", number: "01", Icon: FileText },
  { id: "two", number: "02", Icon: Clock3 },
  { id: "three", number: "03", Icon: ShieldCheck },
] as const;

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

        <section className="mx-auto w-full max-w-5xl px-0 py-2 sm:px-2 sm:py-4">
          <ol className="grid gap-6 sm:grid-cols-3">
            {guideSteps.map(({ id, number, Icon }) => (
              <li
                className="group flex h-[230px] flex-col justify-between rounded-md border border-border-gray bg-white p-6 text-left shadow-md transition-all hover:border-premium-red hover:shadow-xl"
                key={id}
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-md border border-border-gray bg-surface-muted text-stone-gray transition-colors group-hover:border-premium-red/30 group-hover:text-premium-red">
                    <Icon className="size-6" strokeWidth={1.8} />
                  </div>
                  <span className="font-condensed text-4xl font-semibold text-stone-gray/20 transition-colors group-hover:text-premium-red/30">
                    {number}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                    {t(`guide.steps.${id}.badge`)}
                  </span>
                  <h3 className="text-lg font-semibold uppercase text-deep-black transition-colors group-hover:text-premium-red sm:text-xl">
                    {t(`guide.steps.${id}.title`)}
                  </h3>
                  <p className="text-sm font-medium text-stone-gray">
                    {t(`guide.steps.${id}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {!data ? (
          <header className="mx-auto max-w-2xl space-y-2 text-center">
            <h3 className="text-xl font-semibold uppercase tracking-wider text-deep-black sm:text-2xl">
              {t("form.sectionTitle")}
            </h3>
            <p className="text-sm text-stone-gray sm:text-base">
              {t("form.sectionDescription")}
            </p>
          </header>
        ) : null}

        <motion.section
          className="mx-auto w-full max-w-5xl rounded-md border border-border-gray bg-white p-6 shadow-xl sm:p-10"
          layout
        >
          <WarrantyTrackForm
            initialValue={initialClaimCode}
            isPending={isPending}
            onSubmit={track}
            onValueChange={reset}
          />

          <AnimatePresence mode="wait">
            {data ? (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 overflow-hidden border-t border-border-gray pt-8"
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

        <section className="mx-auto w-full max-w-5xl border-t border-border-gray pt-6">
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
        </section>

        <WarrantyPolicyShortcut />
      </Container>
    </main>
  );
}
