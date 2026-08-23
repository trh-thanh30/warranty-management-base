import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL(
    "./components/warranty-activation-requests-table.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("activation request action column stays on one line", () => {
  assert.match(
    source,
    /<TableHead className="whitespace-nowrap text-right">\s*\{t\("actions"\)\}\s*<\/TableHead>/,
  );
  assert.match(source, /<TableCell className="whitespace-nowrap text-right">/);
});
