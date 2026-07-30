import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HttpClientError } from "@repo/shared";

async function importRequired(relativePath) {
  try {
    return await import(new URL(relativePath, import.meta.url));
  } catch (error) {
    assert.fail(
      `Expected ${relativePath} to be implemented: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

test("warranty claims service looks up a normalized public claim code", async () => {
  const { WarrantyClaimsService } = await importRequired(
    "../src/services/warranty-claims/warranty-claims.service.ts",
  );
  const calls = [];
  const responseData = {
    claimCode: "CLM-0123456789ABCDEFABCD",
    status: "REVIEWING",
    timeline: [],
  };
  const service = new WarrantyClaimsService({
    async get(url) {
      calls.push(url);
      return { data: responseData };
    },
    async post() {
      throw new Error("Unexpected POST request");
    },
  });

  const result = await service.getWarrantyClaimByCode(
    " clm-0123456789abcdefabcd ",
  );

  assert.deepEqual(result, responseData);
  assert.deepEqual(calls, [
    "/public/warranty-claims/by-code/CLM-0123456789ABCDEFABCD",
  ]);
});

test("warranty tracking schema accepts claim codes and rejects unrelated values", async () => {
  const { createWarrantyTrackFormSchema } = await importRequired(
    "../src/views/warranty/warranty-track-form.schema.ts",
  );
  const schema = createWarrantyTrackFormSchema({
    claimCodeInvalid: "claimCodeInvalid",
  });

  assert.deepEqual(schema.parse({ claimCode: " clm-0123456789abcdefabcd " }), {
    claimCode: "CLM-0123456789ABCDEFABCD",
  });
  assert.equal(schema.safeParse({ claimCode: "CLM000001" }).success, false);
  assert.equal(
    schema.safeParse({ claimCode: "CLM-2026-ABC123" }).success,
    false,
  );
  assert.equal(schema.safeParse({ claimCode: "0886337733" }).success, false);
  assert.equal(
    schema.safeParse({ claimCode: "WAR-20260730-0001" }).success,
    false,
  );
});

test("warranty claim codes share normalization and compatibility rules", async () => {
  const {
    isWarrantyClaimCode,
    normalizeWarrantyClaimCode,
    WARRANTY_CLAIM_RANDOM_CODE_PATTERN,
  } = await importRequired(
    "../../../packages/shared/src/utils/warranty-claim-code.ts",
  );

  assert.equal(
    normalizeWarrantyClaimCode(" clm-0123456789abcdefabcd "),
    "CLM-0123456789ABCDEFABCD",
  );
  assert.equal(isWarrantyClaimCode("CLM000001"), false);
  assert.equal(isWarrantyClaimCode("CLM-2026-ABC123"), false);
  assert.equal(
    WARRANTY_CLAIM_RANDOM_CODE_PATTERN.test("CLM-0123456789ABCDEFABCD"),
    true,
  );
  assert.equal(isWarrantyClaimCode("CLM-"), false);
  assert.equal(isWarrantyClaimCode("WAR-20260730-0001"), false);
});

test("warranty tracking maps public lookup failures", async () => {
  const { getWarrantyClaimTrackingErrorKind } = await importRequired(
    "../src/hooks/use-warranty-claim-tracking.ts",
  );

  assert.equal(
    getWarrantyClaimTrackingErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Not found",
        status: 404,
      }),
    ),
    "notFound",
  );
  assert.equal(
    getWarrantyClaimTrackingErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Too many requests",
        status: 429,
      }),
    ),
    "rateLimit",
  );
  assert.equal(
    getWarrantyClaimTrackingErrorKind(new Error("Network unavailable")),
    "request",
  );
});

test("warranty tracking view composes the real public claim workflow", async () => {
  const source = await readFile(
    new URL("../src/views/warranty/track.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useWarrantyClaimTracking/);
  assert.match(source, /WarrantyTrackForm/);
  assert.match(source, /WarrantyClaimProgress/);
  assert.match(source, /AnimatePresence/);
  assert.match(source, /<motion\.section[\s\S]*layout/);
  assert.match(source, /initial=\{\{\s*opacity:\s*0,\s*height:\s*0/);
  assert.match(source, /embedded/);
  assert.doesNotMatch(source, /demoWarrantyTicket/);
  assert.doesNotMatch(source, /setTicketData/);
});

test("warranty request receipt links its CLM code into tracking prefill", async () => {
  const [requestSource, trackSource] = await Promise.all([
    readFile(
      new URL("../src/views/warranty/request.view.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/views/warranty/track.view.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(requestSource, /pathname:\s*"\/warranty\/track"/);
  assert.match(
    requestSource,
    /query:\s*\{\s*claimCode:\s*claim\.claimCode\s*\}/,
  );
  assert.match(trackSource, /searchParams\.get\("claimCode"\)/);
  assert.match(trackSource, /initialValue=\{initialClaimCode\}/);
});
