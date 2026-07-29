import assert from "node:assert/strict";
import test from "node:test";
import { createWarrantyActivationRequestsService } from "./create-warranty-activation-requests.service.ts";
import type { WarrantyActivationRequestsHttpClient } from "./warranty-activation-requests.types.ts";

test("exports activation requests with reconciliation filters", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["export"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createWarrantyActivationRequestsService(
    http as unknown as WarrantyActivationRequestsHttpClient,
  ).exportWarrantyActivationRequests({
    dateFrom: "2026-07-01",
    dateTo: "2026-07-31",
    search: "Nguyen Van A",
    status: "PENDING",
  });

  assert.equal(result, blob);
  assert.deepEqual(calls, [
    {
      url: "/warranty-activation-requests/export",
      config: {
        params: {
          dateFrom: "2026-07-01",
          dateTo: "2026-07-31",
          search: "Nguyen Van A",
          status: "PENDING",
        },
        responseType: "blob",
      },
    },
  ]);
});

test("downloads an activation request certificate as a blob", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["pdf"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createWarrantyActivationRequestsService(
    http as unknown as WarrantyActivationRequestsHttpClient,
  ).downloadWarrantyActivationRequestCertificate("request-id");

  assert.equal(result, blob);
  assert.deepEqual(calls, [
    {
      url: "/warranty-activation-requests/request-id/certificate/download",
      config: { responseType: "blob" },
    },
  ]);
});

test("creates an admin activation request from a selected product", async () => {
  const calls: unknown[] = [];
  const body = {
    productId: "23684bbd-b6e0-401a-9ba4-97e1b98176fd",
    addressDetail: "1 Nguyen Trai",
    customerEmail: "customer@example.com",
    customerName: "Nguyen Van A",
    customerPhone: "0901234567",
    provinceCode: "79",
    provinceName: "TP Ho Chi Minh",
    wardCode: "26734",
    wardName: "Phuong Ben Thanh",
  };
  const http = {
    async post(url: string, requestBody?: unknown) {
      calls.push({ url, body: requestBody });
      return { data: { success: true, data: { id: "request-id" } } };
    },
  };

  await createWarrantyActivationRequestsService(
    http as unknown as WarrantyActivationRequestsHttpClient,
  ).createAdminWarrantyActivationRequest(body);

  assert.deepEqual(calls, [
    { url: "/warranty-activation-requests/admin", body },
  ]);
});
