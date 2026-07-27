import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./content-page-form.tsx", import.meta.url),
  "utf8",
);

test("content page summary uses a multiline textarea", () => {
  assert.match(
    source,
    /<Textarea[\s\S]*?id="content-page-summary"[\s\S]*?rows=\{4\}/,
  );
});

test("content page rich-text editor enables document import", () => {
  assert.match(
    source,
    /<RichTextEditor[\s\S]*?maxLength=\{20_000\}[\s\S]*?onImportDocument=\{[\s\S]*?value=\{field\.value\}/,
  );
});
