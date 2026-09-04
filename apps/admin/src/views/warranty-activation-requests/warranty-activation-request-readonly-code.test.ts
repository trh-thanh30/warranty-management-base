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

test("the assigned activation code is read-only in the activation request form", () => {
  assert.match(
    formSource,
    /id="create-activation-request-activation-code"[\s\S]*?readOnly/,
  );
  assert.doesNotMatch(formSource, /selectAvailableActivationCode/);
  assert.doesNotMatch(formSource, /clearAvailableActivationCode/);
});
