import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tableSource = readFileSync(
  new URL("./components/activation-code-batches-table.tsx", import.meta.url),
  "utf8",
);
const constantsSource = readFileSync(
  new URL("./activation-code-batches.constants.ts", import.meta.url),
  "utf8",
);

test("batch rows show product assignment progress separately from code status", () => {
  assert.match(tableSource, /columns\.assignment/);
  assert.match(tableSource, /assignedProgress/);
  assert.match(tableSource, /batch\.assignedCount/);
  assert.match(tableSource, /<ActivationCodeStatusCounts batch=\{batch\}/);
});

test("batch status counts reuse the shared activation code status badge", () => {
  assert.match(
    tableSource,
    /<ActivationCodeStatusBadge[\s\S]*?count=\{count\}[\s\S]*?status=\{status\}/,
  );
  assert.doesNotMatch(tableSource, /const statusClasses/);
});

test("batch status filters include codes reserved by pending requests", () => {
  assert.match(constantsSource, /"PENDING_APPROVAL"/);

  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      readFileSync(
        new URL(`../../messages/${locale}.json`, import.meta.url),
        "utf8",
      ),
    ) as {
      ActivationCodeBatches: { statuses: Record<string, string> };
    };

    assert.ok(messages.ActivationCodeBatches.statuses.PENDING_APPROVAL);
  }
});

test("mobile batch summaries use valid paragraph structure and identify rename action", () => {
  assert.match(
    tableSource,
    /<div className="truncate font-medium text-slate-950 dark:text-slate-50">[\s\S]*<p className="truncate font-medium">\{batch\.batchName\}<\/p>/,
  );
  assert.match(tableSource, /<Pencil className="mr-2 size-4" \/>/);
  assert.match(tableSource, /\{t\("viewDetails"\)\}/);
  assert.match(tableSource, /<DialogTitle[\s\S]*\{t\("renameTitle"\)\}/);
  assert.match(tableSource, /<Input[\s\S]*autoFocus[\s\S]*renameValue/);
  assert.match(tableSource, /t\("renameSubmit"\)/);
  assert.doesNotMatch(tableSource, /window\.prompt/);
  assert.doesNotMatch(tableSource, /Xem chi tiết mã/);
  assert.doesNotMatch(
    tableSource,
    /<p className="truncate font-medium text-slate-950 dark:text-slate-50">[\s\S]*<p className="truncate font-medium">/,
  );
});
