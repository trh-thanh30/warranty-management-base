"use client";

import { useDebounce } from "@repo/hooks";
import type {
  GeoPoint,
  ListPublicNetworkDirectoryQuery,
  PaginationMeta,
} from "@repo/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useVietnamProvinces,
  useVietnamWards,
} from "@/src/hooks/use-vietnam-provinces";
import { publicNetworkDirectoryService } from "@/src/services/network-directory/public-network-directory.service";
import type {
  NearbyDealerStatus,
  NetworkDirectoryLocation,
} from "./dealers.types";
import { dealerFilterAll, getNetworkLocationKey } from "./dealers.utils";

const dealerPageSize = 10;

export function useDealerDirectory() {
  const [locations, setLocations] = useState<NetworkDirectoryLocation[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] =
    useState<string>(dealerFilterAll);
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>(dealerFilterAll);
  const [selectedLocationKey, setSelectedLocationKey] = useState<string | null>(
    null,
  );
  const [userPosition, setUserPosition] = useState<GeoPoint | null>(null);
  const [nearMeOnly, setNearMeOnly] = useState(false);
  const [nearbyStatus, setNearbyStatus] = useState<NearbyDealerStatus>("idle");
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const nearbyRequestVersion = useRef(0);
  const queryVersion = useRef(0);
  const loadingMoreRef = useRef(false);
  const debouncedSearch = useDebounce(searchQuery.trim(), 300);
  const provincesQuery = useVietnamProvinces();
  const selectedProvinceItem =
    provincesQuery.data.find(
      (province) => province.name === selectedProvince,
    ) ?? null;
  const wardsQuery = useVietnamWards(selectedProvinceItem?.code ?? null);
  const provinces = useMemo(
    () => provincesQuery.data.map((province) => province.name),
    [provincesQuery.data],
  );
  const districts = useMemo(
    () => wardsQuery.data.map((ward) => ward.name),
    [wardsQuery.data],
  );

  const baseQuery = useMemo<ListPublicNetworkDirectoryQuery>(
    () => ({
      district:
        selectedDistrict === dealerFilterAll ? undefined : selectedDistrict,
      latitude: nearMeOnly ? userPosition?.latitude : undefined,
      limit: dealerPageSize,
      longitude: nearMeOnly ? userPosition?.longitude : undefined,
      province:
        selectedProvince === dealerFilterAll ? undefined : selectedProvince,
      radiusKm: nearMeOnly ? 20 : undefined,
      search: debouncedSearch || undefined,
    }),
    [
      debouncedSearch,
      nearMeOnly,
      selectedDistrict,
      selectedProvince,
      userPosition,
    ],
  );

  useEffect(() => {
    queryVersion.current += 1;
    if (nearbyStatus === "loading") return;

    const controller = new AbortController();

    loadingMoreRef.current = false;
    setLoading(true);
    setIsLoadingMore(false);
    setError(false);
    setLoadMoreError(false);

    void publicNetworkDirectoryService
      .listLocations({ ...baseQuery, page: 1 }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setLocations(result.items);
        setMeta(result.meta);
        setSelectedLocationKey((current) =>
          result.items.some(
            (location) => getNetworkLocationKey(location) === current,
          )
            ? current
            : null,
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [baseQuery, nearbyStatus, requestVersion]);

  const loadMore = useCallback(async () => {
    if (
      !meta?.hasNextPage ||
      loadingMoreRef.current ||
      isLoadingMore ||
      loading
    ) {
      return;
    }

    const currentQueryVersion = queryVersion.current;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const result = await publicNetworkDirectoryService.listLocations({
        ...baseQuery,
        page: meta.page + 1,
      });

      if (queryVersion.current !== currentQueryVersion) return;

      setLocations((current) => {
        const locationByKey = new Map(
          [...current, ...result.items].map((location) => [
            getNetworkLocationKey(location),
            location,
          ]),
        );
        return Array.from(locationByKey.values());
      });
      setMeta(result.meta);
    } catch {
      if (queryVersion.current === currentQueryVersion) {
        setLoadMoreError(true);
      }
    } finally {
      if (queryVersion.current === currentQueryVersion) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [baseQuery, isLoadingMore, loading, meta]);

  const changeProvince = useCallback((province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict(dealerFilterAll);
  }, []);

  const changeNearMeOnly = useCallback((enabled: boolean) => {
    nearbyRequestVersion.current += 1;
    const version = nearbyRequestVersion.current;

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

    setNearbyStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (nearbyRequestVersion.current !== version) return;
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setNearMeOnly(true);
        setNearbyStatus("active");
      },
      () => {
        if (nearbyRequestVersion.current !== version) return;
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

  const retry = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  const activeLocation = useMemo(
    () =>
      locations.find(
        (location) => getNetworkLocationKey(location) === selectedLocationKey,
      ) ?? null,
    [locations, selectedLocationKey],
  );

  return {
    activeLocation,
    districts,
    error,
    hasNextPage: meta?.hasNextPage ?? false,
    isLoadingMore,
    loadMore,
    loadMoreError,
    loading,
    locations,
    nearMeOnly,
    nearbyStatus,
    provinces,
    provincesLoading: provincesQuery.isLoading,
    resultCount: meta?.total ?? 0,
    retry,
    searchQuery,
    selectedDistrict,
    selectedProvince,
    selectProvince: changeProvince,
    setNearMeOnly: changeNearMeOnly,
    setSearchQuery,
    setSelectedLocation: (location: NetworkDirectoryLocation) =>
      setSelectedLocationKey(getNetworkLocationKey(location)),
    setSelectedDistrict,
    wardsLoading: wardsQuery.isLoading,
  };
}
