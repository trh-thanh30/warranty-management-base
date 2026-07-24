# Dealer Map with Leaflet and Vietnam GeoJSON

## Goal

Replace the OpenStreetMap iframe on the dealer page with an interactive
Leaflet map that:

- opens on the full Vietnam extent;
- prevents normal panning outside the configured Vietnam bounds;
- visually masks map content outside the supplied Vietnam geometry;
- shows no dealer marker until the user selects a showroom;
- flies to the selected showroom and opens a useful marker popup;
- remains usable on phone, tablet, and desktop.

## Source Data

The user-supplied file is:

`C:\Users\nttzb\Downloads\geoBoundaries-VNM-ADM0.geojson`

It will be copied to:

`apps/web/public/maps/vietnam-adm0.geojson`

Validated characteristics:

- GeoJSON `FeatureCollection`;
- one `MultiPolygon` feature;
- 90 polygon parts;
- 4,449 coordinate positions;
- approximately 200 KB;
- bounding box: `102.143676, 8.403123, 109.463025, 23.393574`.

The repository copy is a presentation boundary for this map, not a runtime
dependency. Boundary correctness, including any offshore geometry expected by
the business, must be approved before production release.

## Architecture

### Feature boundary

The Leaflet implementation belongs to the dealers feature:

`apps/web/src/views/dealers/components/dealer-map.tsx`

`DealersView` remains responsible for filters, selection, and surrounding
layout. It passes the selected `Dealer | null` to `DealerMap`.

React Leaflet directly accesses the DOM, so `DealerMap` is dynamically imported
with server-side rendering disabled. The route page remains a thin server
component.

### Dependencies

Add to `@repo/web`:

- `leaflet`;
- `react-leaflet`;
- `@types/leaflet` as a development dependency.

The standard OpenStreetMap raster tile endpoint is used with visible
`© OpenStreetMap contributors` attribution. No tile prefetching or offline
download is added.

## Map Behaviour

### Initial state

- The map fits the supplied Vietnam GeoJSON bounds.
- No showroom is selected and no marker is rendered.
- The map header uses the existing default-title translation.

### Selecting a showroom

- Clicking a showroom card or its “view more” action sets `selectedDealerId`.
- Exactly one FUJITEK-red marker is rendered at the selected coordinates.
- A map controller calls `flyTo` with a practical street-level zoom.
- The marker popup shows showroom name, address, phone, and a Google Maps
  directions link.

### Clearing or filtering

- Filters do not implicitly select the first result.
- If there is no explicit selection, the camera returns to the Vietnam extent.
- A selected showroom remains selected until the user selects another showroom
  or an explicit reset clears it.

## Vietnam Mask

After loading the local GeoJSON:

1. Extract every outer polygon ring from the `MultiPolygon`.
2. Convert GeoJSON `[longitude, latitude]` coordinates to Leaflet
   `[latitude, longitude]`.
3. Render a world-sized outer polygon with the Vietnam rings as holes using the
   even-odd fill rule.
4. Fill the outside mask with the app surface color at controlled opacity.
5. Render the Vietnam boundary above the mask using the semantic
   `premium-red` token.

`maxBounds` and `maxBoundsViscosity: 1` constrain interaction, while the mask
handles neighbouring content that still appears near viewport edges.

## Responsive Layout

- Mobile: dealer list and map stack vertically; each section has a bounded,
  viewport-friendly height instead of a fixed 750 px desktop height.
- Desktop: retain the current 5/7-column split and aligned heights.
- Map controls and popup actions retain at least a 44 px interaction target.
- Loading and error overlays do not shift surrounding layout.

## Accessibility and Internationalisation

- All visible popup, loading, error, reset, and directions copy uses
  `DealersPage.map` messages in both `vi` and `en`.
- The map container receives a translated accessible label.
- The custom marker is an SVG/CSS marker, not an emoji.
- Popup links have descriptive text and keyboard focus states.
- Color is not the only selected-state indicator; the selected dealer card
  retains its border and semantic state.

## Error Handling

- While GeoJSON is loading, show a stable skeleton inside the reserved map
  area.
- If GeoJSON loading fails, show a translated error overlay and keep the dealer
  list usable.
- Invalid or missing dealer coordinates do not create a marker or trigger
  camera movement.

## Testing

Add source-level regression tests that verify:

- the local GeoJSON exists and parses as a `MultiPolygon`;
- the dealer map uses React Leaflet rather than an iframe;
- OpenStreetMap attribution and tile URL are present;
- `maxBounds`, outside mask, marker, popup, and `flyTo` behaviour exist;
- no showroom is selected by default;
- both locales resolve every new map message.

Verification also includes:

- `@repo/web` typecheck;
- ESLint;
- existing dealer and locale-policy tests;
- browser render at 375 px, 768 px, and desktop widths;
- selecting multiple showroom cards and confirming marker/camera updates.

## Out of Scope

- Geocoding dealer addresses;
- automatic nearest-showroom location permission;
- route navigation inside Leaflet;
- offline map tiles;
- editing or asserting geopolitical boundary correctness;
- replacing the supplied GeoJSON without business approval.
