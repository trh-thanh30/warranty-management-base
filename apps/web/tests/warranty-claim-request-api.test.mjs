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

const validFormValues = {
  issue: "bubble",
  issueDetail: "Bubbles on the windshield",
  requesterName: " Nguyen Van An ",
  requesterPhone: " 0886 33 77 33 ",
  warrantyCode: " wm-2026-abcdef ",
};

test("warranty claims service posts the public claim request", async () => {
  const { WarrantyClaimsService } = await importRequired(
    "../src/services/warranty-claims/warranty-claims.service.ts",
  );
  const calls = [];
  const responseData = {
    claimCode: "CLM-2026-ABC123",
    warrantyCode: "WM-2026-ABCDEF",
    issueTitle: "Peeling / Film bubbles",
    status: "SUBMITTED",
    priority: "NORMAL",
  };
  const body = {
    issueDetail: "Bubbles on the windshield",
    issueTitle: "Peeling / Film bubbles",
    requesterName: "Nguyen Van An",
    requesterPhone: "0886 33 77 33",
    warrantyCode: "WM-2026-ABCDEF",
  };
  const service = new WarrantyClaimsService({
    async post(url, requestBody) {
      calls.push({ body: requestBody, url });
      return { data: responseData };
    },
  });

  const result = await service.createWarrantyClaim(body);

  assert.deepEqual(result, responseData);
  assert.deepEqual(calls, [
    {
      body,
      url: "/public/warranty-claims",
    },
  ]);
});

test("warranty claims service sends the Turnstile token separately from claim data", async () => {
  const { WarrantyClaimsService } = await importRequired(
    "../src/services/warranty-claims/warranty-claims.service.ts",
  );
  const calls = [];
  const service = new WarrantyClaimsService({
    async post(url, body, config) {
      calls.push({ body, config, url });
      return { data: { claimCode: "CLM-1" } };
    },
  });
  const body = { warrantyCode: "WM-ABC123" };

  await service.createWarrantyClaim(body, "turnstile-token");

  assert.deepEqual(calls, [
    {
      body,
      config: { headers: { "X-Turnstile-Token": "turnstile-token" } },
      url: "/public/warranty-claims",
    },
  ]);
});

test("warranty claim form schema validates public request fields", async () => {
  const { createWarrantyClaimRequestFormSchema } = await importRequired(
    "../src/views/warranty/warranty-claim-request-form.schema.ts",
  );
  const schema = createWarrantyClaimRequestFormSchema({
    detailsInvalid: "detailsInvalid",
    issueRequired: "issueRequired",
    nameInvalid: "nameInvalid",
    phoneInvalid: "phoneInvalid",
    warrantyCodeInvalid: "warrantyCodeInvalid",
  });

  assert.equal(schema.safeParse(validFormValues).success, true);

  const invalid = schema.safeParse({
    ...validFormValues,
    issue: "",
    requesterName: "",
    requesterPhone: "abc",
    warrantyCode: "invalid code!",
  });

  assert.equal(invalid.success, false);
  assert.deepEqual(
    new Set(invalid.error.issues.map((issue) => issue.message)),
    new Set([
      "issueRequired",
      "nameInvalid",
      "phoneInvalid",
      "warrantyCodeInvalid",
    ]),
  );
});

test("warranty claim form maps the selected shared issue into the API body", async () => {
  const { toWarrantyClaimRequestBody } = await importRequired(
    "../src/views/warranty/warranty-claim-request.utils.ts",
  );

  assert.deepEqual(
    toWarrantyClaimRequestBody(validFormValues, {
      bubble: "Peeling / Film bubbles",
      connectionFailure: "App / Device connection failure",
      fade: "Discoloration / Fading",
      inaccurateReading: "Incorrect readings",
      intermittentOperation: "Intermittent operation",
      lowSensorBattery: "Low / Depleted sensor battery",
      moisture: "Internal moisture / Condensation",
      noPower: "No power / Not working",
      noRecording: "Not recording",
      other: "Other issue",
      poorVideoQuality: "Blurry / Choppy video",
      scratch: "Impact scratches",
      storageFailure: "Memory card error / Data loss",
      weakOrWrongLight: "Weak light / Incorrect light color",
    }),
    {
      issueDetail: "Bubbles on the windshield",
      issueTitle: "Peeling / Film bubbles",
      requesterName: "Nguyen Van An",
      requesterPhone: "0886 33 77 33",
      warrantyCode: "WM-2026-ABCDEF",
    },
  );
});

test("warranty claim errors distinguish business and transport failures", async () => {
  const { getWarrantyClaimRequestErrorKind } = await importRequired(
    "../src/hooks/use-warranty-claim-request.ts",
  );
  const businessError = (code, status = 400) =>
    new HttpClientError({
      details: { code },
      isNetworkError: false,
      message: code,
      status,
    });

  assert.equal(
    getWarrantyClaimRequestErrorKind(
      businessError("WARRANTY_CLAIM_ALREADY_OPEN", 409),
    ),
    "alreadyOpen",
  );
  assert.equal(
    getWarrantyClaimRequestErrorKind(
      businessError("WARRANTY_CLAIM_OWNER_MISMATCH"),
    ),
    "ownerMismatch",
  );
  assert.equal(
    getWarrantyClaimRequestErrorKind(businessError("WARRANTY_NOT_ACTIVE")),
    "notEligible",
  );
  assert.equal(
    getWarrantyClaimRequestErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Not found",
        status: 404,
      }),
    ),
    "notFound",
  );
  assert.equal(
    getWarrantyClaimRequestErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Too many requests",
        status: 429,
      }),
    ),
    "rateLimit",
  );
});

test("warranty claim request view uses the API form without mock tickets", async () => {
  const source = await readFile(
    new URL("../src/views/warranty/request.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /WarrantyClaimRequestForm/);
  assert.match(source, /useWarrantyClaimRequest/);
  assert.match(source, /claimCode/);
  assert.doesNotMatch(source, /Math\.random/);
  assert.doesNotMatch(source, /setIsSubmitted/);
});

test("warranty claim request shows localized API errors through the global toaster", async () => {
  const [formSource, layoutSource, providerSource] = await Promise.all([
    readFile(
      new URL(
        "../src/views/warranty/components/warranty-claim-request-form.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../app/[locale]/layout.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/app/providers/toast-provider.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(formSource, /toast\.error/);
  assert.match(formSource, /toast\.success/);
  assert.match(formSource, /getWarrantyClaimRequestErrorKind\(error\)/);
  assert.match(layoutSource, /<ToastProvider \/>/);
  assert.match(providerSource, /<Toaster/);
});
