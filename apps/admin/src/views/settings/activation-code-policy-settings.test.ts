import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const componentSource = readFileSync(
  new URL("./components/activation-code-policy-settings.tsx", import.meta.url),
  "utf8",
);
const viMessages = JSON.parse(
  readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
);
const enMessages = JSON.parse(
  readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
);

test("policy form warns that saving synchronizes existing and future code expiry", () => {
  assert.match(componentSource, /t\("expirySyncDescription"\)/);
  assert.match(
    viMessages.Settings.activationCodePolicy.expirySyncDescription,
    /tất cả lô và mã đã tạo/,
  );
  assert.match(
    enMessages.Settings.activationCodePolicy.expirySyncDescription,
    /every existing batch and code/,
  );
});

test("policy form configures minimum, default, and maximum batch quantities", () => {
  assert.match(componentSource, /t\("minBatchQuantity"\)/);
  assert.match(componentSource, /t\("defaultBatchQuantity"\)/);
  assert.match(componentSource, /t\("maxBatchQuantity"\)/);
  assert.match(componentSource, /minBatchQuantity <= defaultBatchQuantity/);
  assert.match(componentSource, /defaultBatchQuantity <= maxBatchQuantity/);
  assert.match(componentSource, /MAX_ACTIVATION_CODES_PER_BATCH/);
  assert.ok(viMessages.Settings.activationCodePolicy.quantityRangeError);
  assert.ok(enMessages.Settings.activationCodePolicy.quantityRangeError);
});
