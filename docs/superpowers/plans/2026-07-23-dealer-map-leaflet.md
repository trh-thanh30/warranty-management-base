# Dealer Map Leaflet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dealer-page OpenStreetMap iframe with a responsive Leaflet map constrained and masked to the supplied Vietnam GeoJSON, with one active showroom marker and popup.

**Architecture:** `DealersView` continues to own filtering and explicit dealer selection. A dynamically imported feature-local `DealerMap` owns Leaflet, local GeoJSON loading, the outside mask, the camera controller, marker, and popup. The supplied GeoJSON is served as a static public asset, while OpenStreetMap remains the raster tile source.

**Tech Stack:** Next.js 16, React 19, TypeScript, React Leaflet 5, Leaflet 1.9, Tailwind CSS 4, next-intl.

## Global Constraints

- Keep `app/**/page.tsx` as a thin server component.
- Do not hardcode visible Vietnamese or English UI copy in TSX.
- Use semantic color tokens, especially `premium-red`, rather than ad-hoc palette values.
- Do not use emoji for the marker.
- Show OpenStreetMap attribution and do not add tile prefetching.
- Use `C:\Users\nttzb\Downloads\geoBoundaries-VNM-ADM0.geojson` without modifying its boundary geometry.
- Do not commit or stage unrelated dirty-worktree changes.

---

### Task 1: Lock the Map Contract and Static Boundary

**Files:**

- Create: `apps/web/tests/dealer-map.test.mjs`
- Create: `apps/web/public/maps/vietnam-adm0.geojson`
- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: the supplied `geoBoundaries-VNM-ADM0.geojson`.
- Produces: `/maps/vietnam-adm0.geojson` and the Leaflet dependencies used by Task 2.

- [ ] **Step 1: Write the failing source/data contract test**

```js
test("dealer map uses local Vietnam GeoJSON and interactive Leaflet", async () => {
  const mapSource = await readFile(dealerMapPath, "utf8");
  const data = JSON.parse(await readFile(vietnamGeoJsonPath, "utf8"));

  assert.equal(data.type, "FeatureCollection");
  assert.equal(data.features[0]?.geometry?.type, "MultiPolygon");
  assert.match(mapSource, /MapContainer/);
  assert.match(mapSource, /maxBoundsViscosity=\{1\}/);
  assert.match(mapSource, /\/maps\/vietnam-adm0\.geojson/);
  assert.match(mapSource, /flyTo/);
  assert.match(mapSource, /<Marker/);
  assert.match(mapSource, /<Popup/);
  assert.doesNotMatch(mapSource, /<iframe/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test apps/web/tests/dealer-map.test.mjs
```

Expected: failure because the public GeoJSON and `dealer-map.tsx` do not exist.

- [ ] **Step 3: Copy the validated boundary asset**

Copy the exact user-provided file to:

```text
apps/web/public/maps/vietnam-adm0.geojson
```

- [ ] **Step 4: Install map dependencies**

Run:

```bash
pnpm --filter @repo/web add leaflet react-leaflet
pnpm --filter @repo/web add -D @types/leaflet
```

Expected: `apps/web/package.json` and `pnpm-lock.yaml` contain all three packages.

---

### Task 2: Build the Client-Only Leaflet Map

**Files:**

- Create: `apps/web/src/views/dealers/components/dealer-map.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/src/messages/vi.json`
- Modify: `apps/web/src/messages/en.json`
- Test: `apps/web/tests/dealer-map.test.mjs`

**Interfaces:**

- Consumes: `Dealer` from `dealers.types.ts` and `/maps/vietnam-adm0.geojson`.
- Produces:

```ts
export interface DealerMapProps {
  activeDealer: Dealer | null;
}

export function DealerMap({ activeDealer }: DealerMapProps): JSX.Element;
```

- [ ] **Step 1: Add failing message assertions**

Assert both locales define:

```text
DealersPage.map.loading
DealersPage.map.loadError
DealersPage.map.popupPhone
DealersPage.map.openGoogleMaps
```

- [ ] **Step 2: Run the test and verify RED**

Expected: missing map component and message keys.

- [ ] **Step 3: Add Leaflet CSS and marker styling**

Import Leaflet CSS from `globals.css`, then add only the feature-specific marker
reset needed to remove Leaflet's default `divIcon` box.

- [ ] **Step 4: Implement GeoJSON loading and geometry conversion**

The component loads the local feature collection, extracts each MultiPolygon
outer ring, converts `[lng, lat]` to `[lat, lng]`, and builds:

