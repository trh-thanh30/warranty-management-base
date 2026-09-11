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

test("activating a warranty posts to the canonical warranty endpoint", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: warranty } };
    },
  };

  await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).activateWarranty("warranty-id", {
    startDate: "2026-07-13",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranties/warranty-id/activate",
      body: {
        startDate: "2026-07-13",
      },
    },
  ]);
});

test("voiding a warranty posts the required reason", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return {
        data: {
          success: true,
          data: { ...warranty, status: "VOIDED", voidReason: "Duplicate" },
        },
      };
    },
  };

  await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).voidWarranty("warranty-id", { reason: "Duplicate" });

  assert.deepEqual(calls, [
    {
      url: "/warranties/warranty-id/void",
      body: { reason: "Duplicate" },
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

test("updates warranty coverage through the warranty endpoint", async () => {
  const calls: unknown[] = [];
  const updatedWarranty = {
    ...warranty,
    coverageLimitAmount: "50000000",
    maxAmountPerClaim: "10000000",
    maxClaimCount: 3,
  };
  const http = {
    async patch(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: updatedWarranty } };
    },
  };

  const result = await createWarrantiesService(
    http as unknown as WarrantiesHttpClient,
  ).updateWarranty("warranty-id", {
    adjustmentReason: "Updated policy",
    coverageLimitAmount: "50000000",
    maxAmountPerClaim: "10000000",
    maxClaimCount: 3,
    startDate: "2026-07-08T03:10:00.000Z",
  });

  assert.deepEqual(calls, [
    {
      url: "/warranties/warranty-id",
      body: {
        adjustmentReason: "Updated policy",
        coverageLimitAmount: "50000000",
        maxAmountPerClaim: "10000000",
        maxClaimCount: 3,
        startDate: "2026-07-08T03:10:00.000Z",
      },
    },
  ]);
  assert.deepEqual(result, updatedWarranty);
});
