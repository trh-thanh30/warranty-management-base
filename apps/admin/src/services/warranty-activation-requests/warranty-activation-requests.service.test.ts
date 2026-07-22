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
