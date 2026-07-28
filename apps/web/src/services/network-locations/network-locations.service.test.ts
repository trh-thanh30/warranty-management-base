import assert from "node:assert/strict";
import test from "node:test";
import type { HttpClient, PublicNetworkLocation } from "@repo/shared";
import { NetworkLocationsService } from "./network-locations.service.ts";

test("loads dealer and service-center map locations from the public API", async () => {
  const locations: PublicNetworkLocation[] = [
    {
      id: "dealer-1",
      kind: "DEALER",
      name: "Đại lý Hà Nội",
      phone: "0901234567",
      address: "1 Nguyễn Trãi",
      province: "Hà Nội",
      district: "Thanh Xuân",
      latitude: 21.0285,
      longitude: 105.8542,
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=21.0285%2C105.8542",
    },
    {
      id: "center-1",
      kind: "SERVICE_CENTER",
      name: "Trung tâm bảo hành Đà Nẵng",
      phone: null,
      address: "1 Nguyễn Văn Linh",
      province: "Đà Nẵng",
      district: "Hải Châu",
      latitude: 16.0544,
      longitude: 108.2022,
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=16.0544%2C108.2022",
    },
  ];
  const calls: string[] = [];
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string): Promise<T> {
      calls.push(url);
      return { data: locations } as T;
    },
  };
  const service = new NetworkLocationsService(http);

  const result = await service.listNetworkLocations();

  assert.deepEqual(calls, ["/public/network-locations"]);
  assert.deepEqual(result, locations);
});

test("propagates network errors so the map can offer a retry", async () => {
  const http: Pick<HttpClient, "get"> = {
    async get<T>(): Promise<T> {
      throw new Error("API unavailable");
    },
  };
  const service = new NetworkLocationsService(http);

  await assert.rejects(service.listNetworkLocations(), /API unavailable/);
});
