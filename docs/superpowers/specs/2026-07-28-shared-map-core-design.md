# Shared Map Core Design

## Goal

Move the reusable Leaflet map infrastructure from the About page into
`packages/ui` so Web and Admin can share the same interaction behavior later.

## Boundary

`SharedMap` owns:

- The Leaflet `MapContainer` and OpenStreetMap tile layer.
- Click-to-interact behavior.
- Wheel zoom deactivation on mouse leave and Escape.
- Reset to the initial center and zoom.
- Accessible activation and reset controls.

The About feature continues to own:

- Vietnam GeoJSON loading, mask, and outline.
- Dealer coordinates, marker icons, and popup content.
- Translated labels passed into `SharedMap`.
- Feature-specific colors and layout.

Contact, Dealers, and Admin maps are not migrated in this change.

## Component API

`SharedMap` accepts the initial view, zoom constraints, translated labels,
container classes, tile settings, and React children for feature-owned layers.
It does not import `next-intl`, fetch application data, or know dealer types.

## Dependencies

The React component belongs in `packages/ui`, not `packages/shared`.
`packages/ui` declares Leaflet and React Leaflet dependencies and exports the
component through `@repo/ui/map`.

## Verification

- Regression tests enforce the package boundary and existing interaction behavior.
- Typecheck and lint run for both `@repo/ui` and `@repo/web`.
