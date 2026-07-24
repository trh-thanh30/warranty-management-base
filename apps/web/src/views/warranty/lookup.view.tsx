"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
  Car,
  Calendar,
  Phone,
  User,
  Building2,
  Hash,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  FileText,
  Layers,
} from "lucide-react";
import { Input } from "@repo/ui/input";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import {
  demoWarrantyLookupRecord,
  warrantyLookupEmptyValue,
  warrantyLookupExamples,
  warrantyLookupSupportPhone,
} from "@/src/constants/warranty.constants";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import type { WarrantyLookupResult } from "./warranty.types";

function ResultRow({
  icon,
  label,
  value,
  valueClassName = "",
  subValue,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
  subValue?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 py-3.5 border-b border-border-gray last:border-b-0">
      <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wide text-stone-gray shrink-0 sm:min-w-[180px]">
        {icon}
        {label}
      </span>
      <div className="sm:text-right">
        <p
          className={`font-semibold text-sm sm:text-base text-deep-black break-words ${valueClassName}`}
        >
          {value || warrantyLookupEmptyValue}
        </p>
        {subValue && (
          <p className="text-xs font-medium text-premium-red mt-0.5">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export function WarrantyLookupView() {
  const t = useTranslations("Warranty.lookup");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<WarrantyLookupResult | null>(
    null,
  );
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearched(true);
    if (searchQuery.trim().length > 0) {
      const normalizedQuery = searchQuery.trim();

      setSearchResult({
        serial: demoWarrantyLookupRecord.serial,
        code: demoWarrantyLookupRecord.code,
        customerName: t("mock.customerName"),
        phone: normalizedQuery.includes("09")
          ? normalizedQuery
          : demoWarrantyLookupRecord.fallbackPhone,
        address: t("mock.address"),
        carPlate: normalizedQuery.includes("30")
          ? normalizedQuery
          : demoWarrantyLookupRecord.fallbackCarPlate,
        carModel: demoWarrantyLookupRecord.carModel,
        filmType: demoWarrantyLookupRecord.filmType,
        warrantyYears: t("mock.warrantyYears"),
        installedDate: demoWarrantyLookupRecord.installedDate,
        expiryDate: demoWarrantyLookupRecord.expiryDate,
        dealer: t("mock.dealer"),
        status: t("mock.status"),
        windshield: demoWarrantyLookupRecord.windshield,
        frontLeftGlass: demoWarrantyLookupRecord.frontLeftGlass,
        frontRightGlass: demoWarrantyLookupRecord.frontRightGlass,
        rearLeftGlass: demoWarrantyLookupRecord.rearLeftGlass,
        rearRightGlass: demoWarrantyLookupRecord.rearRightGlass,
        sunroof: demoWarrantyLookupRecord.sunroof,
        rearGlass: demoWarrantyLookupRecord.rearGlass,
        notes: demoWarrantyLookupRecord.notes,
      });
    } else {
      setSearchResult(null);
    }
  };

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black pb-16 sm:pb-24">
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
        <div className="relative z-20 mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 w-full space-y-3">
          <span className="inline-block bg-premium-red text-white px-4 py-1 rounded-md text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-condensed font-semibold uppercase text-white tracking-wider leading-tight">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-medium max-w-xl">
            {t("description")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 space-y-16 mt-12 sm:mt-16">
        {/* 2. Registration Methods Section */}
        <section className="space-y-8 text-center max-w-4xl lg:max-w-5xl mx-auto">
          <div className="space-y-3">
            <h2 className="text-xl sm:text-3xl font-condensed font-semibold uppercase tracking-wider text-deep-black">
              {t("registration.title")}
            </h2>
            <p className="text-sm text-stone-gray font-medium max-w-xl mx-auto">
              {t("registration.description")}
            </p>
            <div className="mt-4 mx-auto h-[3px] w-20 bg-premium-red" />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
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
                <p className="text-xs text-stone-gray font-medium">
                  {t("registration.methods.phone.description")}
                </p>
              </div>
            </div>

            <div className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
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
                  <span className="rounded-full bg-accent-gold px-2.5 py-0.5 text-xs font-semibold uppercase text-deep-black">
                    E-Warranty
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold uppercase text-deep-black group-hover:text-premium-red transition-colors">
                  {t("registration.methods.qr.title")}
                </h3>
                <p className="text-xs text-stone-gray font-medium">
                  {t("registration.methods.qr.description")}
                </p>
              </div>
            </div>

            <div className="group bg-white rounded-[24px] border border-border-gray shadow-md hover:shadow-xl hover:border-premium-red transition-all p-6 sm:p-7 text-left flex flex-col justify-between h-[230px]">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted border border-border-gray text-stone-gray group-hover:text-premium-red group-hover:border-premium-red/30 transition-colors">
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
                <p className="text-xs font-mono text-stone-gray">
                  {t("registration.methods.serial.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Search Section */}
        <section className="space-y-6 max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-condensed font-semibold uppercase tracking-wider text-deep-black">
              {t("searchSection.title")}
            </h2>
            <p className="text-xs sm:text-sm text-stone-gray font-medium max-w-lg mx-auto">
              {t("searchSection.description")}
            </p>
          </div>

          <motion.div
            layout
            className="bg-white rounded-[28px] p-6 sm:p-10 border border-border-gray shadow-xl max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto overflow-hidden"
          >
            <div className="mb-8 pb-8 border-b border-border-gray space-y-8">
              <div>
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-gray mb-6">
                  {t("guide.title")}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-surface-muted/70 p-4 rounded-2xl border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-semibold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-full">
                      {t("guide.steps.one.badge")}
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      {t("guide.steps.one.title")}
                    </h4>
                    <p className="text-xs text-stone-gray font-medium">
                      {t("guide.steps.one.description")}
                    </p>
                  </div>

                  <div className="bg-surface-muted/70 p-4 rounded-2xl border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-semibold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-full">
                      {t("guide.steps.two.badge")}
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      {t("guide.steps.two.title")}
                    </h4>
                    <p className="text-xs text-stone-gray font-medium">
                      {t("guide.steps.two.description")}
                    </p>
                  </div>

                  <div className="bg-surface-muted/70 p-4 rounded-2xl border border-border-gray space-y-1 text-center">
                    <span className="inline-block text-xs font-condensed font-semibold text-premium-red uppercase tracking-widest bg-premium-red/10 px-2.5 py-0.5 rounded-full">
                      {t("guide.steps.three.badge")}
                    </span>
                    <h4 className="text-sm font-semibold uppercase text-deep-black pt-1">
                      {t("guide.steps.three.title")}
                    </h4>
                    <p className="text-xs text-stone-gray font-medium">
                      {t("guide.steps.three.description")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-gray pt-6">
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-stone-gray mb-4">
                  {t("otherActions.title")}
                </p>
                <div className="grid gap-3 sm:grid-cols-3 text-xs font-semibold uppercase tracking-wide text-center">
                  <Link
                    href={APP_ROUTES.warrantyActivate}
                    className="p-3.5 rounded-xl bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>{t("otherActions.activate")}</span>
                  </Link>
                  <Link
                    href={APP_ROUTES.warrantyRequest}
                    className="p-3.5 rounded-xl bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <FileText className="size-4 shrink-0" />
                    <span>{t("otherActions.request")}</span>
                  </Link>
                  <Link
                    href={APP_ROUTES.dealers}
                    className="p-3.5 rounded-xl bg-surface-muted hover:bg-premium-red hover:text-white border border-border-gray transition-colors text-deep-black flex items-center justify-center gap-2"
                  >
                    <Building2 className="size-4 shrink-0" />
                    <span>{t("otherActions.dealers")}</span>
                  </Link>
                </div>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-stone-gray" />
                  <Input
                    type="text"
                    placeholder={t("placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-12 h-14 rounded-[16px] text-base border-border-gray ${formControlFocusClassName}`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 bg-premium-red hover:bg-warm-red text-white h-14 rounded-[16px] text-base font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  {t("search")}
                </button>
              </div>
              <p className="text-xs text-stone-gray font-medium text-center">
                {t("tryPrefix")}{" "}
                <code className="bg-light-gray px-2 py-0.5 rounded font-mono text-premium-red">
                  {warrantyLookupExamples[0]}
                </code>{" "}
                {t("or")}{" "}
                <code className="bg-light-gray px-2 py-0.5 rounded font-mono text-premium-red">
                  {warrantyLookupExamples[1]}
                </code>
              </p>
            </form>

            <AnimatePresence>
              {isSearched && searchResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden border-t border-border-gray pt-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border-gray mb-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase text-premium-red tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="size-4" />
                        <span>{searchResult.status}</span>
                      </span>
                      <h3 className="text-xl sm:text-2xl font-condensed font-semibold uppercase tracking-wide text-deep-black">
                        {t("result.code")}: {searchResult.code}
                      </h3>
                    </div>
                    <span className="inline-flex self-start sm:self-center bg-premium-red text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                      {t("result.duration")}: {searchResult.warrantyYears}
                    </span>
                  </div>

                  <div className="divide-y divide-border-gray">
                    <ResultRow
                      icon={<Hash className="size-4 shrink-0" />}
                      label={t("result.serial")}
                      value={searchResult.serial}
                    />
                    <ResultRow
                      icon={<Car className="size-4 shrink-0" />}
                      label={t("result.carPlate")}
                      value={searchResult.carPlate}
                    />
                    <ResultRow
                      icon={<Car className="size-4 shrink-0" />}
                      label={t("result.carModel")}
                      value={searchResult.carModel}
                    />
                    <ResultRow
                      icon={<User className="size-4 shrink-0" />}
                      label={t("result.owner")}
                      value={searchResult.customerName}
                    />
                    <ResultRow
                      icon={<Phone className="size-4 shrink-0" />}
                      label={t("result.phone")}
                      value={searchResult.phone}
                    />
                    <ResultRow
                      icon={<MapPin className="size-4 shrink-0" />}
                      label={t("result.address")}
                      value={searchResult.address}
                    />
                    <ResultRow
                      icon={<Building2 className="size-4 shrink-0" />}
                      label={t("result.dealer")}
                      value={searchResult.dealer}
                    />
                    <ResultRow
                      icon={<Calendar className="size-4 shrink-0" />}
                      label={t("result.installedDate")}
                      value={searchResult.installedDate}
                    />
                    <ResultRow
                      icon={<Sparkles className="size-4 shrink-0" />}
                      label={t("result.film")}
                      value={searchResult.filmType}
                    />
                    <ResultRow
                      icon={<Clock className="size-4 shrink-0" />}
                      label={t("result.warrantyYears")}
                      value={searchResult.warrantyYears}
                    />
                    <ResultRow
                      icon={<ShieldCheck className="size-4 shrink-0" />}
                      label={t("result.expiryDate")}
                      value={searchResult.expiryDate}
                      subValue={searchResult.status}
                    />
                  </div>

                  <div className="border-t border-border-gray pt-6 mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-gray mb-2 flex items-center gap-1.5">
                      <Layers className="size-4" />
                      {t("result.glassSection")}
                    </p>
                    <div className="divide-y divide-border-gray">
                      <ResultRow
                        label={t("result.windshield")}
                        value={searchResult.windshield}
                      />
                      <ResultRow
                        label={t("result.frontLeftGlass")}
                        value={searchResult.frontLeftGlass}
                      />
                      <ResultRow
                        label={t("result.frontRightGlass")}
                        value={searchResult.frontRightGlass}
                      />
                      <ResultRow
                        label={t("result.rearLeftGlass")}
                        value={searchResult.rearLeftGlass}
                      />
                      <ResultRow
                        label={t("result.rearRightGlass")}
                        value={searchResult.rearRightGlass}
                      />
                      <ResultRow
                        label={t("result.sunroof")}
                        value={searchResult.sunroof}
                      />
                      <ResultRow
                        label={t("result.rearGlass")}
                        value={searchResult.rearGlass}
                      />
                      <ResultRow
                        label={t("result.notes")}
                        value={searchResult.notes}
                      />
                    </div>
                  </div>

                  <div className="mt-8 border-t border-border-gray pt-6 pb-6 text-center space-y-4 bg-surface-muted/60 rounded-2xl p-6 sm:p-8">
                    <p className="text-sm sm:text-base text-stone-gray font-medium leading-relaxed max-w-lg mx-auto">
                      {t("support.message")}
                    </p>
                    <div className="flex justify-center">
                      <a
                        href={warrantyLookupSupportPhone.href}
                        className="inline-flex items-center gap-2 bg-premium-red hover:bg-warm-red text-white px-6 py-3.5 rounded-full text-sm font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-105 whitespace-nowrap shrink-0"
                      >
                        <Phone className="size-4 animate-bounce shrink-0" />
                        <span className="whitespace-nowrap">
                          {t("support.hotlineLabel")}:{" "}
                          {warrantyLookupSupportPhone.displayValue}
                        </span>
                      </a>
                    </div>
                    <p className="text-xs font-semibold text-deep-black uppercase tracking-wide">
                      {t("support.closing")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isSearched && !searchResult && (
                <motion.div
                  key="no-result"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-border-gray pt-6 text-center text-stone-gray font-medium"
                >
                  {t("noResult")}
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
              <p className="text-xs sm:text-sm text-stone-gray font-medium">
                {t("policyShortcut.description")}
              </p>
            </div>

            <Link
              href={APP_ROUTES.policyWarrantyReturn}
              className="inline-flex items-center gap-2.5 bg-premium-red hover:bg-warm-red text-white px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-md"
            >
              <span>{t("policyShortcut.action")}</span>
              <FileText className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
