import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tableSource = readFileSync(
  new URL("./components/dealers-table.tsx", import.meta.url),
  "utf8",
);
const statusBadgeSource = readFileSync(
  new URL("./components/dealer-status-badge.tsx", import.meta.url),
  "utf8",
);

test("dealer status and created date stay on one line", () => {
  assert.match(statusBadgeSource, /className=\{cn\(\s*"whitespace-nowrap"/);
  assert.match(
    tableSource,
    /<TableCell className="whitespace-nowrap">\s*\{formatDate\(dealer\.createdAt, \{ locale \}\)\}/,
  );
});
