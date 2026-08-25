import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const formSource = readFileSync(
  new URL("./components/customer-form.tsx", import.meta.url),
  "utf8",
);

test("customer form uses the shared birthdate picker", () => {
  assert.match(formSource, /name="birthdate"/);
  assert.match(formSource, /<DatePicker/);
  assert.match(formSource, /maxDate=\{today\}/);
  assert.match(formSource, /minDate=\{new Date\(1900, 0, 1\)\}/);
});

test("customer code stays separate from the responsive identity row", () => {
  assert.match(formSource, /grid gap-5 sm:grid-cols-2/);

  const customerCodeIndex = formSource.indexOf('id="customer-code"');
  const fullNameIndex = formSource.indexOf('id="customer-full-name"');
  const birthdateIndex = formSource.indexOf('id="customer-birthdate"');

  assert.ok(customerCodeIndex < fullNameIndex);
  assert.ok(fullNameIndex < birthdateIndex);
});

for (const locale of ["vi", "en"] as const) {
  test(`customer birthdate copy exists for ${locale}`, () => {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as { Customers: Record<string, unknown> };

    assert.equal(typeof messages.Customers.birthdate, "string");
    assert.equal(typeof messages.Customers.birthdateInvalid, "string");
    assert.equal(typeof messages.Customers.openBirthdateCalendar, "string");
  });
}
