import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dialogSource = readFileSync(
  new URL(
    "./components/activation-code-expiry-extension-dialog.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("expiry extension dialog shows live dates and accepts custom months", () => {
  assert.match(dialogSource, /currentExpiry/);
  assert.match(dialogSource, /projectedExpiry/);
  assert.match(dialogSource, /type="number"/);
  assert.match(dialogSource, /max=\{MAX_ACTIVATION_CODE_EXTENSION_MONTHS\}/);
  assert.match(dialogSource, /parseActivationCodeExtensionMonths/);
  assert.match(dialogSource, /addCalendarMonthsUtc/);
});

test("expiry extension actions are present on batch and shared code tables", () => {
  const batchTable = readFileSync(
    new URL("./components/activation-code-batches-table.tsx", import.meta.url),
    "utf8",
  );
  const detailView = readFileSync(
    new URL("./activation-code-detail.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(batchTable, /ActivationCodeExpiryExtensionDialog/);
  assert.match(batchTable, /extendExpiryAction/);
  assert.match(detailView, /ActivationCodeExpiryExtensionDialog/);
  assert.match(detailView, /canExtend/);
  assert.match(detailView, /onExtend/);
});
