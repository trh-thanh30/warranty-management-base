import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL(
    "./components/create-warranty-activation-request-form-card.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("selected product summary stays on one line on narrow screens", () => {
  assert.match(
    source,
    /className="flex items-center justify-between gap-2 overflow-hidden whitespace-nowrap rounded-md[^"]*sm:whitespace-normal/,
  );
  assert.match(
    source,
    /className="min-w-0 truncate text-slate-600 dark:text-slate-300"/,
  );
  assert.match(
    source,
    /className="shrink-0 whitespace-nowrap font-semibold text-slate-950 dark:text-slate-50"/,
  );
});
