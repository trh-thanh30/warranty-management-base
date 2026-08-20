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

test("certificate icon actions expose visible hover and focus tooltips", () => {
  assert.match(source, /<TooltipProvider delayDuration=\{250\}>/);
  assert.equal(source.match(/<Tooltip>/g)?.length, 3);
  assert.match(source, /<TooltipContent>\s*\{t\("viewItemCertificate"/);
  assert.match(source, /<TooltipContent>\s*\{t\("downloadItemCertificate"/);
  assert.match(source, /<TooltipContent>\s*\{t\("resendItemCertificate"/);
});
