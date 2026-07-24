"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@repo/ui/input";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import { demoWarrantyCustomer } from "@/src/constants/warranty.constants";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import { demoWarrantyRecord } from "./warranty.constants";
import type { WarrantyLookupResult } from "./warranty.types";

const resultFields = [
  ["code", "code"],
  ["serial", "serial"],
  ["owner", "customerName"],
  ["phone", "phone"],
  ["address", "address"],
  ["carPlate", "carPlate"],
  ["carModel", "carModel"],
  ["film", "filmType"],
  ["warrantyYears", "warrantyYears"],
  ["installedDate", "installedDate"],
  ["expiryDate", "expiryDate"],
  ["dealer", "dealer"],
] as const satisfies readonly [
  keyof WarrantyLookupResult | "owner" | "film" | "warrantyYears",
  keyof WarrantyLookupResult,
][];

export function WarrantyLookupView() {
  const t = useTranslations("Warranty.lookup");
  const actionsT = useTranslations("Warranty.actions");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<WarrantyLookupResult | null>(
    null,
  );
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearched(true);

    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchResult({
      ...demoWarrantyRecord,
      customerName: demoWarrantyCustomer.name,
      phone: searchQuery.includes("09")
        ? searchQuery
        : demoWarrantyRecord.phone,
      warrantyYears: t("mock.warrantyYears"),
      dealer: t("mock.dealer"),
      status: t("mock.status"),
    });
  };

  return (
    <main className="min-h-screen bg-surface-muted pb-16 text-deep-black sm:pb-24">
      <section className="relative flex min-h-[260px] items-center overflow-hidden bg-deep-black sm:min-h-[340px]">
        <Image
          src="/708986914_976804048389364_3900113787497783781_n.jpg"
          alt={t("heroImageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-deep-black/80 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1200px] space-y-3 px-6">
          <span className="inline-flex rounded-md bg-premium-red px-4 py-1 text-xs font-medium uppercase tracking-wider text-white">
            {t("eyebrow")}
          </span>
          <h1 className="max-w-3xl font-condensed text-3xl font-semibold uppercase tracking-wider text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/80">
            {t("description")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1000px] space-y-8 px-6 pt-10 sm:pt-14">
        <section className="rounded-[24px] border border-border-gray bg-white p-5 shadow-md sm:p-8">
          <form
            onSubmit={handleSearch}
            className="grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-stone-gray"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("placeholder")}
                className={`h-14 rounded-[14px] border-border-gray bg-white pl-12 text-base ${formControlFocusClassName}`}
              />
            </div>
            <button
              type="submit"
              className="min-h-14 rounded-[14px] bg-premium-red px-8 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-warm-red"
            >
              {t("search")}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-stone-gray">
            {t("tryPrefix")} <code>0988123456</code> {t("or")}{" "}
            <code>30H-888.88</code>
          </p>
        </section>

        {isSearched && !searchResult ? (
          <div className="rounded-[20px] border border-border-gray bg-white p-8 text-center text-sm text-stone-gray">
            {t("noResult")}
          </div>
        ) : null}

        {searchResult ? (
          <section className="overflow-hidden rounded-[24px] border border-border-gray bg-white shadow-md">
            <header className="flex items-center justify-between gap-4 border-b border-border-gray bg-deep-black px-5 py-4 text-white sm:px-7">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="size-6 text-premium-red"
                  aria-hidden="true"
                />
                <span className="font-condensed text-lg font-semibold uppercase tracking-wide">
                  {searchResult.code}
                </span>
              </div>
              <span className="rounded-full bg-premium-red px-3 py-1 text-xs font-medium uppercase">
                {searchResult.status}
              </span>
            </header>

            <dl className="grid gap-x-8 px-5 py-3 sm:grid-cols-2 sm:px-7">
              {resultFields.map(([labelKey, valueKey]) => (
                <div
                  key={valueKey}
                  className="border-b border-border-gray py-4 last:border-b-0"
                >
                  <dt className="text-xs font-medium uppercase text-stone-gray">
                    {t(`result.${labelKey}`)}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-deep-black">
                    {searchResult[valueKey] || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["activate", APP_ROUTES.warrantyActivate],
              ["request", APP_ROUTES.warrantyRequest],
              ["policy", APP_ROUTES.policyWarrantyReturn],
            ] as const
          ).map(([id, href]) => (
            <Link
              key={id}
              href={href}
              className="rounded-[16px] border border-border-gray bg-white p-4 text-center text-xs font-semibold uppercase tracking-wide text-deep-black transition-colors hover:border-premium-red hover:text-premium-red"
            >
              {actionsT(`items.${id}.action`)}
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
