import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./compact-badge-list.tsx", import.meta.url),
  "utf8",
);
const barrelSource = readFileSync(
  new URL("./index.ts", import.meta.url),
  "utf8",
);

test("compact badge list is reusable through the common component barrel", () => {
  assert.match(barrelSource, /export \* from "\.\/compact-badge-list"/);
  assert.match(source, /maxVisibleItems = 2/);
  assert.match(source, /badgeVariant = "info"/);
  assert.match(source, /emptyContent = "-"/);
});

test("compact badge list exposes hidden items on hover and keyboard focus", () => {
  assert.match(source, /<TooltipTrigger asChild>/);
  assert.match(source, /aria-label=\{overflowAriaLabel/);
  assert.match(source, /hiddenItems\.map/);
  assert.match(source, /focus-visible:ring-2/);
});

test("compact badge list can show full item text on hover and keyboard focus", () => {
  assert.match(source, /showItemTooltip = false/);
  assert.match(source, /<TooltipTrigger asChild>\{badge\}<\/TooltipTrigger>/);
  assert.match(source, /tabIndex=\{showTooltip \? 0 : undefined\}/);
  assert.match(source, /<TooltipContent[^>]*>\s*\{item\}/);
});
