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

test("birthdate supports manual input and month-year navigation", () => {
  assert.match(formSource, /allowManualInput/);
  assert.match(formSource, /captionLayout="dropdown"/);
  assert.match(formSource, /startMonth=\{new Date\(1900, 0, 1\)\}/);
  assert.match(formSource, /maxDate=\{today\}/);
  assert.match(formSource, /disabledDates=\{\{ after: today \}\}/);
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
