import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentUrl = new URL(
  "./activation-code-status-badge.tsx",
  import.meta.url,
);

test("activation code status badge centralizes labels and visual variants", async () => {
  const source = await readFile(componentUrl, "utf8");

  assert.match(source, /useTranslations\("ActivationCodeStatuses"\)/);
  assert.match(source, /AVAILABLE: "info"/);
  assert.match(source, /PENDING_APPROVAL: "warning"/);
  assert.match(source, /ACTIVATED: "success"/);
  assert.match(source, /EXPIRED: "destructive"/);
  assert.match(source, /variant=\{STATUS_VARIANTS\[status\]\}/);
  assert.match(source, /count\?: number/);
  assert.match(source, /count !== undefined \? `: \$\{count\}` : null/);
});
