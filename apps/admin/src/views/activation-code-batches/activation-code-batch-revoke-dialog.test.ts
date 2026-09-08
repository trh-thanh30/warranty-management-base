import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dialogSource = readFileSync(
  new URL(
    "./components/activation-code-batch-revoke-dialog.tsx",
    import.meta.url,
  ),
  "utf8",
);
const viMessages = JSON.parse(
  readFileSync(new URL("../../messages/vi.json", import.meta.url), "utf8"),
);
const enMessages = JSON.parse(
  readFileSync(new URL("../../messages/en.json", import.meta.url), "utf8"),
);

test("batch revoke dialog previews impact and defaults to the safe scope", () => {
  assert.match(dialogSource, /getBatchRevokePreview/);
  assert.match(dialogSource, /UNASSIGNED_ONLY/);
  assert.match(dialogSource, /ALL_REVOCABLE/);
  assert.match(dialogSource, /RadioGroup/);
  assert.match(dialogSource, /revokeProtectedSummary/);
  assert.match(dialogSource, /assignedRevocableCount/);
});

test("batch revoke dialog copy is translated", () => {
  for (const messages of [viMessages, enMessages]) {
    const activationCodes = messages.ActivationCodeBatches;
    for (const key of [
      "revokeDescription",
      "revokeUnassignedOnly",
      "revokeUnassignedOnlyDescription",
      "revokeAllRevocable",
      "revokeAllRevocableDescription",
      "revokeProtectedSummary",
      "revokeLoading",
      "revokePreviewError",
      "revokeRetry",
      "revoking",
    ]) {
      assert.equal(typeof activationCodes[key], "string", key);
    }
  }

  assert.equal(
    viMessages.ActivationCodeBatches.revokeProtectedSummary,
    "Các mã đã được dùng trong yêu cầu kích hoạt bảo hành hoặc đã kích hoạt bảo hành sẽ không bị thu hồi.",
  );
  assert.match(
    viMessages.ActivationCodeBatches.revokeAssignedWarning,
    /Có 1 mã chưa kích hoạt đang được gán cho sản phẩm/,
  );
});
