import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("claim detail cards size to content instead of stretching each other", () => {
  const source = readFileSync(
    new URL("./components/warranty-claim-detail-content.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /className="grid items-start gap-3/);
  assert.equal(source.match(/<Card className="h-fit /g)?.length, 2);
});

test("claim attachments do not reserve a tall empty gallery", () => {
  const source = readFileSync(
    new URL("./components/claim-attachments-section.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /\bmin-h-\[/);
});
