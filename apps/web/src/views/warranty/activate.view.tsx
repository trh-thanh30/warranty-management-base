"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/src/components/common/container";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-request";
import { WarrantyActivationRequestForm } from "./components/warranty-activation-request-form";
import { WarrantyActivationSuccess } from "./components/warranty-activation-success";
import { WarrantyBackLink } from "./components/warranty-back-link";

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

        {request ? (
          <WarrantyActivationSuccess onReset={reset} request={request} />
        ) : (
          <div className="rounded-md border border-border-gray bg-white p-6 shadow-xl sm:p-10">
            <WarrantyActivationRequestForm
              errorKind={errorKind}
              isPending={isPending}
              onResetError={reset}
              onSubmit={submit}
            />
          </div>
        )}
      </Container>
    </main>
  );
}
