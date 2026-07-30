import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HttpClientError } from "@repo/shared";

const validFormValues = {
  addressDetail: "7C Nguyen Ngoc Phuong",
  customerEmail: " CUSTOMER@EXAMPLE.COM ",
  customerName: " Nguyen Van An ",
  customerPhone: " 0886 33 77 33 ",
  provinceCode: "79",
  vehiclePlate: " 51a-123.45 ",
  wardCode: "26734",
  warrantyCode: " fj-8899-2026 ",
};

const provinces = [{ code: 79, name: "Thanh pho Ho Chi Minh" }];
const wards = [
  {
    code: 26734,
    name: "Phuong Thanh My Tay",
    province_code: 79,
  },
];

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

test("warranty activation service posts the public activation request", async () => {
  const { WarrantyActivationRequestsService } = await importRequired(
    "../src/services/warranty-activation-requests/warranty-activation-requests.service.ts",
  );
  const calls = [];
  const responseData = {
    id: "request-id",
    requestCode: "WAR-20260730-0001",
    status: "PENDING",
  };
  const body = {
    addressDetail: "7C Nguyen Ngoc Phuong",
    customerEmail: "customer@example.com",
    customerName: "Nguyen Van An",
    customerPhone: "0886 33 77 33",
    provinceCode: "79",
    provinceName: "Thanh pho Ho Chi Minh",
    vehiclePlate: "51A-123.45",
    wardCode: "26734",
    wardName: "Phuong Thanh My Tay",
    warrantyCode: "FJ-8899-2026",
  };
  const service = new WarrantyActivationRequestsService({
    async post(url, requestBody) {
      calls.push({ body: requestBody, url });
      return { data: responseData };
    },
  });

  const result = await service.createActivationRequest(body);

  assert.deepEqual(result, responseData);
  assert.deepEqual(calls, [
    {
      body,
      url: "/public/warranty-activation-requests",
    },
  ]);
});

test("warranty activation form maps selected location names into the API body", async () => {
  const { toWarrantyActivationRequestBody } = await importRequired(
    "../src/views/warranty/warranty-activation.utils.ts",
  );

  assert.deepEqual(
    toWarrantyActivationRequestBody({
      provinces,
      values: validFormValues,
      wards,
    }),
    {
      addressDetail: "7C Nguyen Ngoc Phuong",
      customerEmail: "customer@example.com",
      customerName: "Nguyen Van An",
      customerPhone: "0886 33 77 33",
      provinceCode: "79",
      provinceName: "Thanh pho Ho Chi Minh",
      vehiclePlate: "51A-123.45",
      wardCode: "26734",
      wardName: "Phuong Thanh My Tay",
      warrantyCode: "FJ-8899-2026",
    },
  );
});

test("warranty activation schema validates the required public fields", async () => {
  const { createWarrantyActivationFormSchema } = await importRequired(
    "../src/views/warranty/warranty-activation-form.schema.ts",
  );
  const schema = createWarrantyActivationFormSchema({
    addressRequired: "addressRequired",
    customerEmailInvalid: "customerEmailInvalid",
    customerEmailRequired: "customerEmailRequired",
    customerNameInvalid: "customerNameInvalid",
    customerPhoneInvalid: "customerPhoneInvalid",
    provinceRequired: "provinceRequired",
    vehiclePlateInvalid: "vehiclePlateInvalid",
    wardRequired: "wardRequired",
    warrantyCodeInvalid: "warrantyCodeInvalid",
  });

  assert.equal(schema.safeParse(validFormValues).success, true);

  const invalid = schema.safeParse({
    ...validFormValues,
    addressDetail: "",
    customerEmail: "",
    provinceCode: "",
    wardCode: "",
    warrantyCode: "invalid code!",
  });

  assert.equal(invalid.success, false);
  assert.deepEqual(
    new Set(invalid.error.issues.map((issue) => issue.message)),
    new Set([
      "addressRequired",
      "customerEmailRequired",
      "provinceRequired",
      "wardRequired",
      "warrantyCodeInvalid",
    ]),
  );

  assert.equal(
    schema.safeParse({
      ...validFormValues,
      customerEmail: "not-an-email",
    }).success,
    false,
  );
});

