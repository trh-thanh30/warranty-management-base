import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL(
    "./components/review-warranty-activation-request-dialog.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("activation request review dialog fills mobile screens only", () => {
  assert.match(
    source,
    /DialogContent className="[^"]*h-dvh[^"]*w-screen[^"]*max-w-none[^"]*rounded-none[^"]*sm:block[^"]*sm:h-fit[^"]*sm:w-\[min\(calc\(100vw-2rem\),36rem\)\][^"]*sm:rounded-lg[^"]*sm:p-4[^"]*"/,
  );
});

test("activation request review dialog keeps actions visible while content scrolls", () => {
  assert.match(source, /<header className="[^"]*shrink-0[^"]*"/);
  assert.match(source, /<div className="min-h-0 flex-1 overflow-y-auto[^"]*"/);
  assert.match(source, /<footer className="[^"]*shrink-0[^"]*"/);
  assert.match(source, /<header className="[^"]*sm:border-0[^"]*sm:p-0[^"]*"/);
  assert.match(
    source,
    /<div className="min-h-0 flex-1 overflow-y-auto[^"]*sm:overflow-visible sm:p-0[^"]*"/,
  );
  assert.match(
    source,
    /<footer className="[^"]*sm:mt-6[^"]*sm:border-0[^"]*sm:p-0[^"]*"/,
  );
});

test("activation request review dialog provides a mobile header close action", () => {
  assert.match(
    source,
    /<DialogClose asChild>[\s\S]*aria-label=\{t\("cancel"\)\}/,
  );
  assert.match(source, /className="absolute right-4 top-4 z-10 sm:hidden"/);
  assert.match(source, /<X aria-hidden="true" className="size-5" \/>/);
  assert.match(
    source,
    /DialogTitle className="pr-12 text-lg font-semibold sm:pr-0"/,
  );
});
