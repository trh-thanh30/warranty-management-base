import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./components/customers-table.tsx", import.meta.url),
  "utf8",
);

test("customer actions switch between soft-delete and restore by status", () => {
  assert.match(source, /customer\.status === "ACTIVE" && onDelete/);
  assert.match(source, /customer\.status === "DELETED" && onRestore/);
  assert.match(source, /onSelect=\{\(\) => onRestore\(customer\)\}/);
});
