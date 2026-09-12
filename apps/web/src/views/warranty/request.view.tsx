"use client";

import { WarrantyProcessSteps } from "@/src/components/common/warranty-process-steps";
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
  FileText,
  Hash,
  Send,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { WarrantyClaimRequestForm } from "./components/warranty-claim-request-form";
import { WarrantyFormCard } from "./components/warranty-form-card";
import { WarrantyOtherActions } from "./components/warranty-other-actions";
import { WarrantyPageHeading } from "./components/warranty-page-heading";
import { WarrantyServicePageShell } from "./components/warranty-service-page-shell";

const requestGuideSteps = [
  { id: "one", number: "01", Icon: FileText },
  { id: "two", number: "02", Icon: Send },
  { id: "three", number: "03", Icon: Clock3 },
] as const;

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
    <WarrantyServicePageShell
      hero={{
        alt: t("title"),
        description: t("description"),
        eyebrow: t("eyebrow"),
        title: t("title"),
      }}
    >
      <WarrantyPageHeading
        description={t("form.description")}
        title={t("form.title")}
      />

      <WarrantyProcessSteps
        steps={requestGuideSteps.map(({ id, number, Icon }) => ({
          number,
          Icon,
          badge: t(`guide.steps.${id}.badge`),
          title: t(`guide.steps.${id}.title`),
          description: t(`guide.steps.${id}.description`),
        }))}
      />

      {!claim ? (
        <WarrantyPageHeading
          description={t("form.sectionDescription")}
          level={3}
          title={t("form.sectionTitle")}
        />
      ) : null}

      <WarrantyFormCard>
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
                    <p className="min-w-0 break-all text-sm font-semibold text-premium-red">
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
          <WarrantyClaimRequestForm
            errorKind={errorKind}
            isPending={isPending}
            onResetError={reset}
            onSubmit={submit}
          />
        )}
      </WarrantyFormCard>

      <WarrantyOtherActions
        items={[
          { id: "activate", label: t("otherActions.activate") },
          { id: "track", label: t("otherActions.track") },
          { id: "dealers", label: t("otherActions.dealers") },
        ]}
        title={t("otherActions.title")}
      />
    </WarrantyServicePageShell>
  );
}
