import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const webRoot = path.join(process.cwd(), "apps", "web");
const dealerMapPath = path.join(
  webRoot,
  "src",
  "views",
  "dealers",
  "components",
  "dealer-map.tsx",
);
const dealersViewPath = path.join(
  webRoot,
  "src",
  "views",
  "dealers",
  "dealers.view.tsx",
);
const dealerFiltersPath = path.join(
  webRoot,
  "src",
  "views",
  "dealers",
  "use-dealer-filters.ts",
);
const vietnamGeoJsonPath = path.join(
  webRoot,
  "public",
  "maps",
  "vietnam-adm0.geojson",
);

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

test("dealer map ships the local Vietnam polygon and maritime line data", async () => {
  assert.equal(
    await exists(vietnamGeoJsonPath),
    true,
    "public/maps/vietnam-adm0.geojson must exist",
  );

  const data = JSON.parse(await readFile(vietnamGeoJsonPath, "utf8"));
  assert.equal(data.type, "FeatureCollection");
  assert.equal(data.features.length, 2);
  assert.deepEqual(
    data.features.map((feature) => feature.geometry?.type).sort(),
    ["MultiLineString", "MultiPolygon"],
  );
  assert.equal(data.features[0]?.properties?.ISO_A3, "VNM");
  assert.equal(
    data.features[1]?.properties?.GEOlayersSrcRequireType,
    "geojson",
  );
});

test("dealer map uses constrained Leaflet with a mask and active marker", async () => {
  assert.equal(
    await exists(dealerMapPath),
    true,
    "dealers/components/dealer-map.tsx must exist",
  );

  const source = await readFile(dealerMapPath, "utf8");
  for (const expected of [
    "MapContainer",
    "TileLayer",
    "GeoJSON",
    "Polygon",
    "Marker",
    "Popup",
    "flyTo",
    "fitBounds",
    "/maps/vietnam-adm0.geojson",
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    "OpenStreetMap contributors",
  ]) {
    assert.match(source, new RegExp(expected.replace(/[{}]/g, "\\$&")));
  }

  assert.match(source, /maxBoundsViscosity=\{1\}/);
  assert.match(source, /fillRule:\s*"evenodd"/);
  assert.doesNotMatch(source, /<iframe/);
  assert.doesNotMatch(source, /🇻🇳|📍/u);
});

test("dealer page starts unselected and dynamically renders the Leaflet map", async () => {
  const [filtersSource, viewSource] = await Promise.all([
    readFile(dealerFiltersPath, "utf8"),
    readFile(dealersViewPath, "utf8"),
  ]);

  assert.match(filtersSource, /useState<string \| null>\(null\)/);
  assert.match(
    filtersSource,
    /dealers\.find\(\(dealer\) => dealer\.id === selectedDealerId\) \?\? null/,
  );
  assert.match(viewSource, /dynamic\(/);
  assert.match(viewSource, /ssr:\s*false/);
  assert.match(viewSource, /<DealerMap activeDealer=\{activeDealer\}/);
  assert.doesNotMatch(viewSource, /openstreetmap\.org\/export\/embed/);
});

test("dealer map messages resolve in every locale", async () => {
  const requiredKeys = [
    "defaultTitle",
    "ariaLabel",
    "loading",
    "loadError",
    "selectedDealer",
    "popupPhone",
    "openGoogleMaps",
  ];
  const missing = [];

  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(
        path.join(webRoot, "src", "messages", `${locale}.json`),
        "utf8",
      ),
    );

    for (const key of requiredKeys) {
      if (typeof messages.DealersPage?.map?.[key] !== "string") {
        missing.push(`${locale}:DealersPage.map.${key}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});
