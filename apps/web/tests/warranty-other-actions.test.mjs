import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const warrantyRoot = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "views",
  "warranty",
);

test("warranty subpages share one other-actions component", async () => {
  const componentSource = await readFile(
    path.join(warrantyRoot, "components", "warranty-other-actions.tsx"),
    "utf8",
  );

  assert.match(componentSource, /PUBLIC_DEALER_NETWORK_URL/);
  assert.match(componentSource, /target="_blank"/);
  assert.match(componentSource, /rel="noopener noreferrer"/);
  assert.match(componentSource, /focus-visible:ring-2/);

  for (const filename of [
    "activate.view.tsx",
    "lookup.view.tsx",
    "request.view.tsx",
    "track.view.tsx",
  ]) {
    const source = await readFile(path.join(warrantyRoot, filename), "utf8");

    assert.match(source, /<WarrantyOtherActions/);
    assert.doesNotMatch(
      source,
      /mt-4 grid gap-3 text-center text-xs font-semibold uppercase tracking-wide/,
    );
  }
});
