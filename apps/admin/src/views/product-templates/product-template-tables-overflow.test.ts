import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const directoryTableUrl = new URL(
  "./components/product-templates-table.tsx",
  import.meta.url,
);
const linkedProductsTableUrl = new URL(
  "./components/linked-products-table.tsx",
  import.meta.url,
);

test("product template tables wrap headers and scroll long table content", async () => {
  const sources = await Promise.all(
    [directoryTableUrl, linkedProductsTableUrl].map((url) =>
      readFile(url, "utf8"),
    ),
  );

  for (const source of sources) {
    assert.match(source, /max-h-144 overflow-auto/);
    assert.match(
      source,
      /sticky top-0 z-10 bg-white.*\[&_th\]:whitespace-normal/,
    );
    assert.match(source, /\[&_th\]:text-wrap/);
  }
});
