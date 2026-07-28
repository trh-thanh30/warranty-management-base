"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createGoogleMapsUrl,
  HttpClientError,
  type GeocodeVietnamAddressCandidate,
} from "@repo/shared";
import { Button, Input, Label } from "@repo/ui";
import type { GeoPoint } from "@repo/ui/map";
import { useGeocodeVietnamAddress } from "@/src/hooks/use-locations";

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
  address: string;
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
  province: string;
  title: string;
  ward: string;
};

export function LocationPickerField({
  address,
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
  province,
  title,
  ward,
}: LocationPickerFieldProps) {
  const t = useTranslations("LocationPicker");
  const geocoding = useGeocodeVietnamAddress();
  const [candidates, setCandidates] = useState<
    GeocodeVietnamAddressCandidate[]
  >([]);
  const [focusValue, setFocusValue] = useState<GeoPoint | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const value = toGeoPoint(latitude, longitude);
  const googleMapsUrl = value ? createGoogleMapsUrl(value) : "";
  const errorId = coordinateError ? "network-location-error" : undefined;

  useEffect(() => {
    setCandidates([]);
    setSearchError(null);
  }, [address, province, ward]);

  async function searchAddress() {
    setSearchError(null);

    try {
      const results = await geocoding.mutateAsync({
        address: toOptionalText(address),
        province: province.trim(),
        ward: toOptionalText(ward),
      });

      if (results.length === 0) {
        setCandidates([]);
        setSearchError(t("noResults"));
        return;
      }

      setCandidates(results);
      selectCandidate(results[0]!);
    } catch (error) {
      setCandidates([]);
      setSearchError(
        error instanceof HttpClientError &&
          error.code === "GEOAPIFY_NOT_CONFIGURED"
          ? t("notConfigured")
          : t("searchError"),
      );
    }
  }

  function selectCandidate(candidate: GeocodeVietnamAddressCandidate) {
    const point = {
      latitude: candidate.latitude,
      longitude: candidate.longitude,
    };
    setFocusValue(point);
    onLocationChange(point);
  }

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

      <div className="space-y-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("searchDescription")}
          </p>
          <Button
            className="min-h-11 shrink-0"
            disabled={!province.trim() || geocoding.isPending}
            onClick={() => void searchAddress()}
            type="button"
            variant="secondary"
          >
            {geocoding.isPending ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Search aria-hidden="true" className="size-4" />
            )}
            {geocoding.isPending ? t("searching") : t("searchButton")}
          </Button>
        </div>
        {!province.trim() ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("selectProvinceFirst")}
          </p>
        ) : null}
        {searchError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {searchError}
          </p>
        ) : null}
      </div>

      <MapLocationPicker
        ariaLabel={mapAriaLabel}
        boundaryErrorLabel={mapBoundaryErrorLabel}
        boundaryLoadingLabel={mapBoundaryLoadingLabel}
        className="h-[26rem] w-full overflow-hidden rounded-md sm:h-[32rem] lg:h-[36rem]"
        focusValue={focusValue}
        onChange={onLocationChange}
        value={value}
      />

      {candidates.length > 1 ? (
        <div className="space-y-2" role="group" aria-label={t("resultsLabel")}>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {t("chooseResult")}
          </p>
          <div className="grid gap-2">
            {candidates.map((candidate) => {
              const selected =
                candidate.latitude === latitude &&
                candidate.longitude === longitude;

              return (
                <button
                  aria-pressed={selected}
                  className="min-h-11 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 aria-pressed:border-slate-950 aria-pressed:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-300 dark:aria-pressed:border-slate-300 dark:aria-pressed:bg-slate-800"
                  key={`${candidate.latitude}:${candidate.longitude}:${candidate.formattedAddress}`}
                  onClick={() => selectCandidate(candidate)}
                  type="button"
                >
                  {candidate.formattedAddress}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

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

      <p className="text-xs text-slate-500 dark:text-slate-400">
        <a
          className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          href="https://www.geoapify.com/"
          rel="noreferrer"
          target="_blank"
        >
          {t("poweredBy")}
        </a>
      </p>
    </fieldset>
  );
}

function toOptionalText(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
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
