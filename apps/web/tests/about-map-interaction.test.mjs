import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const aboutMapPath = path.join(
  process.cwd(),
  "apps",
  "web",
  "src",
  "views",
  "about",
  "components",
  "about-network-map.tsx",
);

test("about map requires an intentional click before wheel zoom", async () => {
  const source = await readFile(aboutMapPath, "utf8");

  assert.match(source, /scrollWheelZoom=\{false\}/);
  assert.match(source, /useMapEvents\(\{\s*click:/);
  assert.match(source, /scrollWheelZoom\.enable\(\)/);
  assert.match(source, /mouseleave/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /scrollWheelZoom\.disable\(\)/);
});

test("about map exposes a visible control for activating wheel zoom", async () => {
  const source = await readFile(aboutMapPath, "utf8");

  assert.match(source, /const \[isWheelZoomEnabled, setIsWheelZoomEnabled\]/);
  assert.match(source, /<MousePointerClick/);
  assert.match(source, /activateLabel=\{t\("activateMap"\)\}/);
  assert.match(source, /aria-label=\{activateLabel\}/);
  assert.match(source, /isWheelZoomEnabled\s*\?\s*"[^"]*opacity-0/);
  assert.match(source, /"pointer-events-auto bg-transparent opacity-100"/);
  assert.match(source, /items-start justify-end p-3[^"]*sm:p-4/);
  assert.match(source, /className="inline-flex min-h-11 items-center/);
  assert.match(source, /text-premium-red/);
  assert.doesNotMatch(source, /text-deep-black\/70/);
  assert.doesNotMatch(source, /bg-black\/10|group-hover:bg-premium-red/);
  assert.match(source, /onInteractionChange=\{setIsWheelZoomEnabled\}/);
});

test("about map reset restores its initial view and interaction state", async () => {
  const source = await readFile(aboutMapPath, "utf8");

  assert.match(source, /const VIETNAM_INITIAL_ZOOM = 6\.25/);
  assert.match(
    source,
    /map\.setView\(VIETNAM_CENTER,\s*VIETNAM_INITIAL_ZOOM\)/,
  );
  assert.match(source, /map\.closePopup\(\)/);
  assert.match(source, /map\.scrollWheelZoom\.disable\(\)/);
  assert.match(source, /<RotateCcw/);
  assert.match(source, /aria-label=\{resetLabel\}/);
  assert.match(source, /title=\{resetLabel\}/);
  assert.match(
    source,
    /left-2\.5 top-\[75px\].*size-\[34px\].*rounded-\[4px\]/,
  );
});
