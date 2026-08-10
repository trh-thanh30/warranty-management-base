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
  assert.match(
    source,
    /TableCell className="whitespace-nowrap">\s*\{getProductCategoryLabel\(product\)\}/,
  );
  assert.match(source, /sticky top-0 z-10 bg-white dark:bg-slate-950/);
});
