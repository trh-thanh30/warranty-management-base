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

test("customer identity fields share one responsive desktop row", () => {
  assert.match(formSource, /grid gap-5 sm:grid-cols-12/);
  assert.match(formSource, /sm:col-span-5/);
  assert.match(formSource, /sm:col-span-3/);
  assert.match(formSource, /sm:col-span-4/);

  const fullNameIndex = formSource.indexOf('id="customer-full-name"');
  const birthdateIndex = formSource.indexOf('id="customer-birthdate"');
  const customerCodeIndex = formSource.indexOf('id="customer-code"');

  assert.ok(fullNameIndex < birthdateIndex);
  assert.ok(birthdateIndex < customerCodeIndex);
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
