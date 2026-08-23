import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./components/dashboard-recent-claims.tsx", import.meta.url),
  "utf8",
);

test("recent claims desktop table keeps compact values on one line", () => {
  assert.match(source, /<Table className="min-w-\[760px\] whitespace-nowrap">/);
  assert.match(source, /className="max-w-52 truncate font-medium"/);
});
