import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("product search uses the shared debounce hook", async () => {
  const source = await readFile(
    new URL("../src/views/products/products.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /import \{ useDebounce \} from "@repo\/hooks"/);
  assert.match(source, /useDebounce\(searchQuery\.trim\(\), 300\)/);
  assert.match(source, /if \(debouncedSearchQuery\)/);
});
