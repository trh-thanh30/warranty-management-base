import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("web route loader follows admin navigation progress with web brand styling", () => {
  const layout = readFileSync(
    new URL("../app/[locale]/layout.tsx", import.meta.url),
    "utf8",
  );
  const loading = readFileSync(
    new URL(
      "../src/components/common/public-page-loading.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(layout, /import NextTopLoader from "nextjs-toploader"/);
  assert.match(layout, /color="var\(--color-premium-red\)"/);
  assert.match(layout, /crawlSpeed=\{180\}/);
  assert.match(layout, /showSpinner=\{false\}/);
  assert.match(layout, /speed=\{220\}/);
  assert.doesNotMatch(loading, /w-1\/3|bg-premium-red/);
  assert.match(loading, /Skeleton/);
});
