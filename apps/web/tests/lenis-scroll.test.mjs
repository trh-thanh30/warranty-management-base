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
const localeLayoutPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "app",
  "[locale]",
  "layout.tsx",
);
const globalStylesPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "app",
  "globals.css",
);
const aboutViewPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "views",
  "about",
  "about.view.tsx",
);

test("public pages use one native root scroll container", async () => {
  const [layoutSource, globalStyles, aboutViewSource] = await Promise.all([
    readFile(localeLayoutPath, "utf8"),
    readFile(globalStylesPath, "utf8"),
    readFile(aboutViewPath, "utf8"),
  ]);

  assert.doesNotMatch(layoutSource, /LenisProvider/);
  assert.doesNotMatch(globalStyles, /scrollbar-gutter:\s*stable/);
  assert.match(aboutViewSource, /overflow-x-clip/);
  assert.doesNotMatch(aboutViewSource, /overflow-x-hidden/);
});

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
