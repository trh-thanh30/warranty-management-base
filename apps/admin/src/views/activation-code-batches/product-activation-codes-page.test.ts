import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("product activation-code page embeds the shared assignment form and assigned-code directory", async () => {
  const source = await readFile(
    new URL("./product-activation-codes.view.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /<AssignActivationCodesForm product=\{product\} \/>/);
  assert.match(source, /<ActivationCodeDetailView/);
});

test("warranty activation dialog wraps the same shared assignment form", async () => {
  const source = await readFile(
    new URL(
      "../products/components/assign-activation-codes-dialog.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /<Dialog open=\{open\}/);
  assert.match(source, /<AssignActivationCodesForm/);
  assert.match(source, /active=\{open\}/);
});
