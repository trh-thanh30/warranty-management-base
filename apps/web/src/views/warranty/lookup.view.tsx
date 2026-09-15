"use client";

import { usePrimaryWebsiteHotline } from "@/src/app/providers/site-settings-provider";
import { WarrantyLookupForm } from "@/src/components/common/warranty-lookup-form";
import { WarrantyProcessSteps } from "@/src/components/common/warranty-process-steps";
import { WarrantyLookupResultDetails } from "@/src/components/warranty-lookup-result";
import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { useWarrantyLookup } from "@/src/hooks/use-warranty-lookup";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Hash, Phone, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { WarrantyFormCard } from "./components/warranty-form-card";
import { WarrantyOtherActions } from "./components/warranty-other-actions";
import { WarrantyPageHeading } from "./components/warranty-page-heading";
import { WarrantyServicePageShell } from "./components/warranty-service-page-shell";

const lookupGuideSteps = [
  { id: "one", number: "01", Icon: FileText },
  { id: "two", number: "02", Icon: Search },
  { id: "three", number: "03", Icon: CheckCircle2 },
] as const;

export function WarrantyLookupView() {
  const t = useTranslations("Warranty.lookup");
  const hotline = usePrimaryWebsiteHotline();
  const {
    data: searchResult,
    errorKind,
    isPending,
    lookup,
    reset,
  } = useWarrantyLookup();

  return (
    <WarrantyServicePageShell
      contentClassName="mt-12 max-w-360 space-y-16 py-0 sm:mt-16 sm:py-0"
      hero={{
        alt: t("heroImageAlt"),
        description: t("description"),
        eyebrow: t("eyebrow"),
        title: t("title"),
      }}
      mainClassName="pb-16 sm:pb-24"
    >
      {/* 2. Registration Methods Section */}
      <section className="space-y-8 text-center  mx-auto">
        <WarrantyPageHeading
          accent
          description={t("registration.description")}
          descriptionClassName="text-base font-medium"
          title={t("registration.title")}
        />

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="group bg-white rounded-md border border-border-gray shadow-xs hover:shadow-sm hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-57.5">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-md bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
                <Phone className="size-6" strokeWidth={1.8} />
              </div>
              <span className="text-3xl sm:text-4xl font-condensed font-semibold text-stone-gray/20 group-hover:text-premium-red/30 transition-colors">
                01
              </span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                {t("registration.methods.phone.label")}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                {t("registration.methods.phone.title")}
              </h3>
              <p className="text-sm text-stone-gray font-medium">
                {t("registration.methods.phone.description")}
              </p>
            </div>
          </div>

          <div className="group bg-white rounded-md border border-border-gray shadow-xs hover:shadow-sm hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-57.5">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-md bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
                <FileText className="size-6" strokeWidth={1.8} />
              </div>
              <span className="text-3xl sm:text-4xl font-condensed font-semibold text-stone-gray/20 group-hover:text-premium-red/30 transition-colors">
                02
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                  {t("registration.methods.qr.label")}
                </span>
                <span className="rounded-md bg-premium-red px-2.5 py-0.5 text-xs font-semibold uppercase text-white">
                  WM-*
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                {t("registration.methods.qr.title")}
              </h3>
              <p className="text-sm text-stone-gray font-medium">
                {t("registration.methods.qr.description")}
              </p>
            </div>
          </div>

          <div className="group bg-white rounded-md border border-border-gray shadow-xs hover:shadow-sm hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-57.5">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-md bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
                <Hash className="size-6" strokeWidth={1.8} />
              </div>
              <span className="text-3xl sm:text-4xl font-condensed font-semibold text-stone-gray/20 group-hover:text-premium-red/30 transition-colors">
                03
              </span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-gray">
                {t("registration.methods.serial.label")}
              </span>
              <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                {t("registration.methods.serial.title")}
              </h3>
              <p className="text-sm font-medium text-stone-gray">
                {t("registration.methods.serial.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Search Section */}
      <section className="space-y-6 mx-auto">
        <WarrantyPageHeading
          className="max-w-none"
          description={t("searchSection.description")}
          descriptionClassName="max-w-none text-base font-medium sm:whitespace-nowrap"
          title={t("searchSection.title")}
        />

        <WarrantyProcessSteps
          steps={lookupGuideSteps.map(({ id, number, Icon }) => ({
            number,
            Icon,
            badge: t(`guide.steps.${id}.badge`),
            title: t(`guide.steps.${id}.title`),
            description: t(`guide.steps.${id}.description`),
          }))}
        />

        <motion.div className="mx-auto " layout>
          <WarrantyFormCard className="max-w-none overflow-hidden shadow-sm">
            <WarrantyLookupForm
              isPending={isPending}
              onSubmit={lookup}
              onValueChange={reset}
            />

            <AnimatePresence mode="wait">
              {searchResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden border-t border-border-gray pt-6"
                >
                  <WarrantyLookupResultDetails result={searchResult} />

                  <div className="mt-8 border-t border-border-gray pt-6 pb-6 text-center space-y-4 bg-surface-muted/60 rounded-md p-6 sm:p-8">
                    <p className="text-sm sm:text-base text-stone-gray font-medium leading-relaxed max-w-lg mx-auto">
                      {t("support.message")}
                    </p>
                    {hotline && (
                      <div className="flex justify-center">
                        <a
                          href={hotline.href}
                          className="inline-flex items-center gap-2 bg-premium-red hover:bg-warm-red text-white px-6 py-3.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap shrink-0"
                        >
                          <Phone className="size-4 animate-bounce shrink-0" />
                          <span className="whitespace-nowrap">
                            {t("support.hotlineLabel")}: {hotline.displayValue}
                          </span>
                        </a>
                      </div>
                    )}
                    <p className="text-xs font-semibold text-deep-black uppercase tracking-wide">
                      {t("support.closing")}
                    </p>
                  </div>
                </motion.div>
              )}
              {errorKind && (
                <motion.div
                  key={errorKind}
                  role="alert"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-border-gray pt-6 text-center text-sm font-medium text-premium-red"
                >
                  {t(`errors.${errorKind}`)}
                </motion.div>
              )}
            </AnimatePresence>
          </WarrantyFormCard>
        </motion.div>
      </section>

      <WarrantyOtherActions
        items={
          PUBLIC_FEATURES.pages.warrantyActivation
            ? [
                { id: "activate", label: t("otherActions.activate") },
                { id: "request", label: t("otherActions.request") },
                { id: "dealers", label: t("otherActions.dealers") },
              ]
            : [
                { id: "request", label: t("otherActions.request") },
                { id: "dealers", label: t("otherActions.dealers") },
              ]
        }
        title={t("otherActions.title")}
      />
    </WarrantyServicePageShell>
  );
}
