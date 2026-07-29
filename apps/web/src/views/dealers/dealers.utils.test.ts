import assert from "node:assert/strict";
import test from "node:test";
import type { PublicNetworkLocation } from "@repo/shared";
import {
  dealerFilterAll,
  filterDealerLocations,
  filterDealerLocationsWithinRadius,
  getDealerDistricts,
  getDealerProvinces,
  selectDealerLocations,
} from "./dealers.utils.ts";

const locations: PublicNetworkLocation[] = [
  {
    id: "dealer-ha-noi",
    kind: "DEALER",
    name: "Panda Auto Cầu Giấy",
    phone: "0901234567",
    address: "18 Cầu Giấy, Hà Nội",
    province: "Thành phố Hà Nội",
    district: "Quận Cầu Giấy",
    latitude: 21.0312,
    longitude: 105.7944,
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=21.0312%2C105.7944",
  },
  {
    id: "dealer-da-nang",
    kind: "DEALER",
    name: "Auto365 Đà Nẵng",
    phone: null,
    address: "42 Nguyễn Hữu Thọ, Đà Nẵng",
    province: "Thành phố Đà Nẵng",
    district: "Quận Hải Châu",
    latitude: 16.0471,
    longitude: 108.2144,
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=16.0471%2C108.2144",
  },
  {
    id: "service-center-ha-noi",
    kind: "SERVICE_CENTER",
    name: "Trung tâm bảo hành Hà Nội",
    phone: "19009169",
    address: "Thanh Xuân, Hà Nội",
    province: "Thành phố Hà Nội",
    district: "Quận Thanh Xuân",
    latitude: 21.003,
    longitude: 105.82,
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=21.003%2C105.82",
  },
];

test("dealer directory only exposes dealer network locations", () => {
  assert.deepEqual(
    selectDealerLocations(locations).map((location) => location.id),
    ["dealer-ha-noi", "dealer-da-nang"],
  );
});

test("dealer directory filters API locations by accent-insensitive search and address", () => {
  const dealers = selectDealerLocations(locations);

  assert.deepEqual(
    filterDealerLocations(dealers, {
      searchQuery: "da nang",
      selectedProvince: dealerFilterAll,
      selectedDistrict: dealerFilterAll,
    }).map((location) => location.id),
    ["dealer-da-nang"],
  );
});

test("dealer directory combines province and district filters", () => {
  const dealers = selectDealerLocations(locations);

  assert.deepEqual(
    filterDealerLocations(dealers, {
      searchQuery: "",
      selectedProvince: "Thành phố Hà Nội",
      selectedDistrict: "Quận Cầu Giấy",
    }).map((location) => location.id),
    ["dealer-ha-noi"],
  );
});

test("dealer directory derives sorted province and district options from API data", () => {
  const dealers = selectDealerLocations(locations);

  assert.deepEqual(getDealerProvinces(dealers), [
    "Thành phố Đà Nẵng",
    "Thành phố Hà Nội",
  ]);
  assert.deepEqual(getDealerDistricts(dealers, "Thành phố Hà Nội"), [
    "Quận Cầu Giấy",
  ]);
  assert.deepEqual(getDealerDistricts(dealers, dealerFilterAll), []);
});

test("nearby dealer filtering keeps locations inside the radius and sorts nearest first", () => {
  const dealers = selectDealerLocations(locations);

  assert.deepEqual(
    filterDealerLocationsWithinRadius(
      [...dealers].reverse(),
      { latitude: 21.031, longitude: 105.794 },
      20,
    ).map((location) => location.id),
    ["dealer-ha-noi"],
  );
});
