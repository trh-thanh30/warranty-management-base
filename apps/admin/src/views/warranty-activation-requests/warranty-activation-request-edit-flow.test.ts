import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("pending activation requests expose one action menu with edit, approve and reject", () => {
  const source = read("./warranty-activation-request-detail.view.tsx");

  assert.match(source, /<DropdownMenu>/);
  assert.match(source, /warranty-activation-requests\/\$\{request\.id\}\/edit/);
  assert.match(source, /actions\.openAction\(request, "approve"\)/);
  assert.match(source, /actions\.openAction\(request, "reject"\)/);
  assert.match(
    source,
    /request\.activationCode\.status === "PENDING_APPROVAL"/,
  );
});

test("the edit route loads the current request into the shared form", () => {
  const view = read("./warranty-activation-request-edit.view.tsx");
  const form = read("./hooks/use-create-warranty-activation-request-form.ts");
  const formCard = read(
    "./components/create-warranty-activation-request-form-card.tsx",
  );
  const categoryFields = read(
    "./components/category-activation-input-fields.tsx",
  );

  assert.match(view, /request\.status !== "PENDING"/);
  assert.match(view, /initialRequest=\{request\}/);
  assert.match(form, /form\.reset\(/);
  assert.match(form, /updateMutation\.mutateAsync\(body\)/);
  assert.match(form, /isEditHydrationError/);
  assert.match(formCard, /retryEditHydration/);
  assert.match(categoryFields, /ActivationItemCodeSelectField/);
});
