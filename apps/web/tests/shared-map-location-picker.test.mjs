import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const mapRoot = path.join(process.cwd(), "packages", "ui", "src", "map");

test("map package exports a controlled location picker and tile provider", async () => {
  const [indexSource, pickerSource, constantsSource] = await Promise.all([
    readFile(path.join(mapRoot, "index.ts"), "utf8"),
    readFile(path.join(mapRoot, "map-location-picker.tsx"), "utf8"),
    readFile(path.join(mapRoot, "map.constants.ts"), "utf8"),
  ]);

  assert.match(indexSource, /map-location-picker/);
  assert.match(indexSource, /map\.constants/);
  assert.match(pickerSource, /value:\s*GeoPoint/);
  assert.match(pickerSource, /onChange:\s*\(value:\s*GeoPoint\)/);
  assert.match(pickerSource, /useMapEvents/);
  assert.match(pickerSource, /<Marker/);
  assert.match(constantsSource, /OPEN_STREET_MAP_TILE_PROVIDER/);
  assert.match(constantsSource, /OpenStreetMap/);
  assert.match(constantsSource, /contributors/);
});
