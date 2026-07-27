"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { divIcon } from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple, PathOptions } from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Dealer } from "../dealers.types";

const VIETNAM_MAINLAND_BOUNDS: LatLngBoundsExpression = [
  [8.56557851800005, 102.118655233],
  [23.3662751270001, 109.472422722],
];

const VIETNAM_INTERACTION_BOUNDS: LatLngBoundsExpression = [
  [6.95331046340264, 102.118655233],
  [23.3662751270001, 116.947319489797],
];

const WORLD_RING: LatLngTuple[] = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
  [-90, -180],
];

const maskStyle: PathOptions = {
  color: "transparent",
  fillColor: "var(--color-surface-muted)",
  fillOpacity: 1,
  fillRule: "evenodd",
  interactive: false,
  stroke: false,
};

const vietnamOutlineStyle: PathOptions = {
  color: "var(--color-premium-red)",
  fillOpacity: 0,
  interactive: false,
  opacity: 0.75,
  weight: 1,
};

interface VietnamBoundary {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown> | null;
    geometry:
      | {
          type: "MultiPolygon";
          coordinates: number[][][][];
        }
      | {
          type: "MultiLineString";
          coordinates: number[][][];
        };
  }>;
}

interface DealerMapProps {
  activeDealer: Dealer | null;
}

function isVietnamBoundary(value: unknown): value is VietnamBoundary {
  if (!value || typeof value !== "object") return false;

  const featureCollection = value as Partial<VietnamBoundary>;

  return (
    featureCollection.type === "FeatureCollection" &&
    Array.isArray(featureCollection.features) &&
    featureCollection.features.length > 0 &&
    featureCollection.features.every(
      (feature) =>
        feature.geometry?.type === "MultiPolygon" ||
        feature.geometry?.type === "MultiLineString",
    ) &&
    featureCollection.features.some(
      (feature) => feature.geometry?.type === "MultiPolygon",
    )
  );
}

function getMaskPositions(boundary: VietnamBoundary): LatLngTuple[][] {
  const vietnamRings = boundary.features.flatMap((feature) => {
    if (feature.geometry.type !== "MultiPolygon") return [];

    return feature.geometry.coordinates.flatMap((polygon) => {
      const outerRing = polygon[0];

      if (!outerRing) return [];

      return [
        outerRing.map(
          ([longitude, latitude]) => [latitude, longitude] as LatLngTuple,
        ),
      ];
    });
  });

  return [WORLD_RING, ...vietnamRings];
}

function MapCamera({ activeDealer }: DealerMapProps) {
  const map = useMap();

  useEffect(() => {
    if (activeDealer) {
      map.flyTo([activeDealer.lat, activeDealer.lng], 13, {
        duration: 1.1,
      });
      return;
    }

    map.fitBounds(VIETNAM_MAINLAND_BOUNDS, {
      animate: true,
      padding: [24, 24],
    });
  }, [activeDealer, map]);

  return null;
}

export function DealerMap({ activeDealer }: DealerMapProps) {
  const t = useTranslations("DealersPage.map");
  const [isMounted, setIsMounted] = useState(false);
  const [vietnamBoundary, setVietnamBoundary] =
    useState<VietnamBoundary | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVietnamBoundary() {
      try {
        const response = await fetch("/map/vn.geojson", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`GeoJSON request failed with ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!isVietnamBoundary(data)) {
          throw new Error("Invalid Vietnam GeoJSON");
        }

        setVietnamBoundary(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadError(true);
      }
    }

    void loadVietnamBoundary();

    return () => controller.abort();
  }, []);

  const maskPositions = useMemo(
    () => (vietnamBoundary ? getMaskPositions(vietnamBoundary) : null),
    [vietnamBoundary],
  );

  const dealerIcon = useMemo(
    () =>
      divIcon({
        className: "fujitek-dealer-marker",
        html: `
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 1.5C9.51 1.5 1 10.01 1 20.5C1 34.75 20 46.5 20 46.5C20 46.5 39 34.75 39 20.5C39 10.01 30.49 1.5 20 1.5Z" fill="var(--color-premium-red)" stroke="white" stroke-width="3"/>
            <circle cx="20" cy="20.5" r="7" fill="white"/>
          </svg>
        `,
        iconAnchor: [20, 46],
        iconSize: [40, 48],
        popupAnchor: [0, -42],
      }),
    [],
  );

  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        className="size-full animate-pulse bg-surface-muted"
      />
    );
  }

  return (
    <div
      role="region"
      aria-label={t("ariaLabel")}
      className="relative isolate size-full overflow-hidden bg-surface-muted"
    >
      <MapContainer
        bounds={VIETNAM_MAINLAND_BOUNDS}
        className="size-full"
        maxBounds={VIETNAM_INTERACTION_BOUNDS}
        maxBoundsViscosity={1}
        minZoom={5}
        maxZoom={18}
        scrollWheelZoom
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {maskPositions && (
          <Polygon positions={maskPositions} pathOptions={maskStyle} />
        )}

        {vietnamBoundary && (
          <GeoJSON
            data={vietnamBoundary}
            style={(feature) =>
              feature?.geometry.type === "MultiLineString"
                ? { ...vietnamOutlineStyle, opacity: 0.65 }
                : vietnamOutlineStyle
            }
          />
        )}

        <MapCamera activeDealer={activeDealer} />

        {activeDealer && (
          <Marker
            position={[activeDealer.lat, activeDealer.lng]}
            icon={dealerIcon}
            title={activeDealer.name}
          >
            <Popup>
              <div className="min-w-52 space-y-2">
                <span className="inline-flex rounded-md bg-premium-red px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {t("selectedDealer")}
                </span>
                <p className="m-0 text-sm font-semibold uppercase leading-snug text-deep-black">
                  {activeDealer.name}
                </p>
                <p className="m-0 text-xs leading-relaxed text-stone-gray">
                  {activeDealer.address}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-deep-black">
                  <Phone className="size-3.5 text-premium-red" />
                  <span>
                    {t("popupPhone")}: {activeDealer.phone}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeDealer.name} ${activeDealer.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase text-premium-red hover:underline"
                >
                  <span>{t("openGoogleMaps")}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {!vietnamBoundary && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-4 top-4 z-[500] rounded-xl border border-border-gray bg-white/95 px-4 py-3 text-center text-xs font-medium text-stone-gray shadow-md backdrop-blur-sm"
        >
          {loadError ? t("loadError") : t("loading")}
        </div>
      )}
    </div>
  );
}
