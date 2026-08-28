import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./combobox.tsx", import.meta.url), "utf8");

test("Combobox uses the shared Vietnamese filter", () => {
  assert.match(source, /filter=\{filterComboboxItem\}/);
});

test("ComboboxItem sends visible string labels to cmdk as keywords", () => {
  assert.match(source, /keywords=\{searchKeywords\}/);
  assert.match(source, /typeof children === "string"/);
});

test("ComboboxTrigger exposes an accessible loading state", () => {
  assert.match(source, /loading\?: boolean/);
  assert.match(source, /loadingLabel\?: string/);
  assert.match(source, /aria-busy=\{loading \|\| undefined\}/);
  assert.match(
    source,
    /loading\s*\? \(loadingLabel \?\? placeholder\)\s*:\s*selectedLabel \|\| placeholder/,
  );
  assert.match(
    source,
    /loading \? \([\s\S]*<Loader2[\s\S]*animate-spin[\s\S]*\) : \([\s\S]*<ChevronsUpDown/,
  );
});
