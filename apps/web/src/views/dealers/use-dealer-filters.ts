"use client";

import type { GeoPoint } from "@repo/shared";
import { useCallback, useMemo, useRef, useState } from "react";
import type { DealerLocation, NearbyDealerStatus } from "./dealers.types";
import {
  dealerFilterAll,
  filterDealerLocations,
  filterDealerLocationsWithinRadius,
  getDealerDistricts,
  getDealerProvinces,
} from "./dealers.utils";

export function useDealerFilters(dealers: readonly DealerLocation[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] =
    useState<string>(dealerFilterAll);
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>(dealerFilterAll);
  const [nearMeOnly, setNearMeOnly] = useState(false);
  const [nearbyStatus, setNearbyStatus] = useState<NearbyDealerStatus>("idle");
  const [userPosition, setUserPosition] = useState<GeoPoint | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const nearbyRequestVersion = useRef(0);

  const provinces = useMemo(() => getDealerProvinces(dealers), [dealers]);

  const districts = useMemo(
    () => getDealerDistricts(dealers, selectedProvince),
    [dealers, selectedProvince],
  );

  const filteredDealers = useMemo(() => {
    const filtered = filterDealerLocations(dealers, {
      searchQuery,
      selectedDistrict,
      selectedProvince,
    });

    return nearMeOnly && userPosition
      ? filterDealerLocationsWithinRadius(filtered, userPosition, 20)
      : filtered;
  }, [
    dealers,
    nearMeOnly,
    searchQuery,
    selectedDistrict,
    selectedProvince,
    userPosition,
  ]);

  const activeDealer = useMemo(
    () => dealers.find((dealer) => dealer.id === selectedDealerId) ?? null,
    [dealers, selectedDealerId],
  );

  const selectProvince = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict(dealerFilterAll);
  };

  const changeNearMeOnly = useCallback((enabled: boolean) => {
    nearbyRequestVersion.current += 1;
    const requestVersion = nearbyRequestVersion.current;

    if (!enabled) {
      setNearMeOnly(false);
      setNearbyStatus("idle");
      setUserPosition(null);
      return;
    }

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setNearMeOnly(false);
      setNearbyStatus("unsupported");
      return;
    }

    setNearMeOnly(true);
    setNearbyStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (nearbyRequestVersion.current !== requestVersion) return;

        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setNearbyStatus("active");
      },
      () => {
        if (nearbyRequestVersion.current !== requestVersion) return;

        setNearMeOnly(false);
        setUserPosition(null);
        setNearbyStatus("error");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 10_000,
      },
    );
  }, []);

  return {
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
    setNearMeOnly: changeNearMeOnly,
    setSearchQuery,
    setSelectedDealerId,
    setSelectedDistrict,
  };
}
