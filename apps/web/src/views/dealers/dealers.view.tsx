"use client";

import { useNetworkLocations } from "@/src/hooks/use-network-locations";
import { Container } from "@/src/components/common/container";
import { Card } from "@repo/ui/card";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo } from "react";
import { DealerFilters } from "./components/dealer-filters";
import { DealerList } from "./components/dealer-list";
import { selectDealerLocations } from "./dealers.utils";
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
  const { error, loading, locations, retry } = useNetworkLocations();
  const dealers = useMemo(() => selectDealerLocations(locations), [locations]);
  const {
    activeDealer,
    districts,
    filteredDealers,
    nearMeOnly,
    nearbyStatus,
    provinces,
    searchQuery,
    selectedDistrict,
    selectedProvince,
    selectProvince,
    setNearMeOnly,
    setSearchQuery,
    setSelectedDealerId,
    setSelectedDistrict,
  } = useDealerFilters(dealers);

  return (
    <main className="min-h-screen bg-surface-muted text-deep-black">
      <section className="w-full ">
        <Image
          src="/dealer/dealer.webp"
          alt={t("hero.imageAlt")}
          width={1920}
          height={600}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
      </section>

      <section className="w-full py-10 lg:py-16 bg-white">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <Card className="flex h-[620px] flex-col overflow-hidden rounded-[28px] border-border-gray shadow-xl lg:col-span-5 lg:h-[750px]">
              <DealerFilters
                districts={districts}
                nearMeOnly={nearMeOnly}
                nearbyStatus={nearbyStatus}
                onDistrictChange={setSelectedDistrict}
                onNearMeChange={setNearMeOnly}
                onProvinceChange={selectProvince}
                onSearchChange={setSearchQuery}
                provinces={provinces}
                resultCountLabel={t("filters.resultCount", {
                  count: filteredDealers.length,
                })}
                searchQuery={searchQuery}
                selectedDistrict={selectedDistrict}
                selectedProvince={selectedProvince}
                translations={{
                  allDistricts: t("filters.allDistricts"),
                  allProvinces: t("filters.allCities"),
                  districtAriaLabel: t("filters.districtAriaLabel"),
                  nearMe: t("filters.nearMe"),
                  nearMeError: t("filters.nearMeError"),
                  nearMeLoading: t("filters.nearMeLoading"),
                  nearMeUnsupported: t("filters.nearMeUnsupported"),
                  provinceAriaLabel: t("filters.cityAriaLabel"),
                  searchAriaLabel: t("filters.searchAriaLabel"),
                  searchPlaceholder: t("filters.searchPlaceholder"),
                }}
              />
              <DealerList
                activeDealerId={activeDealer?.id ?? null}
                dealers={filteredDealers}
                error={error}
                loading={loading}
                onRetry={retry}
                onSelectDealer={setSelectedDealerId}
                translations={{
                  directions: t("directions"),
                  empty: t("empty"),
                  error: t("states.error"),
                  loading: t("states.loading"),
                  retry: t("states.retry"),
                  viewMore: t("viewMore"),
                }}
              />
            </Card>

            <Card className="isolate relative flex h-[520px] flex-col overflow-hidden rounded-[28px] border-border-gray shadow-xl sm:h-[620px] lg:col-span-7 lg:h-[750px]">
              <div className="bg-white text-deep-black p-4 px-6 flex items-center justify-between z-10 border-b border-border-gray">
                <div className="flex items-center gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="size-5 text-premium-red"
                  />
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {activeDealer?.name ?? t("map.defaultTitle")}
                  </span>
                </div>
                <span className="text-xs text-stone-gray font-mono font-medium">
                  {activeDealer?.province ?? null}
                </span>
              </div>

              <div className="flex-1 w-full relative bg-light-gray">
                <DealerMap activeDealer={activeDealer} />
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </main>
  );
}
