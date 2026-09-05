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
  assert.match(
    source,
    /className="w-max min-w-full table-auto \[&_td\]:whitespace-nowrap \[&_th\]:whitespace-nowrap"/,
  );
  assert.doesNotMatch(source, /min-w-352/);
  assert.doesNotMatch(source, /\{t\("category"\)\}/);
  assert.match(source, /\{getProductCategoryLabel\(product\)\}/);
  assert.doesNotMatch(source, /\{product\.name\} · \{product\.productCode\}/);
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
  assert.match(
    source,
    /product\.assignedActivationCode &&[\s\S]*?!product\.assignedActivationCode\.canReplace/,
  );
  assert.match(source, /"activationCodeChangeLocked"/);
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
  assert.match(source, /<ActivationCodeStatusBadge/);
  assert.match(source, /<ConfirmActionDialog/);
  assert.match(source, /!currentCode\.canReplace/);
});

test("activation-code dialog filters assignable codes by a searchable batch", async () => {
  const source = await readFile(
    new URL("./components/assign-activation-codes-dialog.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /activationCodesService\.listBatches/);
  assert.match(source, /const \[batchId, setBatchId\] = useState\("ALL"\)/);
  assert.match(
    source,
    /className="w-\[min\(calc\(100vw-2rem\),42rem\)\] max-w-2xl"/,
  );
  assert.match(
    source,
    /selectedBatchLabel[\s\S]*?useState\(\(\) =>\s*t\("allBatches"\)/,
  );
  assert.match(source, /batchId: batchId === "ALL" \? undefined : batchId/);
  assert.equal(source.match(/<SearchDropdown/g)?.length, 2);
  assert.doesNotMatch(source, /<Combobox/);
  assert.match(source, /id: "ALL"/);
  assert.match(source, /setBatchId\("ALL"\)/);
  assert.match(
    source,
    /onOpenAutoFocus=\{\(event\) => event\.preventDefault\(\)\}/,
  );
  assert.match(source, /t\("allBatchesDescription"\)/);
  assert.match(source, /setSelected\(null\)/);
  assert.match(source, /t\("allBatches"\)/);
  assert.match(source, /code\.batchName \|\| code\.batchCode/);
  assert.match(source, /selected\.batchName \|\| selected\.batchCode/);
  assert.match(
    source,
    /<ActivationCodeStatusBadge[\s\S]*?status=\{code\.status\}/,
  );
  assert.match(source, /onRetry=\{\(\) => void batchesQuery\.refetch\(\)\}/);
  assert.match(source, /onRetry=\{\(\) => void codesQuery\.refetch\(\)\}/);
});

test("product table displays the assigned activation code on desktop and mobile", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(source, /t\("activationCode"\)/);
  assert.match(source, /ProductActivationCodeCell/);
  assert.match(source, /product\.assignedActivationCode/);
  assert.match(source, /t\("activationCodeUnassigned"\)/);
});
