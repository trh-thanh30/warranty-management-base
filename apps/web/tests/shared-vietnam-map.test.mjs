import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const repoRoot = path.resolve(webRoot, "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("Vietnam boundary rendering is owned by the shared map package", () => {
  const sharedOverlay = read("packages/ui/src/map/vietnam-map-overlay.tsx");
  const picker = read("packages/ui/src/map/map-location-picker.tsx");
  const aboutMap = read(
    "apps/web/src/views/about/components/about-network-map.tsx",
  );
  const dealerMap = read(
    "apps/web/src/views/dealers/components/dealer-map.tsx",
  );

  assert.match(sharedOverlay, /export function VietnamMapOverlay/);
  assert.match(sharedOverlay, /export function useVietnamBoundary/);
  assert.match(sharedOverlay, /export function isPointInVietnam/);
  assert.match(picker, /<VietnamMapOverlay/);
  assert.match(picker, /isPointInVietnam/);
  assert.match(aboutMap, /<VietnamMapOverlay/);
  assert.match(dealerMap, /<VietnamMapOverlay/);
  assert.doesNotMatch(aboutMap, /WORLD_RING/);
  assert.doesNotMatch(dealerMap, /WORLD_RING/);
});

test("Admin and Web serve the same Vietnam GeoJSON contract", () => {
  for (const app of ["admin", "web"]) {
    const geoJsonPath = path.join(
      repoRoot,
      "apps",
      app,
      "public",
      "map",
      "vn.geojson",
    );

    assert.equal(fs.existsSync(geoJsonPath), true);
    const boundary = JSON.parse(fs.readFileSync(geoJsonPath, "utf8"));
    assert.equal(boundary.type, "FeatureCollection");
    assert.ok(boundary.features.length > 0);
  }
});

test("production images include public map assets", () => {
  for (const app of ["admin", "web"]) {
    const dockerfile = read(`apps/${app}/Dockerfile`);

    assert.equal(
      dockerfile.includes(`/app/apps/${app}/public ./apps/${app}/public`),
      true,
    );
  }
});
