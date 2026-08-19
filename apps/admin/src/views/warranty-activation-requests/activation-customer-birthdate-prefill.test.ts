import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hookSource = readFileSync(
  new URL(
    "./hooks/use-create-warranty-activation-request-form.ts",
    import.meta.url,
  ),
  "utf8",
);

test("selecting a customer stores its id and prefills its birthdate", () => {
  assert.match(hookSource, /customerId:\s*customer\.id/);
  assert.match(
    hookSource,
    /customerBirthdate:\s*customer\.birthdate\?\.slice\(0, 10\)\s*\?\?\s*""/,
  );
});

test("clearing a customer clears its id and birthdate", () => {
  assert.match(hookSource, /customerId:\s*""/);
  assert.match(hookSource, /customerBirthdate:\s*""/);
});
