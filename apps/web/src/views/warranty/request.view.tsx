"use client";

import { Container } from "@/src/components/common/container";
import { WarrantyResultRow } from "@/src/components/common/warranty-result-row";
import { useWarrantyClaimRequest } from "@/src/hooks/use-warranty-claim-request";
import { Link } from "@/src/i18n/navigation";
import { formatDate } from "@repo/shared";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  Hash,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { WarrantyClaimRequestForm } from "./components/warranty-claim-request-form";

export function WarrantyClaimRequestView() {
  const t = useTranslations("Warranty.request");
  const locale = useLocale();
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
          <section
            aria-live="polite"
            className="animate-in mx-auto max-w-3xl zoom-in-95"
          >
            <div className="border-b border-border-gray pb-6 text-center">
              <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-premium-red/10 text-premium-red">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </span>
              <div className="mt-4 min-w-0">
                <h2 className="text-xl font-semibold uppercase text-deep-black sm:text-2xl">
                  {t("success.title")}
                </h2>
                <p className="mt-2 max-w-2xl text-base leading-7 text-stone-gray">
                  {t("success.description")}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border-gray">
              <WarrantyResultRow
                icon={<Hash className="size-4" aria-hidden="true" />}
                label={t("success.claimCodeLabel")}
                value={
                  <div className="flex items-center justify-start gap-2 sm:justify-end">
                    <p className="min-w-0 break-all font-mono text-base font-semibold text-deep-black">
                      {claim.claimCode}
                    </p>
                    <Button
                      aria-label={
                        isCodeCopied
                          ? t("success.copied")
                          : t("success.copyCode")
                      }
                      className="size-9 shrink-0 rounded-md border-border-gray p-0 text-stone-gray hover:border-premium-red hover:bg-premium-red/5 hover:text-premium-red"
                      onClick={() => void copyClaimCode()}
                      title={
                        isCodeCopied
                          ? t("success.copied")
                          : t("success.copyCode")
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
                }
              />
              <WarrantyResultRow
                icon={<CircleAlert className="size-4" aria-hidden="true" />}
                label={t("success.issueLabel")}
                value={claim.issueTitle}
              />
              <WarrantyResultRow
                icon={<Calendar className="size-4" aria-hidden="true" />}
                label={t("success.submittedAtLabel")}
                value={formatDate(claim.submittedAt, {
                  locale,
                  showTime: true,
                })}
              />
              <WarrantyResultRow
                icon={<Clock3 className="size-4" aria-hidden="true" />}
                label={t("success.statusLabel")}
                value={
                  <Badge
                    className="gap-2 bg-premium-red/10 px-3 py-1.5 text-premium-red"
                    variant="destructive"
                  >
                    <Clock3 className="size-4" aria-hidden="true" />
                    {claim.status === "SUBMITTED"
                      ? t("success.submittedStatus")
                      : claim.status}
                  </Badge>
                }
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button
                asChild
                className="h-12 w-full rounded-md bg-premium-red px-8 text-xs font-semibold uppercase text-white hover:bg-warm-red"
              >
                <Link
                  href={{
                    pathname: "/warranty/track",
                    query: { claimCode: claim.claimCode },
                  }}
                >
                  {t("success.track")}
                </Link>
              </Button>
              <Button
                className="h-12 w-full rounded-md border-premium-red px-8 text-xs font-semibold uppercase text-premium-red transition-colors hover:bg-premium-red hover:text-white"
                onClick={resetForm}
                type="button"
                variant="outline"
              >
                {t("success.reset")}
              </Button>
            </div>
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
