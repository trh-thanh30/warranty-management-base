"use client";

import { Container } from "@/src/components/common/container";
import { Card } from "@repo/ui/card";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import { DealerFilters } from "./components/dealer-filters";
import { DealerList } from "./components/dealer-list";
import { DealerRecruitmentCta } from "./components/dealer-recruitment-cta";
import type { NetworkDirectoryLocation } from "./dealers.types";
import { getNetworkLocationKey } from "./dealers.utils";
import { useDealerDirectory } from "./use-dealer-directory";

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
  const [mapSelectionRequestId, setMapSelectionRequestId] = useState(0);
  const mapCardRef = useRef<HTMLDivElement>(null);
  const {
    activeLocation,
    districts,
    error,
    hasNextPage,
    isLoadingMore,
    loadMore,
    loadMoreError,
    loading,
    locations,
    nearMeOnly,
    nearbyStatus,
    provinces,
    provincesLoading,
    resultCount,
    retry,
    searchQuery,
    selectedDistrict,
    selectedProvince,
    selectProvince,
    setNearMeOnly,
    setSearchQuery,
    setSelectedLocation,
    setSelectedDistrict,
    wardsLoading,
  } = useDealerDirectory();

  const handleSelectLocation = (location: NetworkDirectoryLocation) => {
    setSelectedLocation(location);
    setMapSelectionRequestId((requestId) => requestId + 1);

    if (!window.matchMedia("(max-width: 1023px)").matches) return;

    window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      mapCardRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

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
            <Card className="flex h-155 flex-col overflow-hidden rounded-sm border-border-gray shadow-xs lg:col-span-5 lg:h-187.5">
              <DealerFilters
                districts={districts}
                nearMeOnly={nearMeOnly}
                nearbyStatus={nearbyStatus}
                onDistrictChange={setSelectedDistrict}
                onNearMeChange={setNearMeOnly}
                onProvinceChange={selectProvince}
                onSearchChange={setSearchQuery}
                provinces={provinces}
                provincesLoading={provincesLoading}
                resultCountLabel={t("filters.resultCount", {
                  count: resultCount,
                })}
                searchQuery={searchQuery}
                selectedDistrict={selectedDistrict}
                selectedProvince={selectedProvince}
                wardsLoading={wardsLoading}
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
                activeLocationKey={
                  activeLocation ? getNetworkLocationKey(activeLocation) : null
                }
                error={error}
                hasNextPage={hasNextPage}
                isLoadingMore={isLoadingMore}
                loadMoreError={loadMoreError}
                loading={loading}
                locations={locations}
                onLoadMore={loadMore}
                onRetry={retry}
                onSelectLocation={handleSelectLocation}
                translations={{
                  dealerBadge: t("locationType.dealer"),
                  directions: t("directions"),
                  empty: t("empty"),
                  error: t("states.error"),
                  loading: t("states.loading"),
                  loadingMore: t("states.loadingMore"),
                  loadMoreError: t("states.loadMoreError"),
                  retry: t("states.retry"),
                  serviceCenterBadge: t("locationType.serviceCenter"),
                  viewMore: t("viewMore"),
                }}
              />
            </Card>

            <div
              ref={mapCardRef}
              className="scroll-mt-20 lg:col-span-7 lg:scroll-mt-0"
            >
              <Card className="isolate relative flex h-[520px] flex-col overflow-hidden rounded-sm border-border-gray shadow-xs sm:h-[620px] lg:h-[750px]">
                <div className="bg-white text-deep-black p-4 px-6 flex items-center justify-between z-10 border-b border-border-gray">
                  <div className="flex items-center gap-2">
                    <MapPin
                      aria-hidden="true"
                      className="size-5 text-premium-red"
                    />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      {activeLocation?.name ?? t("map.defaultTitle")}
                    </span>
                  </div>
                  <span className="text-xs text-stone-gray font-mono font-medium">
                    {activeLocation?.province ?? null}
                  </span>
                </div>

                <div className="flex-1 w-full relative bg-light-gray">
                  <DealerMap
                    activeLocation={activeLocation}
                    selectionRequestId={mapSelectionRequestId}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <DealerRecruitmentCta />
    </main>
  );
}
