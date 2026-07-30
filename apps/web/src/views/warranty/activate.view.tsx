"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/src/components/common/container";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-request";
import { WarrantyActivationRequestForm } from "./components/warranty-activation-request-form";
import { WarrantyActivationSuccess } from "./components/warranty-activation-success";

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
    <main className="min-h-screen bg-white py-12 text-deep-black sm:py-20">
      <Container className="max-w-[1000px] space-y-10">
        <div className="space-y-4 text-center">
          <span className="text-sm font-semibold uppercase text-premium-red">
            {t("eyebrow")}
          </span>
          <h1 className="font-condensed text-3xl font-semibold uppercase sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-normal text-stone-gray sm:text-lg">
            {t("description")}
          </p>
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
