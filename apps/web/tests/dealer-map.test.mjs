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
const dealerRecruitmentCtaPath = path.join(
  webRoot,
  "src",
  "views",
  "dealers",
  "components",
  "dealer-recruitment-cta.tsx",
);
const dealerDirectoryHookPath = path.join(
  webRoot,
  "src",
  "views",
  "dealers",
  "use-dealer-directory.ts",
);
const publicNetworkDirectoryServicePath = path.join(
  webRoot,
  "src",
  "services",
  "network-directory",
  "public-network-directory.service.ts",
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

test("dealer map uses the shared Vietnam overlay without locking horizontal panning", async () => {
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
    "Marker",
    "NetworkLocationPopup",
    "flyTo",
    "setView",
    "VIETNAM_CENTER",
    "VIETNAM_INITIAL_ZOOM",
  ]) {
    assert.match(source, new RegExp(expected.replace(/[{}]/g, "\\$&")));
  }

  assert.match(source, /activateLabel=\{t\("activateMap"\)\}/);
  assert.match(source, /initialCenter=\{VIETNAM_CENTER\}/);
  assert.match(source, /initialZoom=\{VIETNAM_INITIAL_ZOOM\}/);
  assert.match(source, /resetLabel=\{t\("resetMap"\)\}/);
  assert.match(overlaySource, /fillRule:\s*"evenodd"/);
  assert.match(overlaySource, /\/map\/vn\.geojson/);
  assert.doesNotMatch(source, /VIETNAM_INTERACTION_BOUNDS/);
  assert.doesNotMatch(source, /maxBounds=/);
  assert.doesNotMatch(source, /maxBoundsViscosity=/);
  assert.doesNotMatch(source, /activationMode="direct"/);
  assert.doesNotMatch(source, /showResetControl=\{false\}/);
  assert.doesNotMatch(source, /setIsMounted|isMounted/);
  assert.doesNotMatch(source, /<TileLayer|<iframe/);
  assert.doesNotMatch(source, /🇻🇳|📍/u);
});

test("dealer page loads the combined public network directory and dynamically renders the Leaflet map", async () => {
  const [directorySource, viewSource, mapSource, serviceSource] =
    await Promise.all([
      readFile(dealerDirectoryHookPath, "utf8"),
      readFile(dealersViewPath, "utf8"),
      readFile(dealerMapPath, "utf8"),
      readFile(publicNetworkDirectoryServicePath, "utf8"),
    ]);

  assert.match(directorySource, /useDebounce\(searchQuery\.trim\(\), 300\)/);
  assert.match(directorySource, /hasNextPage/);
  assert.match(directorySource, /isLoadingMore/);
  assert.match(directorySource, /loadMore/);
  assert.match(serviceSource, /"\/public\/network-directory"/);
  assert.match(serviceSource, /"\/public\/network-directory\/filter-options"/);
  assert.match(serviceSource, /params:\s*query/);
  assert.match(viewSource, /useDealerDirectory/);
  assert.match(viewSource, /dynamic\(/);
  assert.match(viewSource, /ssr:\s*false/);
  assert.match(viewSource, /<DealerMap activeLocation=\{activeLocation\}/);
  assert.equal(
    (viewSource.match(/<Card className="[^"]*\brounded-sm\b/g) ?? []).length,
    2,
    "both dealer directory cards should use rounded-sm",
  );
  assert.match(mapSource, /useNetworkLocations/);
  assert.match(mapSource, /locations\.map/);
  assert.match(
    mapSource,
    /position=\{\[location\.latitude,\s*location\.longitude\]\}/,
  );
  assert.match(mapSource, /MAP_MARKER_COLORS\.dealer/);
  assert.match(mapSource, /MAP_MARKER_COLORS\.serviceCenter/);
  assert.match(mapSource, /<NetworkLocationPopup/);
  assert.doesNotMatch(viewSource, /openstreetmap\.org\/export\/embed/);
});

