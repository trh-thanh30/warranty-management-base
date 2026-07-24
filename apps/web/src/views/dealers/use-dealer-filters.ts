"use client";

import { useMemo, useState } from "react";
import { dealerFilterAll, dealers } from "./dealers.constants";

export function useDealerFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(dealerFilterAll);
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>(dealerFilterAll);
  const [nearMeOnly, setNearMeOnly] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);

  const cities = useMemo(
    () => Array.from(new Set(dealers.map((dealer) => dealer.cityId))),
    [],
  );

  const districts = useMemo(() => {
    if (selectedCity === dealerFilterAll) return [];

    return Array.from(
      new Set(
        dealers
          .filter((dealer) => dealer.cityId === selectedCity)
          .map((dealer) => dealer.districtId),
      ),
    );
  }, [selectedCity]);

  const filteredDealers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("vi");

    return dealers.filter((dealer) => {
      const matchesQuery =
        !normalizedQuery ||
        dealer.name.toLocaleLowerCase("vi").includes(normalizedQuery) ||
        dealer.address.toLocaleLowerCase("vi").includes(normalizedQuery);
      const matchesCity =
        selectedCity === dealerFilterAll || dealer.cityId === selectedCity;
      const matchesDistrict =
        selectedDistrict === dealerFilterAll ||
        dealer.districtId === selectedDistrict;

      return matchesQuery && matchesCity && matchesDistrict;
    });
  }, [searchQuery, selectedCity, selectedDistrict]);

  const activeDealer = useMemo(
    () => dealers.find((dealer) => dealer.id === selectedDealerId) ?? null,
    [selectedDealerId],
  );

  const selectCity = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedDistrict(dealerFilterAll);
  };

  return {
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
  };
}
