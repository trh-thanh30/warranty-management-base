import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const heroPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "views",
  "home",
  "components",
  "hero-section.tsx",
);

test("homepage hero delegates autoplay and navigation to Embla", async () => {
  const source = await readFile(heroPath, "utf8");

  assert.match(source, /useEmblaCarousel/);
  assert.match(source, /Autoplay\(\{\s*delay:\s*6000/);
  assert.match(source, /ref=\{emblaRef\}/);
  assert.match(
    source,
    /ref=\{emblaRef\}[\s\S]*?availableImages\.map\([\s\S]*?<Image/,
  );
  assert.match(source, /emblaApi\?\.scrollPrev\(\)/);
  assert.match(source, /emblaApi\?\.scrollNext\(\)/);
  assert.doesNotMatch(source, /window\.setInterval/);
});
