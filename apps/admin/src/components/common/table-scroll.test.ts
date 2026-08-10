import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tableSourceUrl = new URL(
  "../../../../../packages/ui/src/table.tsx",
  import.meta.url,
);

test("TableScroll provides horizontal overflow and accepts custom classes", async () => {
  const source = await readFile(tableSourceUrl, "utf8");

  assert.match(source, /export function TableScroll/);
  assert.match(source, /HTMLAttributes<HTMLDivElement>/);
  assert.match(source, /w-full overflow-x-auto/);
  assert.match(
    source,
    /className=\{cn\("w-full overflow-x-auto", className\)\} \{\.\.\.props\}/,
  );
});
