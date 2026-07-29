# 0004 - Network Location Coordinates and Map Provider

## Status

Accepted

## Context

Dealer and Service Center locations need to be selected in Admin and displayed
as map markers on the public Web app. A provider-specific Google Maps URL is not
a stable or queryable source of coordinates, and storing it alongside
coordinates would allow the two values to drift.

The shared map package also needs a reusable tile-provider default without
coupling `packages/ui` to Next.js environment variables.

## Decision

- Store required `latitude` and `longitude` columns on Dealer and Service
  Center.
- Validate coordinate ranges at both the API and database boundaries.
- Derive Google Maps search URLs from coordinates; do not accept or persist
  `metadata.googleMapsUrl`.
- Expose active Dealers and Service Centers through the public
  `network-locations` contract.
- Keep the OpenStreetMap provider as the shared map default.
- Pass tile URL and attribution together as a `MapTileProvider` object.
- Do not read environment variables from `packages/ui`. An app may build and
  pass a provider from app-local config if deployment requirements change.

## Consequences

- Every Dealer and Service Center creation path, including Excel import and
  quick Dealer creation, must provide coordinates.
- Public map consumers receive normalized, directly renderable locations.
- Tile provider URL and attribution cannot accidentally be configured
  independently.
- Switching providers later remains an app configuration concern and does not
  require changing the shared map component.
