"use client";

import { useMemo } from "react";
import { divIcon } from "leaflet";
import type { LatLngExpression } from "leaflet";
import { Marker, useMapEvents } from "react-leaflet";
import { SharedMap } from "./shared-map";
import type { GeoPoint, MapTileProvider } from "./map.types";
import {
  isPointInVietnam,
  useVietnamBoundary,
  VIETNAM_CENTER,
  VIETNAM_INITIAL_ZOOM,
  VIETNAM_INTERACTION_BOUNDS,
  VietnamMapOverlay,
} from "./vietnam-map-overlay";
import type { VietnamBoundary } from "./vietnam-map-overlay";

interface LocationSelectionControllerProps {
  boundary: VietnamBoundary;
  onChange: (value: GeoPoint) => void;
}

function LocationSelectionController({
  boundary,
  onChange,
}: LocationSelectionControllerProps) {
  useMapEvents({
    click: ({ latlng }) => {
      const point = {
        latitude: latlng.lat,
        longitude: latlng.lng,
      };

      if (isPointInVietnam(point, boundary)) {
        onChange(point);
      }
    },
  });

  return null;
}

export interface MapLocationPickerProps {
  activateLabel?: string;
  ariaLabel: string;
  boundaryErrorLabel?: string;
  boundaryLoadingLabel?: string;
  boundaryUrl?: string;
  className?: string;
  initialCenter?: LatLngExpression;
  initialZoom?: number;
  maxZoom?: number;
  minZoom?: number;
  onChange: (value: GeoPoint) => void;
  resetLabel?: string;
  tileProvider?: MapTileProvider;
  value: GeoPoint | null;
}

export function MapLocationPicker({
  activateLabel,
  ariaLabel,
  boundaryErrorLabel,
  boundaryLoadingLabel,
  boundaryUrl,
  className = "h-80 w-full overflow-hidden rounded-md",
  initialCenter = VIETNAM_CENTER,
  initialZoom = VIETNAM_INITIAL_ZOOM,
  maxZoom = 18,
  minZoom = 5,
  onChange,
  resetLabel,
  tileProvider,
  value,
}: MapLocationPickerProps) {
  const { boundary, status } = useVietnamBoundary(boundaryUrl);
  const markerIcon = useMemo(
    () =>
      divIcon({
        className: "shared-location-picker-marker",
        html: `
          <span style="display:block;width:24px;height:24px;border-radius:9999px;background:#dc2626;border:4px solid white;box-shadow:0 2px 8px rgb(15 23 42 / 0.35)" aria-hidden="true"></span>
        `,
        iconAnchor: [12, 12],
        iconSize: [24, 24],
      }),
    [],
  );

  return (
    <div aria-label={ariaLabel} className={className} role="region">
      {boundary ? (
        <SharedMap
          activateLabel={activateLabel}
          activationMode="direct"
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          maxBounds={VIETNAM_INTERACTION_BOUNDS}
          maxBoundsViscosity={1}
          maxZoom={maxZoom}
          minZoom={minZoom}
          resetLabel={resetLabel}
          showResetControl={Boolean(resetLabel)}
          tileProvider={tileProvider}
          zoomSnap={0.25}
        >
          <VietnamMapOverlay boundary={boundary} />
          <LocationSelectionController
            boundary={boundary}
            onChange={onChange}
          />
          {value ? (
            <Marker
              icon={markerIcon}
              position={[value.latitude, value.longitude]}
            />
          ) : null}
        </SharedMap>
      ) : (
        <div
          className="grid size-full place-items-center bg-slate-100 px-4 text-center text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          role="status"
        >
          {status === "error"
            ? (boundaryErrorLabel ?? ariaLabel)
            : (boundaryLoadingLabel ?? ariaLabel)}
        </div>
      )}
    </div>
  );
}
