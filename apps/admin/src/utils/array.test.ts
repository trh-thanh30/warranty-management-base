import assert from "node:assert/strict";
import test from "node:test";
import { moveItem } from "./array.ts";

test("moveItem reorders an item by direction", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 1, -1), ["b", "a", "c"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 1, 1), ["a", "c", "b"]);
});

test("moveItem returns the same items when target index is out of range", () => {
  const items = ["a", "b", "c"];

  assert.equal(moveItem(items, 0, -1), items);
  assert.equal(moveItem(items, 2, 1), items);
});
