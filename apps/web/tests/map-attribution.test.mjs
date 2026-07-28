import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const sharedMapPath = path.join(
  process.cwd(),
  "packages",
  "ui",
  "src",
  "map",
  "shared-map.tsx",
);
const globalsPath = path.join(webRoot, "app", "globals.css");
const dealerMapPath = path.join(
  webRoot,
  "src",
  "views",
  "dealers",
  "components",
  "dealer-map.tsx",
);
const contactMapPath = path.join(
  webRoot,
  "src",
  "views",
  "contact",
  "components",
  "contact-map.tsx",
);

test("OSM attribution remains configured and visible in web maps", async () => {
  const [sharedMap, globals, dealerMap, contactMap] = await Promise.all([
    readFile(sharedMapPath, "utf8"),
    readFile(globalsPath, "utf8"),
    readFile(dealerMapPath, "utf8"),
    readFile(contactMapPath, "utf8"),
  ]);

  assert.match(sharedMap, /OpenStreetMap/);
  assert.match(sharedMap, /contributors/);
  assert.match(sharedMap, /attribution=\{tileAttribution\}/);

  assert.doesNotMatch(
    globals,
    /\.leaflet-control-attribution[\s\S]*display:\s*none/,
  );
  assert.doesNotMatch(
    globals,
    /\.leaflet-control-attribution[\s\S]*visibility:\s*hidden/,
  );

  assert.match(dealerMap, /OpenStreetMap/);
  assert.match(dealerMap, /attribution=\{OSM_TILE_ATTRIBUTION\}/);

  assert.match(contactMap, /OpenStreetMap/);
  assert.match(contactMap, /attribution=\{OSM_TILE_ATTRIBUTION\}/);
  assert.doesNotMatch(contactMap, /attributionControl=\{false\}/);
  assert.doesNotMatch(contactMap, /attribution=""/);
});
