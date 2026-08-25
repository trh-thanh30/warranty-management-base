import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./components/activation-request-items-table.tsx", import.meta.url),
  "utf8",
);

test("activation request item columns stay readable and scroll horizontally", () => {
  assert.match(
    source,
    /TableScroll className="max-w-full overscroll-x-contain rounded-md/,
  );
  assert.match(source, /Table className="min-w-\[1120px\] whitespace-nowrap"/);
});

test("certificate actions use the standard accessible overflow menu", () => {
  assert.match(source, /function ActivationRequestItemActions/);
  assert.match(source, /<DropdownMenuTrigger asChild>/);
  assert.match(source, /aria-label=\{t\("openItemActions"/);
  assert.match(source, /<MoreHorizontal aria-hidden="true"/);
  assert.equal(source.match(/<DropdownMenuItem /g)?.length, 4);
  assert.doesNotMatch(source, /<TooltipProvider/);
});

test("certificate overflow menu is omitted when an item has no actions", () => {
  assert.match(
    source,
    /if \(!canView && !canDownload && !canResend && !canRetry\) return null/,
  );
  assert.match(source, /disabled=\{busy\}/);
});
