import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const productsTableUrl = new URL(
  "./components/products-table.tsx",
  import.meta.url,
);

test("desktop product table keeps content on one line and scrolls long results", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(source, /TableScroll/);
  assert.match(source, /max-h-144 overflow-y-scroll/);
  assert.match(source, /\[&_td\]:whitespace-nowrap/);
  assert.match(source, /\[&_th\]:whitespace-nowrap/);
  assert.match(source, /TooltipTrigger asChild/);
  assert.match(source, /getProductCategoryLabel\(product\)/);
  assert.match(source, /sticky top-0 z-10 bg-white dark:bg-slate-950/);
  assert.doesNotMatch(source, /t\("owner"\)/);
  assert.doesNotMatch(source, /formatProductOwner/);
});

test("product actions expose the existing product detail route", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(
    source,
    /const canView = hasPermission\(PERMISSIONS\.PRODUCT_VIEW\)/,
  );
  assert.match(
    source,
    /<Link href=\{`\/products\/\$\{product\.id\}`\}>[\s\S]*?<Eye[\s\S]*?\{t\("viewDetail"\)\}/,
  );
});

test("product actions expose the clone route", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(
    source,
    /<Link href=\{`\/products\/create\?cloneFrom=\$\{product\.id\}`\}>[\s\S]*?<Copy[\s\S]*?\{t\("clone"\)\}/,
  );
});

test("product actions expose permissioned activation-code assignment", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(source, /PERMISSIONS\.ACTIVATION_CODE_ASSIGN_PRODUCT/);
  assert.match(source, /onSelect=\{\(\) => onAssignCodes\(product\)\}/);
  assert.match(source, /product\.assignedActivationCode/);
  assert.match(source, /"replaceActivationCode"/);
  assert.match(source, /"assignActivationCodes"/);
});

test("activation-code dialog separates assignment from confirmed replacement", async () => {
  const source = await readFile(
    new URL("./components/assign-activation-codes-dialog.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /const currentCode = product\?\.assignedActivationCode/);
  assert.match(source, /replaceProductAssignment/);
  assert.match(source, /currentActivationCodeId: currentCode\.id/);
  assert.match(source, /replacementActivationCodeId: selected!\.id/);
  assert.match(source, /<ProductActivationCodeStatusBadge/);
  assert.match(source, /<ConfirmActionDialog/);
  assert.match(source, /!currentCode\.canReplace/);
});

test("product table displays the assigned activation code on desktop and mobile", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(source, /t\("activationCode"\)/);
  assert.match(source, /ProductActivationCodeCell/);
  assert.match(source, /product\.assignedActivationCode/);
  assert.match(source, /t\("activationCodeUnassigned"\)/);
});
