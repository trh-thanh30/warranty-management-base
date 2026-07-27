"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { divIcon } from "leaflet";
import type { LatLngTuple, PathOptions } from "leaflet";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
} from "react-leaflet";

const WORLD_RING: LatLngTuple[] = [
  [-90, -180],
  [-90, 180],
  [90, 180],
  [90, -180],
  [-90, -180],
];

const maskStyle: PathOptions = {
  color: "transparent",
  fillColor: "#f4f4f5",
  fillOpacity: 0.96,
  fillRule: "evenodd",
  interactive: false,
  stroke: false,
};

const vietnamOutlineStyle: PathOptions = {
  color: "var(--color-premium-red)",
  fillOpacity: 0,
  interactive: false,
  opacity: 0.8,
  weight: 1.5,
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

function isVietnamBoundary(value: unknown): value is VietnamBoundary {
  if (!value || typeof value !== "object") return false;
  const fc = value as Partial<VietnamBoundary>;
  return (
    fc.type === "FeatureCollection" &&
    Array.isArray(fc.features) &&
    fc.features.length > 0
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

const dealerPinLocations = [
  {
    id: "hanoi",
    label: "Hà Nội",
    lat: 21.0285,
    lng: 105.8542,
    isMain: true,
    address: "Quận Cầu Giấy, Hà Nội",
  },
  {
    id: "haiphong",
    label: "Hải Phòng",
    lat: 20.8449,
    lng: 106.6881,
    isMain: false,
    address: "Quận Hồng Bàng, Hải Phòng",
  },
  {
    id: "danang",
    label: "Đà Nẵng",
    lat: 16.0544,
    lng: 108.2022,
    isMain: true,
    address: "Quận Hải Châu, Đà Nẵng",
  },
  {
    id: "nhatrang",
    label: "Nha Trang",
    lat: 12.2388,
    lng: 109.1967,
    isMain: false,
    address: "TP. Nha Trang, Khánh Hòa",
  },
  {
    id: "hcm",
    label: "TP. Hồ Chí Minh",
    lat: 10.7769,
    lng: 106.7009,
    isMain: true,
    address: "Quận 1, TP. Hồ Chí Minh",
  },
  {
    id: "cantho",
    label: "Cần Thơ",
    lat: 10.0452,
    lng: 105.7469,
    isMain: false,
    address: "Quận Ninh Kiều, Cần Thơ",
  },
];

const VIETNAM_CENTER: LatLngTuple = [16.0, 107.0];

export function AboutNetworkMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [vietnamBoundary, setVietnamBoundary] =
    useState<VietnamBoundary | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetch("/map/vn.geojson")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (isVietnamBoundary(data)) {
          setVietnamBoundary(data);
        }
      })
      .catch((err) => console.error("Failed to load vn.geojson", err));
  }, []);

  const maskPositions = useMemo(
    () => (vietnamBoundary ? getMaskPositions(vietnamBoundary) : null),
    [vietnamBoundary],
  );

  const createCustomIcon = (label: string, isMain: boolean) =>
    divIcon({
      className: "fujitek-network-marker",
      html: `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <span class="absolute -inset-2 rounded-full bg-red-500/30 ${isMain ? "animate-ping" : ""} pointer-events-none"></span>
          <div class="relative size-4 rounded-full bg-premium-red border-2 border-white shadow-md flex items-center justify-center">
            <div class="size-1.5 rounded-full bg-white"></div>
          </div>
          <div class="mt-1 whitespace-nowrap opacity-95 group-hover:opacity-100 transition-opacity">
            <span class="rounded bg-deep-black/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-md">
              ${label}
            </span>
          </div>
        </div>
      `,
      iconAnchor: [30, 10],
      iconSize: [60, 40],
      popupAnchor: [0, -10],
    });

  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        className="w-full h-full min-h-[500px] animate-pulse bg-surface-muted"
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-surface-muted isolate overflow-hidden">
      {/* React Leaflet Map Container with OSM Tiles */}
      <MapContainer
        center={VIETNAM_CENTER}
        zoom={6.25}
        zoomSnap={0.25}
        minZoom={5}
        maxZoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Outer Mask: Hides everywhere except Vietnam mainland */}
        {maskPositions && (
          <Polygon positions={maskPositions} pathOptions={maskStyle} />
        )}

        {/* Red outline for Vietnam mainland */}
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

        {dealerPinLocations.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={createCustomIcon(pin.label, pin.isMain)}
          >
            <Popup className="fujitek-map-popup">
              <div className="p-1 space-y-1.5 min-w-[160px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-premium-red" />
                  <span className="text-xs font-bold text-deep-black uppercase">
                    Đại lý {pin.label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-gray m-0 leading-tight">
                  {pin.address}
                </p>
                <div className="pt-1 text-[10px] font-bold text-premium-red uppercase">
                  Dịch vụ E-Warranty chính hãng
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
