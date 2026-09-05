import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tableUrl = new URL("./components/products-table.tsx", import.meta.url);
const detailUrl = new URL("./product-detail.view.tsx", import.meta.url);
const assignmentDialogUrl = new URL(
  "../activation-code-batches/components/activation-code-product-assignment-dialog.tsx",
  import.meta.url,
);
const categoryFormUrl = new URL(
  "../categories/components/category-form.tsx",
  import.meta.url,
);
const categoryFormHookUrl = new URL(
  "../categories/hooks/use-category-form.ts",
  import.meta.url,
);

test("product actions hide activation-code assignment for disabled categories", async () => {
  const [table, detail] = await Promise.all([
    readFile(tableUrl, "utf8"),
    readFile(detailUrl, "utf8"),
  ]);

  assert.match(table, /categoryRef\?\.activationCodeEnabled === true/);
  assert.match(detail, /categoryRef\?\.activationCodeEnabled === true/);
});

test("activation-code assignment dialog requests only assignable products", async () => {
  const dialog = await readFile(assignmentDialogUrl, "utf8");

  assert.match(dialog, /activationCodeAssignable: "true"/);
});

test("only admins see and submit category activation-code configuration", async () => {
  const [form, hook] = await Promise.all([
    readFile(categoryFormUrl, "utf8"),
    readFile(categoryFormHookUrl, "utf8"),
  ]);

  assert.match(form, /hasRole\("admin"\)/);
  assert.match(form, /selectedType === "PRODUCT" && hasRole\("admin"\)/);
  assert.match(hook, /canConfigureActivationCodes = hasRole\("admin"\)/);
  assert.match(hook, /includeActivationCodeConfig/);
});
