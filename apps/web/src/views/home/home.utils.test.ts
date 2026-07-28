import assert from "node:assert/strict";
import test from "node:test";
import { richTextToPlainText } from "./home.utils.ts";

test("converts category rich text to safe plain text", () => {
  assert.equal(
    richTextToPlainText(
      "<p>Công nghệ <strong>LED</strong> &amp; <span>TPMS</span></p>",
    ),
    "Công nghệ LED & TPMS",
  );
});
