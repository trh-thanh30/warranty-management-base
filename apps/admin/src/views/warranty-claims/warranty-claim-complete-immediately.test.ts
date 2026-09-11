import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

test("status dialog exposes a separately confirmed immediate completion action", () => {
  const source = readSource("./components/update-claim-status-dialog.tsx");

  assert.match(source, /t\("completeImmediately"\)/);
  assert.match(source, /setIsConfirmingCompletion\(true\)/);
  assert.match(source, /onCompleteImmediately\(note\)/);
  assert.match(source, /t\("completeImmediatelyWarning"\)/);
});

test("immediate completion copy exists in Vietnamese and English", () => {
  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      readSource(`../../messages/${locale}.json`),
    ) as Record<string, Record<string, string>>;
    const claims = messages.WarrantyClaims;

    assert.ok(claims);
    assert.ok(claims.completeImmediately);
    assert.ok(claims.completeImmediatelyDescription);
    assert.ok(claims.completeImmediatelyWarning);
    assert.ok(claims.confirmCompleteImmediately);
  }
});
