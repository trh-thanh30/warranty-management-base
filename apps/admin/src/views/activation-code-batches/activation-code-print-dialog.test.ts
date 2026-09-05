import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dialogSource = readFileSync(
  new URL("./components/activation-code-print-dialog.tsx", import.meta.url),
  "utf8",
);
const viMessages = JSON.parse(
  readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
);
const enMessages = JSON.parse(
  readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
);

test("print dialog keeps the 64-label preset and supports custom dimensions", () => {
  assert.match(dialogSource, /DEFAULT_ACTIVATION_LABEL_WIDTH_MM/);
  assert.match(dialogSource, /DEFAULT_ACTIVATION_LABEL_HEIGHT_MM/);
  assert.match(dialogSource, /labelWidthMm/);
  assert.match(dialogSource, /labelHeightMm/);
  assert.match(dialogSource, /resolveActivationLabelLayout/);
  assert.match(dialogSource, /labelsPerPage/);
});

test("print layout controls are translated", () => {
  for (const messages of [viMessages, enMessages]) {
    const activationCodes = messages.ActivationCodeBatches;
    for (const key of [
      "printSizeTitle",
      "printSizeDescription",
      "printLabelWidth",
      "printLabelHeight",
      "printLayoutPreview",
      "printLayoutInvalid",
    ]) {
      assert.equal(typeof activationCodes[key], "string", key);
    }
  }
});
