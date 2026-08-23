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
