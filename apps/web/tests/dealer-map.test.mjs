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
const vietnamGeoJsonPath = path.join(webRoot, "public", "map", "vn.geojson");
const globalsPath = path.join(webRoot, "app", "globals.css");
const vietnamOverlayPath = path.join(
  process.cwd(),
  "packages",
  "ui",
  "src",
  "map",
  "vietnam-map-overlay.tsx",
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
    "public/map/vn.geojson must exist",
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

test("dealer map uses the shared constrained Vietnam overlay and active marker", async () => {
  assert.equal(
    await exists(dealerMapPath),
    true,
    "dealers/components/dealer-map.tsx must exist",
  );

  const [source, overlaySource] = await Promise.all([
    readFile(dealerMapPath, "utf8"),
    readFile(vietnamOverlayPath, "utf8"),
  ]);
  for (const expected of [
    "SharedMap",
    "VietnamMapOverlay",
    "VIETNAM_INTERACTION_BOUNDS",
    "Marker",
    "Popup",
    "flyTo",
    "fitBounds",
  ]) {
    assert.match(source, new RegExp(expected.replace(/[{}]/g, "\\$&")));
  }

  assert.match(source, /maxBoundsViscosity=\{1\}/);
  assert.match(overlaySource, /fillRule:\s*"evenodd"/);
  assert.match(overlaySource, /\/map\/vn\.geojson/);
  assert.doesNotMatch(source, /<TileLayer|<iframe/);
  assert.doesNotMatch(source, /🇻🇳|📍/u);
});

test("dealer page loads public network dealers and dynamically renders the Leaflet map", async () => {
  const [filtersSource, viewSource, mapSource] = await Promise.all([
    readFile(dealerFiltersPath, "utf8"),
    readFile(dealersViewPath, "utf8"),
    readFile(dealerMapPath, "utf8"),
  ]);

  assert.match(filtersSource, /useState<string \| null>\(null\)/);
  assert.match(
    filtersSource,
    /dealers\.find\(\(dealer\) => dealer\.id === selectedDealerId\) \?\? null/,
  );
  assert.match(viewSource, /useNetworkLocations/);
  assert.match(viewSource, /selectDealerLocations\(locations\)/);
  assert.match(viewSource, /dynamic\(/);
  assert.match(viewSource, /ssr:\s*false/);
  assert.match(viewSource, /<DealerMap activeDealer=\{activeDealer\}/);
  assert.match(mapSource, /activeDealer\.latitude/);
  assert.match(mapSource, /activeDealer\.longitude/);
  assert.match(mapSource, /href=\{activeDealer\.googleMapsUrl\}/);
  assert.doesNotMatch(viewSource, /openstreetmap\.org\/export\/embed/);
});

test("dealer directory composes shared UI controls instead of native form controls", async () => {
  const filtersPath = path.join(
    webRoot,
    "src",
    "views",
    "dealers",
    "components",
    "dealer-filters.tsx",
  );
  const listPath = path.join(
    webRoot,
    "src",
    "views",
    "dealers",
    "components",
    "dealer-list.tsx",
  );
  const [filtersSource, listSource] = await Promise.all([
    readFile(filtersPath, "utf8"),
    readFile(listPath, "utf8"),
  ]);

  assert.match(filtersSource, /from "@repo\/ui\/input"/);
  assert.match(filtersSource, /from "@repo\/ui\/select"/);
  assert.match(filtersSource, /from "@repo\/ui\/button"/);
  assert.match(listSource, /from "@repo\/ui\/button"/);
  assert.match(listSource, /from "@repo\/ui\/skeleton"/);
  assert.match(listSource, /data-lenis-prevent/);
  assert.match(listSource, /min-h-0/);
  assert.match(listSource, /overscroll-y-contain/);
  assert.doesNotMatch(filtersSource, /<select|<input|<button/);
  assert.doesNotMatch(listSource, /<button/);
});

test("public Web keeps shared UI controls in the light theme regardless of OS preference", async () => {
  const source = await readFile(globalsPath, "utf8");

  assert.match(source, /:root\s*\{\s*color-scheme:\s*light;/);
  assert.match(
    source,
    /@custom-variant dark \(&:where\(\.dark,\s*\.dark \*\)\);/,
  );
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
