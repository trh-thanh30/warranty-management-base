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

const sharedMapPath = path.join(
  process.cwd(),
  "packages",
  "ui",
  "src",
  "map",
  "shared-map.tsx",
);

test("overlay maps require an intentional click before wheel zoom", async () => {
  const source = await readFile(sharedMapPath, "utf8");

  assert.match(source, /scrollWheelZoom=\{activationMode === "direct"\}/);
  assert.match(source, /useMapEvents\(\{\s*click:/);
  assert.match(source, /scrollWheelZoom\.enable\(\)/);
  assert.match(source, /mouseleave/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /scrollWheelZoom\.disable\(\)/);
  assert.match(source, /activationMode === "overlay"\s*\?\s*\(/);
});

test("shared map exposes a visible control for activating wheel zoom", async () => {
  const source = await readFile(sharedMapPath, "utf8");

  assert.match(source, /cn\("isolate z-0", className\)/);
  assert.match(source, /const \[isWheelZoomEnabled, setIsWheelZoomEnabled\]/);
  assert.match(source, /<MousePointerClick/);
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

test("shared map reset restores its initial view and interaction state", async () => {
  const source = await readFile(sharedMapPath, "utf8");

  assert.match(source, /map\.setView\(initialCenter,\s*initialZoom\)/);
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

test("shared map exposes an accessible fullscreen control and redraws Leaflet", async () => {
  const [sharedMapSource, aboutMapSource] = await Promise.all([
    readFile(sharedMapPath, "utf8"),
    readFile(aboutMapPath, "utf8"),
  ]);

  assert.match(sharedMapSource, /<Maximize2/);
  assert.match(sharedMapSource, /<Minimize2/);
  assert.match(sharedMapSource, /requestFullscreen\(\)/);
  assert.match(sharedMapSource, /document\.exitFullscreen\(\)/);
  assert.match(sharedMapSource, /"fullscreenchange"/);
  assert.match(sharedMapSource, /map\.invalidateSize\(\)/);
  assert.match(
    sharedMapSource,
    /aria-label=\{isFullscreen \? exitFullscreenLabel : fullscreenLabel\}/,
  );
  assert.match(
    sharedMapSource,
    /left-2\.5 top-\[115px\].*size-\[34px\].*rounded-\[4px\]/,
  );
  assert.match(aboutMapSource, /fullscreenLabel=\{t\("fullscreenMap"\)\}/);
  assert.match(
    aboutMapSource,
    /exitFullscreenLabel=\{t\("exitFullscreenMap"\)\}/,
  );
});

test("about map composes feature layers inside the shared map", async () => {
  const source = await readFile(aboutMapPath, "utf8");

  assert.match(source, /SharedMap,/);
  assert.match(source, /from "@repo\/ui\/map"/);
  assert.match(source, /<SharedMap/);
  assert.match(source, /activateLabel=\{t\("activateMap"\)\}/);
  assert.match(source, /initialCenter=\{VIETNAM_CENTER\}/);
  assert.match(source, /initialZoom=\{VIETNAM_INITIAL_ZOOM\}/);
  assert.match(source, /<Marker/);
  assert.doesNotMatch(source, /<MapContainer/);
  assert.doesNotMatch(source, /function MapInteractionController/);
});

test("about map renders dealer and service-center locations from the public API", async () => {
  const source = await readFile(aboutMapPath, "utf8");

  assert.match(source, /useNetworkLocations/);
  assert.match(source, /locations\.map/);
  assert.match(
    source,
    /position=\{\[location\.latitude,\s*location\.longitude\]\}/,
  );
  assert.match(source, /MAP_MARKER_COLORS\.dealer/);
  assert.match(source, /MAP_MARKER_COLORS\.serviceCenter/);
  assert.doesNotMatch(source, /dealerPinLocations/);
});
