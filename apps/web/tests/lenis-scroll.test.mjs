import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const lenisProviderPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "components",
  "providers",
  "lenis-provider.tsx",
);

test("Lenis owns its RAF lifecycle and does not override the first touch scroll", async () => {
  const source = await readFile(lenisProviderPath, "utf8");

  assert.match(source, /autoRaf:\s*true/);
  assert.doesNotMatch(source, /requestAnimationFrame\(raf\)/);
  assert.match(source, /hasHandledInitialRouteRef/);
  assert.match(
    source,
    /if \(!hasHandledInitialRouteRef\.current\)[\s\S]*return;/,
  );
  assert.match(source, /lenisRef\.current\.scrollTo\(0,/);
});

test("touch-only devices keep native scrolling instead of mounting Lenis", async () => {
  const source = await readFile(lenisProviderPath, "utf8");

  assert.match(
    source,
    /matchMedia\([\s\S]*?hover:\s*none[\s\S]*?pointer:\s*coarse[\s\S]*?\)\.matches/,
  );
  assert.match(source, /if \(prefersNativeTouchScroll\) return;/);
});
