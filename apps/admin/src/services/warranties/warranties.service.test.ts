import assert from "node:assert/strict";
import test from "node:test";
import { createWarrantiesService } from "./create-warranties.service.ts";
import type { WarrantiesHttpClient } from "./warranties.types.ts";

const warranty = {
  id: "warranty-id",
  productId: "product-id",
  warrantyCode: "WM-2026-ABCDEF",
  startDate: "2026-07-13T00:00:00.000Z",
  endDate: "2027-07-13T00:00:00.000Z",
  durationMonths: 12,
  status: "ACTIVE",
  terms: null,
  metadata: null,
  createdAt: "2026-07-13T00:00:00.000Z",
  updatedAt: "2026-07-13T00:00:00.000Z",
  product: {
    id: "product-id",
    name: "SUV Battery",
    brand: "Demo",
    model: "Battery",
    productCode: "PRD-000001",
    serialNumber: "SN-001",
  },
  owner: null,
};

test("warranty directory requests paginated warranties with filters", async () => {
  const calls: unknown[] = [];
  const response = {
    items: [warranty],
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

  const result = await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).listWarranties({
    page: 1,
    search: "battery",
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranties",
      config: {
        params: {
          page: 1,
          search: "battery",
          sortBy: "createdAt",
          sortOrder: "desc",
          status: "ACTIVE",
        },
      },
    },
  ]);
  assert.deepEqual(result, response);
});

test("exports warranties with the current directory filters", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["export"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).exportWarranties({
    search: "battery",
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });

  assert.equal(result, blob);
  assert.deepEqual(calls, [
    {
      url: "/warranties/export",
      config: {
        params: {
          search: "battery",
          sortBy: "createdAt",
          sortOrder: "desc",
          status: "ACTIVE",
        },
        responseType: "blob",
      },
    },
  ]);
});

test("activating a product warranty posts to product activation endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: warranty } };
    },
  };

  await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).activateWarranty("product-id", {
    durationMonths: 12,
    startDate: "2026-07-13",
  });

  assert.deepEqual(calls, [
    {
      url: "/products/product-id/activate-warranty",
      body: {
        durationMonths: 12,
        startDate: "2026-07-13",
      },
    },
  ]);
});

test("warranty detail requests warranty by id", async () => {
  const calls: unknown[] = [];
  const http = {
    async get(url: string) {
      calls.push({ url });
      return { data: { success: true, data: warranty } };
    },
  };

  const result = await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).getWarrantyDetail("warranty-id");

  assert.deepEqual(calls, [{ url: "/warranties/warranty-id" }]);
  assert.deepEqual(result, warranty);
});
