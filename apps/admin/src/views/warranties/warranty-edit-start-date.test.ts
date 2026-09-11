import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("warranty edit exposes installation date and the projected end date", async () => {
  const source = await readFile(
    new URL("./components/warranty-edit-form-card.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /<DateTimePicker/);
  assert.match(source, /startDate: parsedStartDate\.toISOString\(\)/);
  assert.match(source, /calculateWarrantyEndDate/);
  assert.match(source, /projectedEndDate/);
});

test("warranty adjustment history renders installation date changes", async () => {
  const source = await readFile(
    new URL("./components/warranty-adjustment-history.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /"startDate"/);
  assert.match(
    source,
    /field === "startDate"[\s\S]*formatDate\(String\(value\), \{ locale, showTime: true \}\)/,
  );
});
