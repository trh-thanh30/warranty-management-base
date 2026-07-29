import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("mobile list mode renders a compact horizontal product card", async () => {
  const source = await readFile(
    new URL("../src/views/products/products.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /w-28/);
  assert.match(source, /sm:w-48/);
  assert.match(source, /hidden space-y-1 pt-1 text-xs sm:block/);
});
