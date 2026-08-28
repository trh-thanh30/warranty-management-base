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

test("product detail actions remain full width only on mobile", async () => {
  const source = await readFile(
    new URL("./product-detail.view.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(source.match(/className="w-full sm:w-auto"/g)?.length ?? 0, 2);
  assert.match(source, /descriptionAccessory={/);
});

test("product identifiers use distinct semantic icons", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.match(source, /icon=\{<BookOpen className="size-4" \/>\}/);
  assert.match(source, /icon=\{<Hash className="size-4" \/>\}/);
  assert.match(source, /icon=\{<KeyRound className="size-4" \/>\}/);
  assert.match(source, /icon=\{<Fingerprint className="size-4" \/>\}/);
  assert.match(source, /icon=\{<CalendarRange className="size-4" \/>\}/);
});

test("product detail rows stay on one line on mobile", async () => {
  const source = await readFile(detailCardUrl, "utf8");

  assert.equal(
    source.match(/grid-cols-\[minmax\(0,1fr\)_minmax\(0,1fr\)\][^"]*sm:flex/g)
      ?.length ?? 0,
    2,
  );
  assert.match(source, /overflow-hidden whitespace-nowrap/);
  assert.match(source, /truncate text-right/);
  assert.match(source, /title=\{value\}/);
  assert.doesNotMatch(source, /className="break-all text-right/);
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
