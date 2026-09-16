import assert from "node:assert/strict";
import test from "node:test";
import { createActivationCodesService } from "./create-activation-codes.service.ts";
import type { ActivationCodesHttpClient } from "./activation-codes.types.ts";

test("requesting a print job sends the selected label range", async () => {
  const calls: unknown[] = [];
  const job = { id: "job-id", status: "QUEUED" };
  const http = {
    async post(url: string, body?: unknown, config?: unknown) {
      calls.push({ url, body, config });
      return { data: { success: true, data: job } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).requestPrintJob("batch-id", {
    from: 1,
    labelHeightMm: 20,
    labelWidthMm: 40,
    to: 50,
  });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/batch-id/print-jobs",
      body: undefined,
      config: {
        params: {
          from: 1,
          labelHeightMm: 20,
          labelWidthMm: 40,
          to: 50,
        },
      },
    },
  ]);
  assert.equal(result, job);
});

test("downloads a completed print job as a blob", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["pdf"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).downloadPrintJob("job-id");

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/print-jobs/job-id/download",
      config: { responseType: "blob" },
    },
  ]);
  assert.equal(result, blob);
});

test("loads activation code report filters", async () => {
  const calls: unknown[] = [];
  const report = { total: 12, byStatus: {}, byProvince: [] };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: report } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).getReport({ dateFrom: "2026-09-01", dateTo: "2026-09-30" });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/reports/summary",
      config: {
        params: { dateFrom: "2026-09-01", dateTo: "2026-09-30" },
      },
    },
  ]);
  assert.equal(result, report);
});

test("exports the filtered activation code report as a blob", async () => {
  const calls: unknown[] = [];
  const blob = new Blob(["excel"]);
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: blob };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).exportReport({
    dateFrom: "2026-09-01T00:00:00.000Z",
    dateTo: "2026-09-30T23:59:59.999Z",
  });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/reports/export",
      config: {
        params: {
          dateFrom: "2026-09-01T00:00:00.000Z",
          dateTo: "2026-09-30T23:59:59.999Z",
        },
        responseType: "blob",
      },
    },
  ]);
  assert.equal(result, blob);
});

test("filters assignable activation codes by batch", async () => {
  const calls: unknown[] = [];
  const response = { items: [], meta: { page: 1, total: 0 } };
  const http = {
    async get(url: string, config?: unknown) {
      calls.push({ url, config });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).listAvailableByProduct(undefined, {
    assignment: "UNASSIGNED",
    batchId: "batch-id",
  });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/available",
      config: {
        params: { assignment: "UNASSIGNED", batchId: "batch-id" },
      },
    },
  ]);
  assert.equal(result, response);
});

test("assigns multiple activation codes to one product", async () => {
  const calls: unknown[] = [];
  const response = {
    activationCodeIds: ["code-id", "second-code-id"],
    product: {
      id: "product-id",
      productCode: "PRD-01",
      displayName: "Camera",
      name: "Camera",
      serialNumber: "SN-01",
    },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).assignProduct({
    activationCodeIds: ["code-id", "second-code-id"],
    productId: "product-id",
  });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/codes/assign-product",
      body: {
        activationCodeIds: ["code-id", "second-code-id"],
        productId: "product-id",
      },
    },
  ]);
  assert.equal(result, response);
});

test("requests automatic assignment by quantity across selected batches", async () => {
  const calls: unknown[] = [];
  const response = {
    activationCodeIds: ["code-3", "code-4"],
    product: { id: "product-id" },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).assignProduct({
    assignmentMode: "QUANTITY",
    batchIds: ["batch-a", "batch-b"],
    productId: "product-id",
    quantity: 10,
  });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/codes/assign-product",
      body: {
        assignmentMode: "QUANTITY",
        batchIds: ["batch-a", "batch-b"],
        productId: "product-id",
        quantity: 10,
      },
    },
  ]);
});

test("removes an unused activation-code assignment", async () => {
  const calls: unknown[] = [];
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return {
        data: { success: true, data: { activationCodeId: "code-id" } },
      };
    },
  };

  await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).unassignProduct({ activationCodeId: "code-id" });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/codes/unassign-product",
      body: { activationCodeId: "code-id" },
    },
  ]);
});

test("replaces a product activation-code assignment atomically", async () => {
  const calls: unknown[] = [];
  const response = {
    previousActivationCodeId: "old-code-id",
    activationCodeId: "new-code-id",
    product: { id: "product-id" },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).replaceProductAssignment({
    currentActivationCodeId: "old-code-id",
    replacementActivationCodeId: "new-code-id",
    productId: "product-id",
  });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/codes/replace-product-assignment",
      body: {
        currentActivationCodeId: "old-code-id",
        replacementActivationCodeId: "new-code-id",
        productId: "product-id",
      },
    },
  ]);
  assert.equal(result, response);
});

test("loads the revoke impact for an activation-code batch", async () => {
  const calls: unknown[] = [];
  const preview = {
    batchId: "batch-id",
    totalCount: 50,
    unassignedRevocableCount: 30,
    assignedRevocableCount: 10,
    requestProtectedCount: 5,
    activatedProtectedCount: 5,
  };
  const http = {
    async get(url: string) {
      calls.push({ url });
      return { data: { success: true, data: preview } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).getBatchRevokePreview("batch-id");

  assert.deepEqual(calls, [
    { url: "/activation-code-batches/batch-id/revoke-preview" },
  ]);
  assert.equal(result, preview);
});

test("sends the selected scope when revoking an activation-code batch", async () => {
  const calls: unknown[] = [];
  const response = {
    batchId: "batch-id",
    scope: "ALL_REVOCABLE",
    revokedCount: 40,
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).revokeBatch("batch-id", { scope: "ALL_REVOCABLE" });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/batch-id/revoke",
      body: { scope: "ALL_REVOCABLE" },
    },
  ]);
  assert.equal(result, response);
});

test("extends one activation code by the requested number of months", async () => {
  const calls: unknown[] = [];
  const response = {
    activationCodeId: "code-id",
    previousExpiresAt: "2027-01-31T10:30:00.000Z",
    expiresAt: "2027-02-28T10:30:00.000Z",
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).extendCodeExpiry("code-id", { months: 1 });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/codes/code-id/extend-expiry",
      body: { months: 1 },
    },
  ]);
  assert.equal(result, response);
});

test("extends an activation-code batch by the requested number of months", async () => {
  const calls: unknown[] = [];
  const response = {
    batchId: "batch-id",
    previousExpiresAt: "2027-01-31T10:30:00.000Z",
    expiresAt: "2027-02-28T10:30:00.000Z",
    extendedCount: 75,
    skipped: { activated: 10, revoked: 10, expired: 5 },
  };
  const http = {
    async post(url: string, body?: unknown) {
      calls.push({ url, body });
      return { data: { success: true, data: response } };
    },
  };

  const result = await createActivationCodesService(
    http as unknown as ActivationCodesHttpClient,
  ).extendBatchExpiry("batch-id", { months: 2 });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/batch-id/extend-expiry",
      body: { months: 2 },
    },
  ]);
  assert.equal(result, response);
});
