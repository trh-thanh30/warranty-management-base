"use client";

import { useEffect, useMemo } from "react";
import { divIcon } from "leaflet";
import type { LatLngExpression } from "leaflet";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { SharedMap } from "./shared-map";
import type { GeoPoint, MapTileProvider } from "./map.types";

const VIETNAM_CENTER: LatLngExpression = [15.9031, 105.8067];

interface LocationSelectionControllerProps {
  onChange: (value: GeoPoint) => void;
}

function LocationSelectionController({
  onChange,
}: LocationSelectionControllerProps) {
  useMapEvents({
    click: ({ latlng }) => {
      onChange({
        latitude: latlng.lat,
        longitude: latlng.lng,
      });
    },
  });

  return null;
}

function SelectedLocationCamera({ value }: { value: GeoPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (!value) return;
    map.panTo([value.latitude, value.longitude]);
  }, [map, value]);

  return null;
}

export interface MapLocationPickerProps {
  activateLabel?: string;
  ariaLabel: string;
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
  className = "h-80 w-full overflow-hidden rounded-md",
  initialCenter = VIETNAM_CENTER,
  initialZoom = 5,
  maxZoom = 18,
  minZoom = 5,
  onChange,
  resetLabel,
  tileProvider,
  value,
}: MapLocationPickerProps) {
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
      <SharedMap
        activateLabel={activateLabel}
        activationMode="direct"
        initialCenter={
          value ? [value.latitude, value.longitude] : initialCenter
        }
        initialZoom={value ? Math.max(initialZoom, 15) : initialZoom}
        maxZoom={maxZoom}
        minZoom={minZoom}
        resetLabel={resetLabel}
        showResetControl={Boolean(resetLabel)}
        tileProvider={tileProvider}
      >
        <LocationSelectionController onChange={onChange} />
        <SelectedLocationCamera value={value} />
        {value ? (
          <Marker
            icon={markerIcon}
            position={[value.latitude, value.longitude]}
          />
        ) : null}
      </SharedMap>
    </div>
  );
}
