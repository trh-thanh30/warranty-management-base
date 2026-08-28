import assert from "node:assert/strict";
import test from "node:test";

import { truncateTelegramHtml } from "../dist/utils/truncate-html.js";

test("truncates long Telegram HTML while preserving formatting tags", () => {
  const value = `<b>CI failed</b><pre><code>${"x".repeat(5000)}</code></pre>`;
  const result = truncateTelegramHtml(value, 100);

  assert.ok(result.length <= 100 + "</code></pre>".length);
  assert.match(result, /^<b>CI failed<\/b><pre><code>/);
  assert.match(result, /<\/code><\/pre>$/);
  assert.match(result, /…/);
});

test("does not change messages under Telegram limits", () => {
  const value = "<b>short</b>";
  assert.equal(truncateTelegramHtml(value, 4096), value);
});
