import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const viewSource = fileURLToPath(
  new URL("./activation-code-batches.view.tsx", import.meta.url),
);

test("activation batch creation opens in a dialog", async () => {
  const source = await readFile(viewSource, "utf8");

  assert.match(source, /<Dialog[\s\S]*open=\{directory\.isCreateOpen\}/);
  assert.match(source, /<DialogContent[\s\S]*sm:max-w-lg/);
  assert.match(source, /<DialogTitle[\s\S]*\{t\("createTitle"\)\}/);
  assert.match(
    source,
    /<DialogDescription[\s\S]*\{t\("genericPoolDescription"\)\}/,
  );
  assert.match(source, /<Input[\s\S]*autoFocus[\s\S]*type="number"/);
  assert.doesNotMatch(source, /\{directory\.isCreateOpen \? \(/);
});

test("activation batch dialog keeps the form action accessible while creating", async () => {
  const source = await readFile(viewSource, "utf8");

  assert.match(source, /onSubmit=\{\(event\) => \{/);
  assert.match(source, /directory\.createMutation[\s\S]*mutateAsync\(\)/);
  assert.match(source, /toast\.success\(t\("created"\)\)/);
  assert.match(source, /toast\.error\(t\("createError"\)\)/);
  assert.match(source, /disabled=\{directory\.createMutation\.isPending\}/);
});
