import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const formSource = readFileSync(
  new URL(
    "./components/create-warranty-activation-request-form-card.tsx",
    import.meta.url,
  ),
  "utf8",
);
const customerDialogSource = readFileSync(
  new URL(
    "./components/edit-activation-request-customer-dialog.tsx",
    import.meta.url,
  ),
  "utf8",
);

const translationKeys = [
  ...`${formSource}\n${customerDialogSource}`.matchAll(/\bt\("([^"]+)"/g),
]
  .map((match) => match[1])
  .filter((key): key is string => Boolean(key));

const activationApiErrorCodes = [
  "ACTIVATION_CATEGORY_REQUIRED",
  "ACTIVATION_FORM_DISABLED",
  "ACTIVATION_ITEM_VALIDATOR_UNAVAILABLE",
  "ACTIVATION_POSITION_DUPLICATE",
  "ACTIVATION_POSITION_INVALID",
  "ACTIVATION_PRODUCT_DUPLICATE",
  "ACTIVATION_REQUIRED_POSITION_MISSING",
  "ACTIVATION_REQUEST_ALREADY_ACTIVATED",
  "ACTIVATION_TARGET_REQUIRED",
  "CATEGORY_NOT_FOUND",
  "CUSTOMER_IDENTITY_CONFLICT",
  "CUSTOMER_NOT_FOUND",
  "CUSTOMER_UPDATE_REQUIRED",
  "DEALER_NOT_FOUND",
  "WARRANTY_OWNER_REQUIRED",
  "WARRANTY_START_DATE_IN_FUTURE",
] as const;

for (const locale of ["vi", "en"]) {
  test(`create activation request form copy exists in the ${locale} locale`, () => {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as {
      WarrantyActivationRequestsAdmin?: Record<string, unknown>;
    };

    const namespace = messages.WarrantyActivationRequestsAdmin;
    assert.ok(
      namespace,
      `${locale} is missing WarrantyActivationRequestsAdmin`,
    );

    for (const key of translationKeys) {
      assert.ok(
        namespace[key],
        `${locale} is missing WarrantyActivationRequestsAdmin.${key}`,
      );
    }
  });
}

for (const locale of ["vi", "en"]) {
  test(`activation API errors are localized in the ${locale} locale`, () => {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as { ApiErrors?: Record<string, unknown> };

    assert.ok(messages.ApiErrors, `${locale} is missing ApiErrors`);
    for (const code of activationApiErrorCodes) {
      assert.equal(
        typeof messages.ApiErrors[code],
        "string",
        `${locale} is missing ApiErrors.${code}`,
      );
    }
  });
}

test("activation address copy asks only for the required local detail", () => {
  const viMessages = JSON.parse(
    readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
  ) as {
    WarrantyActivationRequestsAdmin: Record<string, unknown>;
  };
  const enMessages = JSON.parse(
    readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
  ) as {
    WarrantyActivationRequestsAdmin: Record<string, unknown>;
  };

  assert.equal(
    viMessages.WarrantyActivationRequestsAdmin.addressDetail,
    "Số nhà, đường hoặc khu phố",
  );
  assert.equal(
    viMessages.WarrantyActivationRequestsAdmin.addressDetailPlaceholder,
    "Nhập số nhà, đường hoặc khu phố",
  );
  assert.equal(
    enMessages.WarrantyActivationRequestsAdmin.addressDetail,
    "House number, street or neighborhood",
  );
  assert.equal(
    enMessages.WarrantyActivationRequestsAdmin.addressDetailPlaceholder,
    "Enter a house number, street or neighborhood",
  );
  assert.equal(
    typeof viMessages.WarrantyActivationRequestsAdmin
      .addressAdministrativeUnitNotAllowed,
    "string",
  );
  assert.equal(
    typeof enMessages.WarrantyActivationRequestsAdmin
      .addressAdministrativeUnitNotAllowed,
    "string",
  );
});

test("activation customer summary localizes missing information", () => {
  const viMessages = JSON.parse(
    readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
  ) as {
    WarrantyActivationRequestsAdmin: Record<string, unknown>;
  };
  const enMessages = JSON.parse(
    readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
  ) as {
    WarrantyActivationRequestsAdmin: Record<string, unknown>;
  };

  assert.equal(
    viMessages.WarrantyActivationRequestsAdmin.noInformation,
    "Không có thông tin",
  );
  assert.equal(
    enMessages.WarrantyActivationRequestsAdmin.noInformation,
    "No information",
  );
});
