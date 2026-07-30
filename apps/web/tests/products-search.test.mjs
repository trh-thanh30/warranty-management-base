import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("product search debounces before building the public API query", async () => {
  const source = await readFile(
    new URL("../src/views/products/products.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /import \{ useDebounce \} from "@repo\/hooks"/);
  assert.match(source, /useDebounce\(searchQuery\.trim\(\), 300\)/);
  assert.match(source, /buildPublicProductsQuery/);
  assert.match(source, /search: debouncedSearchQuery/);
});
