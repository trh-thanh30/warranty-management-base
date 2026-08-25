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

test("activation form does not duplicate the customer birthdate editor", () => {
  assert.doesNotMatch(formSource, /name="customerBirthdate"/);
  assert.doesNotMatch(
    formSource,
    /id="create-activation-request-customer-birthdate"/,
  );
  assert.doesNotMatch(formSource, /<DatePicker/);
});

for (const locale of ["vi", "en"]) {
  test(`birthdate input copy exists in the ${locale} locale`, () => {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as {
      WarrantyActivationRequestsAdmin: Record<string, unknown>;
    };

    assert.equal(
      typeof messages.WarrantyActivationRequestsAdmin.birthdateInvalid,
      "string",
    );
    assert.equal(
      typeof messages.WarrantyActivationRequestsAdmin.birthdateInputPlaceholder,
      "string",
    );
  });
}
