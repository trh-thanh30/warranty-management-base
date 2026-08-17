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

const translationKeys = [...formSource.matchAll(/\bt\("([^"]+)"/g)]
  .map((match) => match[1])
  .filter((key): key is string => Boolean(key));

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
