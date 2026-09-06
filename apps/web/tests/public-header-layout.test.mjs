import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const readWebFile = (...segments) =>
  readFile(path.join(process.cwd(), "apps", "web", ...segments), "utf8");

test("public header participates in layout without a hard-coded content offset", async () => {
  const [layoutSource, headerSource] = await Promise.all([
    readWebFile("app", "[locale]", "layout.tsx"),
    readWebFile("src", "components", "layout", "site-header.tsx"),
  ]);

  assert.doesNotMatch(layoutSource, /className=["'][^"']*pt-21/);
  assert.match(headerSource, /className=["'][^"']*sticky[^"']*top-0/);
  assert.doesNotMatch(headerSource, /className=["'][^"']*fixed[^"']*top-0/);
});

test("about hero preserves the image ratio on mobile and uses a stable desktop viewport", async () => {
  const source = await readWebFile(
    "src",
    "views",
    "about",
    "components",
    "about-hero-corporate.tsx",
  );

  assert.match(source, /lg:min-h-\[calc\(100svh-5\.25rem\)\]/);
  assert.match(source, /aspect-video/);
  assert.doesNotMatch(source, /min-h-\[280px\]/);
});
