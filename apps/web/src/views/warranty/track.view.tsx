"use client";

import { Container } from "@/src/components/common/container";
import { WarrantyPolicyShortcut } from "@/src/components/common/warranty-policy-shortcut";
import { WarrantyProcessSteps } from "@/src/components/common/warranty-process-steps";
import { PUBLIC_DEALER_NETWORK_URL } from "@/src/config/public-features.config";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { useWarrantyTracking } from "@/src/hooks/use-warranty-tracking";
import { Link } from "@/src/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Clock3, FileText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { WarrantyActivationRequestProgress } from "./components/warranty-activation-request-progress";
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
  const { data, isPending, reset, track } = useWarrantyTracking();
  const initialTrackingCode =
    searchParams.get("requestCode") ?? searchParams.get("claimCode") ?? "";

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
        <div className="absolute inset-0 z-10 bg-linear-to-r from-deep-black via-deep-black/80 to-transparent" />
        <Container className="relative z-20 max-w-350 space-y-3">
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

        <WarrantyProcessSteps
          steps={guideSteps.map(({ id, number, Icon }) => ({
            number,
            Icon,
            badge: t(`guide.steps.${id}.badge`),
            title: t(`guide.steps.${id}.title`),
            description: t(`guide.steps.${id}.description`),
          }))}
        />

        {!data ? (
          <header className="mx-auto max-w-2xl space-y-2 text-center">
            <h3 className="text-2xl font-semibold uppercase tracking-wider text-deep-black sm:text-3xl">
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
            initialValue={initialTrackingCode}
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
                key={
                  data.kind === "activationRequest"
                    ? data.request.requestCode
                    : data.claim.claimCode
                }
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {data.kind === "activationRequest" ? (
                  <WarrantyActivationRequestProgress
                    embedded
                    request={data.request}
                  />
                ) : (
                  <WarrantyClaimProgress claim={data.claim} embedded />
                )}
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
            <a
              className="group flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:border-premium-red hover:bg-premium-red hover:text-white"
              href={PUBLIC_DEALER_NETWORK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Building2 className="size-4 shrink-0" />
              <span>{t("otherActions.dealers")}</span>
            </a>
          </div>
        </section>

        <WarrantyPolicyShortcut />
      </Container>
    </main>
  );
}
