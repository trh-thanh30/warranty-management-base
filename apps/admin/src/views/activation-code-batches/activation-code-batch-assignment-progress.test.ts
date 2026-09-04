import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tableSource = readFileSync(
  new URL("./components/activation-code-batches-table.tsx", import.meta.url),
  "utf8",
);

test("batch rows show product assignment progress separately from code status", () => {
  assert.match(tableSource, /columns\.assignment/);
  assert.match(tableSource, /assignedProgress/);
  assert.match(tableSource, /batch\.assignedCount/);
  assert.match(tableSource, /<ActivationCodeStatusCounts batch=\{batch\}/);
});
