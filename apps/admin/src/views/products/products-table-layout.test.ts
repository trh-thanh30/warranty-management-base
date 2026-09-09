import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const productsTableUrl = new URL(
  "./components/products-table.tsx",
  import.meta.url,
);
const assignmentFormUrl = new URL(
  "./components/assign-activation-codes-form.tsx",
  import.meta.url,
);
const assignmentDialogUrl = new URL(
  "./components/assign-activation-codes-dialog.tsx",
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
  assert.match(
    source,
    /href=\{`\/products\/\$\{product\.id\}\/activation-codes`\}/,
  );
  assert.doesNotMatch(source, /onAssignCodes/);
  assert.match(source, /product\.assignedActivationCodes/);
  assert.match(source, /"assignActivationCodes"/);
});

test("activation-code dialog lists existing codes and bulk assigns selected codes", async () => {
  const source = await readFile(assignmentFormUrl, "utf8");

  assert.match(source, /product\?\.assignedActivationCodes \?\? \[\]/);
  assert.match(source, /activationCodesService\.assignProduct/);
  assert.match(source, /activationCodeIds: selectedCodes\.map/);
  assert.match(source, /closeOnSelect=\{false\}/);
  assert.match(source, /setSelectedCodes/);
  assert.match(source, /t\("selectedCount"/);
  assert.match(source, /currentCodes\.map/);
  assert.match(source, /<ActivationCodeStatusBadge/);
});

test("activation-code dialog filters assignable codes by a searchable batch", async () => {
  const source = await readFile(assignmentFormUrl, "utf8");
  const dialogSource = await readFile(assignmentDialogUrl, "utf8");

  assert.match(source, /activationCodesService\.listBatches/);
  assert.match(source, /const \[batchId, setBatchId\] = useState\("ALL"\)/);
  assert.match(
    dialogSource,
    /className="max-h-\[calc\(100dvh-2rem\)\][^"]*overflow-y-auto[^"]*md:max-w-4xl"/,
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
    dialogSource,
    /onOpenAutoFocus=\{\(event\) => event\.preventDefault\(\)\}/,
  );
  assert.match(source, /t\("allBatchesDescription"\)/);
  assert.match(source, /setSelectedCodes\(\[\]\)/);
  assert.match(source, /t\("allBatches"\)/);
  assert.match(source, /code\.batchName \|\| code\.batchCode/);
  assert.match(source, /t\("codeBatch", \{/);
  assert.equal(source.match(/t\("codeBatch", \{/g)?.length, 2);
  assert.match(source, /batch\.assignableCount/);
  assert.match(source, /getItemDisabledReason=\{\(batch\) =>/);
  assert.match(source, /batch\.assignableCount === 0/);
  assert.match(source, /t\("batchUnavailableReason"\)/);
  assert.match(source, /assignedCodeCountByBatch/);
  assert.match(source, /t\("batchAssignableCount"/);
  assert.match(source, /t\("batchAssignedToProductCount"/);
  assert.match(source, /<Badge/);
  assert.match(source, /selectedCodes\.map\(\(code\) =>/);
  assert.match(
    source,
    /<ActivationCodeStatusBadge[\s\S]*?status=\{code\.status\}/,
  );
  assert.match(source, /onRetry=\{\(\) => void batchesQuery\.refetch\(\)\}/);
  assert.match(source, /onRetry=\{\(\) => void codesQuery\.refetch\(\)\}/);
});

test("activation-code dialog assigns a requested quantity from all or selected batches", async () => {
  const source = await readFile(assignmentFormUrl, "utf8");

  assert.match(source, /SELECTED/);
  assert.match(source, /ALL_AVAILABLE/);
  assert.match(source, /QUANTITY/);
  assert.match(source, /assignmentMode/);
  assert.equal(source.match(/<Checkbox/g)?.length, 2);
  assert.equal(
    source.match(
      /disabled=\{mutation\.isPending \|\| !canSubmit \|\| batchId === "ALL"\}/g,
    )?.length,
    1,
  );
  assert.match(
    source,
    /useState<ActivationCodeProductAssignmentMode>\("SELECTED"\)/,
  );
  assert.match(source, /t\("allAvailableAssignment"\)/);
  assert.match(source, /t\("quantityAssignment"\)/);
  assert.match(source, /t\("allAvailableNotice", \{ product: productName \}\)/);
  assert.doesNotMatch(source, /t\("selectAllAvailable"\)/);
  assert.doesNotMatch(source, /<Select[\s>]/);
  assert.match(source, /selectedBatchIds/);
  assert.match(source, /quantity/);
  assert.doesNotMatch(source, /rangeFrom/);
  assert.doesNotMatch(source, /rangeTo/);
  assert.doesNotMatch(source, /assignmentMode === "RANGE"/);
  assert.match(source, /batchId/);

  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    );
    const translations = messages.ProductActivationCodeAssignment;
    for (const key of [
      "quantityAssignment",
      "quantityAssignmentDescription",
      "quantity",
      "quantityInvalid",
      "selectedBatchCount",
      "allAvailableAssignment",
      "allAvailableAssignmentDescription",
      "automaticModeRequiresBatch",
      "selectAllAvailable",
      "clearAllAvailable",
      "allAvailableNotice",
      "confirmAutomatic",
    ]) {
      assert.equal(typeof translations[key], "string", `${locale}.${key}`);
    }
  }
});

test("product table displays the assigned activation code on desktop and mobile", async () => {
  const source = await readFile(productsTableUrl, "utf8");

  assert.match(source, /t\("activationCode"\)/);
  assert.match(source, /ProductActivationCodeCell/);
  assert.match(source, /product\.assignedActivationCodes/);
  assert.match(source, /t\("activationCodeUnassigned"\)/);
});