test("warranty activation errors distinguish business and transport failures", async () => {
  const { getWarrantyActivationErrorKind } = await importRequired(
    "../src/hooks/use-warranty-activation-request.ts",
  );
  const businessError = (code) =>
    new HttpClientError({
      details: { code },
      isNetworkError: false,
      message: code,
      status: 400,
    });

  assert.equal(
    getWarrantyActivationErrorKind(businessError("WARRANTY_CODE_NOT_FOUND")),
    "notFound",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      businessError("WARRANTY_NOT_ELIGIBLE_FOR_ACTIVATION"),
    ),
    "notEligible",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      businessError("ACTIVATION_REQUEST_ALREADY_OPEN"),
    ),
    "alreadyOpen",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Too many requests",
        status: 429,
      }),
    ),
    "rateLimit",
  );
});

test("web locations service loads wards for the selected province", async () => {
  const { LocationsService } = await import(
    new URL("../src/services/locations/locations.service.ts", import.meta.url)
  );
  const calls = [];
  const service = new LocationsService({
    async get(url, config) {
      calls.push({ config, url });
      return { data: wards };
    },
  });

  assert.equal(typeof service.listVietnamWards, "function");
  const result = await service.listVietnamWards(79);

  assert.deepEqual(result, wards);
  assert.deepEqual(calls, [
    {
      config: { params: { province: 79 } },
      url: "/locations/vietnam/wards",
    },
  ]);
});

test("warranty activation view submits a request and shows its pending code", async () => {
  const source = await readFile(
    new URL("../src/views/warranty/activate.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /WarrantyActivationRequestForm/);
  assert.match(source, /WarrantyActivationSuccess/);
  assert.match(source, /useWarrantyActivationRequest/);
  assert.doesNotMatch(source, /setIsSuccess\(true\)/);
});

test("warranty activation success keeps a receipt and static process timeline inside the page", async () => {
  const source = await readFile(
    new URL(
      "../src/views/warranty/components/warranty-activation-success.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const [vi, en] = await Promise.all([
    import("../src/messages/vi.json", { with: { type: "json" } }),
    import("../src/messages/en.json", { with: { type: "json" } }),
  ]);

  assert.match(source, /request\.requestCode/);
  assert.match(source, /request\.status/);
  assert.match(source, /request\.createdAt/);
  assert.match(source, /formatDate\(request\.createdAt/);
  assert.match(source, /framer-motion/);
  assert.match(source, /timelineTitle/);
  assert.doesNotMatch(source, /function formatRequestDateTime/);
  assert.doesNotMatch(source, /1-2/);

  for (const messages of [vi.default, en.default]) {
    const success = messages.Warranty.activate.success;
    assert.equal(typeof success.timelineTitle, "string");
    assert.equal(typeof success.submittedStep, "string");
    assert.equal(typeof success.reviewStep, "string");
    assert.equal(typeof success.activationStep, "string");
  }
});

test("warranty activation reports submit and clipboard results through localized toasts", async () => {
  const [formSource, successSource, vi, en] = await Promise.all([
    readFile(
      new URL(
        "../src/views/warranty/components/warranty-activation-request-form.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../src/views/warranty/components/warranty-activation-success.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    import("../src/messages/vi.json", { with: { type: "json" } }),
    import("../src/messages/en.json", { with: { type: "json" } }),
  ]);

  assert.match(formSource, /toast\.success\(t\("success\.title"\)\)/);
  assert.match(
    formSource,
    /toast\.error\(t\(`errors\.\$\{getWarrantyActivationErrorKind\(error\)\}`\)\)/,
  );
  assert.match(successSource, /toast\.success\(t\("copied"\)\)/);
  assert.match(successSource, /toast\.error\(t\("copyFailed"\)\)/);

  for (const messages of [vi.default, en.default]) {
    assert.equal(
      typeof messages.Warranty.activate.success.copyFailed,
      "string",
    );
  }
});