```ts
const maskPositions: LatLngExpression[][] = [WORLD_RING, ...vietnamOuterRings];
```

- [ ] **Step 5: Implement map, mask, outline, camera, and marker**

Use:

```tsx
<MapContainer
  bounds={VIETNAM_BOUNDS}
  maxBounds={VIETNAM_INTERACTION_BOUNDS}
  maxBoundsViscosity={1}
  minZoom={5}
  maxZoom={18}
>
  <TileLayer
    attribution="&copy; OpenStreetMap contributors"
    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <Polygon positions={maskPositions} pathOptions={maskStyle} />
  <GeoJSON data={vietnamGeoJson} style={boundaryStyle} />
  <MapCamera activeDealer={activeDealer} />
  {activeDealer ? (
    <Marker position={[activeDealer.lat, activeDealer.lng]} icon={dealerIcon}>
      <Popup>{/* translated dealer details and directions */}</Popup>
    </Marker>
  ) : null}
</MapContainer>
```

`MapCamera` calls `flyTo` for a valid active dealer and `fitBounds` when the
selection is cleared.

- [ ] **Step 6: Run dealer-map test and verify GREEN**

Run:

```bash
node --test apps/web/tests/dealer-map.test.mjs
```

Expected: pass.

---

### Task 3: Integrate Explicit Selection and Responsive Layout

**Files:**

- Modify: `apps/web/src/views/dealers/use-dealer-filters.ts`
- Modify: `apps/web/src/views/dealers/dealers.view.tsx`
- Test: `apps/web/tests/dealer-map.test.mjs`

**Interfaces:**

- Consumes: `DealerMapProps.activeDealer`.
- Produces: `activeDealer: Dealer | null`, with `null` as the initial state.

- [ ] **Step 1: Add failing integration assertions**

Verify:

```js
assert.match(filtersSource, /useState<string \| null>\(null\)/);
assert.match(viewSource, /dynamic\(/);
assert.match(viewSource, /ssr:\s*false/);
assert.match(viewSource, /<DealerMap activeDealer=\{activeDealer\}/);
assert.doesNotMatch(viewSource, /openstreetmap\.org\/export\/embed/);
```

- [ ] **Step 2: Run the test and verify RED**

Expected: the hook still selects dealer `1` and the view still contains the iframe.

- [ ] **Step 3: Make dealer selection explicit**

Initialize `selectedDealerId` to `null` and derive:

```ts
const activeDealer = useMemo(
  () => dealers.find((dealer) => dealer.id === selectedDealerId) ?? null,
  [selectedDealerId],
);
```

- [ ] **Step 4: Dynamically import and render DealerMap**

Load `DealerMap` with `next/dynamic`, `ssr: false`, and a stable loading
placeholder. Replace only the iframe/map-overlay portion; retain the existing
map card header and dealer selection controls.

- [ ] **Step 5: Make the two-column area responsive**

Use bounded mobile heights for list and map, and retain equal 750 px heights
only at `lg`. Ensure the popup and card controls remain keyboard reachable.

- [ ] **Step 6: Run targeted tests and type checks**

Run:

```bash
node --test apps/web/tests/dealer-map.test.mjs
node --test apps/web/tests/locale-routes.test.mjs
pnpm --filter @repo/web check-types
pnpm --filter @repo/web lint
```

Expected: all pass with no warnings.

---

### Task 4: Browser Verification

**Files:**

- Modify only if verification exposes a defect in the files from Tasks 2–3.

**Interfaces:**

- Consumes: the completed dealer map.
- Produces: verified behaviour at representative viewport widths.

- [ ] **Step 1: Render `/vi/he-thong-dai-ly` at 375, 768, and 1280 px**

Confirm no document-level horizontal overflow and that the map reserves a
stable height.

- [ ] **Step 2: Verify initial state**

Confirm Vietnam is fitted and there is no showroom marker.

- [ ] **Step 3: Select at least two showroom cards**

Confirm exactly one red marker is rendered, the camera moves, and popup content
matches the selected showroom.

- [ ] **Step 4: Verify failure and accessibility behaviour**

Confirm translated loading/error copy, visible OSM attribution, keyboard
focusability, and no emoji marker.

- [ ] **Step 5: Run final verification**

Run:

```bash
git diff --check
node --test apps/web/tests/dealer-map.test.mjs
pnpm --filter @repo/web check-types
pnpm --filter @repo/web lint
```

Expected: all relevant checks pass.
