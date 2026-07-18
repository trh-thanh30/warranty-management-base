import assert from "node:assert/strict";
import test from "node:test";
import {
  createServiceCentersService,
  type ServiceCentersHttpClient,
} from "./create-service-centers.service.ts";

const serviceCenter = {
  id: "service-center-id",
  name: "Da Nang Warranty Center",
  phone: "0900000001",
  email: "danang@example.com",
  province: "Da Nang",
  district: "Hai Chau",
  address: "1 Nguyen Van Linh",
  googleMapsUrl: "https://maps.google.com/?q=1+Nguyen+Van+Linh",
  isActive: true,
  metadata: null,
  createdAt: "2026-07-15T00:00:00.000Z",
  updatedAt: "2026-07-15T00:00:00.000Z",
};

test("lists service centers with directory filters", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [serviceCenter],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createServiceCentersService(
    http as unknown as ServiceCentersHttpClient,
  ).listServiceCenters({
    isActive: "true",
    page: 1,
    province: "Da Nang",
    search: "warranty",
    sortBy: "name",
    sortOrder: "asc",
  });

  assert.deepEqual(calls, [
    {
      url: "/service-centers",
      config: {
        params: {
          isActive: "true",
          page: 1,
          province: "Da Nang",
          search: "warranty",
          sortBy: "name",
          sortOrder: "asc",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("lists provinces currently used by service centers", async () => {
  const calls: unknown[] = [];
  const provinces = ["Da Nang", "Ha Noi"];
  const http = {
    async get(url: string) {
      calls.push({ url });
      return { data: { success: true, data: provinces } };
    },
  };

  const result = await createServiceCentersService(
    http as unknown as ServiceCentersHttpClient,
  ).listProvinces();

  assert.deepEqual(calls, [{ url: "/service-centers/provinces" }]);
  assert.deepEqual(result, provinces);
});

test("creates, updates, and deactivates a service center", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ method: "post", url, body });
      return { data: { success: true, data: serviceCenter } };
    },
    async patch(url: string, body?: unknown) {
      calls.push({ method: "patch", url, body });
      return { data: { success: true, data: serviceCenter } };
    },
  };
  const service = createServiceCentersService(
    http as unknown as ServiceCentersHttpClient,
  );

  await service.createServiceCenter({
    address: serviceCenter.address,
    name: serviceCenter.name,
    province: serviceCenter.province,
  });
  await service.updateServiceCenter(serviceCenter.id, { name: "New name" });
  await service.deactivateServiceCenter(serviceCenter.id);

  assert.deepEqual(calls, [
    {
      method: "post",
      url: "/service-centers",
      body: {
        address: serviceCenter.address,
        name: serviceCenter.name,
        province: serviceCenter.province,
      },
    },
    {
      method: "patch",
      url: "/service-centers/service-center-id",
      body: { name: "New name" },
    },
    {
      method: "patch",
      url: "/service-centers/service-center-id/deactivate",
      body: undefined,
    },
  ]);
});
