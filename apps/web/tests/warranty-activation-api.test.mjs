import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HttpClientError } from "@repo/shared";

const validFormValues = {
  addressDetail: "7C Nguyen Ngoc Phuong",
  customerEmail: " CUSTOMER@EXAMPLE.COM ",
  customerName: " Nguyen Van An ",
  customerPhone: " 0886 33 77 33 ",
  installedAt: "2026-09-09T14:30:00.000Z",
  provinceCode: "79",
  vehiclePlate: " 51a-123.45 ",
  wardCode: "26734",
  activationCode: " sp-abcdef123456 ",
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
    requestCode: "WAR-20260730-0001",
    status: "PENDING",
    createdAt: "2026-07-30T00:00:00.000Z",
  };
  const body = {
    addressDetail: "7C Nguyen Ngoc Phuong",
    customerEmail: "customer@example.com",
    customerName: "Nguyen Van An",
    customerPhone: "0886 33 77 33",
    installedAt: "2026-09-09T14:30:00.000Z",
    provinceCode: "79",
    provinceName: "Thanh pho Ho Chi Minh",
    vehiclePlate: "51A-123.45",
    wardCode: "26734",
    wardName: "Phuong Thanh My Tay",
    activationCode: "SP-ABCDEF123456",
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

test("warranty activation service sends the Turnstile token separately from domain data", async () => {
  const { WarrantyActivationRequestsService } = await importRequired(
    "../src/services/warranty-activation-requests/warranty-activation-requests.service.ts",
  );
  const calls = [];
  const service = new WarrantyActivationRequestsService({
    async post(url, body, config) {
      calls.push({ body, config, url });
      return { data: { requestCode: "WAR-1" } };
    },
  });
  const body = { activationCode: "SP-ABC123" };

  await service.createActivationRequest(body, "turnstile-token");

  assert.deepEqual(calls, [
    {
      body,
      config: { headers: { "X-Turnstile-Token": "turnstile-token" } },
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
      installedAt: "2026-09-09T14:30:00.000Z",
      provinceCode: "79",
      provinceName: "Thanh pho Ho Chi Minh",
      vehiclePlate: "51A-123.45",
      wardCode: "26734",
      wardName: "Phuong Thanh My Tay",
      activationCode: "SP-ABCDEF123456",
    },
  );
});

test("warranty activation form only asks for an SP activation code", async () => {
  const [formSource, viSource, enSource] = await Promise.all([
    readFile(
      new URL(
        "../src/views/warranty/components/warranty-activation-request-form.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../src/messages/vi.json", import.meta.url), "utf8"),
    readFile(new URL("../src/messages/en.json", import.meta.url), "utf8"),
  ]);

  assert.match(formSource, /name="activationCode"/);
  assert.match(formSource, /fields\.activationCode\.description/);
  assert.doesNotMatch(formSource, /fields\.stampCode/);

  for (const source of [viSource, enSource]) {
    const messages = JSON.parse(source);
    const field = messages.Warranty.activate.fields.activationCode;

    assert.equal(typeof field.label, "string");
    assert.equal(typeof field.placeholder, "string");
    assert.match(field.placeholder, /SP-/);
    assert.match(field.description, /SP-/);
    assert.doesNotMatch(field.description, /WM-|FJ-|E-Warranty/i);
  }
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
    installedAtFuture: "installedAtFuture",
    installedAtInvalid: "installedAtInvalid",
    installedAtRequired: "installedAtRequired",
    provinceRequired: "provinceRequired",
    vehiclePlateInvalid: "vehiclePlateInvalid",
    wardRequired: "wardRequired",
    activationCodeInvalid: "activationCodeInvalid",
  });

  assert.equal(schema.safeParse(validFormValues).success, true);

  const invalid = schema.safeParse({
    ...validFormValues,
    addressDetail: "",
    customerEmail: "",
    installedAt: "",
    provinceCode: "",
    wardCode: "",
    activationCode: "invalid code!",
  });

  assert.equal(invalid.success, false);
  assert.deepEqual(
    new Set(invalid.error.issues.map((issue) => issue.message)),
    new Set([
      "addressRequired",
      "customerEmailRequired",
      "installedAtFuture",
      "installedAtInvalid",
      "installedAtRequired",
      "provinceRequired",
      "wardRequired",
      "activationCodeInvalid",
    ]),
  );

  assert.equal(
    schema.safeParse({
      ...validFormValues,
      customerEmail: "not-an-email",
    }).success,
    false,
  );

  for (const addressDetail of [
    "123 Nguyễn Trãi, Phường 1",
    "Khu phố Hoàng Xá, Xã A, Tỉnh B",
    "Số 10, Thành phố Tây Hồ",
    "123 Nguyen Trai, Phuong 1",
  ]) {
    assert.equal(
      schema.safeParse({ ...validFormValues, addressDetail }).success,
      true,
      `expected public address detail to remain valid: ${addressDetail}`,
    );
  }
});

