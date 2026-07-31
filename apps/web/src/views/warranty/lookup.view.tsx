"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Building2, Hash, ShieldCheck, FileText } from "lucide-react";
import { usePrimaryWebsiteHotline } from "@/src/app/providers/site-settings-provider";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { Link } from "@/src/i18n/navigation";
import { Container } from "@/src/components/common/container";
import { WarrantyLookupForm } from "@/src/components/common/warranty-lookup-form";
import { WarrantyLookupResultDetails } from "@/src/components/warranty-lookup-result";
import { useWarrantyLookup } from "@/src/hooks/use-warranty-lookup";
import { WarrantyBackLink } from "./components/warranty-back-link";

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
    <main className="min-h-screen bg-white text-deep-black pb-16 sm:pb-24">
      {/* 1. Hero Banner matching Dealers & About pages */}
      <section className="relative w-full h-[260px] sm:h-[360px] bg-deep-black overflow-hidden flex items-center">
        <Image
          src="/708986914_976804048389364_3900113787497783781_n.jpg"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-deep-black/80 to-transparent z-10" />
        <Container className="relative z-20 max-w-[1400px] space-y-3">
          <WarrantyBackLink className="mb-5" inverse />
          <span className="inline-block bg-premium-red text-white px-4 py-1 rounded-md text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-condensed font-semibold uppercase text-white tracking-wider leading-tight">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-medium max-w-xl">
            {t("description")}
          </p>
        </Container>
      </section>

      <Container className="mt-12 max-w-[1400px] space-y-16 sm:mt-16">
        {/* 2. Registration Methods Section */}
        <section className="space-y-8 text-center max-w-4xl lg:max-w-5xl mx-auto">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-3xl font-semibold uppercase text-deep-black">
              {t("registration.title")}
            </h2>
            <p className="text-base text-stone-gray font-medium max-w-xl mx-auto">
              {t("registration.description")}
            </p>
            <div className="mt-4 mx-auto h-[3px] w-20 bg-premium-red" />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="group bg-white rounded-md border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
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

            <div className="group bg-white rounded-md border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
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
                  <span className="rounded-md bg-accent-gold px-2.5 py-0.5 text-xs font-semibold uppercase text-deep-black">
                    E-Warranty
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

            <div className="group bg-white rounded-md border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
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
                  Serial Number
                </h3>
                <p className="text-sm font-medium text-stone-gray">
                  {t("registration.methods.serial.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Search Section */}
        <section className="space-y-6 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-semibold uppercase text-deep-black">
              {t("searchSection.title")}
            </h2>
            <p className="text-base text-stone-gray font-medium max-w-xl mx-auto">
              {t("searchSection.description")}
            </p>
          </div>

          <motion.div
            layout
            className="bg-white rounded-md p-6 sm:p-10 border border-border-gray shadow-xl max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto overflow-hidden"
          >
            <div className="mb-8 pb-8 border-b border-border-gray space-y-8">
              <div>
                <p className="text-center text-base font-semibold uppercase tracking-wider text-stone-gray mb-6">
                  {t("guide.title")}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-surface-muted/70 p-4 rounded-md border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-semibold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-md">
                      {t("guide.steps.one.badge")}
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      {t("guide.steps.one.title")}
                    </h4>
                    <p className="text-sm text-stone-gray font-medium">
                      {t("guide.steps.one.description")}
                    </p>
                  </div>

                  <div className="bg-surface-muted/70 p-4 rounded-md border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-semibold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-md">
                      {t("guide.steps.two.badge")}
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      {t("guide.steps.two.title")}
                    </h4>
                    <p className="text-sm text-stone-gray font-medium">
                      {t("guide.steps.two.description")}
                    </p>
                  </div>

                  <div className="bg-surface-muted/70 p-4 rounded-md border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-semibold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-md">
                      {t("guide.steps.three.badge")}
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      {t("guide.steps.three.title")}
                    </h4>
                    <p className="text-sm text-stone-gray font-medium">
                      {t("guide.steps.three.description")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-gray pt-6">
                <p className="text-center text-sm font-semibold uppercase tracking-wider text-stone-gray mb-4">
                  {t("otherActions.title")}
                </p>
                <div
                  className={`grid gap-3 text-center text-xs font-semibold uppercase tracking-wide ${
                    PUBLIC_FEATURES.warrantyActivation
                      ? "sm:grid-cols-3"
                      : "sm:grid-cols-2"
                  }`}
                >
                  {PUBLIC_FEATURES.warrantyActivation ? (
                    <Link
                      href={APP_ROUTES.warrantyActivate}
                      className="flex items-center justify-center gap-2 rounded-md border border-border-gray bg-surface-muted p-3.5 text-deep-black transition-colors hover:bg-premium-red hover:text-white"
                    >
                      <ShieldCheck className="size-4 shrink-0" />
                      <span>{t("otherActions.activate")}</span>
                    </Link>
                  ) : null}
                  <Link
                    href={APP_ROUTES.warrantyRequest}
                    className="p-3.5 rounded-md bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <FileText className="size-4 shrink-0" />
                    <span>{t("otherActions.request")}</span>
                  </Link>
                  <Link
                    href={APP_ROUTES.dealers}
                    className="p-3.5 rounded-md bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <Building2 className="size-4 shrink-0" />
                    <span>{t("otherActions.dealers")}</span>
                  </Link>
                </div>
              </div>
            </div>

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
          </motion.div>
        </section>

        <section className="max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border-gray">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-premium-red">
                <ShieldCheck className="size-4" />
                <span>{t("policyShortcut.eyebrow")}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black">
                {t("policyShortcut.title")}
              </h3>
              <p className="text-sm text-stone-gray font-medium">
                {t("policyShortcut.description")}
              </p>
            </div>

            <Link
              href={APP_ROUTES.policyWarrantyReturn}
              className="inline-flex items-center gap-2.5 bg-premium-red hover:bg-warm-red text-white px-6 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-md"
            >
              <span>{t("policyShortcut.action")}</span>
              <FileText className="size-4" />
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
