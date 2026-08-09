"use client";

import Image from "next/image";
import { Container } from "@/src/components/common/container";
import { WarrantyPolicyShortcut } from "@/src/components/common/warranty-policy-shortcut";
import { WarrantyResultRow } from "@/src/components/common/warranty-result-row";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { useWarrantyClaimRequest } from "@/src/hooks/use-warranty-claim-request";
import { Link } from "@/src/i18n/navigation";
import { formatDate } from "@repo/shared";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  FileText,
  Hash,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { WarrantyBackLink } from "./components/warranty-back-link";
import { WarrantyClaimRequestForm } from "./components/warranty-claim-request-form";

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

        <section className="mx-auto w-full max-w-5xl px-0 py-2 sm:px-2 sm:py-4">
          <ol className="grid gap-6 sm:grid-cols-3">
            {requestGuideSteps.map(({ id, number, Icon }) => (
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

        {!claim ? (
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
        </section>

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
