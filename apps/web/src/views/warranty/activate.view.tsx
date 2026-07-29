"use client";

import { Button } from "@repo/ui/button";
import { CheckCircle2, Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/src/components/common/container";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-request";
import { WarrantyActivationRequestForm } from "./components/warranty-activation-request-form";

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
    <main className="min-h-screen bg-surface-muted py-12 text-deep-black sm:py-20">
      <Container className="max-w-[1000px] space-y-12">
        <div className="space-y-4 text-center">
          <span className="inline-block rounded-md border border-premium-red/30 bg-premium-red/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-premium-red">
            {t("eyebrow")}
          </span>
          <h1 className="font-condensed text-3xl font-semibold uppercase tracking-wider sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-normal text-stone-gray sm:text-lg">
            {t("description")}
          </p>
        </div>

        {request ? (
          <div className="animate-in space-y-6 rounded-md border border-premium-red/30 bg-white p-8 text-center shadow-xl zoom-in-95 sm:p-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-md bg-premium-red/10 text-premium-red">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold uppercase text-deep-black sm:text-3xl">
                {t("success.title")}
              </h2>
              <p className="mx-auto max-w-xl text-base font-normal text-stone-gray">
                {t("success.description")}
              </p>
            </div>

            <div className="mx-auto grid max-w-lg gap-3 rounded-md bg-surface-muted p-5 text-left sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-stone-gray">
                  {t("success.requestCodeLabel")}
                </p>
                <p className="mt-1 font-mono text-base font-semibold text-deep-black">
                  {request.requestCode}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-stone-gray">
                  {t("success.statusLabel")}
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-premium-red">
                  <Clock3 className="size-4" />
                  {request.status === "PENDING"
                    ? t("success.pendingStatus")
                    : request.status}
                </p>
              </div>
            </div>

            <Button
              className="rounded-md bg-deep-black px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-premium-red"
              onClick={reset}
              type="button"
            >
              {t("success.reset")}
            </Button>
          </div>
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
