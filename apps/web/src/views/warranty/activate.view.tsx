"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Building2, Clock3, FileText, Send, ShieldCheck } from "lucide-react";
import { Container } from "@/src/components/common/container";
import { WarrantyPolicyShortcut } from "@/src/components/common/warranty-policy-shortcut";
import { WarrantyProcessSteps } from "@/src/components/common/warranty-process-steps";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-request";
import { Link } from "@/src/i18n/navigation";
import { WarrantyActivationRequestForm } from "./components/warranty-activation-request-form";
import { WarrantyActivationSuccess } from "./components/warranty-activation-success";
import { WarrantyBackLink } from "./components/warranty-back-link";

const activationGuideSteps = [
  { id: "one", number: "01", Icon: FileText },
  { id: "two", number: "02", Icon: Send },
  { id: "three", number: "03", Icon: ShieldCheck },
] as const;

export function WarrantyActivateView() {
  const t = useTranslations("Warranty.activate");
  const {
    data: request,
    errorKind,
    isPending,
    reset,
    submit,
  } = useWarrantyActivationRequest();

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <section className="relative flex h-[260px] w-full items-center overflow-hidden bg-deep-black sm:h-[360px]">
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

      <Container className="max-w-[1000px] space-y-10 py-12 sm:py-20">
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
          steps={activationGuideSteps.map(({ id, number, Icon }) => ({
            number,
            Icon,
            badge: t(`guide.steps.${id}.badge`),
            title: t(`guide.steps.${id}.title`),
            description: t(`guide.steps.${id}.description`),
          }))}
        />

        {!request ? (
          <header className="mx-auto max-w-2xl space-y-2 text-center">
            <h3 className="text-2xl font-semibold uppercase tracking-wider text-deep-black sm:text-3xl">
              {t("form.sectionTitle")}
            </h3>
            <p className="text-sm text-stone-gray sm:text-base">
              {t("form.sectionDescription")}
            </p>
          </header>
        ) : null}

        <section className="mx-auto w-full max-w-5xl rounded-md border border-border-gray bg-white p-6 shadow-xl sm:p-10">
          {request ? (
            <WarrantyActivationSuccess onReset={reset} request={request} />
          ) : (
            <WarrantyActivationRequestForm
              errorKind={errorKind}
              isPending={isPending}
              onResetError={reset}
              onSubmit={submit}
            />
          )}
        </section>

        <section className="mx-auto w-full max-w-5xl border-t border-border-gray pt-6">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-stone-gray">
            {t("otherActions.title")}
          </p>
          <div className="mt-4 grid gap-3 text-center text-xs font-semibold uppercase tracking-wide sm:grid-cols-3">
            <Link
              className="group flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:border-premium-red hover:bg-premium-red hover:text-white"
              href={APP_ROUTES.warrantyRequest}
            >
              <FileText className="size-4 shrink-0" />
              <span>{t("otherActions.request")}</span>
            </Link>
            <Link
              className="group flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:border-premium-red hover:bg-premium-red hover:text-white"
              href={APP_ROUTES.warrantyTrack}
            >
              <Clock3 className="size-4 shrink-0" />
              <span>{t("otherActions.track")}</span>
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
