import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("product activation-code page embeds the shared assignment form and assigned-code directory", async () => {
  const source = await readFile(
    new URL("./product-activation-codes.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /<AssignActivationCodesForm product=\{product\} \/>/);
  assert.match(source, /<ActivationCodeDetailView/);
});

test("warranty activation dialog wraps the same shared assignment form", async () => {
  const source = await readFile(
    new URL(
      "../products/components/assign-activation-codes-dialog.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /<Dialog open=\{open\}/);
  assert.match(source, /<AssignActivationCodesForm/);
  assert.match(source, /active=\{open\}/);
});

test("activation-code table identifies the source batch for each code", async () => {
  const [detailViewSource, sharedTypeSource] = await Promise.all([
    readFile(
      new URL("./activation-code-detail.view.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../../../../../packages/shared/src/types/activation-code-report.types.ts",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(detailViewSource, /t\("columns\.batch"\)/);
  assert.match(detailViewSource, /item\.batchName/);
  assert.match(detailViewSource, /item\.batchCode/);
  assert.match(
    sharedTypeSource,
    /export type ActivationCodeDetail = \{[\s\S]*?batchCode: string;[\s\S]*?batchName: string;/,
  );
});

test("activation-code table preserves column widths and scrolls horizontally", async () => {
  const detailViewSource = await readFile(
    new URL("./activation-code-detail.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    detailViewSource,
    /<TableScroll[\s\S]*?<Table className="min-w-\[1200px\] whitespace-nowrap">/,
  );
});
