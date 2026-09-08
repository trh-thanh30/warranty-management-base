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
const hookSource = readFileSync(
  new URL(
    "./hooks/use-create-warranty-activation-request-form.ts",
    import.meta.url,
  ),
  "utf8",
);

test("the activation request form requires an explicit activation code selection", () => {
  assert.match(formSource, /items=\{selectableActivationCodes\}/);
  assert.match(formSource, /selectActivationCode\(code\)/);
  assert.match(formSource, /t\("chooseDifferentActivationCode"\)/);
  assert.doesNotMatch(hookSource, /resolveAssignedActivationCodeForProduct/);
});

test("categories with activation codes disabled skip code UI and validation", () => {
  assert.match(
    hookSource,
    /if \(requiresActivationCode && !hasActivationCode\)/,
  );
  assert.match(
    hookSource,
    /Boolean\(selectedProduct\) &&\s*requiresActivationCode/,
  );
  assert.match(formSource, /!activationCodeId && requiresActivationCode \? \(/);
});

test("an eligible admin can assign a missing activation code without leaving the form", () => {
  assert.match(formSource, /PERMISSIONS\.ACTIVATION_CODE_ASSIGN_PRODUCT/);
  assert.match(formSource, /<AssignActivationCodesDialog/);
  assert.match(formSource, /t\("assignActivationCode"\)/);
  assert.match(
    formSource,
    /onAssigned=\{async \(\) => \{[\s\S]*?activationCodesQuery\.refetch\(\)/,
  );
});
