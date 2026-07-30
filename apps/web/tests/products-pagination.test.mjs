import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getPaginationItems } from "@repo/ui/pagination-controls";

test("product pagination renders every page for a short result set", () => {
  assert.deepEqual(getPaginationItems(2, 5), [1, 2, 3, 4, 5]);
});

test("product pagination keeps the first and last page around a middle page", () => {
  assert.deepEqual(getPaginationItems(50, 100), [
    1,
    "ellipsis-start",
    49,
    50,
    51,
    "ellipsis-end",
    100,
  ]);
});

test("product pagination collapses pages near both boundaries", () => {
  assert.deepEqual(getPaginationItems(2, 100), [
    1,
    2,
    3,
    4,
    5,
    "ellipsis-end",
    100,
  ]);
  assert.deepEqual(getPaginationItems(99, 100), [
    1,
    "ellipsis-start",
    96,
    97,
    98,
    99,
    100,
  ]);
});

test("products use the shared pagination control", async () => {
  const source = await readFile(
    new URL("../src/views/products/products.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /@repo\/ui\/pagination-controls/);
  assert.match(source, /useLenis/);
  assert.match(source, /onScrollToTarget=/);
  assert.doesNotMatch(source, /products-pagination\.utils/);
});
