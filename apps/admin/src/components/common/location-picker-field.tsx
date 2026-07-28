"use client";

import dynamic from "next/dynamic";
import { ExternalLink } from "lucide-react";
import { createGoogleMapsUrl } from "@repo/shared";
import { Input, Label } from "@repo/ui";
import type { GeoPoint } from "@repo/ui/map";

const MapLocationPicker = dynamic(
  () => import("@repo/ui/map").then((module) => module.MapLocationPicker),
  {
    loading: () => (
      <div
        aria-hidden="true"
        className="h-[26rem] w-full animate-pulse rounded-md bg-slate-100 sm:h-[32rem] lg:h-[36rem] dark:bg-slate-800"
      />
    ),
    ssr: false,
  },
);

type LocationPickerFieldProps = {
  coordinateError?: string;
  description: string;
  googleMapsLabel: string;
  googleMapsPlaceholder: string;
  latitude: number;
  latitudeLabel: string;
  latitudePlaceholder: string;
  longitude: number;
  longitudeLabel: string;
  longitudePlaceholder: string;
  mapAriaLabel: string;
  mapBoundaryErrorLabel: string;
  mapBoundaryLoadingLabel: string;
  onLatitudeChange: (value: number) => void;
  onLocationChange: (value: GeoPoint) => void;
  onLongitudeChange: (value: number) => void;
  title: string;
};

export function LocationPickerField({
  coordinateError,
  description,
  googleMapsLabel,
  googleMapsPlaceholder,
  latitude,
  latitudeLabel,
  latitudePlaceholder,
  longitude,
  longitudeLabel,
  longitudePlaceholder,
  mapAriaLabel,
  mapBoundaryErrorLabel,
  mapBoundaryLoadingLabel,
  onLatitudeChange,
  onLocationChange,
  onLongitudeChange,
  title,
}: LocationPickerFieldProps) {
  const value = toGeoPoint(latitude, longitude);
  const googleMapsUrl = value ? createGoogleMapsUrl(value) : "";
  const errorId = coordinateError ? "network-location-error" : undefined;

  return (
    <fieldset className="space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
      <div>
        <legend className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </legend>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <MapLocationPicker
        ariaLabel={mapAriaLabel}
        boundaryErrorLabel={mapBoundaryErrorLabel}
        boundaryLoadingLabel={mapBoundaryLoadingLabel}
        className="h-[26rem] w-full overflow-hidden rounded-md sm:h-[32rem] lg:h-[36rem]"
        onChange={onLocationChange}
        value={value}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="network-location-latitude">{latitudeLabel}</Label>
          <Input
            aria-describedby={errorId}
            aria-invalid={Boolean(coordinateError)}
            id="network-location-latitude"
            inputMode="decimal"
            max={90}
            min={-90}
            onChange={(event) =>
              onLatitudeChange(toCoordinate(event.currentTarget.value))
            }
            placeholder={latitudePlaceholder}
            step="any"
            type="number"
            value={formatCoordinate(latitude)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="network-location-longitude">{longitudeLabel}</Label>
          <Input
            aria-describedby={errorId}
            aria-invalid={Boolean(coordinateError)}
            id="network-location-longitude"
            inputMode="decimal"
            max={180}
            min={-180}
            onChange={(event) =>
              onLongitudeChange(toCoordinate(event.currentTarget.value))
            }
            placeholder={longitudePlaceholder}
            step="any"
            type="number"
            value={formatCoordinate(longitude)}
          />
        </div>
      </div>

      {coordinateError ? (
        <p
          className="text-sm leading-5 text-red-600 dark:text-red-400"
          id={errorId}
          role="alert"
        >
          {coordinateError}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="network-location-google-maps">{googleMapsLabel}</Label>
        <div className="flex gap-2">
          <Input
            id="network-location-google-maps"
            placeholder={googleMapsPlaceholder}
            readOnly
            value={googleMapsUrl}
          />
          {googleMapsUrl ? (
            <a
              aria-label={googleMapsLabel}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-300"
              href={googleMapsUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}

function formatCoordinate(value: number): number | "" {
  return Number.isFinite(value) ? value : "";
}

function toCoordinate(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function toGeoPoint(latitude: number, longitude: number): GeoPoint | null {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}
