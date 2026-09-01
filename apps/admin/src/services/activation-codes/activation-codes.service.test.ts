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
  ).requestPrintJob("batch-id", { from: 1, to: 50 });

  assert.deepEqual(calls, [
    {
      url: "/activation-code-batches/batch-id/print-jobs",
      body: undefined,
      config: { params: { from: 1, to: 50 } },
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