test("dealer page presents a localized recruitment CTA linked to Contact", async () => {
  const [viewSource, ctaSource] = await Promise.all([
    readFile(dealersViewPath, "utf8"),
    readFile(dealerRecruitmentCtaPath, "utf8"),
  ]);

  assert.match(viewSource, /<DealerRecruitmentCta/);
  assert.match(ctaSource, /from "@repo\/ui\/button"/);
  assert.match(ctaSource, /from "@\/src\/components\/common\/container"/);
  assert.match(ctaSource, /href=\{APP_ROUTES\.contact\}/);
  assert.match(ctaSource, /useTranslations\("DealersPage\.recruitment"\)/);
  assert.match(
    ctaSource,
    /className="[^"]*border-border-gray[^"]*bg-white[^"]*text-deep-black[^"]*"/,
  );
  assert.doesNotMatch(ctaSource, /\bbg-deep-black\b/);

  const missing = [];

  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(
        path.join(webRoot, "src", "messages", `${locale}.json`),
        "utf8",
      ),
    );

    for (const key of ["eyebrow", "title", "description", "cta"]) {
      if (typeof messages.DealersPage?.recruitment?.[key] !== "string") {
        missing.push(`${locale}:DealersPage.recruitment.${key}`);
      }
    }
  }

  assert.deepEqual(missing, []);
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
  assert.match(
    filtersSource,
    /from "@\/src\/components\/common\/form-control\.constants"/,
  );
  assert.equal(
    (filtersSource.match(/formControlFocusClassName/g) ?? []).length,
    4,
    "search and both selects should share the premium-red focus style",
  );
  assert.equal(
    (filtersSource.match(/\brounded-sm\b/g) ?? []).length,
    4,
    "search, both selects, and nearby button should use rounded-sm",
  );
  assert.match(
    filtersSource,
    /className="[^"]*rounded-sm[^"]*bg-premium-red[^"]*text-white[^"]*"/,
  );
  assert.match(
    filtersSource,
    /className="[^"]*h-auto[^"]*whitespace-normal[^"]*"/,
  );
  assert.doesNotMatch(filtersSource, /rounded-\[\d+px\]/);
  assert.doesNotMatch(filtersSource, /bg-accent-gold/);
  assert.match(listSource, /from "@repo\/ui\/button"/);
  assert.match(listSource, /from "@repo\/ui\/badge"/);
  assert.match(listSource, /from "@repo\/ui\/skeleton"/);
  assert.match(listSource, /location\.kind === "DEALER"/);
  assert.match(listSource, /translations\.dealerBadge/);
  assert.match(listSource, /translations\.serviceCenterBadge/);
  assert.match(listSource, /data-lenis-prevent/);
  assert.match(listSource, /min-h-0/);
  assert.match(listSource, /overscroll-y-contain/);
  assert.match(listSource, /IntersectionObserver/);
  assert.match(listSource, /isLoadingMore/);
  assert.match(listSource, /onLoadMore/);
  assert.match(
    listSource,
    /className="[^"]*rounded-sm[^"]*bg-premium-red[^"]*text-white[^"]*"/,
  );
  assert.doesNotMatch(listSource, /bg-accent-gold/);
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
    "activateMap",
    "resetMap",
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

test("directory result labels describe dealers and warranty centers instead of stores", async () => {
  for (const locale of ["vi", "en"]) {
    const messages = JSON.parse(
      await readFile(
        path.join(webRoot, "src", "messages", `${locale}.json`),
        "utf8",
      ),
    );
    const resultCount = messages.DealersPage?.filters?.resultCount;

    assert.equal(typeof resultCount, "string");
    assert.match(resultCount, /\{count\}/);
    assert.doesNotMatch(resultCount, /cửa hàng|stores?/i);
    assert.equal(typeof messages.DealersPage?.locationType?.dealer, "string");
    assert.equal(
      typeof messages.DealersPage?.locationType?.serviceCenter,
      "string",
    );
  }
});
