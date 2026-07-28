"use client";

import { useEffect, useMemo, useState } from "react";
import type { LatLngBoundsExpression, LatLngTuple, PathOptions } from "leaflet";
import { GeoJSON, Polygon } from "react-leaflet";
import type { GeoPoint } from "./map.types";

export const VIETNAM_CENTER: LatLngTuple = [16, 107];
export const VIETNAM_INITIAL_ZOOM = 6.25;
export const VIETNAM_MAINLAND_BOUNDS: LatLngBoundsExpression = [
  [8.56557851800005, 102.118655233],
  [23.3662751270001, 109.472422722],
];
export const VIETNAM_INTERACTION_BOUNDS: LatLngBoundsExpression = [
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

type VietnamMultiPolygonGeometry = {
  coordinates: number[][][][];
  type: "MultiPolygon";
};

type VietnamMultiLineStringGeometry = {
  coordinates: number[][][];
  type: "MultiLineString";
};

export type VietnamBoundary = {
  features: Array<{
    geometry: VietnamMultiLineStringGeometry | VietnamMultiPolygonGeometry;
    properties: Record<string, unknown> | null;
    type: "Feature";
  }>;
  type: "FeatureCollection";
};

export type VietnamBoundaryStatus = "error" | "loading" | "ready";

export function useVietnamBoundary(boundaryUrl = "/map/vn.geojson"): {
  boundary: VietnamBoundary | null;
  status: VietnamBoundaryStatus;
} {
  const [boundary, setBoundary] = useState<VietnamBoundary | null>(null);
  const [status, setStatus] = useState<VietnamBoundaryStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBoundary() {
      setBoundary(null);
      setStatus("loading");

      try {
        const response = await fetch(boundaryUrl, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Vietnam GeoJSON request failed: ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!isVietnamBoundary(data)) {
          throw new Error("Vietnam GeoJSON response is invalid");
        }

        setBoundary(data);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("error");
      }
    }

    void loadBoundary();

    return () => controller.abort();
  }, [boundaryUrl]);

  return { boundary, status };
}

type VietnamMapOverlayProps = {
  boundary: VietnamBoundary;
  maskFillColor?: string;
  maskFillOpacity?: number;
  outlineColor?: string;
  outlineOpacity?: number;
  outlineWeight?: number;
};

export function VietnamMapOverlay({
  boundary,
  maskFillColor = "#f4f4f5",
  maskFillOpacity = 0.96,
  outlineColor = "#db2114",
  outlineOpacity = 0.8,
  outlineWeight = 1.5,
}: VietnamMapOverlayProps) {
  const maskPositions = useMemo(
    () => getVietnamMaskPositions(boundary),
    [boundary],
  );
  const maskStyle = useMemo<PathOptions>(
    () => ({
      color: "transparent",
      fillColor: maskFillColor,
      fillOpacity: maskFillOpacity,
      fillRule: "evenodd",
      interactive: false,
      stroke: false,
    }),
    [maskFillColor, maskFillOpacity],
  );
  const outlineStyle = useMemo<PathOptions>(
    () => ({
      color: outlineColor,
      fillOpacity: 0,
      interactive: false,
      opacity: outlineOpacity,
      weight: outlineWeight,
    }),
    [outlineColor, outlineOpacity, outlineWeight],
  );

  return (
    <>
      <Polygon positions={maskPositions} pathOptions={maskStyle} />
      <GeoJSON
        data={boundary}
        style={(feature) =>
          feature?.geometry.type === "MultiLineString"
            ? { ...outlineStyle, opacity: outlineOpacity * 0.8 }
            : outlineStyle
        }
      />
    </>
  );
}

export function isPointInVietnam(
  point: GeoPoint,
  boundary: VietnamBoundary,
): boolean {
  return boundary.features.some((feature) => {
    if (feature.geometry.type !== "MultiPolygon") return false;

    return feature.geometry.coordinates.some((polygon) => {
      const [outerRing, ...holes] = polygon;

      if (!outerRing || !isPointInRing(point, outerRing)) return false;

      return !holes.some((hole) => isPointInRing(point, hole));
    });
  });
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

function getVietnamMaskPositions(boundary: VietnamBoundary): LatLngTuple[][] {
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

function isPointInRing(point: GeoPoint, ring: number[][]): boolean {
  let isInside = false;

  for (
    let currentIndex = 0, previousIndex = ring.length - 1;
    currentIndex < ring.length;
    previousIndex = currentIndex++
  ) {
    const current = ring[currentIndex];
    const previous = ring[previousIndex];

    if (!current || !previous) continue;

    const [currentLongitude, currentLatitude] = current;
    const [previousLongitude, previousLatitude] = previous;

    if (
      currentLongitude === undefined ||
      currentLatitude === undefined ||
      previousLongitude === undefined ||
      previousLatitude === undefined
    ) {
      continue;
    }

    const crossesLatitude =
      currentLatitude > point.latitude !== previousLatitude > point.latitude;
    const longitudeAtLatitude =
      ((previousLongitude - currentLongitude) *
        (point.latitude - currentLatitude)) /
        (previousLatitude - currentLatitude) +
      currentLongitude;

    if (crossesLatitude && point.longitude < longitudeAtLatitude) {
      isInside = !isInside;
    }
  }

  return isInside;
}
