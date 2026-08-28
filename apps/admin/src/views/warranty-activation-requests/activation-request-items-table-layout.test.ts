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
  assert.match(source, /Table className="min-w-\[920px\] whitespace-nowrap"/);
});

test("activation request items scroll vertically with a sticky header", () => {
  assert.match(
    source,
    /TableScroll className="[^"]*max-h-\[30rem\][^"]*overflow-y-auto/,
  );
  assert.match(
    source,
    /TableHeader className="sticky top-0 z-10 bg-white dark:bg-slate-950"/,
  );
});

test("activation request items do not expose certificate actions", () => {
  assert.doesNotMatch(source, /viewItemCertificate/);
  assert.doesNotMatch(source, /downloadItemCertificate/);
  assert.doesNotMatch(source, /resendItemCertificate/);
});
