import assert from "node:assert/strict";
import test from "node:test";
import type {
  HttpClient,
  HttpRequestConfig,
  PaginatedResponse,
  PublicNetworkDirectoryFilterOptions,
  PublicNetworkLocation,
} from "@repo/shared";
import { PublicNetworkDirectoryService } from "./public-network-directory.service.ts";

test("loads a paginated directory containing dealers and warranty centers", async () => {
  const response: PaginatedResponse<PublicNetworkLocation> = {
    items: [
      {
        id: "dealer-1",
        kind: "DEALER",
        name: "Ha Noi Dealer",
        phone: "0901234567",
        address: "1 Nguyen Trai",
        province: "Ha Noi",
        district: "Thanh Xuan",
        latitude: 21.0285,
        longitude: 105.8542,
        googleMapsUrl: "https://maps.example/dealer-1",
      },
      {
        id: "center-1",
        kind: "SERVICE_CENTER",
        name: "Ha Noi Warranty Center",
        phone: null,
        address: "2 Nguyen Trai",
        province: "Ha Noi",
        district: "Thanh Xuan",
        latitude: 21.03,
        longitude: 105.85,
        googleMapsUrl: "https://maps.example/center-1",
      },
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  const calls: Array<{ config?: HttpRequestConfig; url: string }> = [];
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
      calls.push({ config, url });
      return { data: response } as T;
    },
  };
  const service = new PublicNetworkDirectoryService(http);

  const result = await service.listLocations({ limit: 10, page: 1 });

  assert.deepEqual(result, response);
  assert.deepEqual(calls, [
    {
      url: "/public/network-directory",
      config: { params: { limit: 10, page: 1 }, signal: undefined },
    },
  ]);
});

test("loads combined province and district filter options", async () => {
  const options: PublicNetworkDirectoryFilterOptions = {
    provinces: ["Bac Ninh", "Ha Noi"],
    districts: ["Cau Giay", "Thanh Xuan"],
  };
  const calls: Array<{ config?: HttpRequestConfig; url: string }> = [];
  const http: Pick<HttpClient, "get"> = {
    async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
      calls.push({ config, url });
      return { data: options } as T;
    },
  };
  const service = new PublicNetworkDirectoryService(http);

  const result = await service.listFilterOptions("Ha Noi");

  assert.deepEqual(result, options);
  assert.deepEqual(calls, [
    {
      url: "/public/network-directory/filter-options",
      config: { params: { province: "Ha Noi" }, signal: undefined },
    },
  ]);
});
