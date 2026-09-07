import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const detailCardUrl = new URL(
  "./components/product-detail-card.tsx",
  import.meta.url,
);

test("product detail uses a summary-first responsive layout", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /ProductSummaryHeader/);
  assert.match(
    source,
    /lg:grid-cols-\[minmax\(0,1\.1fr\)_minmax\(20rem,0\.9fr\)\]/,
  );
  assert.match(source, /WarrantyProgress/);
  assert.doesNotMatch(source, /<CardTitle>\{title\}<\/CardTitle>/);
});

test("product detail formats warranty dates and exposes copy actions", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /formatDate\(warranty\.startDate/);
  assert.match(source, /formatDate\(warranty\.endDate/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /aria-label=\{t\("copyValue"/);
});

test("product detail actions are grouped in an accessible dropdown", async () => {
  const source = await readFile(
    new URL("./product-detail.view.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(source.match(/<DropdownMenuItem/g)?.length ?? 0, 3);
  assert.match(source, /<DropdownMenuTrigger asChild>/);
  assert.match(source, /aria-label=\{t\("actions"\)\}/);
  assert.match(source, /descriptionAccessory={/);
  assert.match(source, /PERMISSIONS\.ACTIVATION_CODE_ASSIGN_PRODUCT/);
  assert.match(source, /<AssignActivationCodesDialog/);
  assert.match(source, /t\("assignActivationCodes"\)/);
});

test("product identifiers use distinct semantic icons", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /icon=\{<Hash className="size-4" \/>\}/);
  assert.match(source, /icon=\{<KeyRound className="size-4" \/>\}/);
  assert.match(source, /icon=\{<Fingerprint className="size-4" \/>\}/);
  assert.match(source, /icon=\{<CalendarRange className="size-4" \/>\}/);
});

test("product detail gives the assigned activation code its own section", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /title=\{t\("sections\.activationCode"\)\}/);
  assert.match(source, /AssignedActivationCodeDetails/);
  assert.match(source, /product\.assignedActivationCodes/);
  assert.match(source, /t\("activationCodeUnassignedDescription"\)/);
});

test("product detail rows keep labels above values on mobile", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.equal(
    source.match(/grid min-h-11 grid-cols-\[minmax\(0,1fr\)_minmax\(0,1fr\)\]/g)
      ?.length ?? 0,
    3,
  );
  assert.match(source, /flex min-w-0 items-center justify-end gap-1/);
  assert.match(source, /truncate text-right/);
  assert.match(source, /title=\{value \?\? undefined\}/);
  assert.doesNotMatch(source, /grid-cols-\[96px_minmax\(0,1fr\)\]/);
});

test("product detail rows render localized placeholders for unavailable values", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /const emptyValue = t\("notUpdated"\)/);
  assert.match(source, /value=\{product\.displayName \|\| emptyValue\}/);
  assert.match(
    source,
    /value=\{product\.modelYear \? String\(product\.modelYear\) : emptyValue\}/,
  );
  assert.match(source, /value=\{installationPosition \|\| emptyValue\}/);
  assert.match(source, /\{value \|\| t\("notUpdated"\)\}/);
  assert.doesNotMatch(source, /muted=/);
});

test("product summary and owner sections preserve mobile width", async () => {
  const source = await readFile(detailCardUrl, "utf8");
  const summarySource = source.slice(
    source.indexOf("function ProductSummaryHeader"),
    source.indexOf("function OwnerSummary"),
  );

  assert.match(source, /flex flex-col gap-4 rounded-lg border/);
  assert.match(summarySource, /getProductDisplayName\(product\)/);
  assert.match(summarySource, /product\.categoryRef\.name/);
  assert.match(source, /<OwnerSummary product=\{product\} \/>/);
  assert.match(
    source,
    /<CopyableDetailItem\s+icon=\{<Hash className="size-4" \/>\}\s+label=\{t\("productCode"\)\}/,
  );
  assert.match(source, /flex items-center justify-between gap-3 border-b/);
  assert.match(
    source,
    /<WarrantyStatusBadge status=\{product\.warranty\?\.status\} \/>/,
  );
});

test("product detail translations exist in every admin locale", async () => {
  const keys = [
    "notUpdated",
    "noOwner",
    "copyValue",
    "copySuccess",
    "copyError",
    "warrantyProgress",
    "remainingMonths",
    "warrantyExpired",
    "warrantyUpcoming",
    "activationCode",
    "activationCodeUnassigned",
    "activationCodeUnassignedDescription",
    "activationCodeBatch",
    "activationCodeExpiresAt",
  ];

  for (const locale of ["en", "vi"]) {
    const messages = JSON.parse(
      await readFile(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as { Products?: Record<string, unknown> };

    for (const key of keys) {
      assert.equal(
        typeof messages.Products?.[key],
        "string",
        `${locale}.${key}`,
      );
    }
  }
});
