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
    assert.match(source, /TableScroll/);
    assert.match(source, /max-h-144 overflow-y-auto/);
    assert.match(
      source,
      /sticky top-0 z-10 bg-white.*\[&_th\]:whitespace-normal/,
    );
    assert.match(source, /\[&_th\]:text-wrap/);
  }

  assert.match(
    sources[0],
    /TableCell className="whitespace-nowrap">\s*\{template\.categoryRef\?\.name \?\? "-"\}/,
  );
  assert.match(
    sources[0],
    /TableCell className="font-mono text-xs whitespace-nowrap">\s*\{template\.sku\}/,
  );
});
