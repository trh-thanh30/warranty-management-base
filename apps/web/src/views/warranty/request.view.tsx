"use client";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Check, CheckCircle2, Clock3, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Container } from "@/src/components/common/container";
import { useWarrantyClaimRequest } from "@/src/hooks/use-warranty-claim-request";
import { WarrantyClaimRequestForm } from "./components/warranty-claim-request-form";

export function WarrantyClaimRequestView() {
  const t = useTranslations("Warranty.request");
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const {
    data: claim,
    errorKind,
    isPending,
    reset,
    submit,
  } = useWarrantyClaimRequest();

  const copyClaimCode = async () => {
    if (!claim) return;

    try {
      await navigator.clipboard.writeText(claim.claimCode);
      setIsCodeCopied(true);
      window.setTimeout(() => setIsCodeCopied(false), 2000);
    } catch {
      setIsCodeCopied(false);
    }
  };

  const resetForm = () => {
    setIsCodeCopied(false);
    reset();
  };

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

        {claim ? (
          <section className="animate-in mx-auto max-w-2xl space-y-7 text-center zoom-in-95">
            <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-premium-red/10 text-premium-red">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold uppercase text-deep-black sm:text-2xl">
                {t("success.title")}
              </h2>
              <p className="mx-auto max-w-xl text-base font-normal text-stone-gray">
                {t("success.description")}
              </p>
            </div>

            <div className="grid gap-5 border-y border-border-gray py-5 text-left sm:grid-cols-2 sm:gap-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-stone-gray">
                  {t("success.claimCodeLabel")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="min-w-0 break-all font-mono text-base font-semibold text-deep-black">
                    {claim.claimCode}
                  </p>
                  <Button
                    aria-label={
                      isCodeCopied ? t("success.copied") : t("success.copyCode")
                    }
                    className="size-9 shrink-0 rounded-md border-border-gray p-0 text-stone-gray hover:border-premium-red hover:bg-premium-red/5 hover:text-premium-red"
                    onClick={() => void copyClaimCode()}
                    title={
                      isCodeCopied ? t("success.copied") : t("success.copyCode")
                    }
                    type="button"
                    variant="outline"
                  >
                    {isCodeCopied ? (
                      <Check className="size-4" aria-hidden="true" />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-stone-gray">
                  {t("success.statusLabel")}
                </p>
                <Badge
                  className="mt-2 gap-2 bg-premium-red/10 px-3 py-1.5 text-premium-red"
                  variant="destructive"
                >
                  <Clock3 className="size-4" aria-hidden="true" />
                  {claim.status === "SUBMITTED"
                    ? t("success.submittedStatus")
                    : claim.status}
                </Badge>
              </div>
            </div>

            <Button
              className="w-full rounded-md border-premium-red px-8 text-xs font-semibold uppercase text-premium-red transition-colors hover:bg-premium-red hover:text-white sm:w-auto"
              onClick={resetForm}
              type="button"
              variant="outline"
            >
              {t("success.reset")}
            </Button>
          </section>
        ) : (
          <div className="rounded-md border border-border-gray bg-white p-6 shadow-xl sm:p-10">
            <WarrantyClaimRequestForm
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
