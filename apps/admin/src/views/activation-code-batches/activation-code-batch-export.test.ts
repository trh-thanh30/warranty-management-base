import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("activation batch page uses the shared Excel menu for a full report", async () => {
  const [view, hook] = await Promise.all([
    readFile(
      new URL("./activation-code-batches.view.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("./hooks/use-activation-code-batches.ts", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(view, /<ImportExportMenu[\s\S]*onExportAll=/);
  assert.match(view, /disabled=\{directory\.exportMutation\.isPending\}/);
  assert.match(hook, /activationCodesService\.exportReport\(\)/);
  assert.match(
    hook,
    /downloadBlob\(blob, createDatedFilename\("activation-code-report"\)\)/,
  );
});
