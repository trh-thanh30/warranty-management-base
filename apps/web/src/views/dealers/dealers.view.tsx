"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Clock,
  MapPin,
  Navigation,
  Phone,
  Search,
  UserPlus,
} from "lucide-react";
import { Input } from "@repo/ui/input";
import { dealerFilterAll } from "./dealers.constants";
import { useDealerFilters } from "./use-dealer-filters";

const DealerMap = dynamic(
  () =>
    import("./components/dealer-map").then(
      (dealerMapModule) => dealerMapModule.DealerMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="size-full animate-pulse bg-surface-muted"
      />
    ),
  },
);

export function DealersView() {
  const t = useTranslations("DealersPage");
  const {
    activeDealer,
    cities,
    districts,
    filteredDealers,
    nearMeOnly,
    searchQuery,
    selectedCity,
    selectedDistrict,
    selectCity,
    setNearMeOnly,
    setSearchQuery,
    setSelectedDealerId,
    setSelectedDistrict,
  } = useDealerFilters();

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black">
      <section className="relative w-full h-[320px] sm:h-[420px] bg-deep-black overflow-hidden flex items-center">
        <Image
          src="/708986914_976804048389364_3900113787497783781_n.jpg"
          alt={t("hero.imageAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-deep-black/80 to-transparent z-10" />

        <div className="relative z-20 mx-auto max-w-[1720px] px-6 sm:px-10 lg:px-12 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="inline-block bg-premium-red text-white px-4 py-1 rounded-md text-xs font-semibold uppercase tracking-[0.25em]">
              {t("hero.eyebrow")}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-condensed font-semibold uppercase text-white tracking-wider leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-normal">
              {t("hero.description")}
            </p>
          </div>

          <a
            href="tel:19009169"
            className="inline-flex items-center gap-2 bg-accent-gold hover:bg-accent-gold-hover text-deep-black px-8 py-4 rounded-[14px] font-semibold text-xs sm:text-sm uppercase tracking-wider transition-transform hover:scale-105 shadow-2xl shrink-0"
          >
            <UserPlus className="size-5" />
            <span>{t("hero.dealerCta")}</span>
          </a>
        </div>
      </section>

      <section className="w-full py-10 lg:py-16">
        <div className="mx-auto max-w-[1720px] px-4 sm:px-6 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5 bg-white rounded-[28px] border border-border-gray shadow-xl overflow-hidden flex flex-col h-[620px] lg:h-[750px]">
              <div className="p-6 bg-surface-muted border-b border-border-gray space-y-4">
                <div className="relative flex items-center">
                  <Input
                    type="search"
                    placeholder={t("filters.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pr-10 h-12 rounded-[14px] text-sm bg-white border-border-gray focus-visible:ring-premium-red"
                  />
                  <Search className="absolute right-3.5 size-5 text-stone-gray" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selectedCity}
                    aria-label={t("filters.cityAriaLabel")}
                    onChange={(event) => selectCity(event.target.value)}
                    className="w-full h-11 rounded-[12px] bg-white border border-border-gray px-3 text-xs sm:text-sm font-medium text-deep-black focus:outline-none focus:border-premium-red"
                  >
                    <option value={dealerFilterAll}>
                      {t("filters.allCities")}
                    </option>
                    {cities.map((cityId) => (
                      <option key={cityId} value={cityId}>
                        {t(`locations.cities.${cityId}`)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrict}
                    aria-label={t("filters.districtAriaLabel")}
                    onChange={(event) =>
                      setSelectedDistrict(event.target.value)
                    }
                    className="w-full h-11 rounded-[12px] bg-white border border-border-gray px-3 text-xs sm:text-sm font-medium text-deep-black focus:outline-none focus:border-premium-red"
                  >
                    <option value={dealerFilterAll}>
                      {t("filters.allDistricts")}
                    </option>
                    {districts.map((districtId) => (
                      <option key={districtId} value={districtId}>
                        {t(`locations.districts.${districtId}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setNearMeOnly(!nearMeOnly)}
                  aria-pressed={nearMeOnly}
                  className={`w-full py-3 px-4 rounded-[12px] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                    nearMeOnly
                      ? "bg-premium-red text-white shadow-md"
                      : "bg-accent-gold text-deep-black hover:bg-accent-gold-hover"
                  }`}
                >
                  <MapPin className="size-4 shrink-0" />
                  <span>{t("filters.nearMe")}</span>
                </button>

                <div className="text-center text-xs font-semibold uppercase text-stone-gray pt-1">
                  {t("filters.resultCount", { count: filteredDealers.length })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-border-gray/60">
                {filteredDealers.length === 0 ? (
                  <div className="p-8 text-center text-stone-gray font-medium text-sm">
                    {t("empty")}
                  </div>
                ) : (
                  filteredDealers.map((dealer) => {
                    const isSelected = activeDealer?.id === dealer.id;

                    return (
                      <article
                        key={dealer.id}
                        className={`pt-4 first:pt-0 p-4 rounded-[20px] transition-all space-y-3 ${
                          isSelected
                            ? "bg-premium-red/5 border-2 border-premium-red"
                            : "hover:bg-surface-muted border border-transparent"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedDealerId(dealer.id)}
                          className="w-full space-y-3 text-left cursor-pointer"
                        >
                          <div className="space-y-1.5 text-left">
                            {dealer.isMainShowroom && (
                              <div>
                                <span className="inline-block bg-premium-red text-white px-2.5 py-0.5 rounded-md text-xs sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                  {t("mainShowroom")}
                                </span>
                              </div>
                            )}
                            <h3 className="text-sm sm:text-base font-semibold uppercase text-deep-black leading-snug text-pretty">
                              {dealer.name}
                            </h3>
                          </div>
                          <div className="space-y-1.5 text-xs text-stone-gray font-medium">
                            <div className="flex items-start gap-2">
                              <MapPin className="size-4 text-premium-red shrink-0 mt-0.5" />
                              <span>{dealer.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="size-4 text-premium-red shrink-0" />
                              <span className="font-medium text-deep-black">
                                {dealer.phone}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="size-4 text-premium-red shrink-0" />
                              <span>{t(`hours.${dealer.hoursKey}`)}</span>
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDealerId(dealer.id)}
                            className="bg-accent-gold hover:bg-accent-gold-hover text-deep-black px-4 py-1.5 rounded-[8px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {t("viewMore")}
                          </button>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dealer.name} ${dealer.address}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-premium-red hover:underline text-xs font-semibold uppercase"
                          >
                            <Navigation className="size-3.5" />
                            <span>{t("directions")}</span>
                          </a>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

            <div className="lg:col-span-7 isolate bg-white rounded-[28px] border border-border-gray shadow-xl overflow-hidden h-[520px] sm:h-[620px] lg:h-[750px] relative flex flex-col">
              <div className="bg-white text-deep-black p-4 px-6 flex items-center justify-between z-10 border-b border-border-gray">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-premium-red" />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {activeDealer?.name ?? t("map.defaultTitle")}
                  </span>
                </div>
                <span className="text-xs text-stone-gray font-mono font-medium">
                  {activeDealer
                    ? t(`locations.cities.${activeDealer.cityId}`)
                    : null}
                </span>
              </div>

              <div className="flex-1 w-full relative bg-light-gray">
                <DealerMap activeDealer={activeDealer} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