test("warranty activation errors distinguish business and transport failures", async () => {
  const { getWarrantyActivationErrorKind, isActivationCodeErrorKind } =
    await importRequired("../src/hooks/use-warranty-activation-request.ts");
  const businessError = (code) =>
    new HttpClientError({
      details: { code },
      isNetworkError: false,
      message: code,
      status: 400,
    });

  assert.equal(
    getWarrantyActivationErrorKind(
      businessError("ACTIVATION_CODE_INVALID_OR_EXPIRED"),
    ),
    "activationCodeInvalid",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      businessError("ACTIVATION_CODE_PRODUCT_NOT_ASSIGNED"),
    ),
    "activationCodeNotAssigned",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      businessError("ACTIVATION_CODE_NOT_APPLICABLE"),
    ),
    "activationCodeNotApplicable",
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
        code: "ACTIVATION_REQUEST_ALREADY_OPEN",
        isNetworkError: false,
        message: "Activation code already has an open request",
        status: 409,
      }),
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
  assert.equal(
    getWarrantyActivationErrorKind(
      new HttpClientError({
        isNetworkError: true,
        message: "Network Error",
      }),
    ),
    "network",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Service unavailable",
        status: 503,
      }),
    ),
    "serviceUnavailable",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      businessError("ACTIVATION_CODE_UNAVAILABLE"),
    ),
    "serviceUnavailable",
  );
  assert.equal(
    getWarrantyActivationErrorKind(
      new HttpClientError({
        isNetworkError: false,
        message: "Not found",
        status: 404,
      }),
    ),
    "notFound",
  );

  for (const kind of [
    "activationCodeInvalid",
    "activationCodeNotApplicable",
    "activationCodeNotAssigned",
    "alreadyOpen",
    "notFound",
  ]) {
    assert.equal(isActivationCodeErrorKind(kind), true);
  }
  assert.equal(isActivationCodeErrorKind("network"), false);
  assert.equal(isActivationCodeErrorKind(null), false);
});

test("warranty activation form renders code errors at the activation-code field", async () => {
  const [source, viSource, enSource] = await Promise.all([
    readFile(
      new URL(
        "../src/views/warranty/components/warranty-activation-request-form.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../src/messages/vi.json", import.meta.url), "utf8"),
    readFile(new URL("../src/messages/en.json", import.meta.url), "utf8"),
  ]);

  assert.match(source, /form\.setError\(\s*"activationCode"/);
  assert.match(source, /isActivationCodeErrorKind\(errorKind\)/);
  assert.doesNotMatch(source, /toast\.error/);

  const errorKinds = [
    "activationCodeInvalid",
    "activationCodeNotApplicable",
    "activationCodeNotAssigned",
    "alreadyOpen",
    "invalid",
    "network",
    "notFound",
    "rateLimit",
    "request",
    "serviceUnavailable",
  ];

  for (const messagesSource of [viSource, enSource]) {
    const errors = JSON.parse(messagesSource).Warranty.activate.errors;
    for (const kind of errorKinds) {
      assert.equal(typeof errors[kind], "string", `missing errors.${kind}`);
      assert.notEqual(errors[kind].trim(), "", `empty errors.${kind}`);
    }
  }
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
  assert.match(source, /submittedAtLabel/);
  assert.match(source, /reservationTitle/);
  assert.match(source, /reservationDescription/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /bg-success-surface/);
  assert.match(source, /bg-info-surface/);
  assert.doesNotMatch(source, /function formatRequestDateTime/);
  assert.doesNotMatch(source, /1-2/);

  for (const [locale, messages] of [
    ["vi", vi.default],
    ["en", en.default],
  ]) {
    const success = messages.Warranty.activate.success;
    assert.equal(typeof success.timelineTitle, "string");
    assert.equal(typeof success.submittedStep, "string");
    assert.equal(typeof success.reviewStep, "string");
    assert.equal(typeof success.activationStep, "string");
    assert.equal(typeof success.submittedAtLabel, "string");
    assert.equal(typeof success.requestCodeHint, "string");
    assert.equal(typeof success.reservationTitle, "string");
    assert.equal(typeof success.reservationDescription, "string");
    assert.equal(typeof success.emailDescription, "string");

    if (locale === "vi") {
      assert.match(success.description, /chưa được kích hoạt/i);
      assert.match(success.reservationDescription, /mã kích hoạt/i);
    } else {
      assert.match(success.description, /not active yet/i);
      assert.match(success.reservationDescription, /activation code/i);
    }
  }
});

test("warranty activation reports success and clipboard results through localized toasts", async () => {
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
  assert.doesNotMatch(formSource, /toast\.error/);
  assert.match(successSource, /toast\.success\(t\("copied"\)\)/);
  assert.match(successSource, /toast\.error\(t\("copyFailed"\)\)/);

  for (const messages of [vi.default, en.default]) {
    assert.equal(
      typeof messages.Warranty.activate.success.copyFailed,
      "string",
    );
  }
});
