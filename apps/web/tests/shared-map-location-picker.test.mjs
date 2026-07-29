import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const mapRoot = path.join(process.cwd(), "packages", "ui", "src", "map");

test("map package exports a controlled location picker and tile provider", async () => {
  const adminRoot = path.join(process.cwd(), "apps", "admin", "src");
  const [
    indexSource,
    pickerSource,
    constantsSource,
    overlaySource,
    locationFieldSource,
    dealerFormSource,
    serviceCenterFormSource,
  ] = await Promise.all([
    readFile(path.join(mapRoot, "index.ts"), "utf8"),
    readFile(path.join(mapRoot, "map-location-picker.tsx"), "utf8"),
    readFile(path.join(mapRoot, "map.constants.ts"), "utf8"),
    readFile(path.join(mapRoot, "vietnam-map-overlay.tsx"), "utf8"),
    readFile(
      path.join(adminRoot, "components", "common", "location-picker-field.tsx"),
      "utf8",
    ),
    readFile(
      path.join(adminRoot, "views", "dealers", "components", "dealer-form.tsx"),
      "utf8",
    ),
    readFile(
      path.join(
        adminRoot,
        "views",
        "service-centers",
        "components",
        "service-center-form.tsx",
      ),
      "utf8",
    ),
  ]);

  assert.match(indexSource, /map-location-picker/);
  assert.match(indexSource, /map\.constants/);
  assert.match(pickerSource, /value:\s*GeoPoint/);
  assert.match(pickerSource, /onChange:\s*\(value:\s*GeoPoint\)/);
  assert.match(pickerSource, /useMapEvents/);
  assert.match(pickerSource, /MapFocusController/);
  assert.match(pickerSource, /flyTo/);
  assert.match(pickerSource, /<Marker/);
  assert.match(pickerSource, /markerColor/);
  assert.match(pickerSource, /\[markerColor\]/);
  assert.match(constantsSource, /MAP_MARKER_COLORS/);
  assert.match(constantsSource, /dealer:\s*"#[a-fA-F0-9]{6}"/);
  assert.match(constantsSource, /serviceCenter:\s*"#[a-fA-F0-9]{6}"/);
  assert.match(locationFieldSource, /markerColor/);
  assert.match(dealerFormSource, /MAP_MARKER_COLORS\.dealer/);
  assert.match(serviceCenterFormSource, /MAP_MARKER_COLORS\.serviceCenter/);
  assert.match(pickerSource, /VIETNAM_PICKER_INTERACTION_BOUNDS/);
  assert.match(overlaySource, /VIETNAM_PICKER_INTERACTION_BOUNDS/);
  const pickerBounds = overlaySource.match(
    /VIETNAM_PICKER_INTERACTION_BOUNDS[^=]*=\s*\[\s*\[[^,]+,\s*([-\d.]+)\],\s*\[[^,]+,\s*([-\d.]+)\]/,
  );
  assert.ok(pickerBounds, "picker interaction bounds must be numeric");
  const longitudeSpan = Number(pickerBounds[2]) - Number(pickerBounds[1]);
  const adminViewportSpanAtMinZoom = (900 / 256) * (360 / 2 ** 5);
  assert.ok(
    longitudeSpan > adminViewportSpanAtMinZoom,
    "picker bounds must leave horizontal room to pan at the minimum Admin zoom",
  );
  assert.match(constantsSource, /OPEN_STREET_MAP_TILE_PROVIDER/);
  assert.match(constantsSource, /OpenStreetMap/);
  assert.match(constantsSource, /contributors/);
});
