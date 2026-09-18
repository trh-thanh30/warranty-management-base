import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const detailCardUrl = new URL(
  "./components/warranty-detail-card.tsx",
  import.meta.url,
);

test("warranty detail separates summary, coverage, and cancellation details", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /WarrantySummaryHeader/);
  assert.match(source, /warranty\.status === "VOIDED"/);
  assert.match(source, /voidItems\.length/);
  assert.match(source, /const voidItems/);
  assert.match(source, /<hr className=" border-t border-slate-100 my-3" \/>/);
  assert.match(source, /flex-row\s+md:flex\s+items-center\s+justify-between/);
});

test("warranty detail uses the product-style detail sections with lighter row dividers", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /function DetailSection/);
  assert.match(source, /divide-y divide-slate-100/);
  assert.doesNotMatch(
    source,
    /CardHeader className="border-b border-slate-200/,
  );
});

test("warranty coverage section hugs its content instead of stretching beside the right column", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(
    source,
    /<DetailSection\s+className="self-start"[\s\S]*title=\{t\("sections\.coverage"\)\}/,
  );
});

test("warranty detail keeps its actions in the page header on desktop", async () => {
  const source = await readFile(
    new URL("./warranty-detail.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /descriptionAccessory=\{/);
  assert.doesNotMatch(
    source,
    /<div className="flex flex-wrap justify-end gap-2">/,
  );
});

test("owner transfer defaults to the current owner and requires a different selection", async () => {
  const source = await readFile(
    new URL("./components/transfer-owner-dialog.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useInfiniteCustomers/);
  assert.match(source, /<SearchDropdown/);
  assert.match(source, /onReachEnd=\{/);
  assert.match(source, /customersQuery\.fetchNextPage\(\)/);
  assert.match(source, /selectedCustomer\?\.id \?\? currentOwnerId/);
  assert.match(source, /getItemDisabledReason=\{/);
  assert.match(source, /currentOwnerDisabled/);
  assert.match(
    source,
    /disabled=\{\s*!customerId \|\| customerId === currentOwnerId \|\| transfer\.isPending\s*\}/,
  );
  assert.doesNotMatch(source, /<Select\b/);
});

test("owner transfer shows a toast for success and failure", async () => {
  const source = await readFile(
    new URL("./components/transfer-owner-dialog.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /await transfer\.mutateAsync\(\{ customerId \}\)/);
  assert.match(source, /toast\.success\(t\("transferOwnerSuccess"\)\)/);
  assert.match(source, /catch \{\s*toast\.error\(t\("transferOwnerError"\)\)/);
});
