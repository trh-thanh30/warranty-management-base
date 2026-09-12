import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("print progress stores the batch name and shows its code alongside the range", () => {
  const hook = readFileSync(
    new URL("./hooks/use-activation-code-print-jobs.ts", import.meta.url),
    "utf8",
  );
  const panel = readFileSync(
    new URL(
      "./components/activation-code-print-jobs-panel.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(hook, /batchName: batch\.batchName/);
  assert.match(
    panel,
    /\{tracked\.batchName\?\.trim\(\) \|\| tracked\.batchCode\}/,
  );
  assert.match(
    panel,
    /text-sm text-slate-500 dark:text-slate-400">\s*\{tracked\.batchCode\} · \{job\.from_index\}–\{job\.to_index\}/,
  );
});
